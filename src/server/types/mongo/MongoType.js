const {MongoClient} = require("mongodb");
const mongoConfig = require("./mongoConfig");

class MongoType {
  /**
   *
   * @param {string} collection - Name of mongo collection
   */
  constructor(db, collectionName = "", itemName = "", immutable = false) {
    this.db = db;
    this._id = null;
    this.itemName = itemName;
    this.collectionName = collectionName;
    this.immutable = immutable;
    this.client = new MongoClient(mongoConfig.uri);
    this.collection = this.client.db(db).collection(collectionName);
  }

  async connect() {
    await this.client.connect();
  }

  async close() {
    await this.client.close();
  }

  async insertOrUpdate(item, callback) {
    try {
      await this.connect();
      let hasItem = await this.collection.findOne({ _id: item._id });
      if (hasItem) {
        console.log(`${this.itemName} exists in collection. Maybe update?`);
        callback && (await callback());
        hasItem = null;
        return 2;
      } else {
        await this.collection.insertOne(item.toJSON());
        console.log(`Inserted ${this.itemName} into the database ${this.db}`);
        return 1;
      }
    } finally {
      await this.close();
    }
  }

  async getAll() {
    try {
      await this.connect();
      return await this.collection.find({}).toArray();
    } catch (e) {
      console.log(e);
    } finally {
      await this.close();
    }
  }

  async drop() {
    try {
      await this.connect();
      return await this.collection.drop();
    } catch (e) {
      console.log(e);
    } finally {
      await this.close();
    }
  }

  toJSON() {}
}

module.exports = MongoType;
