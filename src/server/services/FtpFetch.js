const PromiseFtp = require("promise-ftp");
const fs = require("fs");
const FtpUtil = require("../../utils/FtpUtil");
const MongoLeaderboard = require("../types/mongo/MongoLeaderboard");
const MongoChallenge = require("../types/mongo/MongoChallenge");
const Challenge = require("../types/challenge/Challenge");
const Readable = require('stream').Readable;

class FtpFetch {
    async fetchMatchlog() {
        const mongoLeaderboard = new MongoLeaderboard();
        const mongoChallenge = new MongoChallenge();
        const leaderboards = await mongoLeaderboard.getAll();
        const challengesArr = await mongoChallenge.getAll();
        const challenges = challengesArr.map(c => new Challenge(c));

        let lbString;
        if (leaderboards.length) {
            lbString = leaderboards[0].players.map(p => {
                return `${p.playerLogin},${p.playerNickNameWithColor},${p.totalPosition},${p.totalPoints}`
            });
        }

        const result = challenges.map(c => {
            return {
                envi: c.envi,
                playerStrings: c.players.map(p => {
                    return p.exportAsString();
                })
            }
        })

        // const replays = [];

        return new Promise(async function (reso, rej) {

            console.log("Connecting to ftp...");
            const ftp = new PromiseFtp();
            ftp
            .connect({ host: "ftp.nc1.eu", user: "n71281", password: "ivwelme28" })
            .then(async (serverMessage) => {

                console.log("Connection established.");
                console.log("Downloading matchlog...");
/*                const replayList = await ftp.listSafe(["/TMF07885/Tracks/Replays/UM"])
                let index = 0;

                if (replayList && replayList.length > 0) {
                    for (let rep of replayList) {
                        const replay = await ftp.get(`/TMF07885/Tracks/Replays/UM/${rep.name}`);
                        const data = await FtpUtil.streamToBinary(replay);
                        replays.push({fileName: rep.name, size: rep.size, data});
                    }
                }*/


                result.forEach(r => {
                    ftp.put(Readable.from(r.playerStrings.join("\n")), `/TMF07885/Controllers/FAST/data/um/${r.envi}.txt`);
                })

                if (leaderboards.length) {
                    ftp.put(Readable.from(lbString.join("\n")), "/TMF07885/Controllers/FAST/data/um/leaderboard.txt");
                }

                return ftp.get("/TMF07885/Controllers/FAST/fastlog/matchlog.tmu.unitedmasters01.txt");
            })
            .then(function (stream) {
                return new Promise(async function (resolve, reject) {
                    stream.once("close", resolve);
                    stream.once("error", reject);
                    const string = await FtpUtil.streamToString(stream);
                    console.log("Downloading matchlog done.");
                    reso([string, null]);
                    // stream.pipe(fs.createWriteStream("matchlog.txt"));
                });
            })
            .then(function () {
                console.log("Closing ftp connection.");
                return ftp.end();
            });
        });
    }

    sendFiles(obj) {

        return new Promise(async function (reso, rej) {
            console.log("Connecting to ftp...");
            const ftp = new PromiseFtp();
            ftp
            .connect({ host: "ftp.nc1.eu", user: "n71281", password: "ivwelme28" })
            .then(function (serverMessage) {
                console.log("Connection established.");
                console.log("Downloading matchlog...");
                return ftp.put("/TMF07885/Controllers/FAST/data/um/leaderboard.txt");
            })
            .then(function (stream) {
                return new Promise(async function (resolve, reject) {
                    stream.once("close", resolve);
                    stream.once("error", reject);
                    const string = await FtpUtil.streamToString(stream);
                    console.log("Downloading matchlog done.");
                    reso(string);
                    // stream.pipe(fs.createWriteStream("matchlog.txt"));
                });
            })
            .then(function () {
                console.log("Closing ftp connection.");
                return ftp.end();
            });
        });
    }
}

module.exports = FtpFetch;
