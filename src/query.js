const createQuery = require('./create-query');
const { camelCaseKeys } = require('@mmckelvy/case');

function defaultTransform(results) {
  if (results.rows) {
    return camelCaseKeys(results.rows, {recursive: true});
  }

  return [];
}

/**
* Creates a parameterized query string from a sql file and values object
* and then executes that query using `pool` or `client` from node-postgres.
*
* @param {object} client - The client object from node-postgres.
* @param {object} pool - The pool object from node-postgres.
* @param {string} sql - Path to the target sql file.
* @param {object} values - Keys are column names and values are row values.
* @param {boolean} transform
* @param {function} transformFn
* @param {boolean} convertUndefined
*
* @return {object} Results object from node-postgres.
*/
module.exports = async function query({
  client,
  pool,
  sql,
  values,
  transform,
  transformFn,
  convertUndefined
}) {
  if (client && pool) {
    throw new Error('Provide a pool OR a client, not both');
  }

  const q = await createQuery({sql, values, convertUndefined});

  const connection = client || pool;

  const results = await connection.query(q);

  if (!transform) {
    return results;
  }

  if (transformFn) {
    return transformFn(results);
  }

  return defaultTransform(results);
};
