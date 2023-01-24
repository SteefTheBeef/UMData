class TimeUtil {
  static millisToMinutes(millis) {
    const minutes = TimeUtil.addLeadingZero(Math.floor(millis / 1000 / 60));
    const secs = (millis / 1000) % 60;
    const seconds = TimeUtil.addLeadingZero(Math.floor(secs));
    const hundreds = TimeUtil.addLeadingZero(Math.floor((secs * 100) % 100));
    //console.log(`${minutes}:${seconds}.${hundreds}`);
    return `${minutes}:${seconds}.${hundreds}`;
  }

  static millisToSeconds(millis) {
    const minutes = TimeUtil.addLeadingZero(Math.floor(millis / 1000 / 60));
    const secs = (millis / 1000) % 60;
    const seconds = TimeUtil.addLeadingZero(Math.floor(secs + minutes * 60));
    const hundreds = TimeUtil.addLeadingZero(Math.floor((secs * 100) % 100));
    //console.log(`${minutes}:${seconds}.${hundreds}`);
    return `${seconds}.${hundreds}`;
  }

  /**
   *
   * @param time - 01:04.01
   */
  static raceTimeToMilliSeconds(time) {
    const mins = parseInt(time.substring(0, 2), 10);
    const seconds = parseInt(time.substring(3, 5), 10);
    const hundreds = parseInt(time.substring(6, 8), 10);
    return mins * 60 * 1000 + seconds * 1000 + hundreds * 10;
  }

  static raceTimeToMilliSeconds1(time) {
    const mins = parseInt(time.substring(0, 2), 10);
    const seconds = parseInt(time.substring(3, 5), 10);
    const hundreds = parseInt(time.substring(6, 8), 10);
    return mins * 60 * 1000 + seconds * 1000 + hundreds * 10;
  }

  static addLeadingZero(number) {
    return number < 10 ? `0${number}` : number.toString();
  }

  static getMillisFromReplayName(replayName) {
    try {
      const first = replayName.split("(");
      const time = first[1].split(")")[0];
      const msArr = time.split("''");
      const ms = parseInt(msArr[1], 10);
      const seconds = parseInt(msArr[0].split("'")[1]);
      const minutes = parseInt(msArr[0].split("'")[0]);


      return minutes * 60 * 1000 + seconds * 1000 + ms;
    } catch(e) {
      console.log(e);
      return 0;
    }
  }
}

module.exports = TimeUtil;
