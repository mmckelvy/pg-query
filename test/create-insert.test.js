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

test('createInsert - Case 2', t => {
  const actual = createInsert({
    table: 'user_account',
    values: [
      {
        firstName: 'Jim',
        lastName: 'Jenkins'
      },
      {
        firstName: 'Leroy',
        lastName: 'Smith'
      },
    ]
  });

  const expected = {
    text: `insert into user_account (first_name, last_name) values ('Jim', 'Jenkins'), ('Leroy', 'Smith') returning *;`.replace(/\s+/g, ' ')
  };

  t.deepEqual(actual, expected);
});

test('createInsert - Case 3', t => {
  const actual = createInsert({
    table: 'user_account',
    values: [
      {
        firstName: 'Jim',
        lastName: 'Jenkins'
      },
      {
        lastName: 'Smith',
        firstName: 'Leroy',
      },
    ]
  });

  const expected = {
    text: `insert into user_account (first_name, last_name) values ('Jim', 'Jenkins'), ('Leroy', 'Smith') returning *;`.replace(/\s+/g, ' ')
  };

  t.deepEqual(actual, expected);
});
