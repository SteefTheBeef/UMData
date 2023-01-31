const LeaderboardPlayer = require("./LeaderboardPlayer");
const ArrayUtil = require("../../../utils/ArrayUtil");

class Leaderboard {
  constructor(props) {
    this._id = "UNITED_MASTERS_QUALIFICATION";
    this.players = props && props.players && props.players.length ? props.players.map((p) => new LeaderboardPlayer(p)) : [];
  }

  updatePoints(challenges) {
    this.players.forEach((player) => {
      player.setPrevValues();
      player.resetPoints();
    });

    let shouldAddHistory;
    for(let challenge of challenges) {
      for (let challengePlayer of challenge.players) {
        let player = this.players.find((p) => p.playerLogin === challengePlayer.playerLogin);
        if (!player) {
          player = new LeaderboardPlayer({
            playerLogin: challengePlayer.playerLogin,
            playerNickName: challengePlayer.playerNickName,
            playerNickNameWithColor: challengePlayer.playerNickNameWithColor,
            racePoints: 0,
            bestLapPoints: 0,
            totalPoints: 0,
            position: 999,
            prevValues: {
              racePoints: 0,
              bestLapPoints: 0
            }
          });

          this.players.push(player);
          // always add history when a new player is added.
          shouldAddHistory = true;
        } else {
          player.playerNickName = challengePlayer.playerNickName;
          player.playerNickNameWithColor = challengePlayer.playerNickNameWithColor;
        }

        // TODO: change updatedAt...
        const lastRank = challengePlayer.getLastRankHistory();
        player.updatedAt = lastRank.createdAt;
        player.racePoints += lastRank.points;
        player.bestLapPoints += lastRank.bestLapPoints;

      }
    }

    this.players.forEach((p) => {
      p.prevValues = {
        racePoints: p.racePoints,
        bestLapPoints: p.bestLapPoints,
      };
    });

    this.players.forEach((p) => {
      p.totalPoints = p.racePoints + p.bestLapPoints;
      //console.log(p);
      if (p.prevValues.racePoints !== p.racePoints || p.prevValues.bestLapPoints !== p.bestLapPoints) {
        shouldAddHistory = true;
      }
    });

    this.players.sort(ArrayUtil.sortByRacePoints);
    this.players.forEach((p, index) => {
      p.position = index + 1;
    });


    this.players.sort(ArrayUtil.sortByBestLapPoints);
    this.players.forEach((p, index) => {
      p.bestLapPosition = index + 1;
    });

    this.players.sort(ArrayUtil.sortByTotalPoints);
    this.players.forEach((p, index) => {
      p.totalPosition = index + 1;
    });

    return shouldAddHistory;
  }

  updateHistory() {
    this.players.forEach((p) => {
      p.addRankHistory();
    });
  }

  toJSON() {
    return {
      _id: this._id,
      players: this.players.map((p) => p.toJSON()),
    };
  }
}

module.exports = Leaderboard;
