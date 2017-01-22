const PgConnection = require('postgresql-easy');

const tableName = 'ice_creams';
const flavors = ['vanilla', 'chocolate', 'strawberry'];
let ids;

// Configure a connection to the database.
const pg = new PgConnection({
  database: 'ice_cream'
});

/*
pg.getAll(tableName)
  .then(result => {
    for (const row of result.rows) {
      console.log(row.id, row.flavor);
    }
  })
*/

// Delete all rows from these tables:
// user_ice_creams, users, and ice_cream.
pg.deleteAll('user_ice_creams')
  .then(() => pg.deleteAll('users'))
  .then(() => pg.deleteAll(tableName))
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
