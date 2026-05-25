ALTER TABLE public.guest_check_in_scans
  ADD COLUMN IF NOT EXISTS client_scan_id uuid,
  ADD COLUMN IF NOT EXISTS scanned_at timestamptz NOT NULL DEFAULT now();

UPDATE public.guest_check_in_scans
SET scanned_at = created_at
WHERE scanned_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'guest_check_in_scans_client_scan_id_key'
      AND conrelid = 'public.guest_check_in_scans'::regclass
  ) THEN
    ALTER TABLE public.guest_check_in_scans
      ADD CONSTRAINT guest_check_in_scans_client_scan_id_key UNIQUE (client_scan_id);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_guest_check_in_scans_guest_success_scanned
  ON public.guest_check_in_scans(guest_id, scanned_at ASC)
  WHERE scan_result = 'success';

DROP FUNCTION IF EXISTS public.process_qr_check_in(text, uuid, jsonb);

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
  _existing_guest public.guests%ROWTYPE;
  _existing_scan public.guest_check_in_scans%ROWTYPE;
  _earliest_success public.guest_check_in_scans%ROWTYPE;
  _event_end timestamptz;
  _checked_in_at timestamptz;
  _scan_result text;
  _message text;
  _qr_hash text := md5(coalesce(_qr_code, ''));
  _qr_payload jsonb;
  _payload_qr_code text;
  _payload_guest_id uuid;
  _payload_event_id uuid;
  _effective_scanned_at timestamptz := coalesce(_scanned_at, now());
