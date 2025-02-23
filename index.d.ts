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
  values: any[];
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
 * Create a parameterized INSERT query string and values from a sql file.
 */
export function createInsert(options: CreateQueryOptions): Promise<QueryStringResult>;

/**
 * Creates a parameterized INSERT query string from a sql file and values object
 * and then executes that query using `pool` or `client` from node-postgres.
 */
export function insert(options: QueryOptions): Promise<QueryResult | any[]>;

/**
 * Create a parameterized UPDATE query string and values from a sql file.
 */
export function createUpdate(options: CreateQueryOptions): Promise<QueryStringResult>;

/**
 * Creates a parameterized UPDATE query string from a sql file and values object
 * and then executes that query using `pool` or `client` from node-postgres.
 */
export function update(options: QueryOptions): Promise<QueryResult | any[]>;
