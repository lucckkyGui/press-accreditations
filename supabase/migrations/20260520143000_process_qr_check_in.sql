CREATE TABLE IF NOT EXISTS public.guest_check_in_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES public.guests(id) ON DELETE SET NULL,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  qr_code_hash text NOT NULL,
  scan_result text NOT NULL CHECK (
    scan_result IN ('success', 'duplicate', 'invalid', 'wrong_event', 'expired', 'unauthorized')
  ),
  scanned_by uuid,
  device_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guest_check_in_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block unauthenticated access to guest check-in scans" ON public.guest_check_in_scans;
DROP POLICY IF EXISTS "Organizers can view guest check-in scans" ON public.guest_check_in_scans;

CREATE POLICY "Block unauthenticated access to guest check-in scans"
ON public.guest_check_in_scans FOR SELECT TO anon USING (false);

CREATE POLICY "Organizers can view guest check-in scans"
ON public.guest_check_in_scans FOR SELECT TO authenticated
USING (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_guest_check_in_scans_event_created
  ON public.guest_check_in_scans(event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_guest_check_in_scans_guest_created
  ON public.guest_check_in_scans(guest_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_guest_check_in_scans_scanned_by_created
  ON public.guest_check_in_scans(scanned_by, created_at DESC);

CREATE OR REPLACE FUNCTION public.process_qr_check_in(
  _qr_code text,
  _event_id uuid,
  _device_info jsonb DEFAULT '{}'::jsonb
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
BEGIN
  IF _caller_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'unauthorized',
      'message', 'Użytkownik nie jest zalogowany'
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

    INSERT INTO public.guest_check_in_scans (
      event_id, qr_code_hash, scan_result, scanned_by, device_info, message
    )
    VALUES (_event_id, _qr_hash, _scan_result, _caller_id, coalesce(_device_info, '{}'::jsonb), _message);

    RETURN jsonb_build_object(
      'success', false,
      'status', _scan_result,
      'message', _message
    );
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

    INSERT INTO public.guest_check_in_scans (
      event_id, qr_code_hash, scan_result, scanned_by, device_info, message
    )
    VALUES (_event_id, _qr_hash, _scan_result, _caller_id, coalesce(_device_info, '{}'::jsonb), _message);

    RETURN jsonb_build_object(
      'success', false,
      'status', _scan_result,
      'message', _message
    );
  END IF;

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

    INSERT INTO public.guest_check_in_scans (
      event_id, qr_code_hash, scan_result, scanned_by, device_info, message
    )
    VALUES (_event_id, _qr_hash, _scan_result, _caller_id, coalesce(_device_info, '{}'::jsonb), _message);

    RETURN jsonb_build_object(
      'success', false,
      'status', _scan_result,
      'message', _message
    );
  END IF;

  IF _guest.event_id <> _event_id THEN
    _scan_result := 'wrong_event';
    _message := 'Kod QR jest dla innego wydarzenia';

    INSERT INTO public.guest_check_in_scans (
      guest_id, event_id, qr_code_hash, scan_result, scanned_by, device_info, message
    )
    VALUES (_guest.id, _event_id, _qr_hash, _scan_result, _caller_id, coalesce(_device_info, '{}'::jsonb), _message);

    RETURN jsonb_build_object(
      'success', false,
      'status', _scan_result,
      'message', _message
    );
  END IF;

  SELECT end_date INTO _event_end
  FROM public.events
  WHERE id = _event_id;

  IF _event_end IS NOT NULL AND _event_end < now() THEN
    _scan_result := 'expired';
    _message := 'Wydarzenie już się zakończyło';

    INSERT INTO public.guest_check_in_scans (
      guest_id, event_id, qr_code_hash, scan_result, scanned_by, device_info, message
    )
    VALUES (_guest.id, _event_id, _qr_hash, _scan_result, _caller_id, coalesce(_device_info, '{}'::jsonb), _message);

    RETURN jsonb_build_object(
      'success', false,
      'status', _scan_result,
      'message', _message,
      'guest', jsonb_build_object(
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
    );
  END IF;

  IF _guest.checked_in_at IS NOT NULL THEN
    _scan_result := 'duplicate';
    _message := 'Gość został już wcześniej zarejestrowany';

    INSERT INTO public.guest_check_in_scans (
      guest_id, event_id, qr_code_hash, scan_result, scanned_by, device_info, message
    )
    VALUES (_guest.id, _event_id, _qr_hash, _scan_result, _caller_id, coalesce(_device_info, '{}'::jsonb), _message);

    RETURN jsonb_build_object(
      'success', false,
      'status', _scan_result,
      'message', _message,
      'checkedInAt', _guest.checked_in_at,
      'guest', jsonb_build_object(
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
    );
  END IF;

  _checked_in_at := now();

  UPDATE public.guests
  SET checked_in_at = _checked_in_at,
      status = 'checked-in',
      updated_at = _checked_in_at
  WHERE id = _guest.id
  RETURNING * INTO _guest;

  _scan_result := 'success';
  _message := 'Gość został pomyślnie zarejestrowany';

  INSERT INTO public.guest_check_in_scans (
    guest_id, event_id, qr_code_hash, scan_result, scanned_by, device_info, message
  )
  VALUES (_guest.id, _event_id, _qr_hash, _scan_result, _caller_id, coalesce(_device_info, '{}'::jsonb), _message);

  RETURN jsonb_build_object(
    'success', true,
    'status', _scan_result,
    'message', _message,
    'checkedInAt', _checked_in_at,
    'scanTime', now(),
    'guest', jsonb_build_object(
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
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_qr_check_in(text, uuid, jsonb) TO authenticated;
