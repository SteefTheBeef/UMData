
const ArrayUtil = require("../../../utils/ArrayUtil");
const TimeUtil = require("../../../utils/TimeUtil");
const BestRace = require("./BestRace");

class ChallengePlayer {
  // TODO: split this into two classes.
  // One for challenge rankings (players) and one for Race Rankings
  constructor(props) {
    this.playerLogin = props.playerLogin;
    this.playerNickName = props.playerNickName;
    this.playerNickNameWithColor = props.playerNickNameWithColor;
    this.challengeId = props.challengeId;
    this.bestLap = props.bestLap || {};
    this.bestRace = new BestRace(props.bestRace);
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
    this.raceWasCompleted = props.raceWasCompleted;
  }

  /**
   *
   * @param rawString - string looks like:
   * 1,2,4,00:51.36,00:23:14,0,25,blackcat111,sOb.Stef
   * the string contains:
   * Rank,Lap,Checkpoints,Time,BestLap,CPdelay,Points,Login,NickName
   * @param date
   * @param allPlayers {Player[]}
   * @returns {ChallengePlayer}
   */
  static create(rawString, date) {
    const items = rawString.split(",");

    return new ChallengePlayer({
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
    // only update this is the race was completed
    if (otherRanking.raceWasCompleted && otherRanking.timeMs < this.timeMs) {
      this.timeMs = otherRanking.timeMs;
      this.time = otherRanking.time;
      this.laps = otherRanking.laps;
      wasUpdated = true;
    }
    // bestlap can be updated regardless if the race was completed.
    if (otherRanking.bestLap.timeMs < this.bestLap.timeMs) {
      this.bestLap = otherRanking.bestLap;
      wasUpdated = true;
    }

    return wasUpdated;
  }

  addRace(newRaceRanking) {
    if (!this.raceHistory) {
      this.raceHistory = [];
    }

    // only insert if the raceId does not already exist in raceHistory
    if (!this.raceHistory.some((rh) => rh.raceId === newRaceRanking.raceId)) {
      this.raceHistory.push(this.createRace(newRaceRanking));
    }
  }

  createRace(newRaceRanking) {
    try {
      const totalTimeMs = newRaceRanking.laps
        .map((l) => {
          return l.timeMs;
        })
        .reduce((accumulated, current) => {
          return accumulated + current;
        }, 0);

      return {
        raceId: newRaceRanking.raceId,
        createdAt: newRaceRanking.createdAt,
        numberOfLaps: newRaceRanking.laps.length,
        totalTimeMs,
        totalTime: TimeUtil.millisToMinutes(totalTimeMs),
        avgTimeMs: totalTimeMs / newRaceRanking.laps.length,
        avgTime: TimeUtil.millisToMinutes(totalTimeMs / newRaceRanking.laps.length),
        rawLaps: newRaceRanking.rawLaps,
        rawCheckpoints: newRaceRanking.rawCheckpoints,
        raceWasCompleted: newRaceRanking.raceWasCompleted
      };
    } catch (e) {
      console.log(e);
      console.log("error in ranking", newRaceRanking);
    }
  }

  addRankHistory(createdAt) {
    // always create raceHistory before creating a new rankHistory
    this.rankHistory.push(this.createNewRankHistoryObj(createdAt));
  }

  createNewRankHistoryObj(createdAt) {
    return {
      createdAt: createdAt,
      totalTime: this.bestRace.raceTime,
      totalTimeMs: this.bestRace.raceTimeMs,
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

  getLastCompletedRace() {
    const lastRaces = this.raceHistory.filter(rh => rh.raceWasCompleted);
    return lastRaces.length ? lastRaces[lastRaces.length - 1] : null;
  }

  getBestCompletedRace() {
    const lastRaces = this.raceHistory.filter(rh => rh.raceWasCompleted);
    lastRaces.sort(ArrayUtil.sortByTimeMs)
    return lastRaces.length ? lastRaces[lastRaces.length - 1] : null;
  }

  setBestLap(newRaceRanking) {
    if(newRaceRanking.bestLap.timeMs < this.bestLap.timeMs) {
      this.bestLap = newRaceRanking.bestLap;
    }
  }

  setBestRace(newRaceRanking, updatedAt, envi) {
    if (!this.bestRace || newRaceRanking.completedCheckpointsCount > this.bestRace.completedCheckpointsCount) {
      this.addBestRace(newRaceRanking, updatedAt);
    } else if(newRaceRanking.completedCheckpointsCount === this.bestRace.completedCheckpointsCount) {
      if (newRaceRanking.raceTimeMs < this.bestRace.raceTimeMs) {
        this.addBestRace(newRaceRanking, updatedAt);
      }
    }
  }

  addBestRace(newRaceRanking, updatedAt) {
    this.bestRace = new BestRace({
      playerLogin: newRaceRanking.playerLogin,
      raceId: newRaceRanking.raceId,
      updatedAt,
      raceTimeMs: newRaceRanking.raceTimeMs,
      raceTime: newRaceRanking.raceTime,
      rawLaps: newRaceRanking.rawLaps,
      rawCheckpoints: newRaceRanking.rawCheckpoints,
      raceWasCompleted: newRaceRanking.raceWasCompleted,
      completedLapsCount: newRaceRanking.completedLapsCount,
      completedCheckpointsCount: newRaceRanking.completedCheckpointsCount,
    })
  }

  exportAsString() {
    const lastRank = this.getLastRankHistory();
    return `${this.playerLogin},${this.playerNickNameWithColor},${lastRank.position},${this.bestRace.raceTime},${this.bestRace.raceWasCompleted}`
  }

  toJSON() {
    const p = {
      playerLogin: this.playerLogin,
      playerNickName: this.playerNickName,
      playerNickNameWithColor: this.playerNickNameWithColor,
      bestLap: this.bestLap,
      bestRace: this.bestRace.toJSON(),
      rankHistory: this.rankHistory,
      raceHistory: this.raceHistory,
    };

    return p;

    //console.log(p.playerLogin, p.bestRace);
  }
}

module.exports = ChallengePlayer;
