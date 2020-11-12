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
  values: {lastName: 'Smith'}
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


# API
### async createQuery({ sql, values, convertUndefined })

#### sql `string`
An absolute path to the `.sql` file with your query.  It's generally easiest to put your `.sql` files in the same directory as the `.js` file where you'll be calling `createQuery`.

#### values `object`
An object with keys that map to variable names in your `.sql` files.

#### convertUndefined `string`
How to treat `undefined` values in the sql string.  Pass `'toNull'` to convert undefined values to `null` and `'toDefault'` to convert undefined values to `'default'`.

#### return `object`
A node-postgres query config object with `text` and `values` keys.  `text` will be in parameterized query form and the values will be in a corresponding array.

### async query({ pool?, client?, sql, values, convertUndefined })
Same params as `createQuery`, with the addition of `pool`, which is an instance of node-postgres `Pool`, and `client`, which is a `client` from the `pool` (you will only be using pool or client but not both for any given query).

This function will create a node-postgres query config object using `createQuery` and then execute the query using your `pool` or `client` instance.

Returns the result of the query.
