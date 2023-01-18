const fs = require("fs");

class LocalFetch {
  constructor(basePaths) {
    this.basePaths = basePaths;
  }

  connect() {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  fetchMatchlog() {
    return new Promise((resolve, reject) => {
      fs.readFile("matchlog.txt", "utf8", (err, data) => {
        if (err) {
          console.error(err);
          return;
        }

        //console.log(data);
        resolve([data]);
      });
    });
  }
}

module.exports = LocalFetch;
