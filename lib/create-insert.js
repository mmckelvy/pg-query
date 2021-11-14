const format = require('pg-format');
const { snakeCase } = require('@mmckelvy/case');

/**
 * @param {string} table
 * @param {object} or {object[]} values
 *
 * @return {object} with 'text' and 'values' keys
 *
 */
module.exports = function createInsert({ table, values, convertUndefined }) {
  const escapes = [];
  const idents = [table];
  const vals = [];

  if (Array.isArray(values)) {
    const [ firstRow ] = values;

    const firstRowKeys = Object.keys(firstRow).sort();

    for (const key of firstRowKeys) {
      escapes.push('%I');
      idents.push(snakeCase(key));
    }

    for (const value of values) {
      const keys = Object.keys(value).sort();

      const rowVals = [];

      for (const key of keys) {
        rowVals.push(value[key]);
      }

      vals.push(rowVals);
    }

  } else {
    const keys = Object.keys(values).sort();

    const rowVals = [];

    for (const key of keys) {
      escapes.push('%I');
      idents.push(snakeCase(key));
      rowVals.push(values[key]);
    }

    vals.push(rowVals);
  }

  const l = format.withArray(
    `insert into %I (${escapes.join(', ')})`,
    idents
  );

  const v = format(
    `values %L`,
    vals
  );

  return {
    text: `${l} ${v} returning *;`
  };
};
