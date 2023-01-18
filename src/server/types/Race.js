const MongoType = require("./mongo/MongoType");
const Challenge = require("./Challenge");

class Race extends MongoType {
  constructor(props) {
    super("r", "Race", true);

    this._id = new Date(props.date).valueOf();
    this.date = props.date;
    this.challengeId = props.challengeId;
    this.challengeName = props.challengeName;
    this.challengeNameWithColor = props.challengeNameWithColor;
    this.challengeEnvi = props.challengeEnvi;
    this.challengeAuthorLogin = props.challengeAuthorLogin;
    this.gameMode = props.gameMode;
    this.numberOfLaps = props.numberOfLaps;
    this.rankings = props.rankings || [];
    this.checkpoints = props.checkpoints || [];
    this.players = props.players || [];
    this.laps = props.laps || [];
  }

  async store() {
    return await this.insertOrUpdate(this);
  }

  getChallenge() {
    return new Challenge({
      _id: this.challengeId.trim(),
      envi: this.challengeEnvi.trim(),
      name: this.challengeName.trim(),
      nameWithColor: this.challengeNameWithColor.trim(),
      author: this.challengeAuthorLogin.trim(),
      rankings: this.getRankingsAsChallengeRecords(),
    });
  }

  getRankingsAsChallengeRecords() {
    return this.rankings.map((ranking) => {
      ranking.bestLap.raceId = this._id;
      ranking.createdAt = this.date;
      ranking.updatedAt = this.date;
      ranking.raceId = this._id;
      ranking.challengeId = this.challengeId;
      return ranking;
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
      rankings: this.rankings.map((ranking) => ranking.toJSON()),
      checkpoints: this.checkpoints.map((checkpoint) => checkpoint.toJSON()),
      laps: this.laps.map((lap) => lap.toJSON()),
    };
  }
}

module.exports = Race;
