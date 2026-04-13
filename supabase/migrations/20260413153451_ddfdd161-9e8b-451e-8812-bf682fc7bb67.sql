
DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;

CREATE POLICY "Authenticated users can create communities"
ON public.communities
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);
