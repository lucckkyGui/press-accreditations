-- PressOps — publiczny landing akredytacyjny + zgłoszenia medialne.
-- Idempotentna migracja: tworzy tabele jeśli nie istnieją oraz dodaje
-- brakujące kolumny (Tydzień 2 — rozszerzony formularz medialny).

-- ─────────────────────────────────────────────────────────────
-- 1. event_landing_pages — konfiguracja publicznego landingu
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  logo_url text,
  banner_url text,
  primary_color text NOT NULL DEFAULT '#6366f1',
  secondary_color text NOT NULL DEFAULT '#8b5cf6',
  description text,
  terms_text text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  form_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Slug: małe litery, cyfry, myślniki (3-63 znaki, nie na początku/końcu)
ALTER TABLE public.event_landing_pages
  DROP CONSTRAINT IF EXISTS event_landing_pages_slug_format;
ALTER TABLE public.event_landing_pages
  ADD CONSTRAINT event_landing_pages_slug_format
  CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$');

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_landing_pages_event
  ON public.event_landing_pages(event_id);
CREATE INDEX IF NOT EXISTS idx_event_landing_pages_slug_active
  ON public.event_landing_pages(slug) WHERE is_active;

ALTER TABLE public.event_landing_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active landing pages" ON public.event_landing_pages;
DROP POLICY IF EXISTS "Authenticated can view active landing pages" ON public.event_landing_pages;
DROP POLICY IF EXISTS "Organizers manage landing pages" ON public.event_landing_pages;

-- Publiczny odczyt aktywnych landingów (formularz dla mediów)
CREATE POLICY "Public can view active landing pages"
ON public.event_landing_pages FOR SELECT TO anon
USING (is_active = true);

CREATE POLICY "Authenticated can view active landing pages"
ON public.event_landing_pages FOR SELECT TO authenticated
USING (
  is_active = true
  OR public.is_event_organizer(auth.uid(), event_id)
  OR public.is_admin(auth.uid())
);

-- Organizator wydarzenia (lub admin) zarządza swoim landingiem
CREATE POLICY "Organizers manage landing pages"
ON public.event_landing_pages FOR ALL TO authenticated
USING (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()))
WITH CHECK (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- 2. landing_page_submissions — zgłoszenia medialne
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.landing_page_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id uuid NOT NULL REFERENCES public.event_landing_pages(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  media_organization text,
  media_type text,
  job_title text,
  role text,
  social_media text,
  portfolio_url text,
  publication_links text,
  coverage_description text,
  requested_access text,
  previous_accreditation boolean NOT NULL DEFAULT false,
  consent_data_processing boolean NOT NULL DEFAULT false,
  consent_marketing boolean NOT NULL DEFAULT false,
  accreditation_type text,
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Kolumny dodane w Tygodniu 2 (gdyby tabela istniała wcześniej)
ALTER TABLE public.landing_page_submissions ADD COLUMN IF NOT EXISTS media_type text;
ALTER TABLE public.landing_page_submissions ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE public.landing_page_submissions ADD COLUMN IF NOT EXISTS publication_links text;
ALTER TABLE public.landing_page_submissions ADD COLUMN IF NOT EXISTS requested_access text;
ALTER TABLE public.landing_page_submissions ADD COLUMN IF NOT EXISTS consent_data_processing boolean NOT NULL DEFAULT false;
ALTER TABLE public.landing_page_submissions ADD COLUMN IF NOT EXISTS consent_marketing boolean NOT NULL DEFAULT false;
ALTER TABLE public.landing_page_submissions ADD COLUMN IF NOT EXISTS flags jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Twardy unikat: jeden e-mail na jeden landing (anty-duplikat)
CREATE UNIQUE INDEX IF NOT EXISTS uq_landing_submissions_page_email
  ON public.landing_page_submissions(landing_page_id, lower(email));

CREATE INDEX IF NOT EXISTS idx_landing_submissions_event_status_created
  ON public.landing_page_submissions(event_id, status, created_at DESC);

ALTER TABLE public.landing_page_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block anon access to submissions" ON public.landing_page_submissions;
DROP POLICY IF EXISTS "Organizers view submissions" ON public.landing_page_submissions;
DROP POLICY IF EXISTS "Organizers update submissions" ON public.landing_page_submissions;

-- Anon nie może czytać zgłoszeń bezpośrednio (insert idzie przez edge function/service role)
CREATE POLICY "Block anon access to submissions"
ON public.landing_page_submissions FOR SELECT TO anon
USING (false);

CREATE POLICY "Organizers view submissions"
ON public.landing_page_submissions FOR SELECT TO authenticated
USING (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()));

CREATE POLICY "Organizers update submissions"
ON public.landing_page_submissions FOR UPDATE TO authenticated
USING (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()))
WITH CHECK (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- 3. updated_at — automatyczna aktualizacja
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_event_landing_pages_updated_at ON public.event_landing_pages;
CREATE TRIGGER trg_event_landing_pages_updated_at
  BEFORE UPDATE ON public.event_landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_landing_page_submissions_updated_at ON public.landing_page_submissions;
CREATE TRIGGER trg_landing_page_submissions_updated_at
  BEFORE UPDATE ON public.landing_page_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 4. Most do panelu weryfikacji
--    Panel „Akredytacje" czyta z public.accreditation_requests (filtr po event_id).
--    Każde zgłoszenie z landingu mirrorujemy do accreditation_requests, aby
--    organizator widział je w istniejącym workflow weryfikacji/zatwierdzania.
--    Mirror jest best-effort — błąd nigdy nie blokuje zapisu zgłoszenia.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.mirror_landing_submission_to_requests()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _organizer uuid;
  _media_name text;
  _website text;
  _notes text;
BEGIN
  SELECT organizer_id INTO _organizer FROM public.events WHERE id = NEW.event_id;

  -- accreditation_requests.user_id jest NOT NULL — bez organizatora pomijamy mirror.
  IF _organizer IS NULL THEN
    RETURN NEW;
  END IF;

  _media_name := COALESCE(
    NULLIF(NEW.media_organization, ''),
    NULLIF(trim(NEW.first_name || ' ' || NEW.last_name), '')
  );

  _website := COALESCE(
    NULLIF(NEW.portfolio_url, ''),
    NULLIF(split_part(COALESCE(NEW.publication_links, ''), E'\n', 1), '')
  );

  _notes := concat_ws(
    E'\n',
    NULLIF(NEW.coverage_description, ''),
    CASE WHEN COALESCE(NEW.requested_access, '') <> '' THEN 'Dostęp: ' || NEW.requested_access END,
    'Zgłoszenie z landing page' ||
      CASE WHEN COALESCE(NEW.role, '') <> '' THEN ' (' || NEW.role || ')' ELSE '' END
  );

  INSERT INTO public.accreditation_requests (
    event_id, user_id, media_name, media_type, contact_email, contact_phone,
    website_url, request_notes, status, created_at
  ) VALUES (
    NEW.event_id,
    _organizer,
    COALESCE(_media_name, 'Zgłoszenie medialne'),
    COALESCE(NULLIF(NEW.role, ''), NULLIF(NEW.media_type, ''), 'other'),
    NEW.email,
    NULLIF(NEW.phone, ''),
    _website,
    NULLIF(_notes, ''),
    'pending',
    now()
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'mirror_landing_submission_to_requests failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mirror_landing_submission ON public.landing_page_submissions;
CREATE TRIGGER trg_mirror_landing_submission
  AFTER INSERT ON public.landing_page_submissions
  FOR EACH ROW EXECUTE FUNCTION public.mirror_landing_submission_to_requests();
