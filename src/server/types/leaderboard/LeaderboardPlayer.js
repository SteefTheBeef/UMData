class LeaderboardPlayer {
  constructor(props) {
    this.playerLogin = props.playerLogin;
    this.playerNickName = props.playerNickName;
    this.playerNickNameWithColor = props.playerNickName;
    this.rankHistory = props.rankHistory || [];
    this.racePosition = props.racePosition || null;
    this.racePoints = props.racePoints || null;
    this.totalPoints = props.totalPoints || null;
    this.totalPosition = props.totalPosition || null;
    this.bestLapPosition = props.bestLapPosition || null;
    this.bestLapPoints = props.bestLapPoints || null;
    this.updatedAt = props.updatedAt || "";
    this.prevValues = props.prevValues;
  }

  resetPoints() {
    this.racePosition = 0;
    this.racePoints = 0;
    this.totalPoints = 0;
    this.totalPosition = 0;
    this.bestLapPosition = 0;
    this.bestLapPoints = 0;
  }

  setPrevValues() {
    this.prevValues = {
      racePoints: this.racePoints,
      bestLapPoints: this.bestLapPoints
    }
  }

  addRankHistory() {
    // always create raceHistory before creating a new rankHistory
    this.rankHistory.push(this.getNewRankHistoryObj());
  }

  getNewRankHistoryObj() {
    return {
      createdAt: this.updatedAt,
      racePosition: this.racePosition,
      racePoints: this.racePoints,
      bestLapPoints: this.bestLapPoints,
      bestLapPosition: this.bestLapPosition,
      totalPoints: this.totalPoints,
      totalPosition: this.totalPosition,
    };
  }

  toJSON() {
    return {
      playerLogin: this.playerLogin,
      playerNickName: this.playerNickName,
      playerNickNameWithColor: this.playerNickNameWithColor,
      rankHistory: this.rankHistory,
      racePosition: this.racePosition,
      racePoints: this.racePoints,
      bestLapPosition: this.bestLapPosition,
      bestLapPoints: this.bestLapPoints,
      totalPoints: this.totalPoints,
      totalPosition: this.totalPosition,
    };
  }
}

module.exports = LeaderboardPlayer;
