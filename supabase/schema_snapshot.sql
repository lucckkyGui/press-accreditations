--
-- PostgreSQL database dump
--

\restrict BmGrvvu0YlgsIkfsUJdIauE9Rq5QWKzHQhxJiiaWXdSeykUbMiDm5cmJZe5Vr8z

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'organizer',
    'staff',
    'guest'
);


ALTER TYPE public.app_role OWNER TO postgres;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    
    -- Add default guest role to user_roles table
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'guest');
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


ALTER FUNCTION public.has_role(_user_id uuid, _role public.app_role) OWNER TO postgres;

--
-- Name: is_admin(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_admin(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;


ALTER FUNCTION public.is_admin(_user_id uuid) OWNER TO postgres;

--
-- Name: is_event_organizer(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_event_organizer(_user_id uuid, _event_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.events
    WHERE id = _event_id
      AND organizer_id = _user_id
  )
$$;


ALTER FUNCTION public.is_event_organizer(_user_id uuid, _event_id uuid) OWNER TO postgres;

--
-- Name: mirror_landing_submission_to_requests(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mirror_landing_submission_to_requests() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  _organizer uuid;
  _media_name text;
  _website text;
  _notes text;
BEGIN
  SELECT organizer_id INTO _organizer FROM public.events WHERE id = NEW.event_id;

  -- accreditation_requests.user_id jest NOT NULL — bez organizatora pomijamy mirror.
  IF _organizer IS NULL THEN
    RETURN NEW;
  END IF;

  _media_name := COALESCE(
    NULLIF(NEW.media_organization, ''),
    NULLIF(trim(NEW.first_name || ' ' || NEW.last_name), '')
  );

  _website := COALESCE(
    NULLIF(NEW.portfolio_url, ''),
    NULLIF(split_part(COALESCE(NEW.publication_links, ''), E'\n', 1), '')
  );

  _notes := concat_ws(
    E'\n',
    NULLIF(NEW.coverage_description, ''),
    CASE WHEN COALESCE(NEW.requested_access, '') <> '' THEN 'Dostęp: ' || NEW.requested_access END,
    'Zgłoszenie z landing page' ||
      CASE WHEN COALESCE(NEW.role, '') <> '' THEN ' (' || NEW.role || ')' ELSE '' END
  );

  INSERT INTO public.accreditation_requests (
    event_id, user_id, media_name, media_type, contact_email, contact_phone,
    website_url, request_notes, status, created_at
  ) VALUES (
    NEW.event_id,
    _organizer,
    COALESCE(_media_name, 'Zgłoszenie medialne'),
    COALESCE(NULLIF(NEW.role, ''), NULLIF(NEW.media_type, ''), 'other'),
    NEW.email,
    NULLIF(NEW.phone, ''),
    _website,
    NULLIF(_notes, ''),
    'pending',
    now()
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'mirror_landing_submission_to_requests failed: %', SQLERRM;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.mirror_landing_submission_to_requests() OWNER TO postgres;

--
-- Name: process_qr_check_in(text, uuid, jsonb, uuid, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.process_qr_check_in(_qr_code text, _event_id uuid, _device_info jsonb DEFAULT '{}'::jsonb, _client_scan_id uuid DEFAULT NULL::uuid, _scanned_at timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
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
$_$;


ALTER FUNCTION public.process_qr_check_in(_qr_code text, _event_id uuid, _device_info jsonb, _client_scan_id uuid, _scanned_at timestamp with time zone) OWNER TO postgres;

--
-- Name: process_rfid_scan(text, uuid, text, uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.process_rfid_scan(_rfid_code text, _event_id uuid, _zone_name text, _scanned_by uuid DEFAULT NULL::uuid, _device_info text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
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
$_$;


ALTER FUNCTION public.process_rfid_scan(_rfid_code text, _event_id uuid, _zone_name text, _scanned_by uuid, _device_info text) OWNER TO postgres;

--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION public.rls_auto_enable() OWNER TO postgres;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

--
-- Name: update_conversation_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_conversation_timestamp() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    UPDATE public.chat_conversations 
    SET updated_at = now() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_conversation_timestamp() OWNER TO postgres;

--
-- Name: update_document_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_document_timestamp() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_document_timestamp() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: access_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.access_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wristband_id uuid NOT NULL,
    event_id uuid NOT NULL,
    zone_name text NOT NULL,
    action text NOT NULL,
    denial_reason text,
    scanned_by uuid,
    device_info text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT access_logs_action_check CHECK ((action = ANY (ARRAY['entry'::text, 'exit'::text, 'denied'::text])))
);


ALTER TABLE public.access_logs OWNER TO postgres;

--
-- Name: accreditation_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accreditation_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid,
    accreditation_type_id uuid,
    first_name text,
    last_name text,
    email text,
    company text,
    "position" text,
    phone text,
    message text,
    status text DEFAULT 'pending'::text,
    review_notes text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.accreditation_requests OWNER TO postgres;

--
-- Name: accreditation_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accreditation_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    requirements jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.accreditation_types OWNER TO postgres;

--
-- Name: accreditations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accreditations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid,
    guest_id uuid,
    accreditation_request_id uuid,
    type text,
    status text DEFAULT 'pending'::text NOT NULL,
    issued_at timestamp with time zone,
    expires_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.accreditations OWNER TO postgres;

--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    event_id uuid,
    name text NOT NULL,
    key_hash text NOT NULL,
    key_prefix text,
    permissions jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    expires_at timestamp with time zone,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.api_keys OWNER TO postgres;

--
-- Name: chat_conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    title text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chat_conversations OWNER TO postgres;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chat_messages OWNER TO postgres;

--
-- Name: coverage_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coverage_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    coverage_request_id uuid NOT NULL,
    event_id uuid NOT NULL,
    article_url text,
    gallery_url text,
    video_url text,
    social_post_url text,
    publication_date date,
    estimated_reach integer,
    sponsor_mentions integer,
    publication_type text,
    notes text,
    submitted_by text,
    verified_by uuid,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.coverage_items OWNER TO postgres;

--
-- Name: coverage_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coverage_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    organizer_id uuid NOT NULL,
    contact_id uuid,
    submission_id uuid,
    guest_id uuid,
    email text NOT NULL,
    first_name text,
    last_name text,
    media_name text,
    status text DEFAULT 'coverage_pending'::text NOT NULL,
    token text NOT NULL,
    token_expires_at timestamp with time zone,
    reminders_sent jsonb DEFAULT '[]'::jsonb NOT NULL,
    last_reminder_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT coverage_requests_status_check CHECK ((status = ANY (ARRAY['coverage_pending'::text, 'coverage_submitted'::text, 'coverage_verified'::text, 'coverage_missing'::text])))
);


ALTER TABLE public.coverage_requests OWNER TO postgres;

--
-- Name: document_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.document_comments OWNER TO postgres;

--
-- Name: document_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    file_path text NOT NULL,
    file_name text NOT NULL,
    file_type text NOT NULL,
    file_size integer,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewer_id uuid,
    review_notes text,
    reviewed_at timestamp with time zone,
    version integer DEFAULT 1,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.document_submissions OWNER TO postgres;

--
-- Name: email_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid,
    guest_id uuid,
    user_id uuid,
    recipient_email text NOT NULL,
    recipient_name text,
    subject text NOT NULL,
    body text NOT NULL,
    template_id uuid,
    status text DEFAULT 'pending'::text NOT NULL,
    provider text,
    provider_message_id text,
    error_message text,
    attempts integer DEFAULT 0 NOT NULL,
    scheduled_at timestamp with time zone DEFAULT now(),
    sent_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.email_queue OWNER TO postgres;

--
-- Name: event_landing_pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_landing_pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    slug text NOT NULL,
    logo_url text,
    banner_url text,
    primary_color text DEFAULT '#6366f1'::text NOT NULL,
    secondary_color text DEFAULT '#8b5cf6'::text NOT NULL,
    description text,
    terms_text text,
    social_links jsonb DEFAULT '{}'::jsonb NOT NULL,
    form_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_landing_pages_slug_format CHECK ((slug ~ '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$'::text))
);


ALTER TABLE public.event_landing_pages OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    location text,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    organizer_id uuid,
    is_published boolean DEFAULT false,
    status text DEFAULT 'draft'::text,
    category text,
    image_url text,
    max_guests integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: guest_check_in_scans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guest_check_in_scans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    guest_id uuid,
    event_id uuid NOT NULL,
    qr_code_hash text NOT NULL,
    scan_result text NOT NULL,
    scanned_by uuid,
    device_info jsonb DEFAULT '{}'::jsonb NOT NULL,
    message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT guest_check_in_scans_scan_result_check CHECK ((scan_result = ANY (ARRAY['success'::text, 'duplicate'::text, 'invalid'::text, 'wrong_event'::text, 'expired'::text, 'revoked'::text, 'unauthorized'::text])))
);


ALTER TABLE public.guest_check_in_scans OWNER TO postgres;

--
-- Name: guests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    first_name text,
    last_name text,
    email text NOT NULL,
    phone text,
    company text,
    status text DEFAULT 'invited'::text,
    ticket_type text DEFAULT 'uczestnik'::text,
    zone text,
    qr_code text,
    checked_in_at timestamp with time zone,
    email_status text DEFAULT 'unknown'::text,
    custom_fields jsonb DEFAULT '{}'::jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    zones text[] DEFAULT ARRAY[]::text[] NOT NULL,
    access_level text,
    revoked_at timestamp with time zone,
    revocation_reason text,
    checked_in_by uuid
);


ALTER TABLE public.guests OWNER TO postgres;

--
-- Name: invitation_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invitation_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    subject text,
    content text,
    is_default boolean DEFAULT false,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.invitation_templates OWNER TO postgres;

--
-- Name: invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    guest_id uuid,
    template_id uuid,
    recipient_email text NOT NULL,
    status text DEFAULT 'pending'::text,
    sent_at timestamp with time zone,
    opened_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.invitations OWNER TO postgres;

--
-- Name: landing_page_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.landing_page_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    landing_page_id uuid NOT NULL,
    event_id uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    media_organization text,
    media_type text,
    job_title text,
    role text,
    social_media text,
    portfolio_url text,
    publication_links text,
    coverage_description text,
    requested_access text,
    previous_accreditation boolean DEFAULT false NOT NULL,
    consent_data_processing boolean DEFAULT false NOT NULL,
    consent_marketing boolean DEFAULT false NOT NULL,
    accreditation_type text,
    custom_fields jsonb DEFAULT '{}'::jsonb NOT NULL,
    flags jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    verification_score integer,
    verification_risk_level text,
    verification_status text,
    verification_flags jsonb DEFAULT '[]'::jsonb NOT NULL,
    verification_explanation text,
    verification_overridden_by uuid,
    verification_overridden_at timestamp with time zone,
    verification_notes text,
    guest_id uuid,
    accreditation_id uuid,
    pass_qr_code text,
    pass_issued_at timestamp with time zone,
    access_level text,
    applicant_message text,
    decision_email_status text,
    decision_email_sent_at timestamp with time zone,
    decided_at timestamp with time zone,
    decided_by uuid,
    CONSTRAINT landing_page_submissions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'approved_limited'::text, 'rejected'::text, 'waitlisted'::text, 'expired'::text]))),
    CONSTRAINT landing_submissions_access_level_check CHECK (((access_level IS NULL) OR (access_level = ANY (ARRAY['press'::text, 'photo'::text, 'video'::text, 'radio'::text, 'podcast'::text, 'influencer'::text, 'photo_pit'::text, 'interview'::text, 'backstage_limited'::text, 'sponsor_media'::text])))),
    CONSTRAINT landing_submissions_decision_email_status_check CHECK (((decision_email_status IS NULL) OR (decision_email_status = ANY (ARRAY['sent'::text, 'failed'::text, 'skipped'::text])))),
    CONSTRAINT landing_submissions_verification_risk_level CHECK (((verification_risk_level IS NULL) OR (verification_risk_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])))),
    CONSTRAINT landing_submissions_verification_score_range CHECK (((verification_score IS NULL) OR ((verification_score >= 0) AND (verification_score <= 100)))),
    CONSTRAINT landing_submissions_verification_status CHECK (((verification_status IS NULL) OR (verification_status = ANY (ARRAY['strong'::text, 'acceptable'::text, 'needs_review'::text, 'weak'::text]))))
);


