/*
  # User Management Functions and Policies

  1. Functions
    - handle_new_user: Trigger function for user registration
    - user_exists_by_firebase_uid: Check if user exists
    - get_user_by_firebase_uid: Get user profile by Firebase UID
    - create_user_profile: Safely create user profile with related records

  2. Security
    - Updated RLS policies for user creation and access
    - Proper permissions for authentication flow
    - Allow anonymous access during registration
*/

-- Create a function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert into users table
  INSERT INTO public.users (
    firebase_uid,
    email,
    email_verified,
    full_name,
    role,
    hall_ticket,
    department,
    academic_year,
    phone_number
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'student',
    COALESCE(NEW.raw_user_meta_data->>'hall_ticket', ''),
    COALESCE(NEW.raw_user_meta_data->>'department', ''),
    COALESCE(NEW.raw_user_meta_data->>'academic_year', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', '')
  ) ON CONFLICT (firebase_uid) DO UPDATE SET
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified,
    updated_at = now()
  RETURNING id INTO new_user_id;

  -- Create engagement record
  INSERT INTO public.engagement (
    user_id,
    activity_points,
    badges,
    events_attended,
    feedback_count
  ) VALUES (
    new_user_id,
    0,
    '[]'::jsonb,
    '{}'::text[],
    0
  ) ON CONFLICT (user_id) DO NOTHING;

  -- Create academic_info record
  INSERT INTO public.academic_info (
    user_id
  ) VALUES (
    new_user_id
  ) ON CONFLICT (user_id) DO NOTHING;

  -- Create preferences record
  INSERT INTO public.preferences (
    user_id,
    theme,
    notifications_enabled
  ) VALUES (
    new_user_id,
    'System',
    true
  ) ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create function to check if user exists by Firebase UID
CREATE OR REPLACE FUNCTION user_exists_by_firebase_uid(p_firebase_uid text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count integer;
BEGIN
  SELECT COUNT(*) INTO user_count
  FROM public.users
  WHERE firebase_uid = p_firebase_uid;
  
  RETURN user_count > 0;
END;
$$;

-- Create function to get user by Firebase UID
CREATE OR REPLACE FUNCTION get_user_by_firebase_uid(p_firebase_uid text)
RETURNS TABLE(
  id uuid,
  firebase_uid text,
  full_name text,
  hall_ticket text,
  email text,
  department text,
  academic_year text,
  phone_number text,
  role text,
  email_verified boolean,
  profile_picture_url text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.firebase_uid,
    u.full_name,
    u.hall_ticket,
    u.email,
    u.department,
    u.academic_year,
    u.phone_number,
    u.role,
    u.email_verified,
    u.profile_picture_url,
    u.is_active,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE u.firebase_uid = p_firebase_uid;
END;
$$;

-- Create function to safely create user profile
CREATE OR REPLACE FUNCTION create_user_profile(
  p_firebase_uid text,
  p_full_name text,
  p_hall_ticket text,
  p_email text,
  p_department text,
  p_academic_year text,
  p_phone_number text,
  p_email_verified boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert the user
  INSERT INTO public.users (
    firebase_uid,
    full_name,
    hall_ticket,
    email,
    department,
    academic_year,
    phone_number,
    email_verified,
    role,
    is_active
  ) VALUES (
    p_firebase_uid,
    p_full_name,
    p_hall_ticket,
    p_email,
    p_department,
    p_academic_year,
    p_phone_number,
    p_email_verified,
    'student',
    true
  ) RETURNING id INTO new_user_id;

  -- Create engagement record
  INSERT INTO public.engagement (
    user_id,
    activity_points,
    badges,
    events_attended,
    feedback_count
  ) VALUES (
    new_user_id,
    0,
    '[]'::jsonb,
    '{}'::text[],
    0
  );

  -- Create academic_info record
  INSERT INTO public.academic_info (
    user_id
  ) VALUES (
    new_user_id
  );

  -- Create preferences record
  INSERT INTO public.preferences (
    user_id,
    theme,
    notifications_enabled
  ) VALUES (
    new_user_id,
    'System',
    true
  );
  
  RETURN new_user_id;
END;
$$;

-- Update RLS policies to be more permissive for user creation
DROP POLICY IF EXISTS "Allow user creation during registration" ON public.users;
CREATE POLICY "Allow user creation during registration"
  ON public.users
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Allow reading user data for authentication purposes
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated, anon
  USING (
    firebase_uid = (auth.jwt() ->> 'sub') OR
    firebase_uid IS NULL -- Allow reading during creation process
  );

-- Allow updating user profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (firebase_uid = (auth.jwt() ->> 'sub'))
  WITH CHECK (firebase_uid = (auth.jwt() ->> 'sub'));

-- Make related record creation more permissive
DROP POLICY IF EXISTS "Allow engagement creation" ON public.engagement;
CREATE POLICY "Allow engagement creation"
  ON public.engagement
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own engagement" ON public.engagement;
CREATE POLICY "Users can read own engagement"
  ON public.engagement
  FOR SELECT
  TO authenticated, anon
  USING (
    user_id IN (
      SELECT id FROM public.users WHERE firebase_uid = (auth.jwt() ->> 'sub')
    ) OR
    user_id IS NULL -- Allow reading during creation
  );

DROP POLICY IF EXISTS "Allow academic info creation" ON public.academic_info;
CREATE POLICY "Allow academic info creation"
  ON public.academic_info
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own academic info" ON public.academic_info;
CREATE POLICY "Users can read own academic info"
  ON public.academic_info
  FOR SELECT
  TO authenticated, anon
  USING (
    user_id IN (
      SELECT id FROM public.users WHERE firebase_uid = (auth.jwt() ->> 'sub')
    ) OR
    user_id IS NULL -- Allow reading during creation
  );

DROP POLICY IF EXISTS "Allow preferences creation" ON public.preferences;
CREATE POLICY "Allow preferences creation"
  ON public.preferences
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own preferences" ON public.preferences;
CREATE POLICY "Users can read own preferences"
  ON public.preferences
  FOR SELECT
  TO authenticated, anon
  USING (
    user_id IN (
      SELECT id FROM public.users WHERE firebase_uid = (auth.jwt() ->> 'sub')
    ) OR
    user_id IS NULL -- Allow reading during creation
  );

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION user_exists_by_firebase_uid(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_by_firebase_uid(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_user_profile(text, text, text, text, text, text, text, boolean) TO authenticated, anon;