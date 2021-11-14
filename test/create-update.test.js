const test = require('ava');

const createUpdate = require('../lib/create-update');

test('createUpdate - Case 1', t => {
  const actual = createUpdate({
    table: 'user_account',
    values: {
      firstName: 'Bob',
    },
    where: {userAccountId: 1}
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

test('createUpdate - Case 2', t => {
  const actual = createUpdate({
    table: 'user_account',
    values: {
      firstName: 'Bob',
    },
    where: {userAccountId: 'abc123'}
  });

  const expected = {
    text: `
      update user_account set
        (first_name) = ('Bob')
      where user_account_id = 'abc123' returning *;
    `.replace(/\s+/g, ' ').trim()
  };

  t.deepEqual(actual, expected);
});

test('createUpdate - Case 3', t => {
  const actual = createUpdate({
    table: 'user_account',
    values: {
      firstName: 'Bob',
    },
    where: {id: 3}
  });

  const expected = {
    text: `
      update user_account set
        (first_name) = ('Bob')
      where id = 3 returning *;
    `.replace(/\s+/g, ' ').trim()
  };

  t.deepEqual(actual, expected);
});

test('createUpdate - Case 4', t => {
  const actual = createUpdate({
    table: 'user_account',
    values: {
      firstName: 'Bob',
      lastName: 'Johnson',
    },
    where: {userAccountId: 3}
  });

  const expected = {
    text: `
      update user_account set
        (first_name, last_name) = ('Bob', 'Johnson')
      where user_account_id = 3 returning *;
    `.replace(/\s+/g, ' ').trim()
  };

  t.deepEqual(actual, expected);
});

test('createUpdate - Case 5', t => {
  const actual = createUpdate({
    table: 'user_account',
    values: {
      firstName: 'Bob',
      lastName: null,
    },
    where: {userAccountId: 3}
  });

  const expected = {
    text: `
      update user_account set
        (first_name, last_name) = ('Bob', NULL)
      where user_account_id = 3 returning *;
    `.replace(/\s+/g, ' ').trim()
  };

  t.deepEqual(actual, expected);
});
