const Leaderboard = require("../leaderboard/Leaderboard");
const MongoType = require("./MongoType");

class MongoRacing extends MongoType {
  constructor(props = {}) {
    super("racing", "Race Item");
  }

  async store(racing) {
    await this.insertOrUpdate(racing);

    try {
      await this.connect();

      await this.collection.updateOne(
        { _id: racing._id },
        {
          $set: {
            races: racing.races
          },
        },
        {
          upsert: true,
        }
      );

      racing = null;
    } catch (e) {
      console.log(e);
    } finally {
      await this.close();
    }
  }
}

module.exports = MongoRacing;
