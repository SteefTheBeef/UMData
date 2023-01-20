const MongoType = require("./MongoType");
const Challenge = require("../challenge/Challenge");

function sortByMilliSeconds(ranking1, ranking2) {
  return ranking1.timeMs - ranking2.timeMs;
}

// highest first
function sortByTotalPoints(ranking1, ranking2) {
  return ranking2.totalPoints - ranking1.totalPoints;
}

class MongoChallenge extends MongoType {
  constructor() {
    super("c", "Challenge");
  }

  async store(race) {
    try {
      await this.connect();
      let existingChallenge = await this.collection.findOne({
        _id: race.challengeId,
      });

      if (!existingChallenge) {
        let challenge = race.getChallenge();

        for (let raceRanking of race.raceRankings) {
          challenge.addPlayerFromRaceRanking(raceRanking);
        }

        challenge.setPreviousPointsOnPlayers();
        challenge.updatePoints();
        challenge.addRankHistory(challenge.getLastPlayer().getLastRaceHistory().createdAt);

        const result = await this.collection.insertOne(challenge.toJSON());
        challenge = null;
        console.log("Inserted challenge ", result.insertedId, " into the database.");
        const chall =  await this.collection.findOne({ _id: result.insertedId });
        return new Challenge(chall);
      }

      //UPDATE existing challenge
      let challenge = new Challenge(existingChallenge);
      console.log("Challenge exists");
      let createdAt;
      for (let raceRanking of race.raceRankings) {

        const currentPlayer = challenge.findPlayer(raceRanking.playerLogin);
        if (currentPlayer) {
          currentPlayer.addRace(raceRanking);
          currentPlayer.setBestLap(raceRanking);
          createdAt = raceRanking.createdAt;
        } else {
          // player is unranked on this challenge. Insert new ranking.
          console.log("PLAYER ADDED TO EXISTING CHALLENGE");
          challenge.addPlayerFromRaceRanking(raceRanking);
          createdAt = raceRanking.createdAt;
        }
      }

      challenge.setPreviousPointsOnPlayers();
      challenge.updatePoints();

      if (challenge.hasPointsChanged()) {
        challenge.addRankHistory(createdAt);
      }

      await this.collection.updateOne(
        { _id: challenge._id },
        {
          $set: {
            players: challenge.players.map((r) => r.toJSON()),
          },
        },
        {
          upsert: true,
        }
      );

      // clear memory
      challenge = null;

      console.log("Updated challenge", challenge.name);
      const chall =  await this.collection.findOne({ _id: challenge._id });
      return new Challenge(chall);
    } catch (e) {
      console.log(e);
    } finally {
      await this.close();
    }
  }

}

module.exports = MongoChallenge;
