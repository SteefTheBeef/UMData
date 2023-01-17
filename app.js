const FtpDataFetcher = require('./FtpDataFetcher.js');
const ftpDataFetcher = new FtpDataFetcher();

function fetchData() {
    ftpDataFetcher.connect().then(async () => {
        await ftpDataFetcher.fetchMatchlog();
    });
}

fetchData();
//test();
// run every 5 mins
setTimeout(() => {
    fetchData();
    //test();
}, 20 * 1000);

async function test() {
    const response = await fetch("https://united-masters.herokuapp.com/api/basicStuff");
    const data = await response.json();
    console.log(data);
}
