const MongoType = require("./mongo/MongoType");
const Challenge = require("./challenge/Challenge");

class Race extends MongoType {
  constructor(db, props) {
    super(db, "r", "Race", true);
    if (props) {
      this._id = props._id;
      this.date = props.date;
      this.challengeId = props.challengeId;
      this.challengeName = props.challengeName;
      this.challengeNameWithColor = props.challengeNameWithColor;
      this.challengeEnvi = props.challengeEnvi;
      this.challengeAuthorLogin = props.challengeAuthorLogin;
      this.gameMode = props.gameMode;
      this.numberOfLaps = props.numberOfLaps;
      this.raceRankings = props.raceRankings || [];
      this.checkpoints = props.checkpoints || [];
      this.players = props.players || [];
      this.laps = props.laps || [];
    }
  }

  async store() {
    const result = await this.insertOrUpdate(this);
    if (result === 1) {
      console.log("Insertered race: ", this.date);
    }

    return result;
  }

  getChallenge() {
    return new Challenge({
      _id: this.challengeId.trim(),
      envi: this.challengeEnvi.trim(),
      name: this.challengeName.trim(),
      nameWithColor: this.challengeNameWithColor.trim(),
      author: this.challengeAuthorLogin.trim(),
    });
  }


  toJSON() {
    return {
      _id: this._id,
      date: this.date,
      challengeId: this.challengeId.trim(),
      challengeName: this.challengeName.trim(),
      challengeEnvi: this.challengeEnvi.trim(),
      challengeAuthorLogin: this.challengeAuthorLogin.trim(),
      gameMode: this.gameMode,
      numberOfLaps: this.numberOfLaps,
      raceRankings: this.raceRankings.map((ranking) => ranking.toJSON()),
      checkpoints: this.checkpoints.map((checkpoint) => checkpoint.toJSON()),
      laps: this.laps.map((lap) => lap.toJSON()),
    };
  }
}

module.exports = Race;
