const format = require('pg-format');
const { snakeCase } = require('@mmckelvy/case');

/**
 * @param {string} table
 * @param {object} or {object[]} values
 *
 * @return {object} with 'text' and 'values' keys
 *
 */
module.exports = function createInsert({ table, values }) {
  const escapes = [];
  const idents = [table];
  const vals = [];

  for (const [ key, val ] of Object.entries(values)) {
    escapes.push('%I');
    idents.push(snakeCase(key));
    vals.push(val);
  }

  const l = format.withArray(
    `insert into %I (${escapes.join(', ')})`,
    idents
  );

  const v = format(
    `values %L`,
    [vals]
  );

  return {
    text: `${l} ${v} returning *;`
  };
};
