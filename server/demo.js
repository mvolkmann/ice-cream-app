const PgConnection = require('postgresql-easy');

// Configure a connection to the database.
const pg = new PgConnection({database: 'ice_cream'});

const tableName = 'ice_creams';

async function demo() {
  try {
    // Delete all rows from these tables:
    // user_ice_creams, users, and ice_cream.
    await pg.deleteAll('user_ice_creams');
    await pg.deleteAll('users');
    await pg.deleteAll(tableName);

    // Insert three new rows corresponding to three flavors.
    // For each flavor, it calls pg-insert which returns a promise.
    // flavors.map returns an array of these three promises.
    // Promise.all returns a promise that resolves when
    // all the promises in the array passed to it resolve.
    const flavors = ['vanilla', 'chocolate', 'strawberry'];
    const results = await Promise.all(
      flavors.map(f => pg.insert(tableName, {flavor: f})));

    // Get an array of the ids of the new rows.
    const ids = results.map(result => result.rows[0].id);
    console.log('inserted records with ids', ids);

    // Delete the first row (vanilla).
    await pg.deleteById(tableName, ids[0]);

    // Change the flavor of the second row (chocolate) to "chocolate chip".
    await pg.updateById(tableName, ids[1], {flavor: 'chocolate chip'});

    // Get all the rows in the table.
    const result = await pg.getAll(tableName);

    // Output their ids and flavors.
    for (const row of result.rows) {
      console.log(row.id, row.flavor);
    }

  // Catch and report any errors that occur in the previous steps.
  } catch (e) {
    throw e;

  } finally {
    // Disconnect from the database.
    await pg.disconnect();
  }
}

demo();
