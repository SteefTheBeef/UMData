class Checkpoint {
  constructor(props) {
    this.playerLogin = props.playerLogin;
    this.raceId = props.raceId;
    this.LapId = props.LapId;
    this.lapNumber = props.lapNumber;
    this.challengeId = props.challengeId;
    this.time = props.time;
  }

  toJSON() {
    return {
      playerLogin: this.playerLogin,
      lapNumber: this.lapNumber,
      time: this.time,
    };
  }
}

module.exports = Checkpoint;
