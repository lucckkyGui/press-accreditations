-- PressOps — Doprodukcyjnienie QR check-in dla akredytacji prasowych (Tydzień 5).
--
-- 1) `revoked` jako ODRĘBNY status check-inu (wcześniej składany do 'unauthorized'),
-- 2) `guests.checked_in_by` — kto dokonał check-inu,
-- 3) RPC process_qr_check_in: zwraca access_level + media, status 'revoked',
--    zapisuje checked_in_by, a powód rewokacji TYLKO do zalogowanego staff/admina.
--
-- Migracja idempotentna. Decyzja człowieka bez zmian; check-in to wyłącznie
-- weryfikacja + zapis obecności.

-- ─────────────────────────────────────────────────────────────
-- 1. guests.checked_in_by
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS checked_in_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────
-- 2. guest_check_in_scans.scan_result — dodaj 'revoked'
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.guest_check_in_scans
  DROP CONSTRAINT IF EXISTS guest_check_in_scans_scan_result_check;
ALTER TABLE public.guest_check_in_scans
  ADD CONSTRAINT guest_check_in_scans_scan_result_check
  CHECK (scan_result IN ('success', 'duplicate', 'invalid', 'wrong_event', 'expired', 'revoked', 'unauthorized'));

-- ─────────────────────────────────────────────────────────────
-- 3. process_qr_check_in (5-arg) — wersja produkcyjna media check-in
-- ─────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.process_qr_check_in(text, uuid, jsonb);
DROP FUNCTION IF EXISTS public.process_qr_check_in(text, uuid, jsonb, uuid, timestamptz);

