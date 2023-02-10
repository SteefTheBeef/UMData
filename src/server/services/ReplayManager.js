
const { readdirSync, rmSync } = require('fs');
const MongoChallenge = require("../types/mongo/MongoChallenge");

const Replay = require("../types/Replay");
const MongoReplay = require("../types/mongo/MongoReplay");

const FtpUtil = require("../../utils/FtpUtil");


class ReplayManager {
  /**
   *
   * @param basePaths {string[]}
   */
  constructor() {

  }
  static async fetchReplays(ftp, remotePath) {
    console.log("fetchReplays");
    return await FtpUtil.fetchFilesToDisk(ftp,remotePath, "replays/");
  }

  static async saveReplays(db, ftp) {
    console.log("Saving replays in db: ", db);
    try {
      await FtpUtil.uploadReplays(ftp);
      let replayList = await FtpUtil.fetchFileList(ftp, "/public_html/replays");

      const replays = replayList.map(r => {
        if (r.name !== "." || r.name !== "..") {
          if (r && r.name) {
            return Replay.create(r.name);
          }

          return null;
        }
      }).filter(r => !!r);

      const mongoReplay = new MongoReplay(db);

      let allReplays = await mongoReplay.getAll();
      allReplays = allReplays.map(r => {
        return new Replay(r);
      })



      for (let replay of replays) {
        const foundReps = allReplays.filter(rep => {
          return rep.fileName === replay.fileName;
        })

        if (!foundReps.length) {
          await mongoReplay.store(replay);
        } else if (!foundReps.some(rep => rep.timeMs >= replay.timeMs)) {
          console.log("Saving replay", replay.fileName);
          await mongoReplay.store(replay);
        }
      }
    } catch (e) {
      console.log(e);
    }

  }

  static removeLocalReplays() {
    const dir = './replays';
    readdirSync(dir).forEach(f => rmSync(`${dir}/${f}`));
  }

  static async removeRemoteReplays(ftp, remotePath) {
    await FtpUtil.removeFilesInDirectory(ftp, remotePath)
  }
}

module.exports = ReplayManager;
