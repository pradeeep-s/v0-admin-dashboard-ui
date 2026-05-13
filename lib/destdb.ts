import { Pool } from "pg"

export const pool = new Pool({
  host: process.env.OG_POSTGRES_HOST,
  user: process.env.OG_POSTGRES_USER,
  password: process.env.OG_POSTGRES_PASSWORD,
  database: process.env.OG_POSTGRES_DATABASE,
  port: 5432,
})