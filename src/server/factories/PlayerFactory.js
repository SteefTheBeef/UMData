const Player = require("../types/Player");

class PlayerFactory {
  static createFromMongo(mongoPlayer) {
    return new Player({
      _id: mongoPlayer._id,
      login: mongoPlayer.login,
      nickName: mongoPlayer.nickName,
      nickNameWithColor: mongoPlayer.nickNameWithColor,
      nickNameWithColorHTML: mongoPlayer.nickNameWithColor,
      lastSeen: mongoPlayer.lastSeen,
    });
  }
}

module.exports = PlayerFactory;
