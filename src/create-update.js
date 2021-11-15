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
  const u = format.withArray(
    `update %I set`,
    [snakeCase(table)]
  );

  const keys = Object.keys(values).sort();

  const setCols = [];

  for (const key of keys) {
    const x = format.withArray(
      `%I = %L`,
      [snakeCase(key), values[key]]
    );

    setCols.push(x);
  }

  const s = setCols.join(', ');

  const [ whereKey, whereVal ] = Object.entries(where)[0];

  const w = typeof whereVal === 'number'
    ? format.withArray(`where %I = ${whereVal}`,[snakeCase(whereKey)])
    : format.withArray(`where %I = %L`,[snakeCase(whereKey), whereVal])
  ;

  return {
    text: `${u} ${s} ${w} returning *;`
  };
};
