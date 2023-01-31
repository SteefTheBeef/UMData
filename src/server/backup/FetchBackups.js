const PromiseFtp = require("promise-ftp");
const FtpUtil = require("../../utils/FtpUtil");
const ftpConfig = require("../../../config/ftpConfig");


class FetchBackups {
    async fetchFiles() {
        return new Promise(async function (resolve, reject) {

            console.log("Connecting to ftp...");
            const ftp = new PromiseFtp();
            await FtpUtil.connect(ftp);
            console.log("Connection established.");
            const fileList = await ftp.listSafe([ftpConfig.directories.backup])

            let index = 1;
            for (let file of fileList) {


                ftp.get(`${ftpConfig.directories.backup}/${file.name}`).then(async (stream) => {

                    const string = await FtpUtil.streamToString(stream);
                    console.log("Fetching file: ", file.name, " done.");
                    file.stringData = string;
                    console.log("index, ", index);
                    console.log("fileList.length, ", fileList.length);
                    if (index === 1) {
                        resolve(fileList);
                    }

                    index++;
                });
            }

            //ftp.end();
        });
    }

}

module.exports = FetchBackups;
