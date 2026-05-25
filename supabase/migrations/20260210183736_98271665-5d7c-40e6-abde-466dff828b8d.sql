
CREATE OR REPLACE FUNCTION public.process_rfid_scan(
  _rfid_code text,
  _event_id uuid,
  _zone_name text,
  _scanned_by uuid DEFAULT NULL::uuid,
  _device_info text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _wristband record;
  _presence record;
  _result jsonb;
  _guest record;
  _caller_id uuid;
BEGIN
  -- Get caller identity
  _caller_id := auth.uid();

  -- Authorization: only organizer, admin, or staff can scan
  IF _caller_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'action', 'denied',
      'reason', 'Authentication required'
    );
  END IF;

  IF NOT (
    public.is_event_organizer(_caller_id, _event_id)
    OR public.is_admin(_caller_id)
    OR public.has_role(_caller_id, 'staff')
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'action', 'denied',
      'reason', 'Unauthorized - not event organizer, admin, or staff'
    );
  END IF;

  -- Input validation: zone_name
  IF _zone_name !~ '^[A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ _\-]{1,50}$' THEN
    RETURN jsonb_build_object(
      'success', false,
      'action', 'denied',
      'reason', 'Invalid zone name format'
    );
  END IF;

  -- Truncate device_info to prevent log poisoning
  IF _device_info IS NOT NULL AND LENGTH(_device_info) > 200 THEN
    _device_info := SUBSTRING(_device_info, 1, 200);
  END IF;

  -- Override scanned_by with authenticated user to prevent spoofing
  _scanned_by := _caller_id;

  -- Find wristband
  SELECT w.*, g.first_name, g.last_name, g.company, g.zone as guest_zone
  INTO _wristband
  FROM wristbands w
  JOIN guests g ON g.id = w.guest_id
  WHERE w.rfid_code = _rfid_code 
    AND w.event_id = _event_id 
    AND w.is_active = true;

  IF NOT FOUND THEN
    INSERT INTO access_logs (wristband_id, event_id, zone_name, action, denial_reason, scanned_by, device_info)
    SELECT id, event_id, _zone_name, 'denied', 'Nieznana lub nieaktywna opaska', _scanned_by, _device_info
    FROM wristbands WHERE rfid_code = _rfid_code AND event_id = _event_id
    LIMIT 1;

    RETURN jsonb_build_object(
      'success', false,
      'action', 'denied',
      'reason', 'Nieznana lub nieaktywna opaska RFID'
    );
  END IF;

  -- Check current presence in this zone
  SELECT * INTO _presence
  FROM zone_presence
  WHERE wristband_id = _wristband.id
    AND zone_name = _zone_name
    AND is_inside = true;

  IF FOUND THEN
    UPDATE zone_presence 
    SET is_inside = false, exited_at = now()
    WHERE id = _presence.id;

    INSERT INTO access_logs (wristband_id, event_id, zone_name, action, scanned_by, device_info)
    VALUES (_wristband.id, _event_id, _zone_name, 'exit', _scanned_by, _device_info);

    RETURN jsonb_build_object(
      'success', true,
      'action', 'exit',
      'guest_name', _wristband.first_name || ' ' || _wristband.last_name,
      'company', _wristband.company,
      'zone', _zone_name,
      'message', 'Wyjście ze strefy: ' || _zone_name
    );
  ELSE
    INSERT INTO zone_presence (wristband_id, event_id, zone_name, entered_at, is_inside)
    VALUES (_wristband.id, _event_id, _zone_name, now(), true)
    ON CONFLICT (wristband_id, zone_name, is_inside) 
    DO UPDATE SET entered_at = now(), is_inside = true, exited_at = null;

    INSERT INTO access_logs (wristband_id, event_id, zone_name, action, scanned_by, device_info)
    VALUES (_wristband.id, _event_id, _zone_name, 'entry', _scanned_by, _device_info);

    RETURN jsonb_build_object(
      'success', true,
      'action', 'entry',
      'guest_name', _wristband.first_name || ' ' || _wristband.last_name,
      'company', _wristband.company,
      'zone', _zone_name,
      'message', 'Wejście do strefy: ' || _zone_name
    );
  END IF;
END;
$function$;