ALTER TABLE public.landing_page_submissions OWNER TO postgres;

--
-- Name: media_contact_outlets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_contact_outlets (
    contact_id uuid NOT NULL,
    outlet_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.media_contact_outlets OWNER TO postgres;

--
-- Name: media_contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organizer_id uuid NOT NULL,
    email text NOT NULL,
    first_name text,
    last_name text,
    phone text,
    role text,
    primary_outlet_id uuid,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    quality_rating integer,
    pr_notes text,
    events_count integer DEFAULT 0 NOT NULL,
    submissions_count integer DEFAULT 0 NOT NULL,
    approved_count integer DEFAULT 0 NOT NULL,
    checked_in_count integer DEFAULT 0 NOT NULL,
    coverage_count integer DEFAULT 0 NOT NULL,
    no_show_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT media_contacts_quality_rating_range CHECK (((quality_rating IS NULL) OR ((quality_rating >= 1) AND (quality_rating <= 5))))
);


ALTER TABLE public.media_contacts OWNER TO postgres;

--
-- Name: media_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    registration_id uuid,
    user_id uuid,
    document_type text,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    file_type text,
    status text DEFAULT 'pending'::text,
    review_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.media_documents OWNER TO postgres;

--
-- Name: media_outlets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_outlets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organizer_id uuid NOT NULL,
    name text NOT NULL,
    normalized_name text NOT NULL,
    domain text,
    media_type text,
    website_url text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.media_outlets OWNER TO postgres;

--
-- Name: media_registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_registrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid,
    media_organization text,
    job_title text,
    media_type text,
    website text,
    social_media jsonb DEFAULT '{}'::jsonb,
    coverage_plan text,
    status text DEFAULT 'pending'::text,
    review_notes text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.media_registrations OWNER TO postgres;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    first_name text,
    last_name text,
    avatar_url text,
    phone text,
    organization_name text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    role text DEFAULT 'guest'::text NOT NULL
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: submission_verification_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.submission_verification_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    submission_id uuid NOT NULL,
    event_id uuid NOT NULL,
    actor_id uuid,
    actor_email text,
    event_type text NOT NULL,
    from_status text,
    to_status text,
    from_score integer,
    to_score integer,
    from_risk text,
    to_risk text,
    note text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT submission_verification_events_event_type_check CHECK ((event_type = ANY (ARRAY['scored'::text, 'rescored'::text, 'override'::text, 'note'::text, 'decision'::text, 'pass_issued'::text, 'pass_revoked'::text, 'email_sent'::text])))
);


ALTER TABLE public.submission_verification_events OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    stripe_customer_id text NOT NULL,
    stripe_subscription_id text NOT NULL,
    product_id text NOT NULL,
    price_id text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean DEFAULT false,
    canceled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    event_id uuid,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    is_read boolean DEFAULT false,
    action_url text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_notifications OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: wristbands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wristbands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    guest_id uuid NOT NULL,
    rfid_code text NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    deactivated_at timestamp with time zone,
    deactivation_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.wristbands OWNER TO postgres;

