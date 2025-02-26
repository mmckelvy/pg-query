import { Pool, Client, QueryResult } from 'pg';

export interface CreateQueryOptions {
  /** Path to the target sql file */
  sql: string;
  /** Keys are column names and values are row values */
  values?: Record<string, any>;
  /**
   * Denotes how to handle a variable that exists in the text string but not
   * in the values object. Generally should be 'toNull' for SELECT and 'toDefault'
   * for INSERT or UPDATE.
   */
  convertUndefined?: 'toNull' | 'toDefault';
}

export interface QueryOptions extends CreateQueryOptions {
  /** The client object from node-postgres */
  client?: Client;
  /** The pool object from node-postgres */
  pool?: Pool;
  /** Whether to transform the results */
  transform?: boolean;
  /** Custom transform function for the results */
  transformFn?: (results: QueryResult) => any;
}

export interface QueryStringResult {
  /** The parameterized query string */
  text: string;
  /** Array of values to be used in the parameterized query */
  values?: any[];
}

export interface CreateInsertOptions {
  /** The table to insert into */
  table: string;
  /** The values to insert. Can be a single object or array of objects */
  values: Record<string, any> | Record<string, any>[];
}

export interface InsertOptions {
  /** The client object from node-postgres */
  client?: Client;
  /** The pool object from node-postgres */
  pool?: Pool;
  /** The table to insert into */
  table: string;
  /** The values to insert. Can be a single object or array of objects */
  values: Record<string, any> | Record<string, any>[];
  /** Whether to transform the results */
  transform?: boolean;
  /** Custom transform function for the results */
  transformFn?: (results: QueryResult) => any;
}

export interface CreateUpdateOptions {
  /** The table to update */
  table: string;
  /** The values to update */
  values: Record<string, any>;
  /** The where clause condition */
  where: Record<string, string | number>;
}

export interface UpdateOptions {
  /** The client object from node-postgres */
  client?: Client;
  /** The pool object from node-postgres */
  pool?: Pool;
  /** The table to update */
  table: string;
  /** The values to update */
  values: Record<string, any>;
  /** The where clause condition */
  where: Record<string, string | number>;
  /** Whether to transform the results */
  transform?: boolean;
  /** Custom transform function for the results */
  transformFn?: (results: QueryResult) => any;
}

/**
 * Create a parameterized query string and values from a sql file.
 */
export function createQuery(options: CreateQueryOptions): Promise<QueryStringResult>;

/**
 * Creates a parameterized query string from a sql file and values object
 * and then executes that query using `pool` or `client` from node-postgres.
 */
export function query(options: QueryOptions): Promise<QueryResult | any[]>;

/**
 * Create a parameterized INSERT query string from a table name and values object.
 */
export function createInsert(options: CreateInsertOptions): QueryStringResult;

/**
 * Creates a parameterized INSERT query string from a table name and values object
 * and then executes that query using `pool` or `client` from node-postgres.
 */
export function insert(options: InsertOptions): Promise<QueryResult | any[]>;

/**
 * Create a parameterized UPDATE query string from a table name, values object, and where condition.
 */
export function createUpdate(options: CreateUpdateOptions): QueryStringResult;

/**
 * Creates a parameterized UPDATE query string from a table name, values object, and where condition
 * and then executes that query using `pool` or `client` from node-postgres.
 */
export function update(options: UpdateOptions): Promise<QueryResult | any[]>;
