const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const https = require('https');
const pg = require('./pg-simple');

const app = express();

// Suppress the x-powered-by response header
// so hackers don't get a clue that might help them.
app.set('x-powered-by', false);

// Enable use of CORs.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET,DELETE,POST,PUT');
  next();
});

app.use(bodyParser.json({extended: true}));

// Must call this before other pg methods.
pg.configure({
  database: 'web-app-steps' // defaults to username
  //host: 'localhost', // default
  //idleTimeoutMillis: 30000, // before a client is closed (default is 30000)
  //max: 10, // max clients in pool (default is 10)
  //password: '', // not needed in this example
  //port: 5432, // the default
  //user: 'Mark' // not needed in this example
});

app.get('/test', (req, res) => {
  res.send('success');
});

app.get('/crash', () => {
  // Throwing an error does not kill the server.
  //throw new Error('I am crashing!');

  // Exiting the process does kill server,
  // but nodemon will restart it after a file change.
  process.exit(1);
});

// Deletes a record from the ice-cream table.
// curl -k -XDELETE https://localhost/ice-cream/some-id
app.delete('/ice-cream/:id', (req, res) => {
  const {id} = req.params;
  pg.deleteById('ice_cream', id)
    .then(() => res.send())
    .catch(err => res.status(500).send(err));
});

// Retrieves all records from the ice-cream table.
// curl -k https://localhost/ice-cream
app.get('/ice-cream', (req, res) => {
  pg.getAll('ice_cream')
    .then(result => res.json(result.rows))
    .catch(err => res.status(500).send(err));
});

// Retrieves a one record from the ice-cream table by id.
// curl -k https://localhost/ice-cream/some-id
app.get('/ice-cream/:id', (req, res) => {
  const {id} = req.params;
  pg.getById('ice_cream', id)
    .then(result => res.json(result.rows[0]))
    .catch(err => res.status(500).send(err));
});

// Creates a new record in the ice-cream table.
// curl -k -XPOST https://localhost/ice-cream?flavor=vanilla
app.post('/ice-cream', (req, res) => {
  const {flavor} = req.query;
  pg.insert('ice_cream', {flavor})
    .then(result => {
      const {id} = result.rows[0];
      res.send(String(id));
    })
    .catch(err => res.status(500).send(err));
});

// Updates a record in the ice-cream table by id.
// curl -k -XPUT https://localhost/ice-cream/some-id?flavor=some-flavor
app.put('/ice-cream/:id', (req, res) => {
  const {id} = req.params;
  const {flavor} = req.query;
  pg.updateById('ice_cream', id, {flavor})
    .then(() => res.send())
    .catch(err => res.status(500).send(err));
});

/**
 * Creates a new user.
 * curl -k -XPOST https://localhost/register?username=mvolkmann\&password=foobar
 */
app.post('/register', (req, res) => {
  const {username, password} = req.query;

  // Encrypt password using a Blowfish-based ciper (bf)
  // performing 8 iterations.
  const sql =
    'insert into users (username, password) ' +
    `values('${username}', crypt('${password}', gen_salt('bf', 8)))`;

  pg.query(sql)
    .then(() => res.send())
    .catch(err => res.status(500).send(err));
});

/**
 * curl -k -XPOST https://localhost/login?username=mvolkmann\&password=foobar
 * WARNING: Don't forget the slash before &password in the curl command!
 */
app.post('/login', (req, res) => {
  const {username, password} = req.body;
  const sql =
    `select password = crypt('${password}', password) ` +
    `from users where username='${username}'`;
  pg.query(sql)
    .then(result => {
      const [row] = result.rows;
      if (row) {
        //TODO: There must be a better way to get the boolean result!
        const authenticated = row['?column?'];
        console.log('index.js login: authenticated =', authenticated);
        res.send(authenticated);
      } else {
        res.status(404).send('username not found');
      }
    })
    .catch(err => res.status(500).send(err));
});

//TODO: You got curl working with HTTPS, but not REST calls from the React app.
const useHttp = true;

if (useHttp) {
  const PORT = 1919;
  app.listen(PORT, () => console.log('listening on port', PORT));
} else {
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
}