--
-- Name: zone_presence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.zone_presence (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wristband_id uuid NOT NULL,
    event_id uuid NOT NULL,
    zone_name text NOT NULL,
    entered_at timestamp with time zone DEFAULT now() NOT NULL,
    is_inside boolean DEFAULT true NOT NULL,
    exited_at timestamp with time zone
);


ALTER TABLE public.zone_presence OWNER TO postgres;

--
-- Name: access_logs access_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_logs
    ADD CONSTRAINT access_logs_pkey PRIMARY KEY (id);


--
-- Name: accreditation_requests accreditation_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accreditation_requests
    ADD CONSTRAINT accreditation_requests_pkey PRIMARY KEY (id);


--
-- Name: accreditation_types accreditation_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accreditation_types
    ADD CONSTRAINT accreditation_types_pkey PRIMARY KEY (id);


--
-- Name: accreditations accreditations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accreditations
    ADD CONSTRAINT accreditations_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: chat_conversations chat_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: coverage_items coverage_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coverage_items
    ADD CONSTRAINT coverage_items_pkey PRIMARY KEY (id);


--
-- Name: coverage_requests coverage_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coverage_requests
    ADD CONSTRAINT coverage_requests_pkey PRIMARY KEY (id);


--
-- Name: coverage_requests coverage_requests_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coverage_requests
    ADD CONSTRAINT coverage_requests_token_key UNIQUE (token);


--
-- Name: document_comments document_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_comments
    ADD CONSTRAINT document_comments_pkey PRIMARY KEY (id);


--
-- Name: document_submissions document_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_submissions
    ADD CONSTRAINT document_submissions_pkey PRIMARY KEY (id);


--
-- Name: email_queue email_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_queue
    ADD CONSTRAINT email_queue_pkey PRIMARY KEY (id);


--
-- Name: event_landing_pages event_landing_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_landing_pages
    ADD CONSTRAINT event_landing_pages_pkey PRIMARY KEY (id);


--
-- Name: event_landing_pages event_landing_pages_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_landing_pages
    ADD CONSTRAINT event_landing_pages_slug_key UNIQUE (slug);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: guest_check_in_scans guest_check_in_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_check_in_scans
    ADD CONSTRAINT guest_check_in_scans_pkey PRIMARY KEY (id);


--
-- Name: guests guests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (id);


--
-- Name: invitation_templates invitation_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitation_templates
    ADD CONSTRAINT invitation_templates_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- Name: landing_page_submissions landing_page_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_page_submissions
    ADD CONSTRAINT landing_page_submissions_pkey PRIMARY KEY (id);


--
-- Name: media_contact_outlets media_contact_outlets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_contact_outlets
    ADD CONSTRAINT media_contact_outlets_pkey PRIMARY KEY (contact_id, outlet_id);


--
-- Name: media_contacts media_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_contacts
    ADD CONSTRAINT media_contacts_pkey PRIMARY KEY (id);


--
-- Name: media_documents media_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_documents
    ADD CONSTRAINT media_documents_pkey PRIMARY KEY (id);


--
-- Name: media_outlets media_outlets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_outlets
    ADD CONSTRAINT media_outlets_pkey PRIMARY KEY (id);


--
-- Name: media_registrations media_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_registrations
    ADD CONSTRAINT media_registrations_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_role_check; Type: CHECK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'organizer'::text, 'moderator'::text, 'staff'::text, 'guest'::text, 'user'::text]))) NOT VALID;


--
-- Name: submission_verification_events submission_verification_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_verification_events
    ADD CONSTRAINT submission_verification_events_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_stripe_subscription_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id);


--
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: wristbands wristbands_event_id_guest_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wristbands
    ADD CONSTRAINT wristbands_event_id_guest_id_key UNIQUE (event_id, guest_id);


--
-- Name: wristbands wristbands_event_id_rfid_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wristbands
    ADD CONSTRAINT wristbands_event_id_rfid_code_key UNIQUE (event_id, rfid_code);


--
-- Name: wristbands wristbands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wristbands
    ADD CONSTRAINT wristbands_pkey PRIMARY KEY (id);


--
-- Name: zone_presence zone_presence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zone_presence
    ADD CONSTRAINT zone_presence_pkey PRIMARY KEY (id);


--
-- Name: zone_presence zone_presence_wristband_id_zone_name_is_inside_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zone_presence
    ADD CONSTRAINT zone_presence_wristband_id_zone_name_is_inside_key UNIQUE (wristband_id, zone_name, is_inside);


--
-- Name: idx_access_logs_event_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_access_logs_event_created ON public.access_logs USING btree (event_id, created_at DESC);


--
-- Name: idx_accreditation_requests_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accreditation_requests_event_id ON public.accreditation_requests USING btree (event_id);


--
-- Name: idx_accreditation_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accreditation_requests_status ON public.accreditation_requests USING btree (status);


--
-- Name: idx_accreditation_requests_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accreditation_requests_user_id ON public.accreditation_requests USING btree (user_id);


--
-- Name: idx_accreditations_event_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accreditations_event_user ON public.accreditations USING btree (event_id, user_id);


--
-- Name: idx_api_keys_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_keys_event_id ON public.api_keys USING btree (event_id);


--
-- Name: idx_api_keys_key_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_keys_key_hash ON public.api_keys USING btree (key_hash);


--
-- Name: idx_api_keys_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_api_keys_user_id ON public.api_keys USING btree (user_id);


--
-- Name: idx_chat_conversations_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_conversations_event ON public.chat_conversations USING btree (event_id);


--
-- Name: idx_chat_messages_conversation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_messages_conversation ON public.chat_messages USING btree (conversation_id);


--
-- Name: idx_chat_messages_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at DESC);


--
-- Name: idx_coverage_items_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coverage_items_event ON public.coverage_items USING btree (event_id, created_at DESC);


--
-- Name: idx_coverage_items_request; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coverage_items_request ON public.coverage_items USING btree (coverage_request_id, created_at DESC);


--
-- Name: idx_coverage_requests_event_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coverage_requests_event_status ON public.coverage_requests USING btree (event_id, status, created_at DESC);


--
-- Name: idx_coverage_requests_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coverage_requests_token ON public.coverage_requests USING btree (token);


--
-- Name: idx_document_submissions_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_document_submissions_event ON public.document_submissions USING btree (event_id);


--
-- Name: idx_document_submissions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_document_submissions_status ON public.document_submissions USING btree (status);


--
-- Name: idx_document_submissions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_document_submissions_user ON public.document_submissions USING btree (user_id);


--
-- Name: idx_email_queue_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_queue_event_id ON public.email_queue USING btree (event_id);


--
-- Name: idx_email_queue_guest_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_queue_guest_id ON public.email_queue USING btree (guest_id);


--
-- Name: idx_email_queue_recipient_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_queue_recipient_email ON public.email_queue USING btree (recipient_email);


--
-- Name: idx_email_queue_status_scheduled; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_queue_status_scheduled ON public.email_queue USING btree (status, scheduled_at);


--
-- Name: idx_event_landing_pages_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_event_landing_pages_event ON public.event_landing_pages USING btree (event_id);


--
-- Name: idx_event_landing_pages_slug_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_landing_pages_slug_active ON public.event_landing_pages USING btree (slug) WHERE is_active;


--
-- Name: idx_events_organizer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_organizer_id ON public.events USING btree (organizer_id);


--
-- Name: idx_events_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_status ON public.events USING btree (status);


--
-- Name: idx_guest_check_in_scans_event_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guest_check_in_scans_event_created ON public.guest_check_in_scans USING btree (event_id, created_at DESC);


--
-- Name: idx_guest_check_in_scans_guest_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guest_check_in_scans_guest_created ON public.guest_check_in_scans USING btree (guest_id, created_at DESC);


--
-- Name: idx_guest_check_in_scans_scanned_by_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guest_check_in_scans_scanned_by_created ON public.guest_check_in_scans USING btree (scanned_by, created_at DESC);


