const express = require('express');
const fs = require('fs');
const pg = require('./pg-simple');

const app = express();

// Enable use of CORs.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET,DELETE,POST,PUT');
  next();
});

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

/*
const https = require('https');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//app.use(express.session({secret: 'keyboard cat'}));
app.use(passport.initialize());
//app.use(passport.session());
passport.use(new LocalStrategy((username, password, done) => {
  const sql = `select * from users where username='${username}'`;
  pg.query(sql)
    .then(res => {
      console.log('server.js passport: res =', res);
      done();
    })
    .catch(err => {
      done();
      throw err;
    });

  User.findOne({ username: username }, function (err, user) {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (!user.validPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  });
}));

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true // to flash an error message if authentication fails
    //TODO: Probably need this for flash messages to work:
    //TODO: https://github.com/jaredhanson/connect-flash
  })
);
*/

// Deletes a record from the ice-cream table.
// Test with "curl -XDELETE localhost:1919/ice-cream/some-id".
app.delete('/ice-cream/:id', (req, res) => {
  const {id} = req.params;
  pg.deleteById('ice_cream', id)
    .then(() => res.send())
    .catch(err => res.status(500).send(err));
});

// Gets all records from the ice-cream table.
// Test with "curl localhost:1919/ice-cream".
app.get('/ice-cream', (req, res) => {
  pg.getAll('ice_cream')
    .then(result => res.json(result.rows))
    .catch(err => res.status(500).send(err));
});

// Gets a one record from the ice-cream table by id.
// Test with "curl localhost:1919/ice-cream/some-id".
app.get('/ice-cream/:id', (req, res) => {
  const {id} = req.params;
  pg.getById('ice_cream', id)
    .then(result => res.json(result.rows[0]))
    .catch(err => res.status(500).send(err));
});

// Creates a new record in the ice-cream table.
// Test with "curl -XPOST localhost:1919/ice-cream?flavor=some-flavor".
app.post('/ice-cream', (req, res) => {
  const {flavor} = req.query;
  pg.insert('ice_cream', {flavor})
    .then(result => {
      const {id} = result.rows[0];
      res.send(String(id));
    })
    .catch(err => res.status(500).send(err));
});

app.post('/register', (req, res) => {
  const {username, password} = req.query;
  pg.insert('users', {username, password})
    .then(result => {
      const {id} = result.rows[0];
      res.send(String(id));
    })
    .catch(err => res.status(500).send(err));
});

// Updates a new record in the ice-cream table by id.
// Test with "curl -XPUT localhost:1919/ice-cream?flavor=some-flavor".
app.put('/ice-cream/:id', (req, res) => {
  const {id} = req.params;
  const {flavor} = req.query;
  pg.updateById('ice_cream', id, {flavor})
    .then(() => res.send())
    .catch(err => res.status(500).send(err));
});

const useHttp = true;

if (useHttp) {
  const PORT = 1919;
  app.listen(PORT, () => console.log('listening on port', PORT));
} else {
  const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    passphrase: 'I like ice cream!'
  };
  const PORT = 443;
  https.createServer(options, app).listen(PORT, () => {
    console.log('listening on port', PORT);
  });
}
