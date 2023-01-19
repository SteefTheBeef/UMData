const MongoChallenge = require("./src/server/types/mongo/MongoChallenge");
const Race = require("./src/server/types/Race");

const mongoChallenge = new MongoChallenge();
const race = new Race();

race.drop();
mongoChallenge.drop();



