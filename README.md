# pg-query
Import your Postgres-flavored .sql queries and run them in Node.

# Install
```bash
npm install @mmckelvy/pg-query
```

# Usage
Create a node-postgres [query config object](https://node-postgres.com/features/queries) from a `.sql` file.

Assume you have an `.sql` file called `query.sql` with the following query:

```sql
select
  first_name,
  last_name
from my_table
where first_name = :firstName and last_name = :lastName;
```

`:firstName` and `:lastName` are variables that you can set with `psql` using the `\set` command, or in our case, you can subsitute with dynamic values from your Node app at runtime:

```javascript
const { createQuery } = require('@mmckelvy/pg-query');

const q = await createQuery({
  // assumes query.sql is in the same directory
  sql: `${__dirname/query.sql}`,
  values: {firstName: 'John', lastName: 'Smith'},
});

console.log(q);
/*
{
  text: `select first_name, last_name from my_table where first_name = $1 and last_name = $2;`,
  values: ['John', 'Smith']
}
*/
```

Usually you'll want to use the result of `createQuery` directly with node-postgres `pool.query` or `client.query` methods to actually execute a Postgres query.  `pg-query` provides a `query` method that does exactly that.  Just pass in the `pool` object from `node-postgres` in addition to the `sql` and `values` params:

```javascript
const { query } = require('@mmckelvy/pg-query');
const pool = require('./path-to-your-pool-instance');

const { rows } = await query({
  pool,
  sql: `${__dirname}/get-user.sql`,
  values: {lastName: 'Smith'},
});

console.log(rows);
/*
[
  {first_name: 'Joe', last_name: 'Smith'}
]
*/
```

### Handling undefined / optional values
Sometimes you'll want to use values that may or may not be present (i.e. they will be `undefined`) in your queries.  This typically happens when you have optional fields for `inserts` or dynamic filter parameters for `where` clauses.  To handle these potentially undefined fields, pg-query gives you the option to convert them to `null` or `default`.  Just pass in the appropriate option like so:

```javascript
const { createQuery } = require('@mmckelvy/pg-query');

const q = await createQuery({
  sql: `${__dirname/query.sql}`,
  values: {firstName: 'John', lastName: 'Smith'},
  convertUndefined: 'toNull' // converts any undefined values to null
});

const x = await createQuery({
  sql: `${__dirname/query.sql}`,
  values: {firstName: 'John', lastName: 'Smith'},
  convertUndefined: 'toDefault' // converts any undefined values to 'default'
});

```
If you don't pass anything for `convertUndefined`, `toNull` will be used.

### Convenience functions
Simple `insert`s and `update`s are common sql operations that often have optional column values.  Optional column values can be cumbersome to handle in plain sql, so pg-query provides convenience functions to help you deal with these situations:

1. `createInsert` - Generate properly escaped `insert` statements.
2. `createUpdate` - Generate properly escaped `update` statements.
3. `insert` - Generate and execute properly escaped `insert` statements.
4. `update` - Generate and execute properly escaped `update` statements.

`createInsert`:

```javascript
const { createInsert } = require('@mmckelvy/pg-query');

// Note this function is not async so no await required.
const q = createInsert({
  table: 'user_account',
  values: {firstName: 'Jim', lastName: 'Jenkins'}
});

console.log(q);
/*
{
  text: `
    insert into user_account (first_name, last_name)
    values ('Jim', 'Jenkins')
    returning *;
  `
}
*/

// Works for bulk inserts as well
const q = createInsert({
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

console.log(q);
/*
{
  text: `
    insert into user_account (first_name, last_name)
    values
      ('Jim', 'Jenkins'),
      ('Leroy', 'Smith')
    returning *;
  `
}
*/
```

`createUpdate`:

```javascript
const { createUpdate } = require('@mmckelvy/pg-query');

// Note this function is not async so no await required.
const q = createUpdate({
  table: 'user_account',
  values: {firstName: 'Bob', lastName: 'Johnson'},
  where: {userAccountId: 1}
});

console.log(q);
/*
{
  text: `
    update user_account set
      first_name = 'Bob',
      last_name = 'Johnson'
    where user_account_id = 1
    returning *;
  `
}
*/
```

The `insert` and `update` convenience functions simply take the output of `createInsert` and `createUpdate` respectively, and execute the queries using node-pg:

```javascript
const { insert, update } = require('@mmckelvy/pg-query');
const pool = require('./path-to-your-pool-instance');

const userAccounts = await insert({
  pool,
  table: 'user_account',
  values: [
    {firstName: 'Jim', lastName: 'Jenkins'},
    {firstName: 'Leroy', lastName: 'Smith'},
    {lastName: 'Jensen', firstName: 'Don'},
  ],
  transform: true
});

console.log(userAccounts);

/*
[
  {firstName: 'Jim', lastName: 'Jenkins'},
  {firstName: 'Leroy', lastName: 'Smith'},
  {firstName: 'Don', lastName: 'Jensen'},
];
*/

const updatedUserAccount = await update({
  pool,
  table: 'user_account',
  values: {firstName: 'Bob', lastName: 'Johnson'},
  where: {userAccountId: 1},
  transform: true
});

console.log(updatedUserAccount);
/*
[
  {userAccountId: 1, firstName: 'Bob', lastName: 'Johnson'}
];
*/
```

### Transforming output
When using the functions that execute queries (`query`, `insert`, `update`), the default output is what you get from node-pg, e.g.:

```javascript
{
  rows: [
    {first_name: 'John', last_name: 'Smith'}
  ],
  fields: [...],
  _parsers: [...],
  command: ...
  // ...etc.
}
```

Chances are you want to make some adjustments before you consume this output.  If that's the case, pg-query provides `transform` and `transformFn` options to `query`, `insert`, and `update`.  Setting `transform` to `true` will return the `rows` key (usually the only thing in which you'll be interested) and `camelCase` the keys of each column name (recursively) on the way out:

