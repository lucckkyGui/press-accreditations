-- ============================================================
-- Compatibility patch:
-- Some legacy security migrations expect public.profiles.role.
-- Later migrations introduce public.user_roles, but this column
-- is still needed for older is_admin() migration to compile.
-- ============================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'guest';

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('admin', 'organizer', 'moderator', 'staff', 'guest', 'user'))
NOT VALID;

UPDATE public.profiles
SET role = 'guest'
WHERE role IS NULL;

