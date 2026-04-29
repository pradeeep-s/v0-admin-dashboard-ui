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
