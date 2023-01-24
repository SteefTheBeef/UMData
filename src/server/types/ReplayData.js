const CommonUtils = require("../../utils/CommonUtils");

class ReplayData {
  constructor(props) {
    this._id = props._id || null;
    this.replayId = props.replayId;
    this.data = props.data;
  }

  toJSON() {
    return {
      _id: this._id,
      replayId: this.replayId,
      data: this.data,
    };
  }
}

module.exports = ReplayData;