```javascript
const userAccounts = await query({
  pool,
  sql: `${__dirname}/query.sql`,
  values: {firstName: 'John', lastName: 'Smith'},
  transform: true
});

console.log(userAccounts);

/*
[
  {firstName: 'Joe', lastName: 'Smith'}
]
*/
```

You can also pass your own `transformFn` if you'd like to do something different with the results:

```javascript
const userAccounts = await query({
  pool,
  sql: `${__dirname}/query.sql`,
  values: {firstName: 'John', lastName: 'Smith'},
  transform: true,
  // Just return the rows without camelCasing the keys.
  transformFn: (results) => results.rows
});

console.log(userAccounts);

/*
[
  {first_name: 'Joe', last_name: 'Smith'}
]
*/
```

# API
### async createQuery({ sql, values, convertUndefined })

#### sql `string`
An absolute path to the `.sql` file with your query.  It's generally easiest to put your `.sql` files in the same directory as the `.js` file where you'll be calling `createQuery`.

#### values `object`
An object with keys that map to variable names in your `.sql` files.

#### convertUndefined `string`
How to treat `undefined` values in the sql string.  Pass `'toNull'` to convert undefined values to `null` and `'toDefault'` to convert undefined values to `'default'`, and `'ignore'` to just leave them as is (helpful if you are using the ":" character to format times or something along those lines).

#### return `object`
A node-postgres query config object with `text` and `values` keys.  `text` will be in parameterized query form and the values will be in a corresponding array.

### async query({ pool?, client?, sql, values, convertUndefined, transform, transformFn })
Same params as `createQuery`, with the addition of `pool`, which is an instance of node-postgres `Pool`, and `client`, which is a `client` from the `pool` (you will only be using pool or client but not both for any given query).

`query` also adds two transform params:

#### transform `boolean`
Whether or not to transform the node-pg output.  If set to `true` and `transformFn` is not supplied, pg-query will use the built-in transform which will return the `rows` property and recursively `camelCase` all column keys.

Defaults to `false`.

#### transformFn `function`
A custom transform function to be applied to the node-pg results.  Signature is `(results) => transformedResults`.

Note that the `transform` property must also be set to `true` for the `transformFn` to apply.

#### return `object` or results of transform function
Returns the result of the query.

### createInsert({ table, values })

#### table `string`
The target table for the insert.  The argument passed for table will be `snake_cased` automatically.

#### values `object or array of objects`
The row or rows you want to insert.  Object keys should correspond to column names and values should correspond to column values.  All columns names will automatically be `snake_cased`.

#### return `object`
A node-postgres query config object with a `text` key.  The values will be already included in the text string.  All identifiers, literals, and values will be properly escaped.

### createUpdate({ table, values, where })

#### table `string`
The target table for the update.  The argument passed for table will be `snake_cased` automatically.

### #values `object`
The columns you want to update.  Keys should correspond to column names and values should correspond to column values.  All columns names will automatically be `snake_cased`.

#### where `object`
An object used to build the `where` clause for the update.  The key should be the column name and the value should be the filter value.

#### return `object`
A node-postgres query config object with a `text` key.  The values will be already included in the text string.  All identifiers, literals, and values will be properly escaped.

### insert({ pool?, client?, table, values, transform, transformFn })
Same params as createInsert with the addition of `pool`, `client`, `transform`, and `transformFn` params, which operate the same as `query`.

Returns the output of a node-pg query or the output of a transform function.

### update({ pool?, client?, table, values, where, transform, transformFn })
Same params as createUpdate with the addition of `pool`, `client`, `transform`, and `transformFn` params, which operate the same as `query`.

Returns the output of a node-pg query or the output of a transform function.

# Test
Make sure you have Postgres installed on your machine and then run:

```bash
npm test
```

