let fs = require('fs');
const ftpConfig = require("../../config/ftpConfig");
const PromiseFtp = require("promise-ftp");

class FtpUtil {
  static async connect(config) {
    const ftp = new PromiseFtp();
    console.log("Connecting to ftp...");
    await ftp.connect({ host: config.host, user: config.user, password: config.password })
    console.log("Connection established.");
    return ftp;
  }

  static async fetchFileList(ftp, remotePath) {
    return await ftp.listSafe([remotePath])
  }

  static async fetchFilesToDisk(ftp, remotePath, localPath) {
    return new Promise(async function (resolve, reject) {
      const fileList = await FtpUtil.fetchFileList(ftp, remotePath);
      if (!fileList || !fileList.length) {
        resolve([]);
        return;
      }

      let index = 1;
      for (let file of fileList) {
        try {
          ftp.get(`${remotePath}/${file.name}`).then(async (stream) => {
            stream.pipe(fs.createWriteStream(`${localPath}/${file.name}`));
            console.log("Fetching file: ", file.name, " done.");

            if (index === fileList.length) {
              resolve(true);
            }

            index++;
          });
        } catch (e) {
          console.log(e);
        }

      }
    });
  }

  static async removeFilesInDirectory(ftp, remotePath) {
    return new Promise(async function (resolve, reject) {
      const fileList = await FtpUtil.fetchFileList(ftp, remotePath);
      if (!fileList || !fileList.length) {
        resolve([]);
        return;
      }

      let index = 1;
      for (let file of fileList) {

        ftp.delete(`${remotePath}/${file.name}`).then(async (stream) => {
          console.log("Removing file: ", file.name, " done.");

          if (index === fileList.length) {
            resolve();
          }

          index++;
        });
      }
    });
  }

  static async uploadReplays(ftp) {
    return new Promise(async function (resolve, reject) {
      const testFolder = './replays/';
      const fs = require('fs');

      const files = [];
      fs.readdirSync(testFolder).forEach(file => {
        files.push(file);
      });

      if (!files || !files.length) {
        resolve([]);
        return;
      }

      let index = 1;
      for (let file of files) {
        if (index === files.length) {
          resolve(files);
        }
        await ftp.put(`./replays/${file}`, `/public_html/replays/${file}`);
        console.log("Uploaded replay: ", file, " done.");
        index++;
      }
    });
  }

  static async fetchFiles(remotePath, ) {
    return new Promise(async function (resolve, reject) {

      console.log("Connecting to ftp...");
      const ftp = new PromiseFtp();
      await FtpUtil.connect(ftp);
      console.log("Connection established.");
      const fileList = await ftp.listSafe([remotePath])

      let index = 1;
      for (let file of fileList) {


        ftp.get(`${remotePath}/${file.name}`).then(async (stream) => {

          const string = await FtpUtil.streamToString(stream);
          console.log("Fetching file: ", file.name, " done.");
          file.stringData = string;
          if (index === fileList.length) {
            resolve(fileList);
          }

          index++;
        });
      }

      //ftp.end();
    });
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
