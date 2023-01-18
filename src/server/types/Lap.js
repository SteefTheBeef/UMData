class Lap {
  constructor(props) {
    this.playerLogin = props.playerLogin;
    this.raceId = props.raceId;
    this.lapNumber = props.lapNumber;
    this.time = props.time;
    this.timeMs = props.timeMs;
    this.checkpoints = props.checkpoints;
  }

  static create(rawString, lapNumber) {
    const items = rawString.split(",");

    return new Lap({
      playerLogin: items[0],
      lapTime: items[1],
      checkpoints: items[2],
      lapNumber,
    });
  }

  toJSON() {
    return {
      playerLogin: this.playerLogin,
      lapNumber: this.lapNumber,
      time: this.time,
      timeMs: this.timeMs,
    };
  }
}

module.exports = Lap;
