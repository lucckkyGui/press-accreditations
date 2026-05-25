-- ============================================
-- 1. REAL-TIME CHAT SYSTEM
-- ============================================

-- Chat conversations table
CREATE TABLE public.chat_conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chat tables
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat conversations policies
CREATE POLICY "Event organizers can manage conversations"
ON public.chat_conversations FOR ALL
USING (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));

CREATE POLICY "Users can view conversations they created"
ON public.chat_conversations FOR SELECT
USING (created_by = auth.uid());

-- Chat messages policies
CREATE POLICY "Users can send messages in their conversations"
ON public.chat_messages FOR INSERT
WITH CHECK (conversation_id IN (
    SELECT id FROM chat_conversations 
    WHERE created_by = auth.uid() OR event_id IN (
        SELECT id FROM events WHERE organizer_id = auth.uid()
    )
));

CREATE POLICY "Users can view messages in their conversations"
ON public.chat_messages FOR SELECT
USING (conversation_id IN (
    SELECT id FROM chat_conversations 
    WHERE created_by = auth.uid() OR event_id IN (
        SELECT id FROM events WHERE organizer_id = auth.uid()
    )
));

CREATE POLICY "Users can update their own messages"
ON public.chat_messages FOR UPDATE
USING (sender_id = auth.uid());

-- ============================================
-- 2. SMART NOTIFICATIONS SYSTEM
-- ============================================

-- User notifications table
CREATE TABLE public.user_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
ON public.user_notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.user_notifications FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON public.user_notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
ON public.user_notifications FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- 3. DOCUMENT WORKFLOW SYSTEM
-- ============================================

-- Document submissions table (enhanced workflow)
CREATE TABLE public.document_submissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    reviewer_id UUID,
    review_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES public.document_submissions(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document comments table
CREATE TABLE public.document_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.document_submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

-- Document submissions policies
CREATE POLICY "Users can create document submissions"
ON public.document_submissions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own submissions"
ON public.document_submissions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Organizers can view submissions for their events"
ON public.document_submissions FOR SELECT
USING (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));

CREATE POLICY "Organizers can update submissions for their events"
ON public.document_submissions FOR UPDATE
USING (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));

CREATE POLICY "Users can update their pending submissions"
ON public.document_submissions FOR UPDATE
USING (user_id = auth.uid() AND status = 'pending');

-- Document comments policies
CREATE POLICY "Users can add comments to their documents"
ON public.document_comments FOR INSERT
WITH CHECK (document_id IN (
    SELECT id FROM document_submissions WHERE user_id = auth.uid()
) OR document_id IN (
    SELECT ds.id FROM document_submissions ds
    JOIN events e ON ds.event_id = e.id
    WHERE e.organizer_id = auth.uid()
));

CREATE POLICY "Users can view comments on their documents"
ON public.document_comments FOR SELECT
USING (document_id IN (
    SELECT id FROM document_submissions WHERE user_id = auth.uid()
) OR document_id IN (
    SELECT ds.id FROM document_submissions ds
    JOIN events e ON ds.event_id = e.id
    WHERE e.organizer_id = auth.uid()
));

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX idx_chat_conversations_event ON public.chat_conversations(event_id);
CREATE INDEX idx_user_notifications_user ON public.user_notifications(user_id);
CREATE INDEX idx_user_notifications_unread ON public.user_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_document_submissions_event ON public.document_submissions(event_id);
CREATE INDEX idx_document_submissions_user ON public.document_submissions(user_id);
CREATE INDEX idx_document_submissions_status ON public.document_submissions(status);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update conversation timestamp when new message arrives
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_conversations 
    SET updated_at = now() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_timestamp();

-- Update document submission timestamp
CREATE OR REPLACE FUNCTION public.update_document_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_document_submissions_timestamp
BEFORE UPDATE ON public.document_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_document_timestamp();

-- ============================================
-- ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;