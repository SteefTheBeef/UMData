const Race = require("../types/Race");
const Lap = require("../types/Lap");
const TimeUtil = require("../../utils/TimeUtil");
const Checkpoint = require("../types/Checkpoint");
const Player = require("../types/Player");
const RaceRanking = require("../types/RaceRanking");

class RaceFactory {
  /**
   *
   * @param rawString - ###
   * [2022-12-27, 14:56:51] LAPS MATCH on [lapstest] (Rally,ebJSLVqnJSrwOgjXu8vQ_RWdzV6,blackcat111)
   * Rank,Lap,Checkpoints,Time,BestLap,CPdelay,Points,Login,NickName
   * 1,2,4,37:00.18,00:04.01,0,25,blackcat111,sOb.Stef
   * --------------------
   * * Laps grouped by player
   * blackcat111,sOb.Stef,36:56.17,00:04.01,
   * --------------------
   * * Checkpoints grouped by player
   * blackcat111,sOb.Stef,00:00.00,36:53.93,36:56.17#,36:58.20,37:00.18#,
   * --------------------
   * * BestLaps
   * Rank,LapTime,LapNumber,Login,NickName
   * 1,00:04.01,2,blackcat111,sOb.Stef
   * 2,36:56.17,1,blackcat111,sOb.Stef
   * --------------------
   * @returns {Race}
   */
  static create(rawString) {
    const rows = rawString.split(/\r?\n/);

    const raceInfo = RaceFactory.createRaceInfo(rows);
    const players = RaceFactory.createPlayers(rows, raceInfo.date);
    let raceRankings = RaceFactory.createRankings(rows, players, raceInfo.date).filter((r) => !!r);
    const rawCheckpoints = RaceFactory.createCheckpoints(rows);
   // const checkpoints = RaceFactory.createNormalCheckpoints(rows);
    const { rawLaps, laps } = RaceFactory.createLaps(rows);

    raceRankings = raceRankings.map((r) => {
      r.laps = laps.filter((l) => l.playerLogin === r.playerLogin);
      if (!r.laps.length) {
        // something went wrong with this player, no laps reported. so exclude
        return null;
      }
      r.rawLaps = rawLaps.find((l) => l.playerLogin === r.playerLogin).raw;
      r.rawCheckpoints = rawCheckpoints.find((l) => l.playerLogin === r.playerLogin).raw;
      let bestLapTime = 9999999999999;

      // set best lap time.
      let lapIndex = 0;
      for (const lap of r.laps) {
        if (lap.timeMs < bestLapTime) {
          bestLapTime = lap.timeMs;
          r.bestLap = lap;
          r.bestLap.rawCheckpoints = r.rawCheckpoints.split("#")[lapIndex];
        }
        lapIndex++;
      }

      r.raceId = raceInfo._id;
      r.challengeId = raceInfo.challengeId;
      r.raceWasCompleted = raceInfo.numberOfLaps === r.completedLapsCount

      return r;
    });

    return new Race({
      _id: raceInfo._id,
      date: raceInfo.date,
      gameMode: raceInfo.gameMode,
      numberOfLaps: raceInfo.numberOfLaps,
      challengeId: raceInfo.challengeId,
      challengeName: raceInfo.challengeName,
      challengeNameWithColor: raceInfo.challengeNameWithColor,
      challengeEnvi: raceInfo.environment,
      challengeAuthorLogin: raceInfo.challengeAuthor,
      raceRankings: raceRankings.filter((r) => !!r),
      laps,
      players,
    });
  }

  static createLaps(rows) {
    const laps = [];
    const rawLaps = [];
    RaceFactory.createCollection(rows, "* Laps grouped by player", (row) => {
      const items = row.split(",");
      const playerLogin = items.shift();
      rawLaps.push({
        playerLogin,
        raw: items.join(","),
      });

      items.unshift(playerLogin);
      for (let i = 1; i < items.length; i++) {
        if (items[i]) {
          laps.push(
            new Lap({
              time: items[i],
              timeMs: TimeUtil.raceTimeToMilliSeconds(items[i]),
              playerLogin: items[0],
              lapNumber: i,
            })
          );
        }
      }
    });

    return { rawLaps, laps };
  }

