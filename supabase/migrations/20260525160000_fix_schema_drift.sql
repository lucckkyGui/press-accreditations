-- ============================================================
-- Schema drift fixes for objects referenced by generated types
-- and application code but missing from local migrations.
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------
-- public_events view
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_events AS
SELECT
  id,
  title,
  description,
  location,
  start_date,
  end_date,
  is_published,
  status,
  category,
  image_url,
  max_guests,
  created_at,
  updated_at
FROM public.events
WHERE is_published = true;

GRANT SELECT ON public.public_events TO anon, authenticated;

-- ------------------------------------------------------------
-- audit_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL,
  resource text NOT NULL,
  resource_id text,
  details text,
  severity text NOT NULL DEFAULT 'info',
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_severity_check CHECK (severity IN ('info', 'warning', 'error'))
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;
CREATE POLICY "Admins can read audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- ------------------------------------------------------------
-- email_campaigns
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  total_recipients integer NOT NULL DEFAULT 0,
  sent_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  opened_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT email_campaigns_status_check CHECK (status IN ('draft', 'sending', 'completed', 'paused', 'cancelled'))
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_email_campaigns_event_id ON public.email_campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);

DROP TRIGGER IF EXISTS set_email_campaigns_updated_at ON public.email_campaigns;
CREATE TRIGGER set_email_campaigns_updated_at
BEFORE UPDATE ON public.email_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Organizers can manage email campaigns for their events" ON public.email_campaigns;
CREATE POLICY "Organizers can manage email campaigns for their events"
ON public.email_campaigns
FOR ALL
TO authenticated
USING (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()))
WITH CHECK (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()));

-- ------------------------------------------------------------
-- email_queue compatibility columns
-- ------------------------------------------------------------
ALTER TABLE public.email_queue
  ADD COLUMN IF NOT EXISTS invitation_id uuid,
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS max_attempts integer DEFAULT 3,
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz;

ALTER TABLE public.email_queue
  ALTER COLUMN body DROP NOT NULL;

UPDATE public.email_queue
SET content = COALESCE(content, body)
WHERE content IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'email_queue_invitation_id_fkey'
      AND conrelid = 'public.email_queue'::regclass
  ) THEN
    ALTER TABLE public.email_queue
      ADD CONSTRAINT email_queue_invitation_id_fkey
      FOREIGN KEY (invitation_id) REFERENCES public.invitations(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.email_queue WHERE content IS NULL) THEN
    ALTER TABLE public.email_queue ALTER COLUMN content SET NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.email_queue WHERE invitation_id IS NULL) THEN
    ALTER TABLE public.email_queue ALTER COLUMN invitation_id SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_queue_invitation_id ON public.email_queue(invitation_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority_scheduled ON public.email_queue(priority DESC, scheduled_for ASC);

DROP POLICY IF EXISTS "Organizers can manage queued emails for their events" ON public.email_queue;
CREATE POLICY "Organizers can manage queued emails for their events"
ON public.email_queue
FOR ALL
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.invitations i
    WHERE i.id = email_queue.invitation_id
      AND public.is_event_organizer(auth.uid(), i.event_id)
  )
  OR public.is_event_organizer(auth.uid(), event_id)
)
WITH CHECK (
  public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.invitations i
    WHERE i.id = email_queue.invitation_id
      AND public.is_event_organizer(auth.uid(), i.event_id)
  )
  OR public.is_event_organizer(auth.uid(), event_id)
);

