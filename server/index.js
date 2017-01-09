const bodyParser = require('body-parser');
const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const https = require('https');
const pg = require('./pg-simple');

const algorithm = 'aes-256-ctr';
const password = 'V01kmann';
const tokenMap = {};

function authenticate(req, res) {
  // Check for existence of token.
  const encryptedToken = req.get('Authorization');
  if (!encryptedToken) {
    res.statusMessage = 'Token Reauired';
    res.status(499).send();
    return false;
  }

  const token = decrypt(encryptedToken);
  const [reqUsername] = token.split('|');

  // Check for matching cached token.
  const cachedToken = tokenMap[reqUsername];
  if (!cachedToken || cachedToken !== token) {
    return false;
  }

  // Check for request from a different client IP address.
  const [username, clientIP, timeout] = token.split('|');
  if (req.ip !== clientIP) {
    res.statusMessage = 'Invalid Token';
    res.status(499).send();
    return false;
  }

  // Check for expired token.
  const timeoutMs = Number(timeout);
  if (timeoutMs < Date.now()) {
    res.statusMessage = 'Session Timeout';
    res.status(440).send();
    delete tokenMap[username];
    return false;
  }

  return true;
}

function encrypt(text) {
  const cipher = crypto.createCipher(algorithm, password);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(text) {
  const decipher = crypto.createDecipher(algorithm, password);
  return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
}

function generateToken(username, req, res) {
  // Generate a token based username, client ip address, and expiration time.
  const expires = new Date();
  //expires.setMinutes(expires.getMinutes() + 30); // adds 30 minutes
  // Make token expire in 5 seconds for easier testing.
  expires.setSeconds(expires.getSeconds() + 5);

  const token = `${username}|${req.ip}|${expires.getTime()}`;
  const encryptedToken = encrypt(token);
  //const decryptedToken = decrypt(encryptedToken);
  //console.log('index.js login: decryptedToken =', decryptedToken);

  tokenMap[username] = token;

  res.setHeader('Authorization', encryptedToken);
}

function handleError(res, err) {
  res.statusMessage = `${err.toString()}; ${err.detail}`;
  res.status(500).send();
}

const app = express();

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

// Must call this before other pg methods.
pg.configure({
  database: 'ice_cream' // defaults to username
  //host: 'localhost', // default
  //idleTimeoutMillis: 30000, // before a client is closed (default is 30000)
  //max: 10, // max clients in pool (default is 10)
  //password: '', // not needed in this example
  //port: 5432, // the default
  //user: 'Mark' // not needed in this example
});

// Deletes an ice cream flavor from a given user.
// curl -k -XDELETE https://localhost/ice-cream/some-id
app.delete('/ice-cream/:username/:id', (req, res) => {
  if (!authenticate(req, res)) return;

  const {id, username} = req.params;

  // This approach gives an error that it cannot determine the type of $1.
  //const sql =
  //  'delete from user_ice_creams ' +
  //  "where username='$1' and ice_cream_id=$2";
  //pg.query(sql, username, Number(id))

  const sql =
    'delete from user_ice_creams ' +
    `where username='${username}' and ice_cream_id=${id}`;
  pg.query(sql)
    .then(() => res.send())
    .catch(handleError.bind(null, res));
});

app.get('/crash', () => {
  // Throwing an error does not kill the server.
  //throw new Error('I am crashing!');

  // Exiting the process does kill server,
  // but nodemon will restart it after a file change.
  process.exit(1);
});

// Retrieves all records from the ice-cream table.
// curl -k https://localhost/ice-cream
app.get('/ice-cream/:username', (req, res) => {
  if (!authenticate(req, res)) return;

  const username = req.params.username;
  const sql =
    'select ic.id, ic.flavor ' +
    'from ice_creams ic, user_ice_creams uic ' +
    `where uic.username='${username}' ` +
    'and uic.ice_cream_id=ic.id';
  pg.query(sql)
    .then(result => {
      res.json(result.rows);
    })
    .catch(handleError.bind(null, res));
});

// Retrieves a one record from the ice-cream table by id.
// curl -k https://localhost/ice-cream/some-id
//TODO: Is this needed?
app.get('/ice-cream/:id', (req, res) => {
  if (!authenticate(req, res)) return;

  const {id} = req.params;
  pg.getById('ice_creams', id)
    .then(result => res.json(result.rows[0]))
    .catch(handleError.bind(null, res));
});

app.get('/test', (req, res) => {
  res.send('success');
});

// Adds an ice cream flavor for a given user.
// a new record in the ice-cream table.
// curl -k -XPOST https://localhost/ice-cream?flavor=vanilla
app.post('/ice-cream/:username', (req, res) => {
  if (!authenticate(req, res)) return;

  const {username} = req.params;
  const {flavor} = req.query;

  function associate(username, iceCreamId) {
    const sql =
      'insert into user_ice_creams (username, ice_cream_id) ' +
      'values ($1, $2)';
    pg.query(sql, username, iceCreamId)
      .then(() => res.send(String(iceCreamId)))
      .catch(handleError.bind(null, res));
  }

  // Get the id of the flavor if it already exists.
  let sql = 'select id from ice_creams where flavor=$1';
  pg.query(sql, flavor)
    .then(result => {
      const [row] = result.rows;
      if (row) {
        const {id} = row;
        associate(username, id);
      } else {
        // The flavor doesn't exist, so create it.
        sql = 'insert into ice_creams (flavor) values ($1) returning id';
        pg.query(sql, flavor)
          .then(result => {
            const [row] = result.rows;
            if (row) {
              const {id} = row;
              associate(username, id);
            } else {
              handleError(res, 'failed to create new flavor');
            }
          })
          .catch(handleError.bind(null, res));
      }
    })
    .catch(handleError.bind(null, res));
});

// Updates a record in the ice-cream table by id.
// curl -k -XPUT https://localhost/ice-cream/some-id?flavor=some-flavor
app.put('/ice-cream/:id', (req, res) => {
  if (!authenticate(req, res)) return;

  const {id} = req.params;
  const {flavor} = req.query;
  pg.updateById('ice_creams', id, {flavor})
    .then(() => res.send())
    .catch(handleError.bind(null, res));
});

/**
 * Logs in a user.
 * curl -k -XPOST https://localhost/login ...
 * The username and password must be in the body
 * and the content type must be "application/json".
 */
app.post('/login', (req, res) => {
  const {username, password} = req.body;
  if (!username) {
    res.statusMessage = 'Missing Username';
    return res.status(400).send();
  }
  if (!password) {
    res.statusMessage = 'Missing Password';
    return res.status(400).send();
  }

  generateToken(username, req, res);

  const sql =
    `select password = crypt('${password}', password) ` +
    `from users where username='${username}'`;
  pg.query(sql)
    .then(result => {
      const [row] = result.rows;
      if (row) {
        //TODO: There must be a better way to get the boolean result!
        const authenticated = row['?column?'];
        res.send(authenticated);
      } else {
        res.statusMessage = 'Username Not Found';
        res.status(404).send();
      }
    })
    .catch(handleError.bind(null, res));
});

/**
 * Signs up a new user.
 * curl -k -XPOST https://localhost/signup ...
 * The username and password must be in the body
 * and the content type must be "application/json".
 */
app.post('/signup', (req, res) => {
  const {username, password} = req.body;
  if (!username) {
    res.statusMessage = 'Missing Username';
    return res.status(400).send();
  }
  if (!password) {
    res.statusMessage = 'Missing Password';
    return res.status(400).send();
  }

  generateToken(username, req, res);

  // Encrypt password using a Blowfish-based ciper (bf)
  // performing 8 iterations.
  const sql =
    'insert into users (username, password) ' +
    `values('${username}', crypt('${password}', gen_salt('bf', 8)))`;

  pg.query(sql)
    .then(() => res.send())
    .catch(handleError.bind(null, res));
});

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  passphrase: 'icecream'
};
const server = https.createServer(options, app);
server.on('error', err => {
  console.log(err.code === 'EACCES' ? 'must use sudo' : err);
});
const PORT = 443;
server.listen(PORT, () => console.log('listening on port', PORT));
