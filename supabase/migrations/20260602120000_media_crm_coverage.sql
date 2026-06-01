-- PressOps — Media CRM + Coverage collection (Tydzień 6).
--
-- Model danych:
--   media_outlets          — media (redakcje) z deduplikacją po znormalizowanej nazwie/domenie
--   media_contacts         — osoby (dziennikarze) z deduplikacją po e-mailu, per organizer
--   media_contact_outlets  — relacja N:M kontakt↔medium
--   coverage_requests      — prośba o coverage per check-in (secure token + status)
--   coverage_items         — dostarczone publikacje (linki, zasięg, sponsor mentions)
--
-- Wszystko event/organizer-scoped, RLS = organizator/admin. Coverage form działa
-- publicznie przez edge function (service role) po tokenie — RLS NIE otwiera anon.
--
-- Migracja idempotentna.

-- ─────────────────────────────────────────────────────────────
-- 1. media_outlets
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.media_outlets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  normalized_name text NOT NULL,
  domain text,
  media_type text,
  website_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Deduplikacja medium: jeden organizer + znormalizowana nazwa.
CREATE UNIQUE INDEX IF NOT EXISTS uq_media_outlets_org_normname
  ON public.media_outlets(organizer_id, normalized_name);
-- Dodatkowo unikat po domenie (gdy podana).
CREATE UNIQUE INDEX IF NOT EXISTS uq_media_outlets_org_domain
  ON public.media_outlets(organizer_id, domain) WHERE domain IS NOT NULL AND domain <> '';

