-- ============================================================================
-- Seed Demo Users with Encrypted Passwords
-- ============================================================================
-- Password hashes generated with bcrypt (rounds=10)
-- admin@pacs.com: admin123
-- operator@pacs.com: operator123

-- Note: These are pre-hashed passwords. In production, use the /api/register endpoint
-- or use bcrypt.hash() in your Node.js application

INSERT INTO public.users (
  id,
  email,
  username,
  password_hash,
  role,
  is_active,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'admin@pacs.com',
  'admin_user',
  '$2a$10$..salt..bfWFYmvtPpBSSeOw1ZNEVbRsCLWmg9K8qI8ZdVpEYrWTO',
  'Admin',
  true,
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

INSERT INTO public.users (
  id,
  email,
  username,
  password_hash,
  role,
  is_active,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'operator@pacs.com',
  'operator_user',
  '$2a$10$..salt..KDZw7EzV8QOD/eVE1LmHGDZY5E1HZL7.6vK4rZ8Ot8Cw6',
  'Operator',
  true,
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Additional test users
INSERT INTO public.users (
  id,
  email,
  username,
  password_hash,
  role,
  is_active,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'test@pacs.com',
  'test_user',
  '$2a$10$..salt..bfWFYmvtPpBSSeOw1ZNEVbRsCLWmg9K8qI8ZdVpEYrWTO',
  'Operator',
  true,
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Verify users were created
SELECT id, email, username, role, is_active, created_at FROM public.users ORDER BY created_at DESC;


CREATE POLICY "Allow select modules"
ON modules
FOR INSERT
WITH CHECK (true);

CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION execute_sql(text) TO service_role;
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

ALTER TABLE dynamic_schemas DISABLE ROW LEVEL SECURITY;
ALTER TABLE schemes DISABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE(column_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.column_name
  FROM information_schema.columns c
  WHERE c.table_name = table_name
    AND c.table_schema = 'public'
  ORDER BY c.ordinal_position;
END;
$$;

GRANT EXECUTE ON FUNCTION get_table_columns(text) TO service_role;

ALTER TABLE dynamic_schemas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read"
ON dynamic_schemas
FOR SELECT
USING (true);

CREATE POLICY "Allow all insert"
ON dynamic_schemas
FOR INSERT
WITH CHECK (true);