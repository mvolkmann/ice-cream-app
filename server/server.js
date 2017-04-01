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
    // This could be more selective!
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
      'Accept, Authorization, Content-Type, Origin, X-Requested-With');
    res.header('Access-Control-Expose-Headers',
      'Authorization, Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET,DELETE,POST,PUT');
    next();
  });

  // The "extended" option of bodyParser enables parsing of objects and arrays.
  app.use(bodyParser.json({extended: true}));

  // Enable use of HTTPS.
  // The two ".pem" files references are described later.
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

  // Configure Socket.IO to allow the server to communicate with the browser.
  // Our usage supports session timeouts.
  const io = sio.listen(server);
  io.on('connection', socket => global.socket = socket);
}

module.exports = {setup, start};
