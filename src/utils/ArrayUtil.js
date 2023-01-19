class ArrayUtil {
  static sortByTimeMs(record1, record2) {
    return record1.timeMs - record2.timeMs;
  }

  static sortByBestLapPoints(record1, record2) {
    return record2.bestLapPoints - record1.bestLapPoints;
  }

  static sortByRacePoints(record1, record2) {
    return record2.racePoints - record1.racePoints;
  }

  static sortByTotalPoints(record1, record2) {
    return record2.totalPoints - record1.totalPoints;
  }

  static sortByColumn(arr, column, ascending = true) {
    console.log(ascending);
    console.log(column);
    const b = arr.sort((record1, record2) => {
      console.log("record1", record1[column]);
      console.log("record2", record2[column]);
      return ascending ? record1[column] - record2[column] : record2[column] - record1[column];
    });

    console.log(b);
  }

  sum(arr) {
    let result = 0;

    arr.forEach((a) => {
      result += a;
    });

    return result;
  }

  static isEqual(obj1, obj2, columns = []) {
    if (!obj1 || !obj2) {
      return false;
    }
    for (let col of columns) {
      if (obj1[col] !== obj2[col]) {
        return false;
      }
    }

    return true;
  }
}

module.exports = ArrayUtil;
