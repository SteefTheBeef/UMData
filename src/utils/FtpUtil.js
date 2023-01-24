let fs = require('fs');

    class FtpUtil {
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

  static fetchFileAsString(ftpClient, filePath) {
    return new Promise((resolve, reject) => {
      ftpClient.get(filePath, async (err, stream) => {
        if (err) throw err;

        const fileString = await streamToString(stream);
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
