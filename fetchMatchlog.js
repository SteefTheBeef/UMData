const Fetch = require("./src/server/services/Fetch");

const fetch = new Fetch();

fetch.fetchMatchlog();

setInterval(() => {
    fetch.fetchMatchlog();
}, 180 * 1000);


