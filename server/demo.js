const pg = require('./pg-simple');

const tableName = 'ice_cream';
const flavors = ['vanilla', 'chocolate', 'strawberry'];
let ids;

pg.configure({
  database: 'web-app-steps',
  host: 'localhost',
  idleTimeoutMillis: 30000, // idle time before a client is closed
  max: 10, // max clients in pool
  //password: 'not needed',
  port: 5432,
  user: 'Mark'
});

pg.deleteAll(tableName)
  .then(() => Promise.all(
    flavors.map(f => pg.insert(tableName, {flavor: f}))
  ))
  .then(results => {
    ids = results.map(result => result.rows[0].id);
    console.log('inserted records with ids', ids);
  })
  .then(() => pg.deleteById(tableName, ids[0]))
  .then(() => pg.updateById(tableName, ids[1], {flavor: 'chocolate chip'}))
  .then(() => pg.getAll(tableName))
  .then(result => {
    for (const row of result.rows) {
      console.log(row.id, row.flavor);
    }
  })
  .then(() => pg.disconnect())
  .catch(err => {
    throw err;
  });

/*
// Alternate approach using async/await instead of promises.
try {
  await pg.connect(dbUrl);
  await pg.deleteAll(tableName);
  flavors.map(f => {
    const result = await pg.insert(tableName, ['flavor'], [f]));
    const {id} = result.rows[0];
    console.log('inserted record with id', id);
    ids.push(id);
  })
  await pg.deleteById(tableName, ids[0]);
  await pg.updateById(tableName, ids[1], ['flavor'], ['chocolate chip']);
  const result = await pg.getAll(tableName);
  for (const row of result.rows) {
    console.log(row.id, row.flavor);
  }
  await pg.disconnect();
} catch (e) {
  console.error(e);
}
*/
