const test = require('ava');

const createUpdate = require('../lib/create-update');

test('createUpdate - Case 1', t => {
  const actual = createUpdate({
    table: 'user_account',
    values: {
      firstName: 'Bob',
    },
    id: 1
  });

  const expected = {
    text: `
      update user_account set
        (first_name) = ('Bob')
      where user_account_id = 1 returning *;
    `.replace(/\s+/g, ' ').trim()
  };

  t.deepEqual(actual, expected);
});
