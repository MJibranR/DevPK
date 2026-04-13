
-- Add creator_id column to communities to track who created it
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS creator_id uuid;

-- Allow authenticated users to create communities
CREATE POLICY "Authenticated users can create communities"
ON public.communities
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow creators to update their communities
CREATE POLICY "Creators can update their communities"
ON public.communities
FOR UPDATE
TO authenticated
USING (auth.uid() = creator_id);

-- Allow creators to delete their communities
CREATE POLICY "Creators can delete their communities"
ON public.communities
FOR DELETE
TO authenticated
USING (auth.uid() = creator_id);
