const createQuery = require('./create-query');

/**
* Creates a parameterized query string from a sql file and values object
* and then executes that query using `pool` or `client` from node-postgres.
*
* @param {object} client - The client object from node-postgres.
* @param {object} pool - The pool object from node-postgres.
* @param {string} sql - Path to the target sql file.
* @param {object} values - Keys are column names and values are row values.
* @param {string} rootDir - sql path will be relative to this directory.
*
* @return {object} Results object from node-postgres.
*/
module.exports = async function query({
  client,
  pool,
  sql,
  values,
  rootDir
}) {
  // Create the query
  const q = await createQuery({sql, values, rootDir});

  if (pool) {
    return pool.query(q);
  }

  if (client) {
    return client.query(q);
  }
};
