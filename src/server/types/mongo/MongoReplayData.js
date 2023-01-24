const MongoType = require("./MongoType");

class MongoReplayData extends MongoType {
  constructor(props = {}) {
    super("replaysData", "ReplaysData Item");
  }

  async store(replayData) {
    await this.insertOrUpdate(replayData);
    return;
    try {
      await this.connect();

      await this.collection.updateOne(
        { _id: replay._id },
        {
          $set: {
            races: replay.races
          },
        },
        {
          upsert: true,
        }
      );

    } catch (e) {
      console.log(e);
    } finally {
      await this.close();
    }
  }
}

module.exports = MongoReplayData;