BEGIN
  IF _caller_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'unauthorized',
      'message', 'Użytkownik nie jest zalogowany'
    );
  END IF;

  _client_scan_id := coalesce(_client_scan_id, gen_random_uuid());
  PERFORM pg_advisory_xact_lock(hashtext(_client_scan_id::text));

  SELECT *
  INTO _existing_scan
  FROM public.guest_check_in_scans
  WHERE client_scan_id = _client_scan_id;

  IF FOUND THEN
    IF NOT (
      coalesce(public.is_event_organizer(_caller_id, _existing_scan.event_id), false)
      OR coalesce(public.is_admin(_caller_id), false)
    ) THEN
      RETURN jsonb_build_object(
        'success', false,
        'status', 'unauthorized',
        'message', 'Brak uprawnień do odczytu tego skanu'
      );
    END IF;

    IF _existing_scan.guest_id IS NOT NULL THEN
      SELECT *
      INTO _existing_guest
      FROM public.guests
      WHERE id = _existing_scan.guest_id;
    END IF;

    RETURN jsonb_build_object(
      'success', _existing_scan.scan_result = 'success',
      'status', _existing_scan.scan_result,
      'message', coalesce(_existing_scan.message, ''),
      'checkedInAt', CASE WHEN _existing_guest.id IS NOT NULL THEN _existing_guest.checked_in_at ELSE NULL END,
      'scanTime', _existing_scan.scanned_at,
      'scannedAt', _existing_scan.scanned_at,
      'clientScanId', _existing_scan.client_scan_id,
      'guest', CASE WHEN _existing_guest.id IS NOT NULL THEN
        jsonb_build_object(
          'id', _existing_guest.id,
          'firstName', _existing_guest.first_name,
          'lastName', _existing_guest.last_name,
          'email', _existing_guest.email,
          'company', _existing_guest.company,
          'phone', _existing_guest.phone,
          'ticketType', _existing_guest.ticket_type,
          'zones', coalesce(to_jsonb(_existing_guest.zones), '[]'::jsonb),
          'status', _existing_guest.status,
          'qrCode', _existing_guest.qr_code,
          'checkedInAt', _existing_guest.checked_in_at
        )
      ELSE NULL END
    );
  END IF;

  IF NOT (
    coalesce(public.is_event_organizer(_caller_id, _event_id), false)
    OR coalesce(public.is_admin(_caller_id), false)
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'unauthorized',
      'message', 'Brak uprawnień do skanowania tego wydarzenia'
    );
  END IF;

  IF _qr_code IS NULL OR length(trim(_qr_code)) = 0 THEN
    _scan_result := 'invalid';
    _message := 'Kod QR jest pusty';
  ELSE
    BEGIN
      _qr_payload := _qr_code::jsonb;
      _payload_qr_code := nullif(trim(coalesce(_qr_payload->>'qrCode', _qr_payload->>'qr_code')), '');

      IF (_qr_payload->>'guestId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        _payload_guest_id := (_qr_payload->>'guestId')::uuid;
      END IF;

      IF (_qr_payload->>'eventId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        _payload_event_id := (_qr_payload->>'eventId')::uuid;
      END IF;
    EXCEPTION
      WHEN others THEN
        _qr_payload := NULL;
        _payload_qr_code := NULL;
        _payload_guest_id := NULL;
        _payload_event_id := NULL;
    END;

    IF _payload_event_id IS NOT NULL AND _payload_event_id <> _event_id THEN
      _scan_result := 'wrong_event';
      _message := 'Kod QR jest dla innego wydarzenia';
    ELSE
      SELECT *
      INTO _guest
      FROM public.guests
      WHERE qr_code = _qr_code
         OR (_payload_qr_code IS NOT NULL AND qr_code = _payload_qr_code)
         OR (_payload_guest_id IS NOT NULL AND id = _payload_guest_id)
      FOR UPDATE;

      IF NOT FOUND THEN
        _scan_result := 'invalid';
        _message := 'Nie znaleziono gościa z tym kodem QR';
      ELSIF _guest.event_id <> _event_id THEN
        _scan_result := 'wrong_event';
        _message := 'Kod QR jest dla innego wydarzenia';
      ELSE
        SELECT end_date INTO _event_end
        FROM public.events
        WHERE id = _event_id;

        IF _event_end IS NOT NULL AND _event_end < now() THEN
          _scan_result := 'expired';
          _message := 'Wydarzenie już się zakończyło';
        ELSE
          SELECT *
          INTO _earliest_success
          FROM public.guest_check_in_scans
          WHERE guest_id = _guest.id
            AND scan_result = 'success'
          ORDER BY scanned_at ASC, created_at ASC
          LIMIT 1
          FOR UPDATE;

          IF FOUND AND _earliest_success.scanned_at <= _effective_scanned_at THEN
            _scan_result := 'duplicate';
            _message := 'Gość został już wcześniej zarejestrowany';
            _checked_in_at := least(coalesce(_guest.checked_in_at, _earliest_success.scanned_at), _earliest_success.scanned_at);
          ELSIF NOT FOUND AND _guest.checked_in_at IS NOT NULL AND _guest.checked_in_at <= _effective_scanned_at THEN
            _scan_result := 'duplicate';
            _message := 'Gość został już wcześniej zarejestrowany';
            _checked_in_at := _guest.checked_in_at;
          ELSE
            _scan_result := 'success';
            _message := 'Gość został pomyślnie zarejestrowany';
            _checked_in_at := _effective_scanned_at;

            UPDATE public.guest_check_in_scans
            SET scan_result = 'duplicate',
                message = 'Gość został już wcześniej zarejestrowany'
            WHERE guest_id = _guest.id
              AND scan_result = 'success'
              AND scanned_at > _effective_scanned_at;
          END IF;
        END IF;
      END IF;
    END IF;
  END IF;

  INSERT INTO public.guest_check_in_scans (
    guest_id,
    event_id,
    qr_code_hash,
    scan_result,
    scanned_by,
    device_info,
    message,
    client_scan_id,
    scanned_at
  )
  VALUES (
    CASE WHEN _guest.id IS NOT NULL THEN _guest.id ELSE NULL END,
    _event_id,
    _qr_hash,
    _scan_result,
    _caller_id,
    coalesce(_device_info, '{}'::jsonb),
    _message,
    _client_scan_id,
    _effective_scanned_at
  )
  ON CONFLICT (client_scan_id) DO NOTHING;

  IF _guest.id IS NOT NULL AND _scan_result = 'success' THEN
    UPDATE public.guests
    SET checked_in_at = _checked_in_at,
        status = 'checked-in',
        updated_at = _checked_in_at
    WHERE id = _guest.id
    RETURNING * INTO _guest;
  ELSIF _guest.id IS NOT NULL AND _scan_result = 'duplicate' AND _checked_in_at IS NOT NULL AND _guest.checked_in_at IS DISTINCT FROM _checked_in_at THEN
    UPDATE public.guests
    SET checked_in_at = _checked_in_at,
        status = 'checked-in',
        updated_at = greatest(coalesce(updated_at, _checked_in_at), _checked_in_at)
    WHERE id = _guest.id
    RETURNING * INTO _guest;
  END IF;

  RETURN jsonb_build_object(
    'success', _scan_result = 'success',
    'status', _scan_result,
    'message', _message,
    'checkedInAt', CASE WHEN _guest.id IS NOT NULL THEN _guest.checked_in_at ELSE NULL END,
    'scanTime', _effective_scanned_at,
    'scannedAt', _effective_scanned_at,
    'clientScanId', _client_scan_id,
    'guest', CASE WHEN _guest.id IS NOT NULL THEN
      jsonb_build_object(
        'id', _guest.id,
        'firstName', _guest.first_name,
        'lastName', _guest.last_name,
        'email', _guest.email,
        'company', _guest.company,
        'phone', _guest.phone,
        'ticketType', _guest.ticket_type,
        'zones', coalesce(to_jsonb(_guest.zones), '[]'::jsonb),
        'status', _guest.status,
        'qrCode', _guest.qr_code,
        'checkedInAt', _guest.checked_in_at
      )
    ELSE NULL END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_qr_check_in(text, uuid, jsonb, uuid, timestamptz) TO authenticated;
