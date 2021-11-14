const { exec } = require('child_process');
const { promisify } = require('util');

const test = require('ava');
const uuid = require('uuid/v4');
const { Pool } = require('pg');

const execAsync = promisify(exec);
const update = require('../lib/update');

test.before(async (t) => {
  t.context.db = uuid();
  await execAsync(`createdb ${t.context.db}`);
  t.context.pool = new Pool({
    database: t.context.db
  });

  await t.context.pool.query(`
    create table user_account (first_name text, last_name text);
  `);
  await t.context.pool.query(`
    insert into user_account (first_name, last_name) values ('Joe', 'Smith')
  `);
});

test('update - Case 1', async (t) => {
  const actual = await update({
    pool: t.context.pool,
    table: 'user_account',
    values: {firstName: 'Jim', lastName: 'Jenkins'},
    id: 1,
    transform: true
  });

  const expected = [
    {firstName: 'Jim', lastName: 'Jenkins'}
  ];

  t.deepEqual(actual, expected);
});

test('update - Case 2', async (t) => {
  const actual = await update({
    pool: t.context.pool,
    table: 'user_account',
    values: [
      {firstName: 'Jim', lastName: 'Jenkins'},
      {firstName: 'Leroy', lastName: 'Smith'},
      {lastName: 'Jensen', firstName: 'Don'},
    ],
    transform: true
  });

  const expected = [
    {firstName: 'Jim', lastName: 'Jenkins'},
    {firstName: 'Leroy', lastName: 'Smith'},
    {firstName: 'Don', lastName: 'Jensen'},
  ];

  t.deepEqual(actual, expected);
});

test('update - Case 3', async (t) => {
  const actual = await update({
      pool: t.context.pool,
      table: 'user_account',
      values: {firstName: 'Jim', lastName: 'Jenkins'},
    });

    const expected = [
      {first_name: 'Jim', last_name: 'Jenkins'}
    ];

  t.deepEqual(actual.rows, expected);
});

test.after.always('Teardown db', async (t) => {
  await t.context.pool.end();
  await execAsync(`dropdb ${t.context.db}`);
});

