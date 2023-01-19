class ChartUtil {
  static getColors() {
    const colors = ["#00700c", "#eff714", "#f71414", "#a414f7", "#f714ba"];

    return colors;
  }

  static getData(history, dataProp, labelProp = "createdAt", maxNumberOfDataPoints = 30) {
    if (!history || !history.length) {
      return {
        labels: [],
        data: [],
      };
    }

    let startIndex = history.length < maxNumberOfDataPoints ? history.length - 1 : maxNumberOfDataPoints;
    let stopIndex = history.length > maxNumberOfDataPoints ? maxNumberOfDataPoints : 0;
    const labels = [];
    const data = [];
    for (let i = startIndex; i >= stopIndex; i--) {
      if (history[i][dataProp]) {
        data.push(history[i][dataProp]);
        labels.push(ChartUtil.getTimeForLabel(history[i][labelProp]));
      }
    }

    return {
      labels: labels.reverse(),
      data: data.reverse(),
    };
  }

  static getDataTotalPoints(ranking) {
    const d = ChartUtil.getData(ranking.rankHistory, "totalPoints");
    return {
      labels: d.labels,
      data: d.data,
      playerNickName: ranking.playerNickName,
      playerLogin: ranking.playerLogin,
    };
  }

  static getDataAvgLapTimes(ranking) {
    const d = ChartUtil.getData(ranking.raceHistory, "avgTimeMs");
    return {
      labels: d.labels,
      data: d.data,
      playerNickName: ranking.playerNickName,
      playerLogin: ranking.playerLogin,
    };
  }

  static getDataTimeDiff(player, otherPlayer) {
    if (!otherPlayer) {
      return null;
    }
    const checkpoints1 = player.getFastestRace().getCheckpoints();
    const checkpoints2 = otherPlayer.getFastestRace().getCheckpoints();
    //console.log("checkpoints1", checkpoints1);

    console.log("otherPlayer", otherPlayer);
    console.log("checkpoints2", checkpoints2);
    const resultDiff = checkpoints1.map((c, index) => {
      return c.timeMs - checkpoints2[index].timeMs;
    });

    return {
      labels: Object.keys(resultDiff),
      data: resultDiff,
      playerNickName: otherRanking.playerNickName,
      playerLogin: otherRanking.playerLogin,
    };

    console.log(resultDiff);
    return resultDiff;

    const d = ChartUtil.getData(ranking.raceHistory, "avgTimeMs");
    return {
      labels: d.labels,
      data: d.data,
      playerNickName: ranking.playerNickName,
      playerLogin: ranking.playerLogin,
    };
  }

  static findItemsCloseBy(rankings, ranking, numberOfItemsOnEachSide) {
    const mainIndex = rankings.indexOf(ranking);
    const numberOfItems = Math.min(numberOfItemsOnEachSide * 2, rankings.length);
    let index = mainIndex - numberOfItemsOnEachSide;
    const result = [];

    while (result.length < numberOfItems) {
      let r = rankings[index];
      if (r) {
        result.push(r);
      }
      index++;
    }
    return result;
  }

  static getTimeForLabel(datetime) {
    const items = datetime.split(" ");
    const dates = items[0].split("-");
    const times = items[1].split(":");

    return `${dates[2]}/${dates[1]} ${times[0]}:${times[1]}`;
  }
}

module.exports = ChartUtil;