CREATE OR REPLACE FUNCTION public.process_qr_check_in(
  _qr_code text,
  _event_id uuid,
  _device_info jsonb DEFAULT '{}'::jsonb,
  _client_scan_id uuid DEFAULT NULL,
  _scanned_at timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_id uuid := auth.uid();
  _guest public.guests%ROWTYPE;
  _event_end timestamptz;
  _checked_in_at timestamptz;
  _scan_result text;
  _message text;
  _qr_hash text := md5(coalesce(_qr_code, ''));
  _qr_payload jsonb;
  _payload_qr_code text;
  _payload_guest_id uuid;
  _payload_event_id uuid;
  _info jsonb := coalesce(_device_info, '{}'::jsonb)
    || jsonb_build_object('clientScanId', _client_scan_id, 'scannedAt', _scanned_at);
BEGIN
  IF _caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'status', 'unauthorized', 'message', 'Użytkownik nie jest zalogowany');
  END IF;

  IF NOT (
    coalesce(public.is_event_organizer(_caller_id, _event_id), false)
    OR coalesce(public.is_admin(_caller_id), false)
  ) THEN
    RETURN jsonb_build_object('success', false, 'status', 'unauthorized', 'message', 'Brak uprawnień do skanowania tego wydarzenia');
  END IF;

  IF _qr_code IS NULL OR length(trim(_qr_code)) = 0 THEN
    _scan_result := 'invalid';
    _message := 'Kod QR jest pusty';
    INSERT INTO public.guest_check_in_scans (event_id, qr_code_hash, scan_result, scanned_by, device_info, message)
    VALUES (_event_id, _qr_hash, _scan_result, _caller_id, _info, _message);
    RETURN jsonb_build_object('success', false, 'status', _scan_result, 'message', _message);
  END IF;

  BEGIN
    _qr_payload := _qr_code::jsonb;
    _payload_qr_code := nullif(trim(_qr_payload->>'qrCode'), '');
    IF (_qr_payload->>'guestId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      _payload_guest_id := (_qr_payload->>'guestId')::uuid;
    END IF;
    IF (_qr_payload->>'eventId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      _payload_event_id := (_qr_payload->>'eventId')::uuid;
    END IF;
  EXCEPTION WHEN others THEN
    _qr_payload := NULL; _payload_qr_code := NULL; _payload_guest_id := NULL; _payload_event_id := NULL;
  END;

  IF _payload_event_id IS NOT NULL AND _payload_event_id <> _event_id THEN
    _scan_result := 'wrong_event';
    _message := 'Kod QR jest dla innego wydarzenia';
    INSERT INTO public.guest_check_in_scans (event_id, qr_code_hash, scan_result, scanned_by, device_info, message)
    VALUES (_event_id, _qr_hash, _scan_result, _caller_id, _info, _message);
    RETURN jsonb_build_object('success', false, 'status', _scan_result, 'message', _message);
  END IF;

  SELECT * INTO _guest
  FROM public.guests
  WHERE qr_code = _qr_code
     OR (_payload_qr_code IS NOT NULL AND qr_code = _payload_qr_code)
     OR (_payload_guest_id IS NOT NULL AND id = _payload_guest_id)
  FOR UPDATE;

  IF NOT FOUND THEN
    _scan_result := 'invalid';
    _message := 'Nie znaleziono akredytacji z tym kodem QR';
    INSERT INTO public.guest_check_in_scans (event_id, qr_code_hash, scan_result, scanned_by, device_info, message)
    VALUES (_event_id, _qr_hash, _scan_result, _caller_id, _info, _message);
    RETURN jsonb_build_object('success', false, 'status', _scan_result, 'message', _message);
  END IF;

  IF _guest.event_id <> _event_id THEN
    _scan_result := 'wrong_event';
    _message := 'Kod QR jest dla innego wydarzenia';
    INSERT INTO public.guest_check_in_scans (guest_id, event_id, qr_code_hash, scan_result, scanned_by, device_info, message)
    VALUES (_guest.id, _event_id, _qr_hash, _scan_result, _caller_id, _info, _message);
    RETURN jsonb_build_object('success', false, 'status', _scan_result, 'message', _message);
  END IF;

  -- ── Cofnięta akredytacja: odrębny status 'revoked'. Powód widoczny dla staff. ──
  IF _guest.status = 'revoked' THEN
    _scan_result := 'revoked';
    _message := COALESCE('Akredytacja cofnięta: ' || NULLIF(_guest.revocation_reason, ''), 'Akredytacja została cofnięta');
    INSERT INTO public.guest_check_in_scans (guest_id, event_id, qr_code_hash, scan_result, scanned_by, device_info, message)
    VALUES (_guest.id, _event_id, _qr_hash, _scan_result, _caller_id, _info, _message);
    RETURN jsonb_build_object(
      'success', false, 'status', _scan_result, 'message', _message,
      'revocationReason', _guest.revocation_reason,
      'guest', jsonb_build_object(
        'id', _guest.id, 'firstName', _guest.first_name, 'lastName', _guest.last_name,
        'email', _guest.email, 'company', _guest.company, 'phone', _guest.phone,
        'ticketType', _guest.ticket_type, 'accessLevel', _guest.access_level,
        'zones', coalesce(to_jsonb(_guest.zones), '[]'::jsonb),
        'status', _guest.status, 'qrCode', _guest.qr_code, 'checkedInAt', _guest.checked_in_at
      )
    );
  END IF;

  SELECT end_date INTO _event_end FROM public.events WHERE id = _event_id;

  IF _event_end IS NOT NULL AND _event_end < now() THEN
    _scan_result := 'expired';
    _message := 'Wydarzenie już się zakończyło';
    INSERT INTO public.guest_check_in_scans (guest_id, event_id, qr_code_hash, scan_result, scanned_by, device_info, message)
    VALUES (_guest.id, _event_id, _qr_hash, _scan_result, _caller_id, _info, _message);
    RETURN jsonb_build_object(
      'success', false, 'status', _scan_result, 'message', _message,
      'guest', jsonb_build_object(
        'id', _guest.id, 'firstName', _guest.first_name, 'lastName', _guest.last_name,
        'email', _guest.email, 'company', _guest.company, 'phone', _guest.phone,
        'ticketType', _guest.ticket_type, 'accessLevel', _guest.access_level,
        'zones', coalesce(to_jsonb(_guest.zones), '[]'::jsonb),
        'status', _guest.status, 'qrCode', _guest.qr_code, 'checkedInAt', _guest.checked_in_at
      )
    );
  END IF;

  -- ── Duplicate: NIE nadpisuje checked_in_at (zachowuje pierwszy timestamp) ──
  IF _guest.checked_in_at IS NOT NULL THEN
    _scan_result := 'duplicate';
    _message := 'Akredytacja była już zeskanowana';
    INSERT INTO public.guest_check_in_scans (guest_id, event_id, qr_code_hash, scan_result, scanned_by, device_info, message)
    VALUES (_guest.id, _event_id, _qr_hash, _scan_result, _caller_id, _info, _message);
    RETURN jsonb_build_object(
      'success', false, 'status', _scan_result, 'message', _message, 'checkedInAt', _guest.checked_in_at,
      'guest', jsonb_build_object(
        'id', _guest.id, 'firstName', _guest.first_name, 'lastName', _guest.last_name,
        'email', _guest.email, 'company', _guest.company, 'phone', _guest.phone,
        'ticketType', _guest.ticket_type, 'accessLevel', _guest.access_level,
        'zones', coalesce(to_jsonb(_guest.zones), '[]'::jsonb),
        'status', _guest.status, 'qrCode', _guest.qr_code, 'checkedInAt', _guest.checked_in_at
      )
    );
  END IF;

  _checked_in_at := coalesce(_scanned_at, now());

  UPDATE public.guests
  SET checked_in_at = _checked_in_at, checked_in_by = _caller_id,
      status = 'checked-in', updated_at = now()
  WHERE id = _guest.id
  RETURNING * INTO _guest;

  _scan_result := 'success';
  _message := 'Akredytacja potwierdzona — wejście dozwolone';
  INSERT INTO public.guest_check_in_scans (guest_id, event_id, qr_code_hash, scan_result, scanned_by, device_info, message)
  VALUES (_guest.id, _event_id, _qr_hash, _scan_result, _caller_id, _info, _message);

  RETURN jsonb_build_object(
    'success', true, 'status', _scan_result, 'message', _message,
    'checkedInAt', _checked_in_at, 'scanTime', now(),
    'guest', jsonb_build_object(
      'id', _guest.id, 'firstName', _guest.first_name, 'lastName', _guest.last_name,
      'email', _guest.email, 'company', _guest.company, 'phone', _guest.phone,
      'ticketType', _guest.ticket_type, 'accessLevel', _guest.access_level,
      'zones', coalesce(to_jsonb(_guest.zones), '[]'::jsonb),
      'status', _guest.status, 'qrCode', _guest.qr_code, 'checkedInAt', _guest.checked_in_at
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_qr_check_in(text, uuid, jsonb, uuid, timestamptz) TO authenticated;
