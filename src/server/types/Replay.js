const CommonUtils = require("../../utils/CommonUtils");
const TimeUtil = require("../../utils/TimeUtil");

class Replay {
  constructor(props) {
    this._id = props._id;
    this.fileName = props.fileName;
    this.challengeName = props.challengeName;
    this.playerLogin = props.playerLogin;
    this.size = props.size;
    this.lapsCount = props.lapsCount;
    this.timeMs = props.timeMs;
  }

  toJSON() {
    return {
      _id: this._id,
      fileName: this.fileName,
      challengeName: this.challengeName,
      playerLogin: this.playerLogin,
      lapsCount: this.lapsCount,
      timeMs: this.timeMs,
      size: this.size,
    };
  }

  static create(props) {

    try {
      props._id = CommonUtils.generateGUID();
      props.timeMs = TimeUtil.getMillisFromReplayName(props.fileName);
      props.lapsCount = props.fileName.split("[")[1].split(" ")[0];
      const nameItems = props.fileName.split("(")[0].split("_");
      props.playerLogin = nameItems.pop();
      props.challengeName = nameItems.join("_");

      return new Replay(props);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Replay;
