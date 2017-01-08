const pg = require('pg');
const debug = false;

let pool;

/**
 * Configures a connection pool.
 */
function configure(config) {
  pool = new pg.Pool(config);
}

/**
 * Helper function for working with ES6 promises.
 */
function handle(resolve, reject, err, result) {
  if (err) {
    reject(err);
  } else {
    resolve(result);
  }
}

function log(...msg) {
  if (debug) console.log('pg-simple.js:', msg.join(' '));
}

/**
 * Deletes all records from a given table.
 */
function deleteAll(tableName) {
  const sql = 'delete from ' + tableName;
  log('deleteAll: sql =', sql);
  return query(sql);
}

/**
 * Deletes a record from a given table by id.
 */
function deleteById(tableName, id) {
  const sql = `delete from ${tableName} where id=${id}`;
  log('delete: sql =', sql);
  return query(sql);
}

/**
 * Disconnects from the database.
 */
function disconnect() {
  log('disconnecting');
  if (pool) pool.end();
}

/**
 * Gets all records from a given table.
 */
function getAll(tableName) {
  const sql = 'select * from ' + tableName;
  log('getAll: sql =', sql);
  return query(sql);
}

/**
 * Gets a record from a given table by id.
 */
function getById(tableName, id) {
  const sql = `select * from ${tableName} where id=${id}`;
  log('getById: sql =', sql);
  return query(sql);
}

/**
 * Inserts a record into a given table.
 */
function insert(tableName, obj) {
  const keys = Object.keys(obj);
  const values = keys.map(key => obj[key]);
  const cols = keys.join(',');
  const placeholders =
    values.map((v, index) => '$' + (index + 1)).join(',');
  const sql =
    `insert into ${tableName} (${cols}) values(${placeholders}) returning id`;
  log('insert: sql =', sql);
  return query(sql, ...values);
}

/**
 * Executes a SQL query.
 * This is used by several of the other functions.
 */
function query(sql, ...params) {
  return new Promise((resolve, reject) => {
    if (!pool) return reject('pool not configured');

    pool.connect((err, client, done) => {
      if (err) return reject(err);
      log('query: sql =', sql);
      client.query(sql, params, (err, result) => {
        handle(resolve, reject, err, result);
        done();
      });
    });
  });
}

/**
 * Updates a record in a given table by id.
 */
function updateById(tableName, id, obj) {
  const sets = Object.keys(obj).map(key => {
    const v = obj[key];
    const value = typeof v === 'string' ? `'${v}'` : v;
    return `${key}=${value}`;
  });
  const sql = `update ${tableName} set ${sets} where id=${id}`;
  log('update: sql =', sql);
  return query(sql);
}

module.exports = {
  configure, deleteAll, deleteById, disconnect,
  getAll, getById, insert, query, updateById
};
