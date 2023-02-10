
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
const mongoConfig = require("../types/mongo/mongoConfig");
const umBot = require("../../../UMBot");
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

  async fetchMatchlog(ftp) {
    const matchlogs = await this.engine.fetchMatchlog(ftp);

    for (let matchlogEntry of matchlogs) {
      console.log("Using db: ", matchlogEntry.db);
      let races = [];

      let logEntries = matchlogEntry.matchlog.split("###");

      for (let raceEntry of logEntries) {
        //console.log(raceEntry);
        if (raceEntry.trim().length > 0 && raceEntry.indexOf("LAPS MATCH") > -1) {
          try {
            const race = RaceFactory.create(matchlogEntry.db, raceEntry);

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
      let index = 0;
      for (const race of races) {
        if ((await race.store()) === 1) {
          players = players.concat(race.players);
          const mongoLeaderboard = new MongoLeaderboard(matchlogEntry.db);
          const mongoChallenge = new MongoChallenge(matchlogEntry.db);

          const improvedPlayers = await mongoChallenge.store(race);
          improvedPlayers.forEach(p => {
            umBot.sendNewRecordMessage(race, p, matchlogEntry.lapsCount)
          })
          const temp = await mongoChallenge.getAll();
          let challenges = temp.map((t) => {
            return new Challenge(t);
          });
          await mongoLeaderboard.store(new Leaderboard({}), challenges);
          // clear mem
          challenges = [];

        }
        console.log("Race index ", index);
        index++;
      }

      // Insert/update players
      for (const player of players) {
        await player.store();
      }

      // clear mem
      players = [];
      races = [];
    }

    return matchlogs;
  }
}

module.exports = Fetch;
