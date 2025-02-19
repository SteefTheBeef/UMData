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
  constructor(db) {
    super(db,"c", "Challenge");
  }

  async cleanStore(challenge) {
    const result = await this.insertOrUpdate(challenge);
    if (result === 2) {
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
    }
  }

  async store(race) {
    const hasImproved = [];
    try {
      await this.connect();
      let existingChallenge = await this.collection.findOne({
        _id: race.challengeId,
      });

      if (!existingChallenge) {
        let challenge = race.getChallenge();

        for (let raceRanking of race.raceRankings) {
          const player = challenge.addPlayerFromRaceRanking(raceRanking);
          player.setBestLap(raceRanking);
          player.setBestRace(raceRanking, raceRanking.createdAt, challenge.envi);
          hasImproved.push(player);
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
      //console.log("Challenge exists");
      let createdAt;
      for (let raceRanking of race.raceRankings) {

        let currentPlayer = challenge.findPlayer(raceRanking.playerLogin);
        if (currentPlayer) {
          createdAt = raceRanking.createdAt;
          currentPlayer.addRace(raceRanking);
          currentPlayer.setBestLap(raceRanking);
          if(currentPlayer.setBestRace(raceRanking, createdAt, challenge.envi)) {
            hasImproved.push(currentPlayer);
          }

        } else {
          // player is unranked on this challenge. Insert new ranking.
          // console.log("PLAYER ADDED TO EXISTING CHALLENGE");
          createdAt = raceRanking.createdAt;
          currentPlayer = challenge.addPlayerFromRaceRanking(raceRanking);
          currentPlayer.setBestLap(raceRanking);
          if(currentPlayer.setBestRace(raceRanking, createdAt, challenge.envi)){
            hasImproved.push(currentPlayer);
          }
        }
      }

      challenge.setPreviousPointsOnPlayers();
      challenge.updatePoints();

      if (challenge.hasPointsChanged()) {
        challenge.addRankHistory(createdAt);
      }

      const improvedTop10 = hasImproved.filter(p => {
        const lastRank = p.getLastRankHistory();
        const lastRace = p.getLastRaceHistory();

        return lastRank.position < 16 && lastRace.totalTimeMs === lastRank.totalTimeMs && lastRace.raceWasCompleted;
      })

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

      console.log("Updated challenge", challenge.name);

      return improvedTop10;

    } catch (e) {
      console.log(e);
    } finally {
      await this.close();
    }
  }

}

module.exports = MongoChallenge;
