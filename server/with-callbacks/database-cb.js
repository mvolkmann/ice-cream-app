const pg = require('pg');
const dbUrl = 'postgres://Mark@localhost/web-app-steps';
const client = new pg.Client(dbUrl);

function connect(cb) {
  console.log('connecting to database');
  client.connect(cb);
}

function deleteAll(cb) {
  const sql = 'delete from ice_cream';
  client.query(sql, cb);
}

function disconnect(cb) {
  console.log('disconnecting from database');
  client.end(cb);
}

function getAll(cb) {
  const sql = 'select * from ice_cream';
  client.query(sql, (err, result) => {
    if (err) return cb(err);
    cb(null, result.rows);
  });
}

function insert(flavor, cb) {
  const sql = 'insert into ice_cream(flavor) values($1) returning id';
  client.query(sql, [flavor], (err, result) => {
    if (err) return cb(err);

    const [{id}] = result.rows;
    cb(null, id);
  });
}

module.exports = {connect, deleteAll, disconnect, getAll, insert};
