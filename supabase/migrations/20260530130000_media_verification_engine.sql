-- PressOps — Media Verification Engine (Tydzień 3).
-- Dodaje scoring / ryzyko / flagi do zgłoszeń medialnych oraz historię decyzji
-- i zmian scoringu. Migracja idempotentna.
--
-- Zasada produktowa: system SUGERUJE i FLAGUJE — NIE podejmuje automatycznej
-- decyzji approve/reject. Kolumna `status` (pending/approved/...) pozostaje
-- decyzją człowieka; kolumny verification_* to wyłącznie podpowiedź.

-- ─────────────────────────────────────────────────────────────
-- 1. Kolumny scoringu na landing_page_submissions
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.landing_page_submissions
  ADD COLUMN IF NOT EXISTS verification_score integer,
  ADD COLUMN IF NOT EXISTS verification_risk_level text,
  ADD COLUMN IF NOT EXISTS verification_status text,
  ADD COLUMN IF NOT EXISTS verification_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS verification_explanation text,
  ADD COLUMN IF NOT EXISTS verification_overridden_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verification_overridden_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_notes text;

-- Wynik 0–100
ALTER TABLE public.landing_page_submissions
  DROP CONSTRAINT IF EXISTS landing_submissions_verification_score_range;
ALTER TABLE public.landing_page_submissions
  ADD CONSTRAINT landing_submissions_verification_score_range
  CHECK (verification_score IS NULL OR (verification_score >= 0 AND verification_score <= 100));

-- Poziom ryzyka
ALTER TABLE public.landing_page_submissions
  DROP CONSTRAINT IF EXISTS landing_submissions_verification_risk_level;
ALTER TABLE public.landing_page_submissions
  ADD CONSTRAINT landing_submissions_verification_risk_level
  CHECK (verification_risk_level IS NULL OR verification_risk_level IN ('low', 'medium', 'high'));

-- Pasek jakości (band). „needs_review" / „weak" oznaczają wynik < 60.
ALTER TABLE public.landing_page_submissions
  DROP CONSTRAINT IF EXISTS landing_submissions_verification_status;
ALTER TABLE public.landing_page_submissions
  ADD CONSTRAINT landing_submissions_verification_status
  CHECK (verification_status IS NULL OR verification_status IN ('strong', 'acceptable', 'needs_review', 'weak'));

-- Szybki filtr listy weryfikacyjnej po evencie / ryzyku
CREATE INDEX IF NOT EXISTS idx_landing_submissions_event_risk
  ON public.landing_page_submissions(event_id, verification_risk_level, verification_score DESC);

-- ─────────────────────────────────────────────────────────────
-- 2. submission_verification_events — historia decyzji i scoringu
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.submission_verification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.landing_page_submissions(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  event_type text NOT NULL
    CHECK (event_type IN ('scored', 'rescored', 'override', 'note', 'decision')),
  from_status text,
  to_status text,
  from_score integer,
  to_score integer,
  from_risk text,
  to_risk text,
  note text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submission_verification_events_submission
  ON public.submission_verification_events(submission_id, created_at DESC);

ALTER TABLE public.submission_verification_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block anon access to verification events" ON public.submission_verification_events;
DROP POLICY IF EXISTS "Organizers view verification events" ON public.submission_verification_events;
DROP POLICY IF EXISTS "Organizers insert verification events" ON public.submission_verification_events;

-- Anon nie ma dostępu do historii weryfikacji
CREATE POLICY "Block anon access to verification events"
ON public.submission_verification_events FOR SELECT TO anon
USING (false);

-- Organizator wydarzenia (lub admin) widzi historię swoich zgłoszeń
CREATE POLICY "Organizers view verification events"
ON public.submission_verification_events FOR SELECT TO authenticated
USING (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()));

-- Organizator/admin dopisuje wpisy historii (override, notatka, decyzja)
CREATE POLICY "Organizers insert verification events"
ON public.submission_verification_events FOR INSERT TO authenticated
WITH CHECK (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()));
