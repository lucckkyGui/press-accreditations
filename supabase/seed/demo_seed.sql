-- PressOps — Demo seed (Tydzień 8).
--
-- Tworzy spójny, sprzedażowy dataset demo dla JEDNEGO organizatora:
--   1 event, 1 landing, 50 submissions (30 approved, 5 approved_limited,
--   10 rejected, 5 waitlisted), 25 checked-in, 18 coverage submitted,
--   7 coverage missing, sponsor mentions, 10 top publications.
--
-- Uruchomienie (psql / Supabase SQL editor):
--   SELECT public.seed_pressops_demo('organizer@twojadomena.pl');
--
-- Idempotentne: czyści poprzednie demo tego organizatora (po znaczniku
-- events.category = 'DEMO') i tworzy od nowa. NIE dotyka danych produkcyjnych.

CREATE OR REPLACE FUNCTION public.seed_pressops_demo(_organizer_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org uuid;
  _event_id uuid;
  _landing_id uuid;
  _slug text := 'demo-press-festival';
  _type_id uuid;
  i int;
  _email text;
  _first text;
  _last text;
  _media text;
  _status text;
  _sub_id uuid;
  _guest_id uuid;
  _qr text;
  _checked boolean;
  _cov_id uuid;
  _cov_status text;
  _media_names text[] := ARRAY['Gazeta Wyborcza','TVN24','Polsat News','Onet','RMF FM','Radio ZET','Wirtualna Polska','Press.pl','Newsweek','Interia'];
  _first_names text[] := ARRAY['Anna','Piotr','Katarzyna','Marek','Magdalena','Tomasz','Agnieszka','Jakub','Joanna','Michał'];
  _last_names text[] := ARRAY['Kowalska','Nowak','Wisniewski','Wojcik','Kowalczyk','Kaminski','Lewandowska','Zielinski','Szymanski','Wozniak'];
  _domains text[] := ARRAY['wyborcza.pl','tvn24.pl','polsatnews.pl','onet.pl','rmf.fm','radiozet.pl','wp.pl','press.pl','newsweek.pl','interia.pl'];
  _access_levels text[] := ARRAY['press','photo','video','radio','podcast','influencer','photo_pit','interview','backstage_limited','sponsor_media'];
  _created int := 0;
BEGIN
  -- Organizator
  SELECT id INTO _org FROM auth.users WHERE email = _organizer_email LIMIT 1;
  IF _org IS NULL THEN
    RAISE EXCEPTION 'Nie znaleziono użytkownika o e-mailu %, najpierw utwórz konto organizatora.', _organizer_email;
  END IF;

  -- Czyszczenie poprzedniego demo (po znaczniku DEMO)
  DELETE FROM public.events WHERE organizer_id = _org AND category = 'DEMO';

  -- 1) Event
  INSERT INTO public.events (organizer_id, title, description, location, start_date, end_date, category, is_published, status, max_guests)
  VALUES (_org, 'Demo Press Festival 2026', 'Wydarzenie demonstracyjne PressOps — pełen workflow akredytacji prasowych.',
          'Łódź, Atlas Arena', now() - interval '5 days', now() - interval '3 days', 'DEMO', true, 'completed', 200)
  RETURNING id INTO _event_id;

  -- 2) Landing
  INSERT INTO public.event_landing_pages (event_id, slug, primary_color, secondary_color, description, is_active)
  VALUES (_event_id, _slug, '#6366f1', '#8b5cf6', 'Akredytacja prasowa — Demo Press Festival 2026', true)
  RETURNING id INTO _landing_id;

  -- Typ akredytacji
  INSERT INTO public.accreditation_types (event_id, created_by, name, description, access_areas, requires_approval)
  VALUES (_event_id, _org, 'Prasa', 'Domyślna kategoria demo', ARRAY['Strefa prasowa'], true)
  RETURNING id INTO _type_id;

  -- 3) 50 submissions z rozkładem statusów
  FOR i IN 1..50 LOOP
    _first := _first_names[1 + (i % 10)];
    _last := _last_names[1 + ((i * 3) % 10)];
    _media := _media_names[1 + (i % 10)];
    _email := lower(_first || '.' || _last || i::text || '@' || _domains[1 + (i % 10)]);

    -- Rozkład: 30 approved, 5 approved_limited, 10 rejected, 5 waitlisted
    IF i <= 30 THEN _status := 'approved';
    ELSIF i <= 35 THEN _status := 'approved_limited';
    ELSIF i <= 45 THEN _status := 'rejected';
    ELSE _status := 'waitlisted';
    END IF;

    INSERT INTO public.landing_page_submissions (
      landing_page_id, event_id, first_name, last_name, email, phone,
      media_organization, media_type, role, publication_links, coverage_description,
      requested_access, previous_accreditation, consent_data_processing,
      status, verification_score, verification_risk_level, verification_status,
      access_level, decided_at, decided_by
    ) VALUES (
      _landing_id, _event_id, _first, _last, _email, '+48 600 000 ' || lpad(i::text, 3, '0'),
      _media, 'national', (ARRAY['journalist','photographer','video','radio','influencer'])[1 + (i % 5)],
      'https://' || _domains[1 + (i % 10)] || '/artykul-' || i,
      'Planowana relacja z wydarzenia, wywiady i materiał podsumowujący.',
      'Strefa prasowa', (i % 3 = 0), true,
      _status,
      CASE WHEN _status LIKE 'approved%' THEN 70 + (i % 30) WHEN _status = 'rejected' THEN 20 + (i % 20) ELSE 45 + (i % 15) END,
      CASE WHEN _status LIKE 'approved%' THEN 'low' WHEN _status = 'rejected' THEN 'high' ELSE 'medium' END,
      CASE WHEN _status LIKE 'approved%' THEN 'strong' WHEN _status = 'rejected' THEN 'weak' ELSE 'needs_review' END,
      CASE WHEN _status LIKE 'approved%' THEN _access_levels[1 + (i % 10)] ELSE NULL END,
      CASE WHEN _status <> 'pending' THEN now() - interval '4 days' ELSE NULL END,
      _org
    ) RETURNING id INTO _sub_id;

    -- Dla approved/approved_limited: guest (QR pass). 25 z nich checked-in.
    IF _status LIKE 'approved%' THEN
      _qr := 'PA-DEMO' || lpad(i::text, 4, '0');
      _checked := (i <= 25); -- pierwszych 25 approved = checked-in
      INSERT INTO public.guests (
        event_id, first_name, last_name, email, company, ticket_type,
        access_level, zones, status, qr_code, checked_in_at, checked_in_by
      ) VALUES (
        _event_id, _first, _last, _email, _media, 'press',
        _access_levels[1 + (i % 10)], ARRAY['Strefa prasowa'],
        CASE WHEN _checked THEN 'checked-in' ELSE 'confirmed' END,
        _qr,
        CASE WHEN _checked THEN now() - interval '4 days' + (i || ' minutes')::interval ELSE NULL END,
        CASE WHEN _checked THEN _org ELSE NULL END
      ) RETURNING id INTO _guest_id;

      UPDATE public.landing_page_submissions
        SET guest_id = _guest_id, pass_qr_code = _qr, pass_issued_at = now() - interval '4 days'
        WHERE id = _sub_id;

      -- Coverage request dla checked-in (25). 18 submitted/verified, 7 missing.
      IF _checked THEN
        IF i <= 18 THEN _cov_status := CASE WHEN i <= 10 THEN 'coverage_verified' ELSE 'coverage_submitted' END;
        ELSE _cov_status := 'coverage_missing';
        END IF;

        INSERT INTO public.coverage_requests (
          event_id, organizer_id, submission_id, guest_id, email, first_name, last_name,
          media_name, status, token
        ) VALUES (
          _event_id, _org, _sub_id, _guest_id, _email, _first, _last,
          _media, _cov_status, 'CVG-DEMO' || lpad(i::text, 4, '0') || 'ABCDEFGH'
        ) RETURNING id INTO _cov_id;

        -- Coverage item dla submitted/verified (18) — 10 z nich top publications z wysokim zasięgiem.
        IF _cov_status <> 'coverage_missing' THEN
          INSERT INTO public.coverage_items (
            coverage_request_id, event_id, article_url, gallery_url, video_url,
            publication_date, estimated_reach, sponsor_mentions, publication_type, verified_at
          ) VALUES (
            _cov_id, _event_id,
            'https://' || _domains[1 + (i % 10)] || '/relacja-demo-' || i,
            CASE WHEN i % 3 = 0 THEN 'https://' || _domains[1 + (i % 10)] || '/galeria-' || i ELSE NULL END,
            CASE WHEN i % 4 = 0 THEN 'https://youtube.com/watch?v=demo' || i ELSE NULL END,
            (now() - interval '2 days')::date,
            CASE WHEN i <= 10 THEN 200000 - (i * 15000) ELSE 15000 + (i * 500) END, -- top 10 = wysoki zasięg
            CASE WHEN i <= 5 THEN 3 ELSE 0 END, -- 5 publikacji ze wzmiankami sponsora
            (ARRAY['artykuł','relacja TV','galeria','wywiad','post social'])[1 + (i % 5)],
            CASE WHEN _cov_status = 'coverage_verified' THEN now() - interval '1 day' ELSE NULL END
          );
        END IF;
      END IF;
    END IF;

    _created := _created + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'event_id', _event_id,
    'landing_slug', _slug,
    'submissions', _created,
    'note', 'Demo seed gotowy. Otwórz event w panelu i wygeneruj Media Coverage Report.'
  );
END;
$$;

-- Cofnięcie demo:
--   DELETE FROM public.events WHERE organizer_id = (SELECT id FROM auth.users WHERE email='...') AND category='DEMO';
