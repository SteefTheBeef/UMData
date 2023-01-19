const ChallengePlayer = require("./ChallengePlayer");

function sortByRaceTime(player1, player2) {
  return player1.bestCompletedRace.totalTimeMs - player2.bestCompletedRace.totalTimeMs;
}

function sortByBestLap(bestLap1, bestLap2) {
  return bestLap1.timeMs - bestLap2.timeMs;
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
    this.players = props.players || [];
    this.players = this.players.map((r) => new ChallengePlayer(r));
  }

  findPlayer(playerLogin) {
    return this.players.find((r) => r.playerLogin === playerLogin);
  }

  setPreviousPointsOnPlayers() {
    this.players.forEach(p => {
      p.previousPoints = {
        points: p.points,
        bestLapPoints: p.bestLap.points,
      }
    })
  }

  hasPointsChanged() {
    for (let player of this.players) {
      if (player.previousPoints) {
        if (player.previousPoints.points !== player.points) {
          return true;
        }
        if (player.previousPoints.bestLapPoints !== player.bestLap.points) {
          return true;
        }
      }
    }

    return false;
  }

  addPlayerFromRaceRanking(raceRanking) {
    const newPlayer = new ChallengePlayer(raceRanking);
    newPlayer.addRace(raceRanking);

    this.players.push(newPlayer);
    return this.players[this.players.length - 1];
  }

  getLastPlayer() {
    return this.players[this.players.length - 1];
  }

  addRankHistory(createdAt) {
    for (let player of this.players) {
      player.addRankHistory(createdAt);
    }
  }

  updatePoints() {
    this.setRegularPoints();
    this.setPointsOnBestLaps();
    this.setTotalPoints();
  }

  setRegularPoints() {
    // only set points from completed races
   const onlyCompleted = this.players.map(p => {
    p.bestCompletedRace = p.getBestCompletedRace()
     return p;
   }).filter(p => !!p.bestCompletedRace);

    if (onlyCompleted.length > 1) {
      onlyCompleted.sort(sortByRaceTime);
    }

    let points = 96;
    let position = 1;
    for (let player of this.players) {
      player.points = 0;
    }

    for (let player of onlyCompleted) {
      player.points = points;
      player.position = position;
      if (position === 1) {player.points += 24}
      if (position === 2) {player.points += 12}
      if (position === 3) {player.points += 6}
      points -= 2;
      position++;
    }
  }

  setPointsOnBestLaps() {
    const bestLaps = this.players.map((r) => r.bestLap);
    if (bestLaps.length > 1) {
      bestLaps.sort(sortByBestLap);
    }

    let points = 48;
    let index = 1;
    for (let bestLap of bestLaps) {
      bestLap.position = index;
      bestLap.points = points;
      if (index === 1) {bestLap.points += 12}
      if (index === 2) {bestLap.points += 6}
      if (index === 3) {bestLap.points += 3}
      points -= 1;
      index++;
    }
  }

  setTotalPoints() {
    for (let player of this.players) {
      player.totalPoints = player.points + player.bestLap.points;
    }

    this.players.sort(sortByTotalPoints);

    this.players.forEach((p, index) => {
      p.position = index + 1;
    })
  }

  toJSON() {
    return {
      _id: this._id,
      envi: this.envi,
      name: this.name,
      nameWithColor: this.nameWithColor,
      author: this.author,
      players: this.players.map((r) => r.toJSON()),
    };
  }
}

module.exports = Challenge;
