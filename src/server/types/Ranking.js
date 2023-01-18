const TimeUtil = require("../../utils/TimeUtil");

class Ranking {
  constructor(props) {
    this.rank = props.rank;
    this.playerLogin = props.playerLogin;
    this.playerNickName = props.playerNickName;
    this.playerNickNameWithColor = props.playerNickName;
    this.challengeId = props.challengeId;
    this.bestLap = props.bestLap;
    this.rankHistory = props.rankHistory || [];
    this.raceHistory = props.raceHistory || [];

    // temp props that should not be stored in DB.
    this.laps = props.laps;
    this.rawCheckpoints = props.rawCheckpoints;
    this.rawLaps = props.rawLaps;
    this.raceId = props.raceId;
    this.time = props.time;
    this.timeMs = props.timeMs;
    this.numberOfLaps = props.numberOfLaps;
    this.numberOfCheckpoints = props.numberOfCheckpoints;
    this.position = props.position;
    this.points = props.points;
    this.totalPoints = props.totalPoints;
    this.createdAt = props.createdAt;
  }

  /**
   *
   * @param rawString - string looks like:
   * 1,2,4,00:51.36,00:23:14,0,25,blackcat111,sOb.Stef
   * the string contains:
   * Rank,Lap,Checkpoints,Time,BestLap,CPdelay,Points,Login,NickName
   * @param date
   * @param allPlayers {Player[]}
   * @returns {Ranking}
   */
  static create(rawString, date) {
    const items = rawString.split(",");

    return new Ranking({
      rank: parseInt(items[0], 10),
      numberOfLaps: parseInt(items[1], 10),
      numberOfCheckpoints: parseInt(items[2], 10),
      time: items[3],
      playerLogin: items[7],
      playerNickName: items[8],
    });
  }

  updateTimesFromAnotherRanking(otherRanking) {
    let wasUpdated = false;
    if (otherRanking.timeMs < this.timeMs) {
      this.timeMs = otherRanking.timeMs;
      this.time = otherRanking.time;
      this.laps = otherRanking.laps;
      wasUpdated = true;
    }

    if (otherRanking.bestLap.timeMs < this.bestLap.timeMs) {
      this.bestLap = otherRanking.bestLap;
      wasUpdated = true;
    }

    return wasUpdated;
  }

  addRaceHistory(incomingRanking) {
    if (!this.raceHistory) {
      this.raceHistory = [];
    }

    // only insert if the raceId does not already exist in raceHistory
    if (!this.raceHistory.some((rh) => rh.raceId === incomingRanking.raceId)) {
      this.raceHistory.push(this.getRaceHistoryObj(incomingRanking));
    }
  }

  getRaceHistoryObj(incomingRanking) {
    try {
      const totalTimeMs = incomingRanking.laps
        .map((l) => {
          return l.timeMs;
        })
        .reduce((accumulated, current) => {
          return accumulated + current;
        }, 0);

      return {
        raceId: incomingRanking.raceId,
        createdAt: incomingRanking.createdAt,
        numberOfLaps: incomingRanking.laps.length,
        totalTimeMs,
        totalTime: TimeUtil.millisToMinutes(totalTimeMs),
        avgTimeMs: totalTimeMs / incomingRanking.laps.length,
        avgTime: TimeUtil.millisToMinutes(totalTimeMs / incomingRanking.laps.length),
        rawLaps: incomingRanking.rawLaps,
        rawCheckpoints: incomingRanking.rawCheckpoints,
      };
    } catch (e) {
      console.log(e);
      console.log("error in ranking", incomingRanking);
    }
  }

  addRankHistory(createdAt) {
    // always create raceHistory before creating a new rankHistory
    this.rankHistory.push(this.getNewRankHistoryObj(createdAt));
  }

  getNewRankHistoryObj(createdAt) {
    const lastRaceHistory = this.raceHistory[this.raceHistory.length - 1];

    return {
      createdAt: createdAt,
      totalTime: lastRaceHistory.totalTime,
      totalTimeMs: lastRaceHistory.totalTimeMs,
      position: this.position,
      points: this.points,
      totalPoints: this.totalPoints,
      bestLapPosition: this.bestLap.position,
      bestLapPoints: this.bestLap.points,
      bestLapTimeMs: this.bestLap.timeMs,
      bestLapTime: this.bestLap.time,
    };
  }

  getLastRankHistory() {
    return this.rankHistory[this.rankHistory.length - 1];
  }

  getLastRaceHistory() {
    return this.raceHistory[this.raceHistory.length - 1];
  }

  toJSON() {
    return {
      playerLogin: this.playerLogin,
      playerNickName: this.playerNickName,
      playerNickNameWithColor: this.playerNickNameWithColor,
      bestLap: this.bestLap,
      rankHistory: this.rankHistory,
      raceHistory: this.raceHistory,
    };
  }
}

module.exports = Ranking;
