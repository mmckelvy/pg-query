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
