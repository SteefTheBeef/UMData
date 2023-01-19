const MongoChallenge = require("./src/server/types/mongo/MongoChallenge");
const Race = require("./src/server/types/Race");
const MongoLeaderboard = require("./src/server/types/mongo/MongoLeaderboard");

const mongoChallenge = new MongoChallenge();
const race = new Race();
const mongoLeaderboard = new MongoLeaderboard();

race.drop();
mongoChallenge.drop();
mongoLeaderboard.drop();



