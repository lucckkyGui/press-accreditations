-- ============================================================
-- Compatibility patch before fix_security_policies.
-- 20260401233800 expects public.email_queue to exist.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES public.guests(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  subject text NOT NULL,
  body text NOT NULL,
  template_id uuid REFERENCES public.invitation_templates(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  provider text,
  provider_message_id text,
  error_message text,
  attempts integer NOT NULL DEFAULT 0,
  scheduled_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_email_queue_event_id
  ON public.email_queue(event_id);

CREATE INDEX IF NOT EXISTS idx_email_queue_guest_id
  ON public.email_queue(guest_id);

CREATE INDEX IF NOT EXISTS idx_email_queue_status_scheduled
  ON public.email_queue(status, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_email_queue_recipient_email
  ON public.email_queue(recipient_email);
