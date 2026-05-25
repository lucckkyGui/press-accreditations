-- ============================================================
-- BASE APPLICATION SCHEMA
-- Required before later feature/security migrations.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  organization_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------
-- events
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  category TEXT,
  image_url TEXT,
  max_guests INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Initial policies are permissive enough for setup.
-- Later migrations will replace/tighten them.
DROP POLICY IF EXISTS "Published events are publicly visible" ON public.events;
CREATE POLICY "Published events are publicly visible"
ON public.events
FOR SELECT
USING (is_published = true);

DROP POLICY IF EXISTS "Organizers can manage own events" ON public.events;
CREATE POLICY "Organizers can manage own events"
ON public.events
FOR ALL
TO authenticated
USING (organizer_id = auth.uid())
WITH CHECK (organizer_id = auth.uid());

-- ------------------------------------------------------------
-- guests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'invited',
  ticket_type TEXT DEFAULT 'uczestnik',
  zone TEXT,
  qr_code TEXT,
  checked_in_at TIMESTAMPTZ,
  email_status TEXT DEFAULT 'unknown',
  custom_fields JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_guests_event_id ON public.guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_email ON public.guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_qr_code ON public.guests(qr_code);

-- ------------------------------------------------------------
-- accreditation_types
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accreditation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  requirements JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.accreditation_types ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- accreditation_requests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accreditation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accreditation_type_id UUID REFERENCES public.accreditation_types(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  company TEXT,
  position TEXT,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.accreditation_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_accreditation_requests_event_id ON public.accreditation_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_accreditation_requests_user_id ON public.accreditation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_accreditation_requests_status ON public.accreditation_requests(status);

-- ------------------------------------------------------------
-- invitation_templates
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invitation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.invitation_templates ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- invitations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.invitation_templates(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_invitations_event_id ON public.invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_invitations_guest_id ON public.invitations(guest_id);

-- ------------------------------------------------------------
-- media_registrations
-- Needed by later storage policies for media_documents bucket.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  media_organization TEXT,
  job_title TEXT,
  media_type TEXT,
  website TEXT,
  social_media JSONB DEFAULT '{}'::jsonb,
  coverage_plan TEXT,
  status TEXT DEFAULT 'pending',
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.media_registrations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_media_registrations_event_id ON public.media_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_media_registrations_user_id ON public.media_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_media_registrations_status ON public.media_registrations(status);

-- ------------------------------------------------------------
-- media_documents metadata table
-- Storage bucket itself is created in a later migration.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES public.media_registrations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  document_type TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  status TEXT DEFAULT 'pending',
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.media_documents ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_media_documents_registration_id ON public.media_documents(registration_id);
CREATE INDEX IF NOT EXISTS idx_media_documents_user_id ON public.media_documents(user_id);

-- ------------------------------------------------------------
-- api_keys
-- Used by public-api Edge Function.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT,
  permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_event_id ON public.api_keys(event_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);

-- ------------------------------------------------------------
-- access_logs
-- Used by public-api / scanner / reports.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  result TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_access_logs_event_id ON public.access_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_guest_id ON public.access_logs(guest_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.access_logs(created_at DESC);