--
-- Name: idx_guests_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guests_created_at ON public.guests USING btree (created_at DESC);


--
-- Name: idx_guests_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guests_email ON public.guests USING btree (email);


--
-- Name: idx_guests_email_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guests_email_status ON public.guests USING btree (email_status);


--
-- Name: idx_guests_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guests_event_id ON public.guests USING btree (event_id);


--
-- Name: idx_guests_event_status_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guests_event_status_created ON public.guests USING btree (event_id, status, created_at DESC);


--
-- Name: idx_guests_event_ticket_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guests_event_ticket_type ON public.guests USING btree (event_id, ticket_type);


--
-- Name: idx_guests_qr_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guests_qr_code ON public.guests USING btree (qr_code);


--
-- Name: idx_guests_ticket_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guests_ticket_type ON public.guests USING btree (ticket_type);


--
-- Name: idx_guests_zones_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guests_zones_gin ON public.guests USING gin (zones);


--
-- Name: idx_invitations_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invitations_event_id ON public.invitations USING btree (event_id);


--
-- Name: idx_invitations_guest_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invitations_guest_id ON public.invitations USING btree (guest_id);


--
-- Name: idx_landing_submissions_event_risk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_landing_submissions_event_risk ON public.landing_page_submissions USING btree (event_id, verification_risk_level, verification_score DESC);


--
-- Name: idx_landing_submissions_event_status_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_landing_submissions_event_status_created ON public.landing_page_submissions USING btree (event_id, status, created_at DESC);


--
-- Name: idx_landing_submissions_guest; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_landing_submissions_guest ON public.landing_page_submissions USING btree (guest_id) WHERE (guest_id IS NOT NULL);


--
-- Name: idx_landing_submissions_pass_qr; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_landing_submissions_pass_qr ON public.landing_page_submissions USING btree (pass_qr_code) WHERE (pass_qr_code IS NOT NULL);


--
-- Name: idx_media_documents_registration_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_documents_registration_id ON public.media_documents USING btree (registration_id);


--
-- Name: idx_media_documents_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_documents_user_id ON public.media_documents USING btree (user_id);


--
-- Name: idx_media_registrations_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_registrations_event_id ON public.media_registrations USING btree (event_id);


--
-- Name: idx_media_registrations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_registrations_status ON public.media_registrations USING btree (status);


--
-- Name: idx_media_registrations_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_registrations_user_id ON public.media_registrations USING btree (user_id);


--
-- Name: idx_submission_verification_events_submission; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_submission_verification_events_submission ON public.submission_verification_events USING btree (submission_id, created_at DESC);


--
-- Name: idx_subscriptions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_status ON public.subscriptions USING btree (status);


--
-- Name: idx_subscriptions_stripe_sub_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_stripe_sub_id ON public.subscriptions USING btree (stripe_subscription_id);


--
-- Name: idx_subscriptions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions USING btree (user_id);


--
-- Name: idx_user_notifications_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_notifications_unread ON public.user_notifications USING btree (user_id, is_read) WHERE (is_read = false);


--
-- Name: idx_user_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_notifications_user ON public.user_notifications USING btree (user_id);


--
-- Name: idx_wristbands_rfid_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wristbands_rfid_event ON public.wristbands USING btree (rfid_code, event_id) WHERE (is_active = true);


--
-- Name: idx_zone_presence_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_zone_presence_active ON public.zone_presence USING btree (wristband_id, zone_name) WHERE (is_inside = true);


--
-- Name: uq_landing_submissions_page_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_landing_submissions_page_email ON public.landing_page_submissions USING btree (landing_page_id, lower(email));


--
-- Name: uq_media_contacts_org_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_media_contacts_org_email ON public.media_contacts USING btree (organizer_id, lower(email));


--
-- Name: uq_media_outlets_org_domain; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_media_outlets_org_domain ON public.media_outlets USING btree (organizer_id, domain) WHERE ((domain IS NOT NULL) AND (domain <> ''::text));


--
-- Name: uq_media_outlets_org_normname; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_media_outlets_org_normname ON public.media_outlets USING btree (organizer_id, normalized_name);


--
-- Name: coverage_items trg_coverage_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_coverage_items_updated_at BEFORE UPDATE ON public.coverage_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: coverage_requests trg_coverage_requests_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_coverage_requests_updated_at BEFORE UPDATE ON public.coverage_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: event_landing_pages trg_event_landing_pages_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_event_landing_pages_updated_at BEFORE UPDATE ON public.event_landing_pages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: landing_page_submissions trg_landing_page_submissions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_landing_page_submissions_updated_at BEFORE UPDATE ON public.landing_page_submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: media_contacts trg_media_contacts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_media_contacts_updated_at BEFORE UPDATE ON public.media_contacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: media_outlets trg_media_outlets_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_media_outlets_updated_at BEFORE UPDATE ON public.media_outlets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: landing_page_submissions trg_mirror_landing_submission; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_mirror_landing_submission AFTER INSERT ON public.landing_page_submissions FOR EACH ROW EXECUTE FUNCTION public.mirror_landing_submission_to_requests();


--
-- Name: chat_messages update_conversation_on_message; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_conversation_on_message AFTER INSERT ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();


--
-- Name: document_submissions update_document_submissions_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_document_submissions_timestamp BEFORE UPDATE ON public.document_submissions FOR EACH ROW EXECUTE FUNCTION public.update_document_timestamp();


--
-- Name: access_logs access_logs_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_logs
    ADD CONSTRAINT access_logs_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: access_logs access_logs_wristband_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_logs
    ADD CONSTRAINT access_logs_wristband_id_fkey FOREIGN KEY (wristband_id) REFERENCES public.wristbands(id) ON DELETE CASCADE;


--
-- Name: accreditation_requests accreditation_requests_accreditation_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accreditation_requests
    ADD CONSTRAINT accreditation_requests_accreditation_type_id_fkey FOREIGN KEY (accreditation_type_id) REFERENCES public.accreditation_types(id) ON DELETE SET NULL;


--
-- Name: accreditation_requests accreditation_requests_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accreditation_requests
    ADD CONSTRAINT accreditation_requests_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: accreditation_requests accreditation_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accreditation_requests
    ADD CONSTRAINT accreditation_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: accreditation_requests accreditation_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accreditation_requests
    ADD CONSTRAINT accreditation_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: accreditations accreditations_accreditation_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accreditations
    ADD CONSTRAINT accreditations_accreditation_request_id_fkey FOREIGN KEY (accreditation_request_id) REFERENCES public.accreditation_requests(id) ON DELETE SET NULL;


--
-- Name: accreditations accreditations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accreditations
    ADD CONSTRAINT accreditations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: accreditations accreditations_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accreditations
    ADD CONSTRAINT accreditations_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE SET NULL;


--
-- Name: accreditations accreditations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accreditations
    ADD CONSTRAINT accreditations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: api_keys api_keys_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: chat_conversations chat_conversations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id) ON DELETE CASCADE;


--
-- Name: coverage_items coverage_items_coverage_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coverage_items
    ADD CONSTRAINT coverage_items_coverage_request_id_fkey FOREIGN KEY (coverage_request_id) REFERENCES public.coverage_requests(id) ON DELETE CASCADE;


--
-- Name: coverage_items coverage_items_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coverage_items
    ADD CONSTRAINT coverage_items_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: coverage_items coverage_items_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coverage_items
    ADD CONSTRAINT coverage_items_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: coverage_requests coverage_requests_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coverage_requests
    ADD CONSTRAINT coverage_requests_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.media_contacts(id) ON DELETE SET NULL;


