-- Ensure the media_documents storage bucket exists and is PRIVATE
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media_documents',
  'media_documents',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop storage policies that may have been created with an incorrect bucket name
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Organizers can view documents for their events" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all documents" ON storage.objects;

-- Users: manage only their own top-level folder (name = userId/...) within the media_documents bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media_documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'media_documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media_documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Organizers: can view documents belonging to registrations for events they organize
CREATE POLICY "Organizers can view documents for their events"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'media_documents'
  AND EXISTS (
    SELECT 1
    FROM public.media_registrations mr
    JOIN public.events e ON e.id = mr.event_id
    WHERE mr.user_id::text = (storage.foldername(name))[1]
      AND e.organizer_id = auth.uid()
  )
);

-- Admins: can manage all documents in the bucket
CREATE POLICY "Admins can manage all documents"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'media_documents'
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'media_documents'
  AND public.has_role(auth.uid(), 'admin')
);
