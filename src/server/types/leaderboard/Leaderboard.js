const LeaderboardPlayer = require("./LeaderboardPlayer");
const ArrayUtil = require("../../../utils/ArrayUtil");

class Leaderboard {
  constructor(props) {
    this._id = "UNITED_MASTERS_QUALIFICATION";
    this.players = props.players && props.players.length ? props.players.map((p) => new LeaderboardPlayer(p)) : [];
  }

  updatePoints(challenges) {
    this.players.forEach((player) => {
      player.resetPoints();
    });

    let shouldAddHistory;
    for (let challenge of challenges) {
      for (let ranking of challenge.rankings) {
        let player = this.players.find((p) => p.playerLogin === ranking.playerLogin);
        if (!player) {
          player = new LeaderboardPlayer({
            playerLogin: ranking.playerLogin,
            playerNickName: ranking.playerNickName,
            playerNickNameWithColor: ranking.playerNickNameWithColor,
            points: 0,
            position: 999,
            prevValues: {
              points: 0,
              bestLapPoints: 0,
            },
          });

          this.players.push(player);
          // always add history when a new player is added.
          shouldAddHistory = true;
        } else {
          if (!player.prevValues) {
            // store the or previous values, so that we can compare with them later
            // to see if any changes has been made, if so we update/add history.
            console.log("ADDED prevValues");
            player.prevValues = {
              points: player.points,
              bestLapPoints: player.bestLapPoints,
            };
          }
          player.playerNickName = ranking.playerNickName;
          player.playerNickNameWithColor = ranking.playerNickNameWithColor;
        }

        // TODO: change updatedAt...
        const lastRank = ranking.getLastRankHistory();
        player.updatedAt = lastRank.createdAt;
        player.racePoints += lastRank.points;
        player.bestLapPoints += lastRank.bestLapPoints;
      }
    }

    this.players.forEach((p) => {
      p.totalPoints = p.racePoints + p.bestLapPoints;
      //console.log(p);
      if (p.prevValues.points !== p.points || p.prevValues.bestLapPoints !== p.bestLapPoints) {
        shouldAddHistory = true;
      }
    });

    this.players.sort(ArrayUtil.sortByPoints);
    this.players.forEach((p, index) => {
      p.points = index + 1;
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
