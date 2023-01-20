const Leaderboard = require("../leaderboard/Leaderboard");
const MongoType = require("./MongoType");

class MongoLeaderboard extends MongoType {
  constructor(props = {}) {
    super("l", "Leaderboard Item");
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
