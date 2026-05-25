-- Block anonymous access to profiles table
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Storage policies for media_documents bucket (private bucket)

-- Only allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Media Documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own uploaded documents
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'Media Documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'Media Documents' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'Media Documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can delete any documents
CREATE POLICY "Admins can delete any documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'Media Documents' 
  AND public.has_role(auth.uid(), 'admin')
);