--
-- Name: coverage_requests coverage_requests_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coverage_requests
    ADD CONSTRAINT coverage_requests_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: coverage_requests coverage_requests_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coverage_requests
    ADD CONSTRAINT coverage_requests_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE SET NULL;


--
-- Name: coverage_requests coverage_requests_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coverage_requests
    ADD CONSTRAINT coverage_requests_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: coverage_requests coverage_requests_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coverage_requests
    ADD CONSTRAINT coverage_requests_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.landing_page_submissions(id) ON DELETE SET NULL;


--
-- Name: document_comments document_comments_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_comments
    ADD CONSTRAINT document_comments_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.document_submissions(id) ON DELETE CASCADE;


--
-- Name: document_submissions document_submissions_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_submissions
    ADD CONSTRAINT document_submissions_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: document_submissions document_submissions_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_submissions
    ADD CONSTRAINT document_submissions_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.document_submissions(id);


--
-- Name: email_queue email_queue_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_queue
    ADD CONSTRAINT email_queue_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: email_queue email_queue_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_queue
    ADD CONSTRAINT email_queue_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE SET NULL;


--
-- Name: email_queue email_queue_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_queue
    ADD CONSTRAINT email_queue_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.invitation_templates(id) ON DELETE SET NULL;


--
-- Name: email_queue email_queue_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_queue
    ADD CONSTRAINT email_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: event_landing_pages event_landing_pages_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_landing_pages
    ADD CONSTRAINT event_landing_pages_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: events events_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: guest_check_in_scans guest_check_in_scans_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_check_in_scans
    ADD CONSTRAINT guest_check_in_scans_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: guest_check_in_scans guest_check_in_scans_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_check_in_scans
    ADD CONSTRAINT guest_check_in_scans_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE SET NULL;


--
-- Name: guests guests_checked_in_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_checked_in_by_fkey FOREIGN KEY (checked_in_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: guests guests_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: invitation_templates invitation_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitation_templates
    ADD CONSTRAINT invitation_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: invitations invitations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: invitations invitations_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;


--
-- Name: invitations invitations_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.invitation_templates(id) ON DELETE SET NULL;


--
-- Name: landing_page_submissions landing_page_submissions_accreditation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_page_submissions
    ADD CONSTRAINT landing_page_submissions_accreditation_id_fkey FOREIGN KEY (accreditation_id) REFERENCES public.accreditations(id) ON DELETE SET NULL;


--
-- Name: landing_page_submissions landing_page_submissions_decided_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_page_submissions
    ADD CONSTRAINT landing_page_submissions_decided_by_fkey FOREIGN KEY (decided_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: landing_page_submissions landing_page_submissions_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_page_submissions
    ADD CONSTRAINT landing_page_submissions_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: landing_page_submissions landing_page_submissions_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_page_submissions
    ADD CONSTRAINT landing_page_submissions_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE SET NULL;


--
-- Name: landing_page_submissions landing_page_submissions_landing_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_page_submissions
    ADD CONSTRAINT landing_page_submissions_landing_page_id_fkey FOREIGN KEY (landing_page_id) REFERENCES public.event_landing_pages(id) ON DELETE CASCADE;


--
-- Name: landing_page_submissions landing_page_submissions_verification_overridden_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_page_submissions
    ADD CONSTRAINT landing_page_submissions_verification_overridden_by_fkey FOREIGN KEY (verification_overridden_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: media_contact_outlets media_contact_outlets_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_contact_outlets
    ADD CONSTRAINT media_contact_outlets_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.media_contacts(id) ON DELETE CASCADE;


--
-- Name: media_contact_outlets media_contact_outlets_outlet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_contact_outlets
    ADD CONSTRAINT media_contact_outlets_outlet_id_fkey FOREIGN KEY (outlet_id) REFERENCES public.media_outlets(id) ON DELETE CASCADE;


--
-- Name: media_contacts media_contacts_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_contacts
    ADD CONSTRAINT media_contacts_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: media_contacts media_contacts_primary_outlet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_contacts
    ADD CONSTRAINT media_contacts_primary_outlet_id_fkey FOREIGN KEY (primary_outlet_id) REFERENCES public.media_outlets(id) ON DELETE SET NULL;


--
-- Name: media_documents media_documents_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_documents
    ADD CONSTRAINT media_documents_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.media_registrations(id) ON DELETE CASCADE;


--
-- Name: media_documents media_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_documents
    ADD CONSTRAINT media_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: media_outlets media_outlets_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_outlets
    ADD CONSTRAINT media_outlets_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: media_registrations media_registrations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_registrations
    ADD CONSTRAINT media_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: media_registrations media_registrations_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_registrations
    ADD CONSTRAINT media_registrations_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: media_registrations media_registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_registrations
    ADD CONSTRAINT media_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: submission_verification_events submission_verification_events_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_verification_events
    ADD CONSTRAINT submission_verification_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: submission_verification_events submission_verification_events_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_verification_events
    ADD CONSTRAINT submission_verification_events_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: submission_verification_events submission_verification_events_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_verification_events
    ADD CONSTRAINT submission_verification_events_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.landing_page_submissions(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_notifications user_notifications_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: wristbands wristbands_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wristbands
    ADD CONSTRAINT wristbands_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: wristbands wristbands_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wristbands
    ADD CONSTRAINT wristbands_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;


--
-- Name: zone_presence zone_presence_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zone_presence
    ADD CONSTRAINT zone_presence_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: zone_presence zone_presence_wristband_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zone_presence
    ADD CONSTRAINT zone_presence_wristband_id_fkey FOREIGN KEY (wristband_id) REFERENCES public.wristbands(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can update all profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));


--
-- Name: invitation_templates Admins can update any invitation template; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update any invitation template" ON public.invitation_templates FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));


--
-- Name: events Admins can view all events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all events" ON public.events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));


--
-- Name: subscriptions Admins can view all subscriptions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));


--
-- Name: event_landing_pages Authenticated can view active landing pages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated can view active landing pages" ON public.event_landing_pages FOR SELECT TO authenticated USING (((is_active = true) OR public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: accreditation_requests Authenticated users can create accreditation requests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can create accreditation requests" ON public.accreditation_requests FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: accreditation_types Authenticated users can view accreditation types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view accreditation types" ON public.accreditation_types FOR SELECT TO authenticated USING (true);


--
-- Name: landing_page_submissions Block anon access to submissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block anon access to submissions" ON public.landing_page_submissions FOR SELECT TO anon USING (false);


--
-- Name: submission_verification_events Block anon access to verification events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block anon access to verification events" ON public.submission_verification_events FOR SELECT TO anon USING (false);


--
-- Name: media_contact_outlets Block anon contact_outlets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block anon contact_outlets" ON public.media_contact_outlets FOR SELECT TO anon USING (false);


--
-- Name: coverage_items Block anon coverage_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block anon coverage_items" ON public.coverage_items FOR SELECT TO anon USING (false);


--
-- Name: coverage_requests Block anon coverage_requests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block anon coverage_requests" ON public.coverage_requests FOR SELECT TO anon USING (false);


--
-- Name: media_contacts Block anon media_contacts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block anon media_contacts" ON public.media_contacts FOR SELECT TO anon USING (false);


--
-- Name: media_outlets Block anon media_outlets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block anon media_outlets" ON public.media_outlets FOR SELECT TO anon USING (false);


--
-- Name: profiles Block anonymous access to profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block anonymous access to profiles" ON public.profiles FOR SELECT TO anon USING (false);


--
-- Name: access_logs Block unauthenticated access to access_logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block unauthenticated access to access_logs" ON public.access_logs FOR SELECT TO anon USING (false);


--
-- Name: accreditation_requests Block unauthenticated access to accreditation_requests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block unauthenticated access to accreditation_requests" ON public.accreditation_requests FOR SELECT TO anon USING (false);


--
-- Name: accreditations Block unauthenticated access to accreditations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block unauthenticated access to accreditations" ON public.accreditations FOR SELECT TO anon USING (false);


--
-- Name: document_submissions Block unauthenticated access to document_submissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block unauthenticated access to document_submissions" ON public.document_submissions FOR SELECT TO anon USING (false);


--
-- Name: email_queue Block unauthenticated access to email_queue; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block unauthenticated access to email_queue" ON public.email_queue FOR SELECT TO anon USING (false);


--
-- Name: guest_check_in_scans Block unauthenticated access to guest check-in scans; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block unauthenticated access to guest check-in scans" ON public.guest_check_in_scans FOR SELECT TO anon USING (false);


--
-- Name: guests Block unauthenticated access to guests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block unauthenticated access to guests" ON public.guests FOR SELECT USING (false);


--
-- Name: invitations Block unauthenticated access to invitations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block unauthenticated access to invitations" ON public.invitations FOR SELECT TO anon USING (false);


--
-- Name: wristbands Block unauthenticated access to wristbands; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block unauthenticated access to wristbands" ON public.wristbands FOR SELECT TO anon USING (false);


--
-- Name: zone_presence Block unauthenticated access to zone_presence; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Block unauthenticated access to zone_presence" ON public.zone_presence FOR SELECT TO anon USING (false);


--
-- Name: accreditations Event organizers can create accreditations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Event organizers can create accreditations" ON public.accreditations FOR INSERT TO authenticated WITH CHECK ((event_id IN ( SELECT events.id
   FROM public.events
  WHERE (events.organizer_id = auth.uid()))));


