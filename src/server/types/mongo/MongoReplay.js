const MongoType = require("./MongoType");

class MongoReplay extends MongoType {
  constructor(db) {
    super(db,"replays", "Replay Item");
  }

  async store(replay) {
    await this.insertOrUpdate(replay);
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

module.exports = MongoReplay;
