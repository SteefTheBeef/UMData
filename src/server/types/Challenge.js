const Ranking = require("./Ranking");

function sortByMilliSeconds(ranking1, ranking2) {
  return ranking1.timeMs - ranking2.timeMs;
}

// highest first
function sortByTotalPoints(ranking1, ranking2) {
  return ranking2.totalPoints - ranking1.totalPoints;
}

class Challenge {
  constructor(props = {}) {
    this._id = props._id;
    this.envi = props.envi;
    this.name = props.name;
    this.nameWithColor = props.nameWithColor;
    this.author = props.author;
    this.rankings = props.rankings || [];
    this.rankings = this.rankings.map((r) => new Ranking(r));
  }

  findRanking(playerLogin) {
    return this.rankings.find((r) => r.playerLogin === playerLogin);
  }

  addRanking(incomingRanking) {
    const newRanking = new Ranking(incomingRanking);
    newRanking.addRaceHistory(newRanking);
    this.rankings.push(newRanking);
    return this.rankings[this.rankings.length - 1];
  }

  getLastRanking() {
    console.log("getLastRanking", this.rankings);
    return this.rankings[this.rankings.length - 1];
  }

  addRankHistory(createdAt) {
    for (let ranking of this.rankings) {
      ranking.addRankHistory(createdAt);
    }
  }

  updatePoints() {
    this.setPointsOnRankings();
    this.setPointsOnBestLaps();
    this.setTotalPoints();
  }

  setPointsOnRankings() {
    if (this.rankings.length > 1) {
      this.rankings.sort(sortByMilliSeconds);
    }

    let points = 96;
    let position = 1;
    for (let ranking of this.rankings) {
      ranking.points = points;
      ranking.position = position;
      points -= 2;
      position++;
    }
  }

  setPointsOnBestLaps() {
    const bestLaps = this.rankings.map((r) => r.bestLap);
    if (bestLaps.length > 1) {
      bestLaps.sort(sortByMilliSeconds);
    }

    let points = 48;
    let index = 1;
    for (let bestLap of bestLaps) {
      bestLap.position = index;
      bestLap.points = points;
      points -= 1;
      index++;
    }
  }

  setTotalPoints() {
    for (let ranking of this.rankings) {
      ranking.totalPoints = ranking.points + ranking.bestLap.points;
    }

    this.rankings.sort(sortByTotalPoints);
  }

  toJSON() {
    return {
      _id: this._id,
      envi: this.envi,
      name: this.name,
      nameWithColor: this.nameWithColor,
      author: this.author,
      rankings: this.rankings.map((r) => r.toJSON()),
    };
  }
}

module.exports = Challenge;
