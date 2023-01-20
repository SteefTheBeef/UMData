
const RaceFactory = require("../factories/RaceFactory");
const FtpFetch = require("./FtpFetch");
const LocalFetch = require("./LocalFetch");
const MongoChallenge = require("../types/mongo/MongoChallenge");
const MongoLeaderboard = require("../types/mongo/MongoLeaderboard");
const Leaderboard = require("../types/leaderboard/Leaderboard");
const Challenge = require("../types/challenge/Challenge");
const mongoLeaderboard = new MongoLeaderboard();
const mongoChallenge = new MongoChallenge();


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

    let logEntries = matchlog.split("###");
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
      //console.log(race.players);
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
