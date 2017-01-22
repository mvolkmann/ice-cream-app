const pg = require('postgresql-easy');

const tableName = 'ice_creams';
const flavors = ['vanilla', 'chocolate', 'strawberry'];
let ids;

// Configure a connection to the database.
pg.configure({
  database: 'ice_cream'
});

// Delete all rows from the ice_cream table.
pg.deleteAll(tableName)
  // Insert three new rows corresponding to vanilla, chocolate, and strawberry.
  .then(() => Promise.all(
    flavors.map(f => pg.insert(tableName, {flavor: f}))
  ))
  // Get an array of the ids of the new rows.
  .then(results => {
    ids = results.map(result => result.rows[0].id);
    console.log('inserted records with ids', ids);
  })
  // Delete the first row (vanilla).
  .then(() => pg.deleteById(tableName, ids[0]))
  // Change the flavor of the second row (chocolate) to "chocolate chip".
  .then(() => pg.updateById(tableName, ids[1], {flavor: 'chocolate chip'}))
  // Get all the rows in the table.
  .then(() => pg.getAll(tableName))
  // Output their id and flavor.
  .then(result => {
    for (const row of result.rows) {
      console.log(row.id, row.flavor);
    }
  })
  // Disconnect from the database.
  .then(() => pg.disconnect())
  // Catch and report any errors that occur in the previous steps.
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
