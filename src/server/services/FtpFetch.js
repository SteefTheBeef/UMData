const FtpUtil = require("../../utils/FtpUtil");

class FtpFetch {
    async fetchMatchlog(ftp) {
        // QUALI
        const matchlogs = [];
        let result, string;
        result = await ftp.get("/TMF07885/Controllers/FAST/fastlog/matchlog.tmu.unitedmasters01.txt");
        string = await FtpUtil.streamToString(result);
        matchlogs.push({db: "um", matchlog: string, replaysRemotePath: "/TMF07885/Tracks/Replays/UM", lapsCount: 6})

        // PO Practice
        result = await ftp.get("/TMF07899/Controllers/FAST/fastlog/matchlog.tmu.unitedmasters03.txt");
        string = await FtpUtil.streamToString(result);
        matchlogs.push({db: "um_playoffs_train", matchlog: string, replaysRemotePath: "/TMF07899/Tracks/Replays/UM", lapsCount: 12})

        return matchlogs;
    }
}

module.exports = FtpFetch;
