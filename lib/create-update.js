const format = require('pg-format');
const { snakeCase } = require('@mmckelvy/case');

module.exports = function createUpdate({
  table,
  values,
  id,
  idCol = `${table}_id`,
}) {
  const escapes = [];
  const idents = [table];
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

  const w = typeof id === 'number'
    ? format.withArray(`where %I = ${id}`,[idCol])
    : format.withArray(`where %I = %L`,[idCol, id])
  ;

  return {
    text: `${l} ${v} ${w} returning *;`
  };
};
