-- Add created_by column to invitation_templates to track ownership
ALTER TABLE public.invitation_templates 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can create invitation templates" ON public.invitation_templates;
DROP POLICY IF EXISTS "Authenticated users can update invitation templates" ON public.invitation_templates;
DROP POLICY IF EXISTS "Authenticated users can delete invitation templates" ON public.invitation_templates;

-- Create proper policies with ownership checks
CREATE POLICY "Users can create their own invitation templates"
ON public.invitation_templates
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own invitation templates"
ON public.invitation_templates
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by OR is_default = true);

CREATE POLICY "Users can delete their own invitation templates"
ON public.invitation_templates
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);