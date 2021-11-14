const createInsert = require('./create-insert');
const { camelCaseKeys } = require('@mmckelvy/case');

function defaultTransform(results) {
  if (results.rows) {
    return camelCaseKeys(results.rows, {recursive: true});
  }

  return [];
}

module.exports = async function insert({
  client,
  pool,
  table,
  values,
  transform,
  transformFn,
  convertUndefined
}) {

  if (client && pool) {
    throw new Error('Provide a pool OR a client, not both');
  }

  const q = createInsert({
    table,
    values,
    convertUndefined,
    transform,
    transformFn,
  });

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
