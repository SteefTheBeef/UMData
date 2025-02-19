const Leaderboard = require("../leaderboard/Leaderboard");
const MongoType = require("./MongoType");

class MongoLeaderboard extends MongoType {
  constructor(db) {
    super(db, "l", "Leaderboard Item");
  }

  async cleanStore(leaderboard) {
    const result = await this.insertOrUpdate(leaderboard);
    if (result === 2) {
      await this.collection.updateOne(
          { _id: leaderboard._id },
          {
            $set: {
              players: leaderboard.players.map((p) => p.toJSON()),
            },
          },
          {
            upsert: true,
          }
      );
    }
  }

  async store(leaderboard, challenges) {
    await this.insertOrUpdate(leaderboard);

    try {
      await this.connect();
      let currentLeaderboard = await this.collection.findOne({ _id: leaderboard._id });
      if (currentLeaderboard) {
        currentLeaderboard = new Leaderboard(currentLeaderboard);
        if (currentLeaderboard.updatePoints(challenges)) {
          currentLeaderboard.updateHistory();
        }
      }

      await this.collection.updateOne(
        { _id: currentLeaderboard._id },
        {
          $set: {
            players: currentLeaderboard.players.map((p) => p.toJSON()),
          },
        },
        {
          upsert: true,
        }
      );

      currentLeaderboard = null;
    } catch (e) {
      console.log(e);
    } finally {
      await this.close();
    }
  }
}

module.exports = MongoLeaderboard;
