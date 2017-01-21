const express = require('express');
const pg = require('./pg-simple');
const server = require('./server');

const app = express();
server.setup(app);

function handleError(res, err) {
  res.statusMessage = `${err.toString()}; ${err.detail}`;
  res.status(500).send();
}

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

/**
 * Deletes an ice cream flavor from a given user.
 */
app.delete('/ice-cream/:username/:id', (req, res) => {
  const {id, username} = req.params;

  const sql =
    'delete from user_ice_creams ' +
    'where username=$1 and ice_cream_id=$2';
  pg.query(sql, username, id)
    .then(() => res.send())
    .catch(handleError.bind(null, res));
});

/**
 * Retrieves all records from the ice-cream table.
 */
app.get('/ice-cream/:username', (req, res) => {
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

/**
 * Adds an ice cream flavor for a given user,
 * creating a new record in the ice-cream table.
 */
app.post('/ice-cream/:username', (req, res) => {
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

/**
 * Updates a record in the ice-cream table by id.
 */
app.put('/ice-cream/:id', (req, res) => {
  const {id} = req.params;
  const {flavor} = req.query;
  pg.updateById('ice_creams', id, {flavor})
    .then(() => res.send())
    .catch(handleError.bind(null, res));
});

server.start();
