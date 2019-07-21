const { exec } = require('child_process');
const { promisify } = require('util');

const test = require('ava');
const uuid = require('uuid/v4');
const { Pool } = require('pg')

const execAsync = promisify(exec);
const query = require('../lib/query');

// need to do some setup and teardown.
test.before(async (t) => {
  const db = uuid();
  await execAsync(`createdb ${db}`);
  const pool = new Pool({db})
  t.context.db = uuid();

  await pool.query(`create table user_account (first_name text, last_name text);`);
});


test('query - Should query the db', async (t) => {

});

test.after.always('Teardown db', async (t) => {
  await
});