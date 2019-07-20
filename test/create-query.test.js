const test = require('ava');

const createQuery = require('../lib/create-query');

test('createQuery - Should create a proper query', async (t) => {
  const actual = await createQuery({
    sql: './test/query.sql',
    values: {foo: 'John'}
  });


  const expected = {
    text: `select first_name, last_name from my_table where first_name = $1;`,
    values: ['John']
  };

  t.deepEqual(actual, expected);
});

test('createQuery - Work with numbers and do not mess up types', async (t) => {
  const actual = await createQuery({
    sql: './test/complex-query.sql',
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
