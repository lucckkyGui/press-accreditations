
-- Table for RFID wristbands assigned to guests
CREATE TABLE public.wristbands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id uuid NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  rfid_code text NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  deactivated_at timestamptz,
  deactivation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, rfid_code),
  UNIQUE(event_id, guest_id)
);

ALTER TABLE public.wristbands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can manage wristbands for their events"
ON public.wristbands FOR ALL
USING (is_event_organizer(auth.uid(), event_id) OR is_admin(auth.uid()));

-- Table for access logs (every scan entry/exit)
CREATE TABLE public.access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wristband_id uuid NOT NULL REFERENCES public.wristbands(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  zone_name text NOT NULL,
  action text NOT NULL CHECK (action IN ('entry', 'exit', 'denied')),
  denial_reason text,
  scanned_by uuid,
  device_info text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can manage access logs for their events"
ON public.access_logs FOR ALL
USING (is_event_organizer(auth.uid(), event_id) OR is_admin(auth.uid()));

-- Table to track current zone presence (anti-passback state)
CREATE TABLE public.zone_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wristband_id uuid NOT NULL REFERENCES public.wristbands(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  zone_name text NOT NULL,
  entered_at timestamptz NOT NULL DEFAULT now(),
  is_inside boolean NOT NULL DEFAULT true,
  exited_at timestamptz,
  UNIQUE(wristband_id, zone_name, is_inside)
);

ALTER TABLE public.zone_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can manage zone presence for their events"
ON public.zone_presence FOR ALL
USING (is_event_organizer(auth.uid(), event_id) OR is_admin(auth.uid()));

-- Function to process RFID scan with anti-passback logic
CREATE OR REPLACE FUNCTION public.process_rfid_scan(
  _rfid_code text,
  _event_id uuid,
  _zone_name text,
  _scanned_by uuid DEFAULT NULL,
  _device_info text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _wristband record;
  _presence record;
  _result jsonb;
  _guest record;
BEGIN
  -- Find wristband
  SELECT w.*, g.first_name, g.last_name, g.company, g.zone as guest_zone
  INTO _wristband
  FROM wristbands w
  JOIN guests g ON g.id = w.guest_id
  WHERE w.rfid_code = _rfid_code 
    AND w.event_id = _event_id 
    AND w.is_active = true;

  IF NOT FOUND THEN
    -- Log denied scan
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
    -- Guest is INSIDE -> this is an EXIT
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
    -- Guest is OUTSIDE -> this is an ENTRY
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
$$;
