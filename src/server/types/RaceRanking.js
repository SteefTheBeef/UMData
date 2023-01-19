class RaceRanking {
  // TODO: split this into two classes.
  // One for challenge rankings (players) and one for Race Rankings
  constructor(props) {
    this.playerLogin = props.playerLogin;
    this.playerNickName = props.playerNickName;
    this.playerNickNameWithColor = props.playerNickNameWithColor;

    this.challengeId = props.challengeId;
    this.raceId = props.raceId;

    this.position = props.position;
    this.bestLap = props.bestLap;
    this.laps = props.laps;
    this.rawCheckpoints = props.rawCheckpoints;
    this.rawLaps = props.rawLaps;

    this.time = props.time;
    this.timeMs = props.timeMs;

    this.completedLapsCount = props.completedLapsCount;
    this.completedCheckpointsCount = props.completedCheckpointsCount;
    this.createdAt = props.createdAt;
    this.raceWasCompleted = props.raceWasCompleted;
  }

  toJSON() {
    return {
      playerLogin: this.playerLogin,
      playerNickName: this.playerNickName,
      playerNickNameWithColor: this.playerNickNameWithColor,
      challengeId: this.challengeId,
      raceId: this.raceId,
      position: this.position,
      bestLap: this.bestLap,
      laps: this.laps,
      rawCheckpoints: this.rawCheckpoints,
      rawLaps: this.rawLaps,
      time: this.time,
      timeMs: this.timeMs,
      completedLapsCount: this.completedLapsCount,
      completedCheckpointsCount: this.completedCheckpointsCount,
      createdAt: this.createdAt,
      raceWasCompleted: this.raceWasCompleted,
    };
  }
}

module.exports = RaceRanking;
