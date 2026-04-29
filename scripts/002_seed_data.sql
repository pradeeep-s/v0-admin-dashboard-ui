-- ============================================================================
-- Seed Data for Dynamic Excel Data Processing System
-- ============================================================================

-- 1. Insert Branches
-- ============================================================================
INSERT INTO public.branches (name, code, location, is_active) VALUES
('Main Branch', 'BR001', 'New Delhi', true),
('North Branch', 'BR002', 'Mumbai', true),
('South Branch', 'BR003', 'Bangalore', true),
('East Branch', 'BR004', 'Kolkata', true),
('West Branch', 'BR005', 'Pune', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Modules
-- ============================================================================
INSERT INTO public.modules (name, code, description, is_active) VALUES
('Members', 'MOD001', 'Member registration and management', true),
('Deposits', 'MOD002', 'Deposit accounts and transactions', true),
('Loans', 'MOD003', 'Loan disbursement and management', true),
('Share Capital', 'MOD004', 'Share capital transactions', true),
('General Ledger', 'MOD005', 'General accounting ledger', true)
ON CONFLICT (code) DO NOTHING;

-- 3. Insert Schemes
-- ============================================================================
INSERT INTO public.schemes (module_id, name, code, description, is_active)
SELECT m.id, 'Basic Member Scheme', 'SCH001', 'Standard membership scheme', true
FROM public.modules m WHERE m.code = 'MOD001'
UNION ALL
SELECT m.id, 'Premium Member Scheme', 'SCH002', 'Premium membership scheme', true
FROM public.modules m WHERE m.code = 'MOD001'
UNION ALL
SELECT m.id, 'Savings Deposit', 'SCH003', 'Savings deposit account', true
FROM public.modules m WHERE m.code = 'MOD002'
UNION ALL
SELECT m.id, 'Fixed Deposit', 'SCH004', 'Fixed deposit account', true
FROM public.modules m WHERE m.code = 'MOD002'
UNION ALL
SELECT m.id, 'Personal Loan', 'SCH005', 'Personal loan scheme', true
FROM public.modules m WHERE m.code = 'MOD003'
UNION ALL
SELECT m.id, 'Business Loan', 'SCH006', 'Business loan scheme', true
FROM public.modules m WHERE m.code = 'MOD003'
ON CONFLICT (module_id, code) DO NOTHING;

-- 4. Insert Column Mappings for Members Module
-- ============================================================================
INSERT INTO public.column_mappings (scheme_id, excel_column, database_column, data_type, is_required)
SELECT s.id, 'Member ID', 'member_id', 'string', true
FROM public.schemes s WHERE s.code = 'SCH001'
UNION ALL
SELECT s.id, 'Member Name', 'member_name', 'string', true
FROM public.schemes s WHERE s.code = 'SCH001'
UNION ALL
SELECT s.id, 'Email', 'email', 'string', false
FROM public.schemes s WHERE s.code = 'SCH001'
UNION ALL
SELECT s.id, 'Phone', 'phone', 'string', true
FROM public.schemes s WHERE s.code = 'SCH001'
UNION ALL
SELECT s.id, 'Address', 'address', 'string', false
FROM public.schemes s WHERE s.code = 'SCH001'
UNION ALL
SELECT s.id, 'Joining Date', 'joining_date', 'date', true
FROM public.schemes s WHERE s.code = 'SCH001'
ON CONFLICT (scheme_id, excel_column) DO NOTHING;

-- 5. Insert Column Mappings for Deposits Module
-- ============================================================================
INSERT INTO public.column_mappings (scheme_id, excel_column, database_column, data_type, is_required)
SELECT s.id, 'Account Number', 'account_number', 'string', true
FROM public.schemes s WHERE s.code = 'SCH003'
UNION ALL
SELECT s.id, 'Member ID', 'member_id', 'string', true
FROM public.schemes s WHERE s.code = 'SCH003'
UNION ALL
SELECT s.id, 'Balance', 'balance', 'number', true
FROM public.schemes s WHERE s.code = 'SCH003'
UNION ALL
SELECT s.id, 'Opening Date', 'opening_date', 'date', true
FROM public.schemes s WHERE s.code = 'SCH003'
UNION ALL
SELECT s.id, 'Interest Rate', 'interest_rate', 'number', false
FROM public.schemes s WHERE s.code = 'SCH003'
ON CONFLICT (scheme_id, excel_column) DO NOTHING;

-- 6. Insert Column Mappings for Loans Module
-- ============================================================================
INSERT INTO public.column_mappings (scheme_id, excel_column, database_column, data_type, is_required)
SELECT s.id, 'Loan ID', 'loan_id', 'string', true
FROM public.schemes s WHERE s.code = 'SCH005'
UNION ALL
SELECT s.id, 'Member ID', 'member_id', 'string', true
FROM public.schemes s WHERE s.code = 'SCH005'
UNION ALL
SELECT s.id, 'Loan Amount', 'loan_amount', 'number', true
FROM public.schemes s WHERE s.code = 'SCH005'
UNION ALL
SELECT s.id, 'Disbursement Date', 'disbursement_date', 'date', true
FROM public.schemes s WHERE s.code = 'SCH005'
UNION ALL
SELECT s.id, 'Interest Rate', 'interest_rate', 'number', true
FROM public.schemes s WHERE s.code = 'SCH005'
ON CONFLICT (scheme_id, excel_column) DO NOTHING;

-- 7. Insert Validation Rules for Members
-- ============================================================================
INSERT INTO public.validation_rules (scheme_id, column_name, rule_type, rule_value, error_message)
SELECT s.id, 'Member ID', 'required', null, 'Member ID is required'
FROM public.schemes s WHERE s.code = 'SCH001'
UNION ALL
SELECT s.id, 'Member Name', 'required', null, 'Member Name is required'
FROM public.schemes s WHERE s.code = 'SCH001'
UNION ALL
SELECT s.id, 'Phone', 'regex', '^[0-9]{10}$', 'Phone must be 10 digits'
FROM public.schemes s WHERE s.code = 'SCH001'
UNION ALL
SELECT s.id, 'Email', 'regex', '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', 'Invalid email format'
FROM public.schemes s WHERE s.code = 'SCH001'
ON CONFLICT (scheme_id, column_name, rule_type) DO NOTHING;

-- 8. Insert Validation Rules for Deposits
-- ============================================================================
INSERT INTO public.validation_rules (scheme_id, column_name, rule_type, rule_value, error_message)
SELECT s.id, 'Account Number', 'required', null, 'Account Number is required'
FROM public.schemes s WHERE s.code = 'SCH003'
UNION ALL
SELECT s.id, 'Balance', 'min', '0', 'Balance cannot be negative'
FROM public.schemes s WHERE s.code = 'SCH003'
UNION ALL
SELECT s.id, 'Balance', 'max', '10000000', 'Balance cannot exceed 1 crore'
FROM public.schemes s WHERE s.code = 'SCH003'
UNION ALL
SELECT s.id, 'Interest Rate', 'min', '0', 'Interest Rate cannot be negative'
FROM public.schemes s WHERE s.code = 'SCH003'
UNION ALL
SELECT s.id, 'Interest Rate', 'max', '15', 'Interest Rate cannot exceed 15%'
FROM public.schemes s WHERE s.code = 'SCH003'
ON CONFLICT (scheme_id, column_name, rule_type) DO NOTHING;

-- 9. Insert Validation Rules for Loans
-- ============================================================================
INSERT INTO public.validation_rules (scheme_id, column_name, rule_type, rule_value, error_message)
SELECT s.id, 'Loan ID', 'required', null, 'Loan ID is required'
FROM public.schemes s WHERE s.code = 'SCH005'
UNION ALL
SELECT s.id, 'Member ID', 'required', null, 'Member ID is required'
FROM public.schemes s WHERE s.code = 'SCH005'
UNION ALL
SELECT s.id, 'Loan Amount', 'min', '1000', 'Loan Amount must be at least 1000'
FROM public.schemes s WHERE s.code = 'SCH005'
UNION ALL
SELECT s.id, 'Loan Amount', 'max', '5000000', 'Loan Amount cannot exceed 50 lakhs'
FROM public.schemes s WHERE s.code = 'SCH005'
UNION ALL
SELECT s.id, 'Interest Rate', 'min', '0', 'Interest Rate cannot be negative'
FROM public.schemes s WHERE s.code = 'SCH005'
UNION ALL
SELECT s.id, 'Interest Rate', 'max', '20', 'Interest Rate cannot exceed 20%'
FROM public.schemes s WHERE s.code = 'SCH005'
ON CONFLICT (scheme_id, column_name, rule_type) DO NOTHING;
