
const RaceFactory = require("../factories/RaceFactory");
const FtpFetch = require("./FtpFetch");
const LocalFetch = require("./LocalFetch");
const MongoChallenge = require("../types/mongo/MongoChallenge");
const MongoLeaderboard = require("../types/mongo/MongoLeaderboard");
const Leaderboard = require("../types/leaderboard/Leaderboard");
const Challenge = require("../types/challenge/Challenge");
const Replay = require("../types/Replay");
const MongoReplay = require("../types/mongo/MongoReplay");
const ReplayData = require("../types/ReplayData");
const MongoReplayData = require("../types/mongo/MongoReplayData");
const mongoLeaderboard = new MongoLeaderboard();
const mongoChallenge = new MongoChallenge();
const mongoReplay = new MongoReplay();
const mongoReplayData = new MongoReplayData();


class Fetch {
  /**
   *
   * @param basePaths {string[]}
   */
  constructor() {
    console.log("process.argv[3]", process.argv[2]);
    this.engine = process.argv[2] === "--dev" ? new LocalFetch() : new FtpFetch();
  }

  connect() {
    return this.engine.connect();
  }

  async fetchMatchlog() {
    const matchlog = await this.engine.fetchMatchlog();

    let races = [];

    let logEntries = matchlog[0].split("###");
    //console.log("matchlog[1]", matchlog[1])
/*    const newReps = [];
    const newRepsData = [];
    const replays = matchlog[1].forEach(r => {
      const rep = Replay.create(r);
      const repData = new ReplayData({
        replayId: rep._id,
        data: r.data
      });

      newReps.push(rep);
      newRepsData.push(repData);
    })

    const existingReplays = await mongoReplay.getAll();
    let index = 0;
    for (let r of newReps) {
      const hasBetter = existingReplays.some(rep => {
        return rep.challengeName === r.challengeName && rep.playerLogin === r.playerLogin && rep.timeMs <= r.timeMs;
      })

      //only insert replay if it is better than the current best one
      if (!hasBetter) {
        await mongoReplay.store(r);
        await mongoReplayData.store(newRepsData[index]);
      }
      index++;
    }*/


    for (let raceEntry of logEntries) {
      //console.log(raceEntry);
      if (raceEntry.trim().length > 0 && raceEntry.indexOf("LAPS MATCH") > -1) {
        try {
          const race = RaceFactory.create(raceEntry);

          races.push(race);
          //console.log(race.raceRankings);
        } catch (e) {
          console.log(e);
        }
      }


      logEntries = [];
    }
    // filter out races that does not have any participants.
    races = races.filter((race) => race.raceRankings.length > 0);

    let players = [];

    // insert new races
    for (const race of races) {
      if ((await race.store()) === 1) {
        players = players.concat(race.players);
        const challenge = await mongoChallenge.store(race);
        const temp = await mongoChallenge.getAll();
        let challenges = temp.map((t) => {
          return new Challenge(t);
        });
        await mongoLeaderboard.store(new Leaderboard({}), challenges);
        // clear mem
        challenges = [];
      }
    }

    // Insert/update players
    for (const player of players) {
      await player.store();
    }

    // clear mem
    players = [];
    races = [];

  }
}

module.exports = Fetch;
