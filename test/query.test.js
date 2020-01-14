const { exec } = require('child_process');
const { promisify } = require('util');

const test = require('ava');
const uuid = require('uuid/v4');
const { Pool } = require('pg');

const execAsync = promisify(exec);
const query = require('../lib/query');

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

test('query - Should query the db', async (t) => {
  const actual = await query({
    pool: t.context.pool,
    sql: `${__dirname}/get-user.sql`,
    values: {lastName: 'Smith'}
  });

  const expected = [
    {firstName: 'Joe', lastName: 'Smith'}
  ];

  t.deepEqual(actual, expected);
});

test('query - Should work with no params', async (t) => {
  const actual = await query({
    pool: t.context.pool,
    sql: `${__dirname}/no-params.sql`
  });

  const expected = [
    {firstName: 'Joe', lastName: 'Smith'}
  ];

  t.deepEqual(actual, expected);
});

test.after.always('Teardown db', async (t) => {
  await t.context.pool.end();
  await execAsync(`dropdb ${t.context.db}`);
});