-- ------------------------------------------------------------
-- webhook_subscriptions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webhook_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  url text NOT NULL,
  secret text NOT NULL,
  events text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  failure_count integer NOT NULL DEFAULT 0,
  last_triggered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT webhook_subscriptions_url_check CHECK (url ~ '^https://')
);

ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_user_id ON public.webhook_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_event_id ON public.webhook_subscriptions(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_active ON public.webhook_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_events ON public.webhook_subscriptions USING gin(events);

DROP TRIGGER IF EXISTS set_webhook_subscriptions_updated_at ON public.webhook_subscriptions;
CREATE TRIGGER set_webhook_subscriptions_updated_at
BEFORE UPDATE ON public.webhook_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Users can view own webhook subscriptions" ON public.webhook_subscriptions;
CREATE POLICY "Users can view own webhook subscriptions"
ON public.webhook_subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can create own webhook subscriptions" ON public.webhook_subscriptions;
CREATE POLICY "Users can create own webhook subscriptions"
ON public.webhook_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (
    event_id IS NULL
    OR public.is_event_organizer(auth.uid(), event_id)
    OR public.is_admin(auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can update own webhook subscriptions" ON public.webhook_subscriptions;
CREATE POLICY "Users can update own webhook subscriptions"
ON public.webhook_subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
WITH CHECK (
  (user_id = auth.uid() OR public.is_admin(auth.uid()))
  AND (
    event_id IS NULL
    OR public.is_event_organizer(auth.uid(), event_id)
    OR public.is_admin(auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can delete own webhook subscriptions" ON public.webhook_subscriptions;
CREATE POLICY "Users can delete own webhook subscriptions"
ON public.webhook_subscriptions
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- ------------------------------------------------------------
-- event_landing_pages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  logo_url text,
  banner_url text,
  primary_color text NOT NULL DEFAULT '#6366f1',
  secondary_color text NOT NULL DEFAULT '#8b5cf6',
  description text,
  terms_text text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  form_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_landing_pages_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$'),
  CONSTRAINT event_landing_pages_event_unique UNIQUE (event_id)
);

ALTER TABLE public.event_landing_pages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_event_landing_pages_event_id ON public.event_landing_pages(event_id);
CREATE INDEX IF NOT EXISTS idx_event_landing_pages_slug ON public.event_landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_event_landing_pages_active ON public.event_landing_pages(is_active);

DROP TRIGGER IF EXISTS set_event_landing_pages_updated_at ON public.event_landing_pages;
CREATE TRIGGER set_event_landing_pages_updated_at
BEFORE UPDATE ON public.event_landing_pages
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Public can view active landing pages" ON public.event_landing_pages;
CREATE POLICY "Public can view active landing pages"
ON public.event_landing_pages
FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Organizers can manage event landing pages" ON public.event_landing_pages;
CREATE POLICY "Organizers can manage event landing pages"
ON public.event_landing_pages
FOR ALL
TO authenticated
USING (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()))
WITH CHECK (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()));

-- ------------------------------------------------------------
-- landing_page_submissions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.landing_page_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id uuid NOT NULL REFERENCES public.event_landing_pages(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  media_organization text,
  job_title text,
  social_media text,
  portfolio_url text,
  coverage_description text,
  previous_accreditation boolean NOT NULL DEFAULT false,
  accreditation_type text,
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  review_notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT landing_page_submissions_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

ALTER TABLE public.landing_page_submissions ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_landing_page_submissions_unique_email
  ON public.landing_page_submissions(landing_page_id, lower(email));
CREATE INDEX IF NOT EXISTS idx_landing_page_submissions_event_id ON public.landing_page_submissions(event_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_submissions_status ON public.landing_page_submissions(status);
CREATE INDEX IF NOT EXISTS idx_landing_page_submissions_created_at ON public.landing_page_submissions(created_at DESC);

DROP TRIGGER IF EXISTS set_landing_page_submissions_updated_at ON public.landing_page_submissions;
CREATE TRIGGER set_landing_page_submissions_updated_at
BEFORE UPDATE ON public.landing_page_submissions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Organizers can manage landing page submissions" ON public.landing_page_submissions;
CREATE POLICY "Organizers can manage landing page submissions"
ON public.landing_page_submissions
FOR ALL
TO authenticated
USING (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()))
WITH CHECK (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()));