ALTER TABLE public.media_outlets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Block anon media_outlets" ON public.media_outlets;
DROP POLICY IF EXISTS "Organizers manage media_outlets" ON public.media_outlets;
CREATE POLICY "Block anon media_outlets" ON public.media_outlets FOR SELECT TO anon USING (false);
CREATE POLICY "Organizers manage media_outlets" ON public.media_outlets FOR ALL TO authenticated
  USING (organizer_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (organizer_id = auth.uid() OR public.is_admin(auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- 2. media_contacts
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.media_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  phone text,
  role text,
  primary_outlet_id uuid REFERENCES public.media_outlets(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  quality_rating integer,
  pr_notes text,
  -- Zliczenia (aktualizowane przy approve/check-in/coverage)
  events_count integer NOT NULL DEFAULT 0,
  submissions_count integer NOT NULL DEFAULT 0,
  approved_count integer NOT NULL DEFAULT 0,
  checked_in_count integer NOT NULL DEFAULT 0,
  coverage_count integer NOT NULL DEFAULT 0,
  no_show_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.media_contacts
  DROP CONSTRAINT IF EXISTS media_contacts_quality_rating_range;
ALTER TABLE public.media_contacts
  ADD CONSTRAINT media_contacts_quality_rating_range
  CHECK (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5));

-- Deduplikacja kontaktu: jeden organizer + e-mail (case-insensitive).
CREATE UNIQUE INDEX IF NOT EXISTS uq_media_contacts_org_email
  ON public.media_contacts(organizer_id, lower(email));

ALTER TABLE public.media_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Block anon media_contacts" ON public.media_contacts;
DROP POLICY IF EXISTS "Organizers manage media_contacts" ON public.media_contacts;
CREATE POLICY "Block anon media_contacts" ON public.media_contacts FOR SELECT TO anon USING (false);
CREATE POLICY "Organizers manage media_contacts" ON public.media_contacts FOR ALL TO authenticated
  USING (organizer_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (organizer_id = auth.uid() OR public.is_admin(auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- 3. media_contact_outlets (N:M)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.media_contact_outlets (
  contact_id uuid NOT NULL REFERENCES public.media_contacts(id) ON DELETE CASCADE,
  outlet_id uuid NOT NULL REFERENCES public.media_outlets(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, outlet_id)
);

ALTER TABLE public.media_contact_outlets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Block anon contact_outlets" ON public.media_contact_outlets;
DROP POLICY IF EXISTS "Organizers manage contact_outlets" ON public.media_contact_outlets;
CREATE POLICY "Block anon contact_outlets" ON public.media_contact_outlets FOR SELECT TO anon USING (false);
CREATE POLICY "Organizers manage contact_outlets" ON public.media_contact_outlets FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.media_contacts c WHERE c.id = contact_id AND (c.organizer_id = auth.uid() OR public.is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.media_contacts c WHERE c.id = contact_id AND (c.organizer_id = auth.uid() OR public.is_admin(auth.uid()))));

-- ─────────────────────────────────────────────────────────────
-- 4. coverage_requests — prośba o coverage (per check-in), secure token
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coverage_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  organizer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.media_contacts(id) ON DELETE SET NULL,
  submission_id uuid REFERENCES public.landing_page_submissions(id) ON DELETE SET NULL,
  guest_id uuid REFERENCES public.guests(id) ON DELETE SET NULL,
  email text NOT NULL,
  first_name text,
  last_name text,
  media_name text,
  status text NOT NULL DEFAULT 'coverage_pending'
    CHECK (status IN ('coverage_pending', 'coverage_submitted', 'coverage_verified', 'coverage_missing')),
  token text NOT NULL UNIQUE,
  token_expires_at timestamptz,
  reminders_sent jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_reminder_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coverage_requests_event_status
  ON public.coverage_requests(event_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coverage_requests_token
  ON public.coverage_requests(token);

ALTER TABLE public.coverage_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Block anon coverage_requests" ON public.coverage_requests;
DROP POLICY IF EXISTS "Organizers manage coverage_requests" ON public.coverage_requests;
CREATE POLICY "Block anon coverage_requests" ON public.coverage_requests FOR SELECT TO anon USING (false);
CREATE POLICY "Organizers manage coverage_requests" ON public.coverage_requests FOR ALL TO authenticated
  USING (organizer_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (organizer_id = auth.uid() OR public.is_admin(auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- 5. coverage_items — dostarczone publikacje
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coverage_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coverage_request_id uuid NOT NULL REFERENCES public.coverage_requests(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  article_url text,
  gallery_url text,
  video_url text,
  social_post_url text,
  publication_date date,
  estimated_reach integer,
  sponsor_mentions integer,
  publication_type text,
  notes text,
  submitted_by text,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coverage_items_request
  ON public.coverage_items(coverage_request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coverage_items_event
  ON public.coverage_items(event_id, created_at DESC);

ALTER TABLE public.coverage_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Block anon coverage_items" ON public.coverage_items;
DROP POLICY IF EXISTS "Organizers manage coverage_items" ON public.coverage_items;
CREATE POLICY "Block anon coverage_items" ON public.coverage_items FOR SELECT TO anon USING (false);
CREATE POLICY "Organizers manage coverage_items" ON public.coverage_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.coverage_requests r WHERE r.id = coverage_request_id AND (r.organizer_id = auth.uid() OR public.is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.coverage_requests r WHERE r.id = coverage_request_id AND (r.organizer_id = auth.uid() OR public.is_admin(auth.uid()))));

-- ─────────────────────────────────────────────────────────────
-- 6. updated_at triggers
-- ─────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_media_outlets_updated_at ON public.media_outlets;
CREATE TRIGGER trg_media_outlets_updated_at BEFORE UPDATE ON public.media_outlets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_media_contacts_updated_at ON public.media_contacts;
CREATE TRIGGER trg_media_contacts_updated_at BEFORE UPDATE ON public.media_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_coverage_requests_updated_at ON public.coverage_requests;
CREATE TRIGGER trg_coverage_requests_updated_at BEFORE UPDATE ON public.coverage_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_coverage_items_updated_at ON public.coverage_items;
CREATE TRIGGER trg_coverage_items_updated_at BEFORE UPDATE ON public.coverage_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
