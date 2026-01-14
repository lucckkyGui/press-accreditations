-- Fix security issues: Block unauthenticated access to sensitive tables

-- 1. accreditation_requests - block public access
DROP POLICY IF EXISTS "Block unauthenticated access to accreditation_requests" ON public.accreditation_requests;
CREATE POLICY "Block unauthenticated access to accreditation_requests"
ON public.accreditation_requests
FOR SELECT
TO anon
USING (false);

-- 2. document_submissions - block public access
DROP POLICY IF EXISTS "Block unauthenticated access to document_submissions" ON public.document_submissions;
CREATE POLICY "Block unauthenticated access to document_submissions"
ON public.document_submissions
FOR SELECT
TO anon
USING (false);

-- 3. invitations - block public access to QR codes
DROP POLICY IF EXISTS "Block unauthenticated access to invitations" ON public.invitations;
CREATE POLICY "Block unauthenticated access to invitations"
ON public.invitations
FOR SELECT
TO anon
USING (false);