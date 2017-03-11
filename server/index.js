const auth = require('node-token-auth');
const express = require('express');
const PgConnection = require('postgresql-easy');
const server = require('./server');

// Configure the algorithm and password used to encrypt auth tokens
// and set the session timeout in minutes.
const algorithm = 'aes-256-ctr';
const key = 'V01kmann';
const timeoutMinutes = 1;
auth.configure(algorithm, key, timeoutMinutes);

const app = express();
server.setup(app);

function handleError(res, err) {
  res.statusMessage = `${err.toString()}; ${err.detail}`;
  res.status(500).send();
}

const pg = new PgConnection({
  database: 'ice_cream' // defaults to username
  //host: 'localhost', // default
  //idleTimeoutMillis: 30000, // before a client is closed (default is 30000)
  //max: 10, // max clients in pool (default is 10)
  //password: '', // not needed in this example
  //port: 5432, // the default
  //user: 'Mark' // not needed in this example
});

/**
 * Deletes an ice cream flavor from a given user.
 * The "Authorization" request header must be set.
 * curl -k -XDELETE https://localhost/ice-cream/some-id
 */
app.delete('/ice-cream/:username/:id', async (req, res) => {
  if (!auth.authorize(req, res)) return;

  // id is the id of the ice cream flavor to be deleted.
  const {id, username} = req.params;

  const sql = `
    delete from user_ice_creams
    where username=$1 and ice_cream_id=$2`;
  try {
    await pg.query(sql, username, id);
    res.send();
  } catch (e) {
    handleError(res, e);
  }
});

app.get('/crash', () => {
  // Throwing an error does not kill the server.
  //throw new Error('I am crashing!');

  // Exiting the process does kill server,
  // but nodemon will restart it after a file change.
  process.exit(1); // eslint-disable-line no-process-exit
});

/**
 * Retrieves all ice cream ids and flavors
 * associated with a given user.
 * The "Authorization" request header must be set.
 */
app.get('/ice-cream/:username', async (req, res) => {
  if (!auth.authorize(req, res)) return;

  const {username} = req.params;
  const sql = `
    select ic.id, ic.flavor
    from ice_creams ic, user_ice_creams uic
    where uic.username='${username}'
    and uic.ice_cream_id=ic.id`;
  try {
    const result = await pg.query(sql);
    res.json(result.rows);
  } catch (e) {
    handleError(res, e);
  }
});

/**
 * Adds an ice cream flavor to a given user.
 * The URL will look like /ice-cream/some-user?flavor=some-flavor.
 * The "Authorization" request header must be set.
 * The response will contain the id of newly created user_ice_creams row.
 * curl -k -XPOST https://localhost/ice-cream/some-user?flavor=vanilla
 */
app.post('/ice-cream/:username', async (req, res) => {
  if (!auth.authorize(req, res)) return;

  const {username} = req.params;
  const {flavor} = req.query;

  async function associate(username, iceCreamId) {
    const sql = `
      insert into user_ice_creams (username, ice_cream_id)
      values ($1, $2)`;
    try {
      await pg.query(sql, username, iceCreamId);
      res.send(String(iceCreamId));
    } catch (e) {
      handleError(res, e);
    }
  }

  // Get the id of the flavor if it already exists.
  let sql = 'select id from ice_creams where flavor=$1';
  try {
    const result = await pg.query(sql, flavor);
    const [row] = result.rows;
    if (row) { // The flavor exists.
      associate(username, row.id);
    } else { // The flavor doesn't exist, so create it.
      sql = 'insert into ice_creams (flavor) values ($1) returning id';
      const result = await pg.query(sql, flavor);
      const [row] = result.rows;
      if (row) {
        associate(username, row.id);
      } else {
        handleError(res, 'failed to create new flavor');
      }
    }
  } catch (e) {
    handleError(res, e);
  }
});

/**
 * Updates a record in the ice-cream table by id.
 * The "Authorization" request header must be set.
 * curl -k -XPUT https://localhost/ice-cream/some-id?flavor=some-flavor
 */
app.put('/ice-cream/:id', async (req, res) => {
  if (!auth.authorize(req, res)) return;

  const {id} = req.params;
  const {flavor} = req.query;
  try {
    await pg.updateById('ice_creams', id, {flavor});
    res.send();
  } catch (e) {
    handleError(res, e);
  }
});

/**
 * Logs in a user.
 * The username and password must be in the body
 * and the content type must be "application/json".
 * curl -k -XPOST https://localhost/login ...
 */
app.post('/login', async (req, res) => {
  const {username, password} = req.body;
  if (!username) {
    res.statusMessage = 'Missing Username';
    return res.status(400).send();
  }
  if (!password) {
    res.statusMessage = 'Missing Password';
    return res.status(400).send();
  }

  const sql = `
    select password = crypt('${password}', password) as authenticated
    from users where username='${username}'`;
  try {
    const result = await pg.query(sql);
    const [row] = result.rows;
    if (row) {
      auth.generateToken(username, req, res);
      res.send(row.authenticated);
    } else {
      res.statusMessage = 'Username Not Found';
      res.status(404).send();
    }
  } catch (e) {
    handleError(res, e);
  }
});

/**
 * Logs out a user.
 * The "Authorization" request header must be set.
 * curl -k -XPOST https://localhost/logout ...
 */
app.post('/logout', (req, res) => {
  if (!auth.authorize(req, res)) return;

  auth.deleteToken(req);
  res.send();
});

/**
 * Signs up a new user.
 * The username and password must be in the body
 * and the content type must be "application/json".
 * curl -k -XPOST https://localhost/signup ...
 */
app.post('/signup', async (req, res) => {
  const {username, password} = req.body;
  if (!username) {
    res.statusMessage = 'Missing Username';
    return res.status(400).send();
  }
  if (!password) {
    res.statusMessage = 'Missing Password';
    return res.status(400).send();
  }

  // Encrypt password using a Blowfish-based ciper (bf)
  // performing 8 iterations.
  const sql = `
    insert into users (username, password)
    values('${username}', crypt('${password}', gen_salt('bf', 8)))`;

  try {
    await pg.query(sql);
    auth.generateToken(username, req, res);
    res.send();
  } catch (e) {
    handleError(res, e);
  }
});

server.start();
