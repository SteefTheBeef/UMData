const forever = require('forever-monitor');

const child = new(forever.Monitor)('fetchMatchlog.js');

child.on('exit', function() {
    console.log('app.js has exited after 3 restarts');
});

child.on("restart", function() {
    console.log( 'app.js has restarted.' );
} );

child.start();
