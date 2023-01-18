const PromiseFtp = require("promise-ftp");
const fs = require("fs");
const FtpUtil = require("../../utils/FtpUtil");

class FtpFetch {
    fetchMatchlog() {
        return new Promise(async function (reso, rej) {
            console.log("Connecting to ftp...");
            const ftp = new PromiseFtp();
            ftp
            .connect({ host: "ftp.nc1.eu", user: "n71281", password: "ivwelme28" })
            .then(function (serverMessage) {
                console.log("Connection established.");
                console.log("Downloading matchlog...");
                return ftp.get("/TMF07885/Controllers/FAST/fastlog/matchlog.tmu.unitedmasters01.txt");
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
