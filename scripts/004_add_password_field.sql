-- Add password field to users table for manual authentication fallback
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create index for faster password lookups
CREATE INDEX IF NOT EXISTS idx_users_email_password ON public.users(email) WHERE password_hash IS NOT NULL;

-- Add comment explaining the field
COMMENT ON COLUMN public.users.password_hash IS 'Bcrypt hashed password for fallback authentication. Users can authenticate via Supabase Auth OR via stored credentials in this table.';
