const MongoChallenge = require("../types/mongo/MongoChallenge");
const MongoLeaderboard = require("../types/mongo/MongoLeaderboard");
const Leaderboard = require("../types/leaderboard/Leaderboard");
const Challenge = require("../types/challenge/Challenge");
const MatchlogManager = require("../matchlog/MatchlogManager");
const FetchBackups = require("./FetchBackups");
const UpdateManager = require("../types/UpdateManager");
const mongoLeaderboard = new MongoLeaderboard();
const mongoChallenge = new MongoChallenge();

class BackupManager {
  constructor() {
    this.fetchBackups = new FetchBackups();
    this.updateManager = new UpdateManager();
  }

  async process() {
    //const await FtpUtil
    const files = await this.fetchBackups.fetchFiles();

    let players = [];

    for (let file of files) {
      console.log("Processing ", file.name);
      const races = MatchlogManager.getRaces(file.stringData);

      // insert new races
      let index = 1;
      for (const race of races) {
        if ((await race.store()) === 1) {
          players = players.concat(race.players);
          this.updateManager.updateChallenge(race);
          this.updateManager.updateLeaderboard();
          index++;
        }
      }

      console.log("Inserted ", index, " races");
    }

    await this.storeChallenges(this.updateManager.challenges);
    await this.storeLeaderboard(this.updateManager.leaderboard);
    await this.storePlayers(players);
  }

  async storeChallenges(challenges) {
    let index = 1;
    for (let challenge of this.updateManager.challenges) {
      await mongoChallenge.cleanStore(challenge);
      index++;
    }

    console.log("Inserted ", index, " challenges");
    return true;
  }

  async storeLeaderboard() {
    await mongoLeaderboard.cleanStore(this.updateManager.leaderboard);
    console.log("Inserted leaderboard");
    return true;
  }

  async storePlayers(players) {
    console.log("Processing players...")
    const playersReversed = players.reverse();
    const playersCleaned = {};

    playersReversed.forEach((p, i) => {
      const login = p.login;
      if (!playersCleaned[login]) {
        playersCleaned[login] = p;
      }
    });

    // Insert/update players

    for (const key in playersCleaned) {
      await playersCleaned[key].store();
    }
    console.log("Processing players...Done")
    return true;
  }
}

module.exports = BackupManager;
