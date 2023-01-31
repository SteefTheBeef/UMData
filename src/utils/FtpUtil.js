let fs = require('fs');
const ftpConfig = require("../../config/ftpConfig");

class FtpUtil {
  static async connect(ftp) {
    return await ftp.connect({ host: ftpConfig.host, user: ftpConfig.user, password: ftpConfig.password })
  }

  static fetchFileList(ftp, path) {
    return new Promise((resolve, reject) => {
      console.log(`Fetching fileList for path: ${path}...`);
      ftp.list(path, false, (err, challengeFilesArr) => {
        if (err) throw err;
        console.log(`Fetching fileList for path: ${path}...Done!`);
        resolve(challengeFilesArr);
      });
    });
  }

  static async fetchFiles(ftp, remotePath) {
    const fileList = await ftp.listSafe([remotePath])

    ftp.end().then(() => {
      const files = [];
      // download the files

      if (fileList && fileList.length > 0) {
        for (let file of fileList) {
          FtpUtil.connect(ftp).then(async () => {
            return ftp.get(`${ftpConfig.directories.backup}/${file.name}`);

          })
          .then(function (stream) {
            return new Promise(async function (resolve, reject) {
              stream.once("close", resolve);
              stream.once("error", reject);
              const string = await FtpUtil.streamToString(stream);
              console.log("Downloading matchlog done.");
            });
          })
          .then(function () {
            console.log("Closing ftp connection.");
            return ftp.end();
          });

          //const data = await FtpUtil.streamToBinary(replay);
          //files.push({fileName: file.name, size: file.size, fileStream});
        }
      }


      return files;
    })

  }

  static fetchFileAsString(ftpClient, filePath) {
    return new Promise((resolve, reject) => {
      ftpClient.get(filePath, async (err, stream) => {
        if (err) throw err;

        const fileString = await FtpUtil.streamToString(stream);
        resolve(fileString);
        stream.once("close", function () {
          ftpClient.end();
        });
      });
    });
  }

  static fetchFile(ftpClient, filePath) {
    return new Promise((resolve, reject) => {
      ftpClient.get(filePath, async (err, stream) => {
        if (err) throw err;

        const fileString = await FtpUtil.streamToString(stream);
        resolve(fileString);
        stream.once("close", function () {
          ftpClient.end();
        });
        const writeStream = fs.createWriteStream("matchlog.txt");
        writeStream.write(fileString);
        writeStream.end();
        //stream.pipe(fs.createWriteStream('foo.local-copy.txt'));
      });
    });
  }

  static async streamToString(stream) {
    // lets have a ReadableStream as a stream variable
    const chunks = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks).toString("utf-8");
  }

  static async streamToBinary(stream) {
    // lets have a ReadableStream as a stream variable
    const chunks = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

}


module.exports = FtpUtil;
