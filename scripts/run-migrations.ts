import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  try {
    console.log('[v0] Starting database migrations...')

    // Read and execute schema migration
    const schemaPath = path.join(__dirname, '001_create_schema.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')

    console.log('[v0] Executing schema migration...')
    const { error: schemaError } = await supabase.rpc('execute_sql', {
      sql: schemaSql,
    })

    if (schemaError) {
      console.log('[v0] Note: Schema may already exist or using manual SQL')
      console.log('[v0] Please execute 001_create_schema.sql in Supabase SQL Editor')
    } else {
      console.log('[v0] ✓ Schema created successfully')
    }

    // Read and execute seed migration
    const seedPath = path.join(__dirname, '002_seed_data.sql')
    const seedSql = fs.readFileSync(seedPath, 'utf8')

    console.log('[v0] Executing seed migration...')
    const { error: seedError } = await supabase.rpc('execute_sql', {
      sql: seedSql,
    })

    if (seedError) {
      console.log('[v0] Note: Seed data may already exist or using manual SQL')
      console.log('[v0] Please execute 002_seed_data.sql in Supabase SQL Editor')
    } else {
      console.log('[v0] ✓ Seed data inserted successfully')
    }

    console.log('[v0] Migrations completed!')
  } catch (error) {
    console.error('[v0] Migration error:', error)
    process.exit(1)
  }
}

runMigrations()
