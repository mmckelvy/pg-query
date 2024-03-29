const test = require('ava');

const createQuery = require('../src/create-query');

// Basic query
test('createQuery - Case 1', async (t) => {
  const actual = await createQuery({
    sql: `${__dirname}/query.sql`,
    values: {firstName: 'John', lastName: 'Steve'},
  });


  const expected = {
    text: `select first_name, last_name from my_table where first_name = $1 and last_name = $2;`.replace(/\s+/g, ' '),
    values: ['John', 'Steve']
  };

  t.deepEqual(actual, expected);
});

// No params
test('createQuery - Case 2', async (t) => {
  const actual = await createQuery({
    sql: `${__dirname}/no-params.sql`
  });

  const expected = {
    text: `select first_name, last_name from user_account;`.replace(/\s+/g, ' '),
    values: []
  };

  t.deepEqual(actual, expected);
});

// Complex query
test('createQuery - Case 3', async (t) => {
  const actual = await createQuery({
    sql: `${__dirname}/complex-query.sql`,
    values: {
      companyOwnerId: 25
    }
  });

  const expected = {
    text: `select account_id from chart_of_accounts where account_name ~ ( select '*.' || co.owner_account_name || '.*' from company_owner as co where co.company_owner_id = $1 )::lquery;`.replace(/\s+/g, ' '),
    values: [25]
  };

  t.deepEqual(actual, expected);
});

// Work with arrays
test('createQuery - Case 4', async (t) => {
  const actual = await createQuery({
    sql: `${__dirname}/array-query.sql`,
    values: {
      listOfNames: ['John', 'Mary', 'Joe']
    }
  });

  const expected = {
    text: `insert into foo (a) values ($1);`,
    values: [['John', 'Mary', 'Joe']]
  };

  t.deepEqual(actual, expected);
});

// With comments
test('createQuery - Case 5', async (t) => {
  const actual = await createQuery({
    sql: `${__dirname}/with-comments.sql`,
    values: {firstName: 'John', lastName: 'Steve'},
  });


  const expected = {
    text: `select first_name, last_name from my_table where first_name = $1 and last_name = $2;`.replace(/\s+/g, ' '),
    values: ['John', 'Steve']
  };

  t.deepEqual(actual, expected);
});

// Handle nulls
test('createQuery - Case 6', async (t) => {
  const actual = await createQuery({
    sql: `${__dirname}/with-nulls.sql`,
    values: {firstName: 'John'},
  });

  const expected = {
    text: `select first_name, last_name from my_table where first_name = $1 and (null is null or last_name = null);`.replace(/\s+/g, ' '),
    values: ['John']
  };

  t.deepEqual(actual, expected);
});

// Handle defaults
test('createQuery - Case 7', async (t) => {
  const actual = await createQuery({
    sql: `${__dirname}/with-defaults.sql`,
    values: {firstName: 'John'},
    convertUndefined: 'toDefault'
  });

  const expected = {
    text: `insert into user_account (first_name, last_name) values ($1, default) returning *;`.replace(/\s+/g, ' '),
    values: ['John']
  };

  t.deepEqual(actual, expected);
});

// Handle similar variable names
test('createQuery - Case 8', async (t) => {
  const actual = await createQuery({
    sql: `${__dirname}/variable-names.sql`,
    values: {message: 'John', messageTimestamp: '2020-10-12T18:20:03.414Z'},
  });

  const expected = {
    text: `select message, message_timestamp from my_table where message = $1 and message_timestamp = $2;`.replace(/\s+/g, ' '),
    values: ['John', '2020-10-12T18:20:03.414Z']
  };

  t.deepEqual(actual, expected);
});

// Similar variable names with default params
test('createQuery - Case 9', async (t) => {
  const actual = await createQuery({
    sql: `${__dirname}/variable-names.sql`,
    values: {message: 'John'},
    convertUndefined: 'toDefault'
  });

  const expected = {
    text: `select message, message_timestamp from my_table where message = $1 and message_timestamp = default;`.replace(/\s+/g, ' '),
    values: ['John']
  };

  t.deepEqual(actual, expected);
});

// Handle colons in sql literal
test('createQuery - Case 10', async (t) => {
  const actual = await createQuery({
    sql: `${__dirname}/ignore.sql`,
    values: {firstName: 'John'},
  });

  const expected = {
    text: `select first_name, to_char(start_time, 'HH24:MI') as start from schedule where first_name = $1;`.replace(/\s+/g, ' '),
    values: ['John']
  };

  t.deepEqual(actual, expected);
});

// Bad convertUndefined param
test('createQuery - Case 11', async (t) => {
  const actual = createQuery({
    sql: `${__dirname}/variable-names.sql`,
    values: {message: 'John'},
    convertUndefined: 'toFoo'
  });

  const error = await t.throwsAsync(actual);
  t.is(error.message, 'convertUndefined must be "toNull" or "toDefault"');
});
