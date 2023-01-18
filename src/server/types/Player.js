const MongoType = require("./mongo/MongoType");
const ColorParser = require("../../utils/ColorParser");

class Player extends MongoType {
  /**
   *
   * @param {string} props._id - uniq login
   * @param {string} props.login - uniq login
   * @param {string} props.nickName - nickname
   * @param {string} props.nickNameWithColor - nickNameWithColor
   * @param {string} props.lastSeen - date
   */
  constructor(props = {}) {
    super("players", "Player");

    this._id = props._id;
    this.login = props.login;
    this.nickName = props.nickName || props.login;
    this.nickNameWithColor = props.nickNameWithColor || this.nickName || "";
    this.nickNameWithColorHTML = ColorParser.toHTML(this.nickNameWithColor);
    this.lastSeen = props.lastSeen;
    this.records = [];
    this.totalTimeMs = 0;
    this.totalReadableTime = "";
    this.totalPoints = 0;
  }

  async store() {
    await this.insertOrUpdate(this, async () => {
      await this.collection.updateOne(
        { _id: this._id },
        {
          $set: {
            nickName: this.nickName,
            nickNameWithColor: this.nickNameWithColor,
            nickNameWithColorHTML: this.nickNameWithColorHTML,
            lastSeen: this.lastSeen,
          },
        },
        {
          upsert: true,
        }
      );
      console.log("Updated player ", this._id, "");
    });
  }

  toJSON() {
    return {
      _id: this._id,
      login: this.login,
      nickName: this.nickName,
      nickNameWithColor: this.nickNameWithColor,
      nickNameWithColorHTML: this.nickNameWithColorHTML,
      lastSeen: this.lastSeen,
      records: this.records,
      totalTimeMs: this.totalTimeMs,
      totalReadableTime: this.totalReadableTime,
      totalPoints: this.totalPoints,
    };
  }
}

module.exports = Player;
