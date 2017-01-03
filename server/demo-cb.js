const {
  connect, deleteAll, disconnect, getAll, insert
} = require('./database-cb');

function handleError(err) {
  if (err) throw err;
}

connect(err => {
  handleError(err);

  deleteAll(err => {
    handleError(err);
    insert('vanilla', (err, id) => {
      handleError(err);
      console.log('inserted record with id', id);
      getAll((err, rows) => {
        handleError(err);
        for (const row of rows) {
          console.log(row.id, row.flavor);
        }
        disconnect(handleError);
      });
    });
  });
});
