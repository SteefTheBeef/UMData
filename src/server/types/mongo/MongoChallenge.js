const MongoType = require("./MongoType");

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

  async cleanUp() {
    //this.deleteTempDataBeforeStorage(this.rankings);
    await this.collection.updateOne(
      { _id: this._id },
      {
        $set: {
          rankings: this.rankings,
        },
      },
      {
        upsert: true,
      }
    );
  }

  async store(challenge) {
    try {
      await this.connect();
      let existingChallenge = await this.collection.findOne({
        _id: challenge._id,
      });

      if (!existingChallenge) {
        // TODO: redudant loops, combine
        challenge.updatePoints();

        for (let ranking of challenge.rankings) {
          ranking.addRaceHistory(ranking);
        }
        console.log("CHALLENGE", challenge);
        challenge.addRankHistory(challenge.getLastRanking().getLastRaceHistory().createdAt);
        challenge.rankings.sort(sortByTotalPoints);
        //console.log("Challenge Store", this.rankings[0]);
        const result = await this.collection.insertOne(challenge.toJSON());
        console.log("Inserted challenge ", result.insertedId, " into the database.");
        return 1;
      }

      //UPDATE existing challenge
      existingChallenge = new Challenge(existingChallenge);
      console.log("Challenge exists");

      let shouldAddHistory = false;
      let createdAt = null;

      for (let ranking of challenge.rankings) {
        // remove any duplicates
        this.removeDuplicateRankings(existingChallenge, ranking);

        const currentRanking = existingChallenge.findRanking(ranking.playerLogin);
        if (currentRanking) {
          //this.setBasicInfo(currentRanking, ranking);
          currentRanking.addRaceHistory(ranking);
          const wasUpdated = currentRanking.updateTimesFromAnotherRanking(ranking);
          if (wasUpdated) {
            shouldAddHistory = true;
            createdAt = ranking.createdAt;
          }
        } else {
          // player is unranked on this challenge. Insert new ranking.
          console.log("RANKING ADDED TO EXISTING CHALLENGE");
          existingChallenge.addRanking(ranking);
          shouldAddHistory = true;
          createdAt = ranking.createdAt;
        }
      }

      existingChallenge.updatePoints();

      if (shouldAddHistory) {
        existingChallenge.addRankHistory(createdAt);
      }

      await this.collection.updateOne(
        { _id: existingChallenge._id },
        {
          $set: {
            rankings: existingChallenge.rankings.map((r) => r.toJSON()),
          },
        },
        {
          upsert: true,
        }
      );

      console.log("Updated challenge", existingChallenge.name);
    } catch (e) {
      console.log(e);
    } finally {
      await this.close();
    }
  }

  removeDuplicateRankings(existingChallenge, ranking) {
    const existingRankings = existingChallenge.rankings.filter((r) => r.playerLogin === ranking.playerLogin);
    if (existingRankings.length > 1) {
      existingRankings.sort(sortByMilliSeconds);
      for (let i = 1; i < existingRankings.length; i++) {
        existingChallenge.rankings.splice(this.rankings.indexOf(existingRankings[i]), 1);
      }
    }
  }
}

module.exports = MongoChallenge;
