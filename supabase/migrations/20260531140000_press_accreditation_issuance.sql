-- PressOps — Wydawanie QR pass przy zatwierdzeniu (Tydzień 4).
--
-- Domyka krok workflow: verification → approval → ACCREDITATION / QR PASS → check-in.
-- Po ręcznym zatwierdzeniu zgłoszenia medialnego system wydaje przepustkę:
--   1) wpis w `guests` z kodem QR  → to JEST encja, którą skanuje istniejący
--      check-in (`process_qr_check_in` + tryb offline szukają po `guests.qr_code`),
--   2) wpis w `accreditations`     → formalny rekord przepustki / badge (best-effort).
--
-- Ta migracja dodaje wyłącznie pola śledzące wydaną przepustkę na zgłoszeniu oraz
-- rozszerza dozwolone typy zdarzeń w historii weryfikacji. Idempotentna.
--
-- Zasada produktowa bez zmian: scoring SUGERUJE, decyzję approve/reject podejmuje
-- człowiek. Pass wydawany jest dopiero PO zatwierdzeniu (status = 'approved').

-- ─────────────────────────────────────────────────────────────
-- 1. Pola śledzące wydaną przepustkę na zgłoszeniu medialnym
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.landing_page_submissions
  ADD COLUMN IF NOT EXISTS guest_id uuid REFERENCES public.guests(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS accreditation_id uuid REFERENCES public.accreditations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pass_qr_code text,
  ADD COLUMN IF NOT EXISTS pass_issued_at timestamptz;

-- Szybkie wyszukanie zgłoszenia po wydanym passie (np. z poziomu check-inu)
CREATE INDEX IF NOT EXISTS idx_landing_submissions_pass_qr
  ON public.landing_page_submissions(pass_qr_code)
  WHERE pass_qr_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_landing_submissions_guest
  ON public.landing_page_submissions(guest_id)
  WHERE guest_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 2. Historia weryfikacji — nowy typ zdarzenia 'pass_issued'
--    (constraint inline z 20260530130000 ma domyślną nazwę *_event_type_check)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.submission_verification_events
  DROP CONSTRAINT IF EXISTS submission_verification_events_event_type_check;
ALTER TABLE public.submission_verification_events
  ADD CONSTRAINT submission_verification_events_event_type_check
  CHECK (event_type IN ('scored', 'rescored', 'override', 'note', 'decision', 'pass_issued'));
