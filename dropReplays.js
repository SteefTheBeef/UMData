const MongoReplay = require("./src/server/types/mongo/MongoReplay");
const MongoReplayData = require("./src/server/types/mongo/MongoReplayData");

const mongoReplay = new MongoReplay();
const mongoReplayData = new MongoReplayData();

mongoReplay.drop();
mongoReplayData.drop();




