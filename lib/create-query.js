const fs = require('fs');
const { promisify } = require('util');

const read = promisify(fs.readFile);

/**
* Create a parameterized query string and values from a sql file.
*
* @param {string} sql - Path to the target sql file.
* @param {object} values - Keys are column names and values are row values.
* @param {string} convertUndefined - 'toNull', 'toDefault' or 'ignore'.
* Denotes how to handle a variable that exists in the text string but not
* in the values object. Generally should be 'toNull' for SELECT and 'toDefault'
* for INSERT or UPDATE.
*
* @return {object} with 'text' and 'values' keys.  'text' value is
* a parameterized string.
*/
module.exports = async function createQuery({
  sql,
  values = {},
  convertUndefined = 'toNull'
}) {
  const rawText = await read(sql, {encoding: 'utf8'});

  // Remove comments
  cleaned = rawText.replace(/--.+(\r\n|\r|\n)/g, '');

  // Remove extra whitespace to avoid parsing issues and make testing easier.
  const text = cleaned.replace(/\s+/g, ' ').trim();

  const keys = Object.keys(values);
  
  if (!keys.length) {
    return {text, values: []};
  }

  // match :foo and :'foo'
  const interimResults = keys.reduce((acc, key, i) => {
    const regex = new RegExp(`(?<!:):'*${key}(?=\\b)'*`, 'g');

    acc.text = acc.text.replace(regex, () => {
      return `$${i + 1}`;
    });

    acc.values.push(values[key]);

    return acc;

  }, {text, values: []});

  // Handle any undefined variables remaining in the text string.
  const undefinedRegEx = /(?<!:):'*\w+(?=\b)'*/g;

  if (convertUndefined === 'ignore') {
    return interimResults;
  }

  const finalResults = {
    text: interimResults.text.replace(undefinedRegEx, () => {
      if (convertUndefined !== 'toNull' && convertUndefined !== 'toDefault') {
        throw new Error('convertUndefined must be equal to "toNull" or "toDefault"');
      }

      const replacementVal = convertUndefined === 'toNull'
        ? 'null'
        : 'default'
    
      return replacementVal;
    }),
    values: interimResults.values
  };

  return finalResults;
};
