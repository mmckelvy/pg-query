const format = require('pg-format');
const { snakeCase } = require('@mmckelvy/case');

/**
 * @param {string} table
 * @param {object} or {object[]} values
 * @param {object} where
 *
 * @return {object} with a 'text' key
 */
module.exports = function createUpdate({
  table,
  values,
  where
}) {
  const escapes = [];
  const idents = [snakeCase(table)];
  const vals = [];

  const keys = Object.keys(values).sort();

  const rowVals = [];

  for (const key of keys) {
    escapes.push('%I');
    idents.push(snakeCase(key));
    rowVals.push(values[key]);
  }

  vals.push(rowVals);

  const l = format.withArray(
    `update %I set (${escapes.join(', ')}) =`,
    idents
  );

  const v = format(
    `%L`,
    vals
  );

  const [ whereKey, whereVal ] = Object.entries(where)[0];

  const w = typeof whereVal === 'number'
    ? format.withArray(`where %I = ${whereVal}`,[snakeCase(whereKey)])
    : format.withArray(`where %I = %L`,[snakeCase(whereKey), whereVal])
  ;

  return {
    text: `${l} ${v} ${w} returning *;`
  };
};
