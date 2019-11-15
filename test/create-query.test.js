const test = require('ava');

const createQuery = require('../lib/create-query');

test('createQuery - Should create a proper query', async (t) => {
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

test('createQuery - Should work with no params', async (t) => {
  const actual = await createQuery({
    sql: `${__dirname}/no-params.sql`
  });

  const expected = {
    text: `select first_name, last_name from user_account;`.replace(/\s+/g, ' '),
    values: []
  };

  t.deepEqual(actual, expected);
});

test('createQuery - Work with numbers and do not mess up types', async (t) => {
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

test('createQuery - Handle arrays', async (t) => {
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

test('createQuery - Should remove comments', async (t) => {
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