import { Pool } from "pg"

export const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  port: 5432,

  ssl: {
    rejectUnauthorized: false,
  },

  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})
