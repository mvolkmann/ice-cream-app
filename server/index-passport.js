const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const fs = require('fs');
const https = require('https');
const pg = require('postgresql-easy');
const session = require('express-session');

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

// Configure use of passport.
const passport = require('passport');
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

//TODO: You may not need all of these middlewares.
//TODO: After getting it working, try removing some.
app.use(cookieParser());
app.use(bodyParser.json({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'keyboard cat'
}));
app.use(passport.initialize());
app.use(passport.session());
//app.use(app.router());

const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy((username, password, done) => {
  const sql =
    `select password = crypt('${password}', password) ` +
    `from users where username='${username}'`;
  pg.query(sql)
    .then(result => {
      const [row] = result.rows;
      if (row) {
        //TODO: There must be a better way to get the boolean result!
        const authenticated = row['?column?'];
        if (authenticated) {
          // Retrieve the user record and return it.
          const sql = `select * from users where username='${username}'`;
          pg.query(sql)
            .then(result => {
              const [user] = result.rows;
              console.log('index.js passport: user =', user);
              done(null, user);
            })
            .catch(err => done(err));
        } else {
          done(null, false, {message: 'incorrect username'});
        }
      } else {
        done(null, false, {message: 'incorrect username'});
      }
    })
    .catch(err => done(err));
}));

app.post('/login',
  /*
  passport.authenticate('local', {
    successRedirect: '/#main',
    failureRedirect: '/#login',
    failureFlash: true // to flash an error message if authentication fails
    //TODO: Probably need this for flash messages to work:
    //TODO: https://github.com/jaredhanson/connect-flash
  })
  */
  (req, res, next) => {
    console.log('index.js login: req =', req);
    passport.authenticate('local', (err, user, info) => {
      console.log('index.js login: info =', info);
      if (err) return next(err);
      if (!user) {
        return res.send({success: false, message: 'authentication failed'});
      }
      req.login(user, err => {
        console.log('index.js more: err =', err);
        if (!err) console.log('SUCCESS!');
        return err ?
          next(err) :
          res.send({success: true, message: 'authentication succeeded'});
      });
    })(req, res, next);
  }
);

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
 * This works, but we want to use Passport to manage this.
 * curl -k -XPOST https://localhost/login-old?username=mvolkmann\&password=foobar
 * WARNING: Don't forget the slash before &password in the curl command!
 */
app.post('/login-old', (req, res) => {
  //TODO: Get username and password from body?
  const {username, password} = req.query;
  const sql =
    `select password = crypt('${password}', password) ` +
    `from users where username='${username}'`;
  console.log('index.js login-old: sql =', sql);
  pg.query(sql)
    .then(result => {
      const [row] = result.rows;
      console.log('index.js login-old: row =', row);
      if (row) {
        //TODO: There must be a better way to get the boolean result!
        const authenticated = row['?column?'];
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
