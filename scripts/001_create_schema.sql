-- ============================================================================
-- Dynamic Excel Data Processing System - Database Schema
-- ============================================================================

-- 1. BRANCHES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Anyone can read branches (they're system data)
CREATE POLICY "branches_select_public" ON public.branches FOR SELECT USING (true);
-- Only admins can modify (controlled via service role)
CREATE POLICY "branches_insert_admin" ON public.branches FOR INSERT WITH CHECK (false);
CREATE POLICY "branches_update_admin" ON public.branches FOR UPDATE USING (false);
CREATE POLICY "branches_delete_admin" ON public.branches FOR DELETE USING (false);

-- ============================================================================
-- 2. MODULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modules_select_public" ON public.modules FOR SELECT USING (true);
CREATE POLICY "modules_insert_admin" ON public.modules FOR INSERT WITH CHECK (false);
CREATE POLICY "modules_update_admin" ON public.modules FOR UPDATE USING (false);
CREATE POLICY "modules_delete_admin" ON public.modules FOR DELETE USING (false);

-- ============================================================================
-- 3. SCHEMES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, code)
);

ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schemes_select_public" ON public.schemes FOR SELECT USING (true);
CREATE POLICY "schemes_insert_admin" ON public.schemes FOR INSERT WITH CHECK (false);
CREATE POLICY "schemes_update_admin" ON public.schemes FOR UPDATE USING (false);
CREATE POLICY "schemes_delete_admin" ON public.schemes FOR DELETE USING (false);

-- ============================================================================
-- 4. USERS TABLE (Extended user data - profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Operator',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- 5. UPLOADS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  module_id UUID NOT NULL REFERENCES public.modules(id),
  scheme_id UUID NOT NULL REFERENCES public.schemes(id),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  total_rows INTEGER DEFAULT 0,
  success_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uploads_select_own" ON public.uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "uploads_insert_own" ON public.uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "uploads_update_own" ON public.uploads FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 6. UPLOAD_ERRORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.upload_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  column_name TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.upload_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "upload_errors_select_own" ON public.upload_errors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.uploads 
      WHERE id = upload_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "upload_errors_insert_own" ON public.upload_errors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.uploads 
      WHERE id = upload_id AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- 7. COLUMN_MAPPINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.column_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
  excel_column TEXT NOT NULL,
  database_column TEXT NOT NULL,
  data_type TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scheme_id, excel_column)
);

ALTER TABLE public.column_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "column_mappings_select_public" ON public.column_mappings FOR SELECT USING (true);
CREATE POLICY "column_mappings_insert_admin" ON public.column_mappings FOR INSERT WITH CHECK (false);
CREATE POLICY "column_mappings_update_admin" ON public.column_mappings FOR UPDATE USING (false);
CREATE POLICY "column_mappings_delete_admin" ON public.column_mappings FOR DELETE USING (false);

-- ============================================================================
-- 8. VALIDATION_RULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
  column_name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  rule_value TEXT,
  error_message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scheme_id, column_name, rule_type)
);

ALTER TABLE public.validation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "validation_rules_select_public" ON public.validation_rules FOR SELECT USING (true);
CREATE POLICY "validation_rules_insert_admin" ON public.validation_rules FOR INSERT WITH CHECK (false);
CREATE POLICY "validation_rules_update_admin" ON public.validation_rules FOR UPDATE USING (false);
CREATE POLICY "validation_rules_delete_admin" ON public.validation_rules FOR DELETE USING (false);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_schemes_module_id ON public.schemes(module_id);
CREATE INDEX idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX idx_uploads_branch_id ON public.uploads(branch_id);
CREATE INDEX idx_uploads_module_id ON public.uploads(module_id);
CREATE INDEX idx_uploads_scheme_id ON public.uploads(scheme_id);
CREATE INDEX idx_uploads_created_at ON public.uploads(created_at DESC);
CREATE INDEX idx_upload_errors_upload_id ON public.upload_errors(upload_id);
CREATE INDEX idx_upload_errors_created_at ON public.upload_errors(created_at DESC);
CREATE INDEX idx_column_mappings_scheme_id ON public.column_mappings(scheme_id);
CREATE INDEX idx_validation_rules_scheme_id ON public.validation_rules(scheme_id);
