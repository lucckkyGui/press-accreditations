-- Ujednolicenie kodów gości: jeden numeryczny 10-cyfrowy qr_code (skan) + UNIQUE.
-- pass_token (landing_page_submissions.pass_qr_code) pozostaje wysokoentropijny — link /pass.
-- Aplikowane przez `supabase db push` (tracked) — bez ręcznego SQL Editora.

-- 1) Generator unikalnego 10-cyfrowego kodu (bez cyfry kontrolnej).
--    SECURITY DEFINER: pre-check `not exists` widzi WSZYSTKIE wiersze mimo RLS.
create or replace function public.generate_guest_qr_code()
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  _code text;
  _tries int := 0;
begin
  loop
    _code := lpad((floor(random() * 1e10))::bigint::text, 10, '0');
    exit when not exists (select 1 from public.guests where qr_code = _code);
    _tries := _tries + 1;
    if _tries > 50 then
      raise exception 'Nie udało się wygenerować unikalnego kodu gościa (% prób)', _tries;
    end if;
  end loop;
  return _code;
end;
$$;

-- 2) Backfill: puste / nie-numeryczne (uuid, PA-token) → numeryczny.
--    Pętla per-row: w jednej transakcji kolejne SELECT-y widzą wcześniej nadane kody
--    (brak kolizji MVCC, w przeciwieństwie do pojedynczego bulk UPDATE).
do $$
declare r record;
begin
  for r in
    select id from public.guests
    where qr_code is null or qr_code !~ '^[0-9]{10}$'
  loop
    update public.guests set qr_code = public.generate_guest_qr_code() where id = r.id;
  end loop;
end $$;

-- 3) Globalny UNIQUE + usunięcie redundantnego indeksu nie-unique.
drop index if exists public.idx_guests_qr_code;
create unique index if not exists uq_guests_qr_code on public.guests (qr_code);

-- 4) Trigger: auto-gen TYLKO gdy qr_code puste (kody podane/importowane przechodzą bez zmian).
create or replace function public.set_guest_qr_code()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.qr_code is null or new.qr_code = '' then
    new.qr_code := public.generate_guest_qr_code();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_guest_qr_code on public.guests;
create trigger trg_set_guest_qr_code
  before insert on public.guests
  for each row execute function public.set_guest_qr_code();

-- 5) Publiczny RPC: pass_token → numeryczny kod + dane do wyświetlenia (PassView).
--    SECURITY DEFINER: odczyt po niezgadywalnym tokenie, omija RLS świadomie.
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
  -- status = status GOŚCIA (revoke ustawia guests.status='revoked') — operacyjny dla ważności passa.
  select g.qr_code, s.first_name, s.last_name, e.title, g.status
  from public.landing_page_submissions s
  join public.guests g on g.id = s.guest_id
  join public.events  e on e.id = s.event_id
  where s.pass_qr_code = _token
  limit 1;
$$;

grant execute on function public.get_pass_by_token(text) to anon, authenticated;
