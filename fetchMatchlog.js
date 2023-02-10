const Fetch = require("./src/server/services/Fetch");
const ReplayManager = require("./src/server/services/ReplayManager");
const FtpUtil = require("./src/utils/FtpUtil");
const ftpConfig = require("./config/ftpConfig");

const fetch = new Fetch();

let ftp;

async function start() {
    ftp = await FtpUtil.connect(ftpConfig.nc1);
    const matchlogs = await fetch.fetchMatchlog(ftp);
    await ftp.end();

    for (let matchlogEntry of matchlogs) {
        try {
            ftp = await FtpUtil.connect(ftpConfig.nc1);
            const result = await ReplayManager.fetchReplays(ftp, matchlogEntry.replaysRemotePath);
            if (result) {
                await ReplayManager.removeRemoteReplays(ftp, matchlogEntry.replaysRemotePath);
            }

            await ftp.end();

            // TODO: Only remove local replays if we are sure that upload was successful.
            ftp = await FtpUtil.connect(ftpConfig.replayStorage);
            await ReplayManager.saveReplays(matchlogEntry.db, ftp);
            await ftp.end();

            ReplayManager.removeLocalReplays();
        }
        catch(e) {
            console.log(e);
        }
    }

    console.log("All tasks completed.")

}

start();

setInterval(async () => {
    await start();
}, 180 * 1000);


