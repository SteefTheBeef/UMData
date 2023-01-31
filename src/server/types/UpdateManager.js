const Leaderboard = require("./leaderboard/Leaderboard");

class UpdateManager {
  constructor() {
    this.challenges = [];
    this.leaderboard = new Leaderboard();
  }

  updateChallenge(race) {
    try {
      let existingChallenge = this.challenges.find(c => c._id === race.challengeId);

      if (!existingChallenge) {
        let challenge = race.getChallenge();

        for (let raceRanking of race.raceRankings) {
          const player = challenge.addPlayerFromRaceRanking(raceRanking);
          player.setBestLap(raceRanking);
          player.setBestRace(raceRanking, raceRanking.createdAt, challenge.envi);
        }

        challenge.setPreviousPointsOnPlayers();
        challenge.updatePoints();
        challenge.addRankHistory(challenge.getLastPlayer().getLastRaceHistory().createdAt);
        this.challenges.push(challenge);
        return challenge;
      }

      let createdAt;
      for (let raceRanking of race.raceRankings) {

        let currentPlayer = existingChallenge.findPlayer(raceRanking.playerLogin);
        if (currentPlayer) {
          createdAt = raceRanking.createdAt;
          currentPlayer.addRace(raceRanking);
          currentPlayer.setBestLap(raceRanking);
          currentPlayer.setBestRace(raceRanking, createdAt, existingChallenge.envi);

        } else {
          // player is unranked on this challenge. Insert new ranking.
          // console.log("PLAYER ADDED TO EXISTING CHALLENGE");
          createdAt = raceRanking.createdAt;
          currentPlayer = existingChallenge.addPlayerFromRaceRanking(raceRanking);
          currentPlayer.setBestLap(raceRanking);
          currentPlayer.setBestRace(raceRanking, createdAt, existingChallenge.envi);
        }
      }

      existingChallenge.setPreviousPointsOnPlayers();
      existingChallenge.updatePoints();

      if (existingChallenge.hasPointsChanged()) {
        existingChallenge.addRankHistory(createdAt);
      }
    } catch (e) {
      console.log(e);
    }
  }

  updateLeaderboard() {
    try {
      if (this.leaderboard) {

        if (this.leaderboard.updatePoints(this.challenges)) {
          this.leaderboard.updateHistory();
        }
      }

    } catch (e) {
      console.log(e);
    }
  }

}

module.exports = UpdateManager;
