const createUpdate = require('./create-update');
const { camelCaseKeys } = require('@mmckelvy/case');

function defaultTransform(results) {
  if (results.rows) {
    return camelCaseKeys(results.rows, {recursive: true});
  }

  return [];
}

module.exports = async function update({
  client,
  pool,
  table,
  values,
  transform,
  transformFn
}) {

  if (client && pool) {
    throw new Error('Provide a pool OR a client, not both');
  }

  const q = createUpdate({
    table,
    values,
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
