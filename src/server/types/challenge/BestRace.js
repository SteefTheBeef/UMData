class BestRace {
  constructor(props = {}) {
    this.playerLogin = props.playerLogin || "";
    this.raceId = props.raceId || "";
    this.updatedAt = props.updatedAt || "";
    this.raceTimeMs = props.raceTimeMs || 0;
    this.raceTime = props.raceTime || "";
    this.completedLapsCount = props.completedLapsCount || 0
    this.completedCheckpointsCount = props.completedCheckpointsCount || 0
    this.rawLaps = props.rawLaps || "";
    this.rawCheckpoints = props.rawCheckpoints || "";
    this.raceWasCompleted = props.raceWasCompleted || false
  }

  toJSON() {
    return {
      playerLogin: this.playerLogin,
      raceId: this.raceId,
      updatedAt: this.updatedAt,
      raceTimeMs: this.raceTimeMs,
      raceTime: this.raceTime,
      rawLaps: this.rawLaps,
      completedLapsCount: this.completedLapsCount,
      completedCheckpointsCount: this.completedCheckpointsCount,
      rawCheckpoints: this.rawCheckpoints,
      raceWasCompleted: this.raceWasCompleted
    };
  }
}

module.exports = BestRace;
