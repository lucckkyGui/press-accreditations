-- ===========================================
-- COMPLETE SECURITY FIX MIGRATION
-- ===========================================

-- 1. CREATE USER ROLES SYSTEM
-- Create enum for roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'organizer', 'staff', 'guest');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is organizer of an event
CREATE OR REPLACE FUNCTION public.is_event_organizer(_user_id UUID, _event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.events
    WHERE id = _event_id
      AND organizer_id = _user_id
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ===========================================
-- 2. FIX EVENTS TABLE - Only published visible publicly
-- ===========================================
DROP POLICY IF EXISTS "Allow read access to all events" ON public.events;
DROP POLICY IF EXISTS "Events are viewable by authenticated users" ON public.events;
DROP POLICY IF EXISTS "Published events are publicly visible" ON public.events;
DROP POLICY IF EXISTS "Organizers can view own events" ON public.events;
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;

CREATE POLICY "Published events are publicly visible"
ON public.events
FOR SELECT
USING (is_published = true);

CREATE POLICY "Organizers can view own events"
ON public.events
FOR SELECT
TO authenticated
USING (organizer_id = auth.uid());

CREATE POLICY "Admins can view all events"
ON public.events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ===========================================
-- 3. FIX ACCREDITATION_TYPES - Restrict to authenticated
-- ===========================================
DROP POLICY IF EXISTS "Anyone can view accreditation types" ON public.accreditation_types;
DROP POLICY IF EXISTS "Authenticated users can view accreditation types" ON public.accreditation_types;

CREATE POLICY "Authenticated users can view accreditation types"
ON public.accreditation_types
FOR SELECT
TO authenticated
USING (true);

-- ===========================================
-- 4. FIX INVITATION_TEMPLATES - Restrict to creators/organizers
-- ===========================================
DROP POLICY IF EXISTS "Authenticated users can view invitation templates" ON public.invitation_templates;
DROP POLICY IF EXISTS "Users can view own or default templates" ON public.invitation_templates;

CREATE POLICY "Users can view own or default templates"
ON public.invitation_templates
FOR SELECT
TO authenticated
USING (created_by = auth.uid() OR is_default = true);

-- ===========================================
-- 5. Update is_admin function to use user_roles table
-- ===========================================
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- ===========================================
-- 6. Update handle_new_user trigger function
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    
    -- Add default guest role to user_roles table
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'guest');
    
    RETURN NEW;
END;
$$;

-- ===========================================
-- 7. Create trigger for new users
-- ===========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();