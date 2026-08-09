import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema/index.js';

/**
 * Create a Drizzle database instance with the given connection string.
 *
 * @param connectionString - PostgreSQL connection string
 * @returns Drizzle database instance
 */
export function createDb(connectionString: string) {
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

/**
 * Type helper for the database instance
 */
export type Database = ReturnType<typeof createDb>;
