const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const read = promisify(fs.readFile);

/**
* Create a parameterized query string and values from a sql file.
*
* @param {string} sql - Path to the target sql file.
* @param {object} values - Keys are column names and values are row values.
*
* @return {object} with 'text' and 'values' keys.  'text' value is
* a parameterized string.
*/
module.exports = async function createQuery({
  sql,
  values,
  rootDir = process.cwd()
}) {
  const rawText = await read(path.join(rootDir, sql), {encoding: 'utf8'});

  // Remove extra whitespace to avoid parsing issues and make testing easier.
  const text = rawText.replace(/\s+/g, ' ').trim();

  const keys = Object.keys(values);

  if (!keys.length) {
    return {text, values: []};
  }

  // match :foo and :'foo'
  const regEx = /(^|\s)(:\w+|:'\w+')/;

  return keys.reduce((acc, key, i) => {
    acc.text = acc.text.replace(regEx, (match, p1, p2) => {
      return `${p1}$${i + 1}`;
    });

    acc.values.push(values[key]);

    return acc;

  }, {text, values: []});
};
