
-- Update vendor RLS policies to allow authenticated users to create vendor records
DROP POLICY IF EXISTS "Users can create their own vendor records" ON public.vendors;
DROP POLICY IF EXISTS "Users can view their own vendor records" ON public.vendors;
DROP POLICY IF EXISTS "Users can update their own vendor records" ON public.vendors;
DROP POLICY IF EXISTS "Users can delete their own vendor records" ON public.vendors;

-- Create new policies that work with Supabase authentication
CREATE POLICY "Users can create vendor records"
  ON public.vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (firebase_uid = auth.uid()::text);

CREATE POLICY "Users can view their own vendor records"
  ON public.vendors
  FOR SELECT
  TO authenticated
  USING (firebase_uid = auth.uid()::text);

CREATE POLICY "Users can update their own vendor records"
  ON public.vendors
  FOR UPDATE
  TO authenticated
  USING (firebase_uid = auth.uid()::text);

CREATE POLICY "Users can delete their own vendor records"
  ON public.vendors
  FOR DELETE
  TO authenticated
  USING (firebase_uid = auth.uid()::text);