--
-- Name: guests Event organizers can create guests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Event organizers can create guests" ON public.guests FOR INSERT TO authenticated WITH CHECK ((auth.uid() IN ( SELECT events.organizer_id
   FROM public.events
  WHERE (events.id = guests.event_id))));


--
-- Name: guests Event organizers can delete guests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Event organizers can delete guests" ON public.guests FOR DELETE TO authenticated USING ((auth.uid() IN ( SELECT events.organizer_id
   FROM public.events
  WHERE (events.id = guests.event_id))));


--
-- Name: chat_conversations Event organizers can manage conversations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Event organizers can manage conversations" ON public.chat_conversations USING ((event_id IN ( SELECT events.id
   FROM public.events
  WHERE (events.organizer_id = auth.uid()))));


--
-- Name: accreditation_requests Event organizers can update accreditation requests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Event organizers can update accreditation requests" ON public.accreditation_requests FOR UPDATE TO authenticated USING ((event_id IN ( SELECT events.id
   FROM public.events
  WHERE (events.organizer_id = auth.uid()))));


--
-- Name: accreditations Event organizers can update accreditations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Event organizers can update accreditations" ON public.accreditations FOR UPDATE TO authenticated USING ((event_id IN ( SELECT events.id
   FROM public.events
  WHERE (events.organizer_id = auth.uid()))));


--
-- Name: guests Event organizers can update guests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Event organizers can update guests" ON public.guests FOR UPDATE TO authenticated USING ((auth.uid() IN ( SELECT events.organizer_id
   FROM public.events
  WHERE (events.id = guests.event_id))));


--
-- Name: accreditations Event organizers can view accreditations for their events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Event organizers can view accreditations for their events" ON public.accreditations FOR SELECT TO authenticated USING ((event_id IN ( SELECT events.id
   FROM public.events
  WHERE (events.organizer_id = auth.uid()))));


--
-- Name: accreditation_requests Event organizers can view event accreditation requests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Event organizers can view event accreditation requests" ON public.accreditation_requests FOR SELECT TO authenticated USING ((event_id IN ( SELECT events.id
   FROM public.events
  WHERE (events.organizer_id = auth.uid()))));


--
-- Name: user_notifications Organizers can create notifications for event participants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers can create notifications for event participants" ON public.user_notifications FOR INSERT WITH CHECK (((event_id IN ( SELECT events.id
   FROM public.events
  WHERE (events.organizer_id = auth.uid()))) OR (user_id = auth.uid())));


--
-- Name: guests Organizers can delete event guests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers can delete event guests" ON public.guests FOR DELETE TO authenticated USING ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: guests Organizers can insert event guests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers can insert event guests" ON public.guests FOR INSERT TO authenticated WITH CHECK ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: access_logs Organizers can manage access logs for their events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers can manage access logs for their events" ON public.access_logs TO authenticated USING ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: accreditations Organizers can manage accreditations for their events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers can manage accreditations for their events" ON public.accreditations TO authenticated USING ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()))) WITH CHECK ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: events Organizers can manage own events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers can manage own events" ON public.events TO authenticated USING ((organizer_id = auth.uid())) WITH CHECK ((organizer_id = auth.uid()));


--
-- Name: wristbands Organizers can manage wristbands for their events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers can manage wristbands for their events" ON public.wristbands TO authenticated USING ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: zone_presence Organizers can manage zone presence for their events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers can manage zone presence for their events" ON public.zone_presence TO authenticated USING ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: guests Organizers can update event guests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers can update event guests" ON public.guests FOR UPDATE TO authenticated USING ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: document_submissions Organizers can update submissions for their events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers can update submissions for their events" ON public.document_submissions FOR UPDATE USING ((event_id IN ( SELECT events.id
   FROM public.events
  WHERE (events.organizer_id = auth.uid()))));


--
-- Name: guests Organizers can view event guests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers can view event guests" ON public.guests FOR SELECT TO authenticated USING ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: guest_check_in_scans Organizers can view guest check-in scans; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers can view guest check-in scans" ON public.guest_check_in_scans FOR SELECT TO authenticated USING ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: events Organizers can view own events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers can view own events" ON public.events FOR SELECT TO authenticated USING ((organizer_id = auth.uid()));


--
-- Name: accreditation_requests Organizers can view requests for their events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers can view requests for their events" ON public.accreditation_requests FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: document_submissions Organizers can view submissions for their events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers can view submissions for their events" ON public.document_submissions FOR SELECT USING ((event_id IN ( SELECT events.id
   FROM public.events
  WHERE (events.organizer_id = auth.uid()))));


--
-- Name: submission_verification_events Organizers insert verification events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers insert verification events" ON public.submission_verification_events FOR INSERT TO authenticated WITH CHECK ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: media_contact_outlets Organizers manage contact_outlets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers manage contact_outlets" ON public.media_contact_outlets TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.media_contacts c
  WHERE ((c.id = media_contact_outlets.contact_id) AND ((c.organizer_id = auth.uid()) OR public.is_admin(auth.uid())))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.media_contacts c
  WHERE ((c.id = media_contact_outlets.contact_id) AND ((c.organizer_id = auth.uid()) OR public.is_admin(auth.uid()))))));


--
-- Name: coverage_items Organizers manage coverage_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers manage coverage_items" ON public.coverage_items TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.coverage_requests r
  WHERE ((r.id = coverage_items.coverage_request_id) AND ((r.organizer_id = auth.uid()) OR public.is_admin(auth.uid())))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.coverage_requests r
  WHERE ((r.id = coverage_items.coverage_request_id) AND ((r.organizer_id = auth.uid()) OR public.is_admin(auth.uid()))))));


--
-- Name: coverage_requests Organizers manage coverage_requests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers manage coverage_requests" ON public.coverage_requests TO authenticated USING (((organizer_id = auth.uid()) OR public.is_admin(auth.uid()))) WITH CHECK (((organizer_id = auth.uid()) OR public.is_admin(auth.uid())));


--
-- Name: event_landing_pages Organizers manage landing pages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers manage landing pages" ON public.event_landing_pages TO authenticated USING ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()))) WITH CHECK ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: media_contacts Organizers manage media_contacts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers manage media_contacts" ON public.media_contacts TO authenticated USING (((organizer_id = auth.uid()) OR public.is_admin(auth.uid()))) WITH CHECK (((organizer_id = auth.uid()) OR public.is_admin(auth.uid())));