  static createCheckpoints(rows) {
    const rawCheckpoints = [];
    RaceFactory.createCollection(rows, "* Checkpoints grouped by player", (row) => {
      const items = row.split(",");
      const playerLogin = items.shift();
      rawCheckpoints.push({
        playerLogin,
        raw: items.join(","),
      });
    });

    return rawCheckpoints;
  }

  static createNormalCheckpoints(rows) {
    let checkpointIndex = rows.findIndex((r) => r.indexOf("* Checkpoints grouped by player") > -1);
    if (checkpointIndex === -1) {
      return [];
    }

    checkpointIndex++;

    let moreCheckpoints = true;
    const checkpoints = [];

    while (moreCheckpoints) {
      //console.log('checkpointIndex', checkpointIndex);
      if (rows[checkpointIndex].indexOf("---") > -1) {
        //  console.log("no checkpoints!");
        moreCheckpoints = false;
      } else {
        const items = rows[checkpointIndex].split(",");
        let lapNumber = 1;

        for (let i = 2; i < items.length; i++) {
          const time = items[i].split("#")[0];
          if (time) {
            checkpoints.push(
              new Checkpoint({
                time: items[i].split("#")[0],
                playerLogin: items[0],
                lapNumber,
              })
            );
          }

          if (items[i].indexOf("#")) {
            lapNumber++;
          }
        }

        checkpointIndex++;
      }
    }

    return checkpoints;
  }

  /**
   * blackcat111,1,2,4,00:51.36,00:23:14,0,25
   * the string contains:
   * Login,Rank,Lap,Checkpoints,Time,BestLap,CPdelay,Points
   * @param rows
   * @param players
   * @param date
   * @returns RaceRanking[]
   */
  static createRankings(rows, players, date) {
    return RaceFactory.createCollection(rows, "* Scores:", (row) => {
      const items = row.split(",");
      let ranking = null;
      // validate that we do not have an empty string
      if (items.length > 1) {
        const playerLogin = items[0].trim();
        const player = players.find((p) => p.login === playerLogin);

        ranking = new RaceRanking({
          position: parseInt(items[1], 10),
          completedLapsCount: parseInt(items[2], 10),
          completedCheckpointsCount: parseInt(items[3], 10),
          time: items[4],
          timeMs: TimeUtil.raceTimeToMilliSeconds(items[4]),
          playerLogin,
          createdAt: date
        });

        if (player) {
          ranking.playerNickName = player.nickName || player.login;
          ranking.playerNickNameWithColor = player.nickNameWithColor || ranking.playerNickName;
        }
      }

      //console.log(ranking.playerNickNameWithColor);
      return ranking;
    });
  }

  /**
   * 1,2,4,00:51.36,00:23:14,0,25,blackcat111,sOb.Stef
   * the string contains:
   * Rank,Lap,Checkpoints,Time,BestLap,CPdelay,Points,Login,NickName
   * @param rows
   * @returns {object}
   */
  static createRaceInfo(rows) {
    const result = RaceFactory.createCollection(rows, "* Race info:", (row) => {
      const items = row.split(",");
      return {
        _id: new Date( items[0]).valueOf(),
        date: items[0],
        challengeName: items[1],
        challengeNameWithColor: items[2],
        challengeId: items[3],
        challengeAuthor: items[4],
        environment: items[5],
        gameMode: items[6],
        numberOfLaps: parseInt(items[7], 10),
      };
    });

    return result[0];
  }

  static createPlayers(rows, date) {
    return RaceFactory.createCollection(rows, "* Players:", (row) => {
      const items = row.split(",");
      if (items.length > 1) {
        return new Player({
          _id: items[0].trim(),
          login: items[0].trim(),
          nickName: items[1].trim(),
          nickNameWithColor: items[2].trim(),
          lastSeen: date.trim(),
        });
      } else {
        return new Player();
      } // filter out empty players
    }).filter((p) => !!p.login);
  }

  static createCollection(rows, strToFind, callback) {
    let rowIndex = rows.findIndex((r) => r.indexOf(strToFind) > -1);
    if (rowIndex === -1) {
      return [];
    }

    // go down two more row for the result to begin
    rowIndex = rowIndex + 2;

    let moreRows = true;
    const result = [];

    while (moreRows) {
      if (rows[rowIndex].indexOf("---") > -1) {
        moreRows = false;
      } else {
        result.push(callback(rows[rowIndex], rowIndex));
      }

      rowIndex++;
    }

    return result;
  }
}

module.exports = RaceFactory;
