const test = require('ava');

const createInsert = require('../lib/create-insert');

test('createInsert - Case 1', t => {
  const actual = createInsert({
    table: 'user_account',
    values: {
      firstName: 'Jim',
      lastName: 'Jenkins'
    }
  });

  const expected = {
    text: `insert into user_account (first_name, last_name) values ('Jim', 'Jenkins') returning *;`.replace(/\s+/g, ' ')
  };

  t.deepEqual(actual, expected);
});
