const FtpDataFetcher = require('./FtpDataFetcher.js');
const ftpDataFetcher = new FtpDataFetcher();
const needle = require('needle');

function fetchData() {
    ftpDataFetcher.connect().then(async () => {
        const result = await ftpDataFetcher.fetchMatchlog();
        await test(result)
    });
}

fetchData();
//test();
// run every 5 mins
setTimeout(() => {
    fetchData();
    //test();
}, 30 * 1000);

async function test(matchlogResult) {
    //const response = await fetch('https://united-masters.herokuapp.com/api/matchlog', {method: 'POST', body: 'kalle'});
    //const data = await response.json();

    //console.log(data);
    const data = {
        matchlogResult
    }
    needle.post('https://united-masters.herokuapp.com/api/matchlog', data, function(error, response) {
        if (!error) {
            console.log(response.body);
        }

    });
}