--
-- Name: media_outlets Organizers manage media_outlets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers manage media_outlets" ON public.media_outlets TO authenticated USING (((organizer_id = auth.uid()) OR public.is_admin(auth.uid()))) WITH CHECK (((organizer_id = auth.uid()) OR public.is_admin(auth.uid())));


--
-- Name: landing_page_submissions Organizers update submissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers update submissions" ON public.landing_page_submissions FOR UPDATE TO authenticated USING ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()))) WITH CHECK ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: landing_page_submissions Organizers view submissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers view submissions" ON public.landing_page_submissions FOR SELECT TO authenticated USING ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: submission_verification_events Organizers view verification events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Organizers view verification events" ON public.submission_verification_events FOR SELECT TO authenticated USING ((public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid())));


--
-- Name: event_landing_pages Public can view active landing pages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can view active landing pages" ON public.event_landing_pages FOR SELECT TO anon USING ((is_active = true));


--
-- Name: events Published events are publicly visible; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Published events are publicly visible" ON public.events FOR SELECT USING ((is_published = true));


--
-- Name: document_comments Users can add comments to their documents; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can add comments to their documents" ON public.document_comments FOR INSERT WITH CHECK (((document_id IN ( SELECT document_submissions.id
   FROM public.document_submissions
  WHERE (document_submissions.user_id = auth.uid()))) OR (document_id IN ( SELECT ds.id
   FROM (public.document_submissions ds
     JOIN public.events e ON ((ds.event_id = e.id)))
  WHERE (e.organizer_id = auth.uid())))));


--
-- Name: document_submissions Users can create document submissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create document submissions" ON public.document_submissions FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: invitation_templates Users can create their own invitation templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own invitation templates" ON public.invitation_templates FOR INSERT TO authenticated WITH CHECK ((auth.uid() = created_by));


--
-- Name: invitation_templates Users can delete their own invitation templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own invitation templates" ON public.invitation_templates FOR DELETE TO authenticated USING ((auth.uid() = created_by));


--
-- Name: user_notifications Users can delete their own notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own notifications" ON public.user_notifications FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- Name: chat_messages Users can send messages in their conversations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can send messages in their conversations" ON public.chat_messages FOR INSERT WITH CHECK ((conversation_id IN ( SELECT chat_conversations.id
   FROM public.chat_conversations
  WHERE ((chat_conversations.created_by = auth.uid()) OR (chat_conversations.event_id IN ( SELECT events.id
           FROM public.events
          WHERE (events.organizer_id = auth.uid())))))));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: invitation_templates Users can update their own invitation templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own invitation templates" ON public.invitation_templates FOR UPDATE TO authenticated USING ((auth.uid() = created_by));


--
-- Name: chat_messages Users can update their own messages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own messages" ON public.chat_messages FOR UPDATE USING ((sender_id = auth.uid()));


--
-- Name: user_notifications Users can update their own notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own notifications" ON public.user_notifications FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: document_submissions Users can update their pending submissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their pending submissions" ON public.document_submissions FOR UPDATE USING (((user_id = auth.uid()) AND (status = 'pending'::text)));


--
-- Name: document_comments Users can view comments on their documents; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view comments on their documents" ON public.document_comments FOR SELECT USING (((document_id IN ( SELECT document_submissions.id
   FROM public.document_submissions
  WHERE (document_submissions.user_id = auth.uid()))) OR (document_id IN ( SELECT ds.id
   FROM (public.document_submissions ds
     JOIN public.events e ON ((ds.event_id = e.id)))
  WHERE (e.organizer_id = auth.uid())))));


--
-- Name: chat_conversations Users can view conversations they created; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view conversations they created" ON public.chat_conversations FOR SELECT USING ((created_by = auth.uid()));


--
-- Name: chat_messages Users can view messages in their conversations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view messages in their conversations" ON public.chat_messages FOR SELECT USING ((conversation_id IN ( SELECT chat_conversations.id
   FROM public.chat_conversations
  WHERE ((chat_conversations.created_by = auth.uid()) OR (chat_conversations.event_id IN ( SELECT events.id
           FROM public.events
          WHERE (events.organizer_id = auth.uid())))))));


--
-- Name: accreditation_requests Users can view own accreditation requests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own accreditation requests" ON public.accreditation_requests FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: accreditations Users can view own accreditations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own accreditations" ON public.accreditations FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: invitation_templates Users can view own or default templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own or default templates" ON public.invitation_templates FOR SELECT TO authenticated USING (((created_by = auth.uid()) OR (is_default = true)));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: subscriptions Users can view own subscriptions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: accreditations Users can view their own accreditations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own accreditations" ON public.accreditations FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_notifications Users can view their own notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own notifications" ON public.user_notifications FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: document_submissions Users can view their own submissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own submissions" ON public.document_submissions FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: access_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: accreditation_requests; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.accreditation_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: accreditation_types; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.accreditation_types ENABLE ROW LEVEL SECURITY;

--
-- Name: accreditations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.accreditations ENABLE ROW LEVEL SECURITY;

--
-- Name: api_keys; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_conversations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: coverage_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.coverage_items ENABLE ROW LEVEL SECURITY;

--
-- Name: coverage_requests; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.coverage_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: document_comments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: document_submissions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.document_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: email_queue; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

--
-- Name: event_landing_pages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_landing_pages ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: guest_check_in_scans; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.guest_check_in_scans ENABLE ROW LEVEL SECURITY;

--
-- Name: guests; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

--
-- Name: invitation_templates; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.invitation_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: invitations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: landing_page_submissions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.landing_page_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: media_contact_outlets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.media_contact_outlets ENABLE ROW LEVEL SECURITY;

--
-- Name: media_contacts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.media_contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: media_documents; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.media_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: media_outlets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.media_outlets ENABLE ROW LEVEL SECURITY;

--
-- Name: media_registrations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.media_registrations ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: submission_verification_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.submission_verification_events ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: wristbands; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wristbands ENABLE ROW LEVEL SECURITY;

--
-- Name: zone_presence; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.zone_presence ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION has_role(_user_id uuid, _role public.app_role); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO anon;
GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO authenticated;
GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO service_role;


