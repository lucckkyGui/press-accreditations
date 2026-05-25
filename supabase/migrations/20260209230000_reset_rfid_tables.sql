-- ============================================================
-- Compatibility patch before RFID migration.
-- The base schema created a generic access_logs table, but
-- 20260209233701 creates RFID-specific access_logs.
-- Since this is a fresh Supabase project, it is safe to drop
-- these tables before the RFID migration recreates them.
-- ============================================================

DROP TABLE IF EXISTS public.zone_presence CASCADE;
DROP TABLE IF EXISTS public.access_logs CASCADE;
DROP TABLE IF EXISTS public.wristbands CASCADE;
