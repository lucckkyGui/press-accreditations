-- ============================================================
-- Compatibility patch before performance indexes.
-- Later migrations and QR check-in expect public.guests.zones.
-- ============================================================

ALTER TABLE public.guests
ADD COLUMN IF NOT EXISTS zones text[] NOT NULL DEFAULT ARRAY[]::text[];

-- Backfill from legacy single zone column when present.
UPDATE public.guests
SET zones = ARRAY[zone]
WHERE zones = ARRAY[]::text[]
  AND zone IS NOT NULL
  AND length(trim(zone)) > 0;
