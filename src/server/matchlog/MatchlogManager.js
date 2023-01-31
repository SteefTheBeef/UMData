const RaceFactory = require("../factories/RaceFactory");

class MatchlogManager {
  static getRaces(matchlog) {
    let races = [];

      let logEntries = matchlog.split("###");

      for (let raceEntry of logEntries) {

        if (raceEntry.trim().length > 0 && raceEntry.indexOf("LAPS MATCH") > -1) {
          try {
            const race = RaceFactory.create(raceEntry);
            races.push(race);
          } catch (e) {
            console.log(e);
          }
        }
      }

    // filter out races that does not have any participants.
    //races = races.filter((race) => race.raceRankings.length > 0);
    return races;
  }
}

module.exports = MatchlogManager;