--
-- Name: FUNCTION is_admin(_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_admin(_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.is_admin(_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_admin(_user_id uuid) TO service_role;


--
-- Name: FUNCTION is_event_organizer(_user_id uuid, _event_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_event_organizer(_user_id uuid, _event_id uuid) TO anon;
GRANT ALL ON FUNCTION public.is_event_organizer(_user_id uuid, _event_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_event_organizer(_user_id uuid, _event_id uuid) TO service_role;


--
-- Name: FUNCTION mirror_landing_submission_to_requests(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.mirror_landing_submission_to_requests() TO anon;
GRANT ALL ON FUNCTION public.mirror_landing_submission_to_requests() TO authenticated;
GRANT ALL ON FUNCTION public.mirror_landing_submission_to_requests() TO service_role;


--
-- Name: FUNCTION process_qr_check_in(_qr_code text, _event_id uuid, _device_info jsonb, _client_scan_id uuid, _scanned_at timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.process_qr_check_in(_qr_code text, _event_id uuid, _device_info jsonb, _client_scan_id uuid, _scanned_at timestamp with time zone) TO anon;
GRANT ALL ON FUNCTION public.process_qr_check_in(_qr_code text, _event_id uuid, _device_info jsonb, _client_scan_id uuid, _scanned_at timestamp with time zone) TO authenticated;
GRANT ALL ON FUNCTION public.process_qr_check_in(_qr_code text, _event_id uuid, _device_info jsonb, _client_scan_id uuid, _scanned_at timestamp with time zone) TO service_role;


--
-- Name: FUNCTION process_rfid_scan(_rfid_code text, _event_id uuid, _zone_name text, _scanned_by uuid, _device_info text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.process_rfid_scan(_rfid_code text, _event_id uuid, _zone_name text, _scanned_by uuid, _device_info text) TO anon;
GRANT ALL ON FUNCTION public.process_rfid_scan(_rfid_code text, _event_id uuid, _zone_name text, _scanned_by uuid, _device_info text) TO authenticated;
GRANT ALL ON FUNCTION public.process_rfid_scan(_rfid_code text, _event_id uuid, _zone_name text, _scanned_by uuid, _device_info text) TO service_role;


--
-- Name: FUNCTION rls_auto_enable(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.rls_auto_enable() TO anon;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO authenticated;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO service_role;


--
-- Name: FUNCTION set_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.set_updated_at() TO anon;
GRANT ALL ON FUNCTION public.set_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.set_updated_at() TO service_role;


--
-- Name: FUNCTION update_conversation_timestamp(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_conversation_timestamp() TO anon;
GRANT ALL ON FUNCTION public.update_conversation_timestamp() TO authenticated;
GRANT ALL ON FUNCTION public.update_conversation_timestamp() TO service_role;


--
-- Name: FUNCTION update_document_timestamp(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_document_timestamp() TO anon;
GRANT ALL ON FUNCTION public.update_document_timestamp() TO authenticated;
GRANT ALL ON FUNCTION public.update_document_timestamp() TO service_role;


--
-- Name: TABLE access_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.access_logs TO anon;
GRANT ALL ON TABLE public.access_logs TO authenticated;
GRANT ALL ON TABLE public.access_logs TO service_role;


--
-- Name: TABLE accreditation_requests; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.accreditation_requests TO anon;
GRANT ALL ON TABLE public.accreditation_requests TO authenticated;
GRANT ALL ON TABLE public.accreditation_requests TO service_role;


--
-- Name: TABLE accreditation_types; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.accreditation_types TO anon;
GRANT ALL ON TABLE public.accreditation_types TO authenticated;
GRANT ALL ON TABLE public.accreditation_types TO service_role;


--
-- Name: TABLE accreditations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.accreditations TO anon;
GRANT ALL ON TABLE public.accreditations TO authenticated;
GRANT ALL ON TABLE public.accreditations TO service_role;


--
-- Name: TABLE api_keys; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.api_keys TO anon;
GRANT ALL ON TABLE public.api_keys TO authenticated;
GRANT ALL ON TABLE public.api_keys TO service_role;


--
-- Name: TABLE chat_conversations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.chat_conversations TO anon;
GRANT ALL ON TABLE public.chat_conversations TO authenticated;
GRANT ALL ON TABLE public.chat_conversations TO service_role;


--
-- Name: TABLE chat_messages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.chat_messages TO anon;
GRANT ALL ON TABLE public.chat_messages TO authenticated;
GRANT ALL ON TABLE public.chat_messages TO service_role;


--
-- Name: TABLE coverage_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.coverage_items TO anon;
GRANT ALL ON TABLE public.coverage_items TO authenticated;
GRANT ALL ON TABLE public.coverage_items TO service_role;


--
-- Name: TABLE coverage_requests; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.coverage_requests TO anon;
GRANT ALL ON TABLE public.coverage_requests TO authenticated;
GRANT ALL ON TABLE public.coverage_requests TO service_role;


--
-- Name: TABLE document_comments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.document_comments TO anon;
GRANT ALL ON TABLE public.document_comments TO authenticated;
GRANT ALL ON TABLE public.document_comments TO service_role;


--
-- Name: TABLE document_submissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.document_submissions TO anon;
GRANT ALL ON TABLE public.document_submissions TO authenticated;
GRANT ALL ON TABLE public.document_submissions TO service_role;


--
-- Name: TABLE email_queue; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.email_queue TO anon;
GRANT ALL ON TABLE public.email_queue TO authenticated;
GRANT ALL ON TABLE public.email_queue TO service_role;


--
-- Name: TABLE event_landing_pages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_landing_pages TO anon;
GRANT ALL ON TABLE public.event_landing_pages TO authenticated;
GRANT ALL ON TABLE public.event_landing_pages TO service_role;


--
-- Name: TABLE events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.events TO anon;
GRANT ALL ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;


--
-- Name: TABLE guest_check_in_scans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.guest_check_in_scans TO anon;
GRANT ALL ON TABLE public.guest_check_in_scans TO authenticated;
GRANT ALL ON TABLE public.guest_check_in_scans TO service_role;


--
-- Name: TABLE guests; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.guests TO anon;
GRANT ALL ON TABLE public.guests TO authenticated;
GRANT ALL ON TABLE public.guests TO service_role;


--
-- Name: TABLE invitation_templates; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.invitation_templates TO anon;
GRANT ALL ON TABLE public.invitation_templates TO authenticated;
GRANT ALL ON TABLE public.invitation_templates TO service_role;


--
-- Name: TABLE invitations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.invitations TO anon;
GRANT ALL ON TABLE public.invitations TO authenticated;
GRANT ALL ON TABLE public.invitations TO service_role;


--
-- Name: TABLE landing_page_submissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.landing_page_submissions TO anon;
GRANT ALL ON TABLE public.landing_page_submissions TO authenticated;
GRANT ALL ON TABLE public.landing_page_submissions TO service_role;


--
-- Name: TABLE media_contact_outlets; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.media_contact_outlets TO anon;
GRANT ALL ON TABLE public.media_contact_outlets TO authenticated;
GRANT ALL ON TABLE public.media_contact_outlets TO service_role;


--
-- Name: TABLE media_contacts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.media_contacts TO anon;
GRANT ALL ON TABLE public.media_contacts TO authenticated;
GRANT ALL ON TABLE public.media_contacts TO service_role;


--
-- Name: TABLE media_documents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.media_documents TO anon;
GRANT ALL ON TABLE public.media_documents TO authenticated;
GRANT ALL ON TABLE public.media_documents TO service_role;


--
-- Name: TABLE media_outlets; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.media_outlets TO anon;
GRANT ALL ON TABLE public.media_outlets TO authenticated;
GRANT ALL ON TABLE public.media_outlets TO service_role;


--
-- Name: TABLE media_registrations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.media_registrations TO anon;
GRANT ALL ON TABLE public.media_registrations TO authenticated;
GRANT ALL ON TABLE public.media_registrations TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE submission_verification_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.submission_verification_events TO anon;
GRANT ALL ON TABLE public.submission_verification_events TO authenticated;
GRANT ALL ON TABLE public.submission_verification_events TO service_role;


--
-- Name: TABLE subscriptions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subscriptions TO anon;
GRANT ALL ON TABLE public.subscriptions TO authenticated;
GRANT ALL ON TABLE public.subscriptions TO service_role;


--
-- Name: TABLE user_notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_notifications TO anon;
GRANT ALL ON TABLE public.user_notifications TO authenticated;
GRANT ALL ON TABLE public.user_notifications TO service_role;


--
-- Name: TABLE user_roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_roles TO anon;
GRANT ALL ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;


--
-- Name: TABLE wristbands; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.wristbands TO anon;
GRANT ALL ON TABLE public.wristbands TO authenticated;
GRANT ALL ON TABLE public.wristbands TO service_role;


--
-- Name: TABLE zone_presence; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.zone_presence TO anon;
GRANT ALL ON TABLE public.zone_presence TO authenticated;
GRANT ALL ON TABLE public.zone_presence TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict BmGrvvu0YlgsIkfsUJdIauE9Rq5QWKzHQhxJiiaWXdSeykUbMiDm5cmJZe5Vr8z

