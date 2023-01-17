const FtpUtil = require('./FtpUtil');
const FTP = require("ftp");

const ftpClient = new FTP();

class FtpDataFetcher {

  constructor(basePaths) {
    this.basePaths = basePaths;
  }

  connect() {
    // connect to localhost:21 as anonymous
    ftpClient.connect({
      host: "ftp.nc1.eu",
      secure: false,
      user: "n71281",
      password: "ivwelme28",
      keepalive: 5000,
      connTimeout: 5000,
      pasvTimeout: 5000,
      debug: (message) => {
        //console.log(message);
      },
    });
    try {
      return new Promise((resolve, reject) => {
        console.log("Connecting to ftp...");
        ftpClient.on("ready", async () => {
          console.log("Connection established.");
          resolve();
        });
      });
    } catch (e) {
      console.log(e);
    }
  }

  async fetchMatchlog() {
    const paths = ["/TMF07885/Controllers/FAST/fastlog/matchlog.tmu.unitedmasters01.txt"];
    const result = [];
    try {
      return new Promise(async (resolve, reject) => {
        for (const path of paths) {
          console.log("Fetching matchlog using ftp...");
          result.push(await FtpUtil.fetchFileAsString(ftpClient, path));
          console.log("Fetching matchlog using ftp...Done!");
        }
        resolve(result);
      });
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = FtpDataFetcher;

