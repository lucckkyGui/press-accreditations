-- Pass token dla GOŚCIA z listy (nie ze zgłoszenia medialnego).
--
-- Goście z listy mają numeryczny `guests.qr_code` (skan, nadawany triggerem), ale
-- nie mieli niezgadywalnego tokenu do publicznego linku /pass — `get_pass_by_token`
-- rozwiązywał token wyłącznie przez `landing_page_submissions.pass_qr_code`.
--
-- Ta migracja:
--   1) dodaje `guests.pass_token` (wysokoentropijny bearer-link /pass) + UNIQUE,
--   2) dodaje `guests.invitation_sent_at` (znacznik realnej wysyłki zaproszenia),
--   3) rozszerza `get_pass_by_token` o gałąź gościa (UNION) — gałąź zgłoszenia 1:1.
-- Aplikowane przez `supabase db push` (tracked) — bez ręcznego SQL Editora. Idempotentna.

-- 1) Nowe kolumny na guests (additive).
alter table public.guests
  add column if not exists pass_token text,
  add column if not exists invitation_sent_at timestamptz;

-- UNIQUE tylko dla nadanych tokenów (partial) — wiele NULL dozwolone.
create unique index if not exists uq_guests_pass_token
  on public.guests (pass_token)
  where pass_token is not null;

-- 2) RPC: token → numeryczny kod + minimalne dane do PassView.
--    Gałąź A (zgłoszenie medialne) przepisana 1:1; gałąź B (gość z listy) dołożona przez UNION.
--    Obie gałęzie zwracają identyczne kolumny w tej samej kolejności.
--    SECURITY DEFINER: odczyt po niezgadywalnym tokenie, świadomie omija RLS.
create or replace function public.get_pass_by_token(_token text)
returns table (
  qr_code text,
  first_name text,
  last_name text,
  event_name text,
  status text
)
language sql
security definer
set search_path to 'public'
as $$
  -- Gałąź A: pass wydany na zgłoszeniu medialnym (bez zmian względem 20260603160000).
  -- status = status GOŚCIA (revoke ustawia guests.status='revoked') — operacyjny dla ważności passa.
  select g.qr_code, s.first_name, s.last_name, e.title, g.status
  from public.landing_page_submissions s
  join public.guests g on g.id = s.guest_id
  join public.events  e on e.id = s.event_id
  where s.pass_qr_code = _token
  union all
  -- Gałąź B: pass gościa z listy (token na guests.pass_token).
  select g.qr_code, g.first_name, g.last_name, e.title, g.status
  from public.guests g
  join public.events e on e.id = g.event_id
  where g.pass_token = _token
  limit 1;
$$;

grant execute on function public.get_pass_by_token(text) to anon, authenticated;
