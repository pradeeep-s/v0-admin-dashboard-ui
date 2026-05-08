import { Pool, PoolClient, QueryResult } from 'pg'

// Database connection pool
let pool: Pool | null = null

/**
 * Initialize database connection pool
 * Called once on first use
 */
function initializePool(): Pool {
  if (pool) {
    return pool
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  pool = new Pool({
    connectionString: databaseUrl,
    max: 20, // Maximum 20 connections
    idleTimeoutMillis: 30000, // 30 seconds
    connectionTimeoutMillis: 2000, // 2 seconds
  })

  pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client', err)
  })

  return pool
}

/**
 * Get a client from the pool
 */
export async function getClient(): Promise<PoolClient> {
  const currentPool = initializePool()
  return currentPool.connect()
}

/**
 * Execute a single query
 * @param sql - SQL query string
 * @param values - Query parameters
 * @returns Query result
 */
export async function query<T = any>(
  sql: string,
  values?: any[]
): Promise<QueryResult<T>> {
  const currentPool = initializePool()
  try {
    console.log('[DB] Query:', sql.substring(0, 100), '...', values)
    return await currentPool.query(sql, values)
  } catch (error) {
    console.error('[DB] Query error:', error)
    throw error
  }
}

/**
 * Execute multiple queries in a transaction
 * @param callback - Function that receives client and executes queries
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('[DB] Transaction error:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Execute a single row query
 * @param sql - SQL query string
 * @param values - Query parameters
 * @returns Single row or undefined
 */
export async function queryOne<T = any>(sql: string, values?: any[]): Promise<T | undefined> {
  const result = await query<T>(sql, values)
  return result.rows[0]
}

/**
 * Execute a query that returns multiple rows
 * @param sql - SQL query string
 * @param values - Query parameters
 * @returns Array of rows
 */
export async function queryMany<T = any>(sql: string, values?: any[]): Promise<T[]> {
  const result = await query<T>(sql, values)
  return result.rows
}

/**
 * Close all connections in the pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

/**
 * Check database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as status')
    return result.rows[0]?.status === 1
  } catch (error) {
    console.error('[DB] Connection test failed:', error)
    return false
  }
}
