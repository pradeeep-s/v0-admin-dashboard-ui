-- ============================================================================
-- Create User Profile on Signup (Trigger)
-- ============================================================================

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, username, email, role, is_active)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'Operator'),
    true
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Create Initial Admin and Operator Users
-- ============================================================================
-- NOTE: These credentials are for demo purposes only.
-- In production, create users through proper signup flow.

-- Admin user will be created via Supabase Auth dashboard or signup
-- For now, this is a placeholder for documentation

-- Sample SQL to create a test admin (do not run - use Supabase Auth UI):
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   raw_user_meta_data,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   'generated-uuid-here',
--   'authenticated',
--   'authenticated',
--   'admin@pacs.com',
--   '{"username": "admin@pacs.com", "role": "Admin"}',
--   crypt('admin123', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW()
-- );
