const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const sio = require('socket.io');

let server;

function setup(app) {
  // Suppress the x-powered-by response header
  // so hackers don't get a clue that might help them.
  app.set('x-powered-by', false);

  // Enable use of CORS.
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
      'Accept, Authorization, Content-Type, Origin, X-Requested-With');
    res.header('Access-Control-Expose-Headers',
      'Authorization, Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET,DELETE,POST,PUT');
    next();
  });

  app.use(bodyParser.json({extended: true}));

  const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    passphrase: 'icecream'
  };
  server = https.createServer(options, app);
  server.on('error', err => {
    console.error(err.code === 'EACCES' ? 'must use sudo' : err);
  });
}

function start() {
  const PORT = 443;
  server.listen(PORT, () => console.log('listening on port', PORT));

  const io = sio.listen(server);
  //console.log('server.js start: io =', io);
  io.on('connection', socket => global.socket = socket);
}

module.exports = {setup, start};
