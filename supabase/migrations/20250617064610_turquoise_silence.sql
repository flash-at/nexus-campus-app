/*
  # Fix User Profile Not Found Issue

  1. Ensure all tables exist with proper structure
  2. Create helper functions for user management
  3. Set up proper RLS policies
  4. Add data validation and error handling
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure users table exists with all required columns
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid text UNIQUE NOT NULL,
  full_name text NOT NULL,
  hall_ticket text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  department text NOT NULL,
  academic_year text NOT NULL,
  phone_number text NOT NULL,
  role text DEFAULT 'student',
  email_verified boolean DEFAULT false,
  profile_picture_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure engagement table exists
CREATE TABLE IF NOT EXISTS engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_points integer DEFAULT 0,
  badges jsonb DEFAULT '[]'::jsonb,
  last_login timestamptz,
  events_attended text[] DEFAULT '{}',
  feedback_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure academic_info table exists
CREATE TABLE IF NOT EXISTS academic_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_semester integer,
  cgpa numeric(3,2),
  subjects_enrolled text[],
  mentor_name text,
  mentor_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure preferences table exists
CREATE TABLE IF NOT EXISTS preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme text DEFAULT 'System' CHECK (theme IN ('Light', 'Dark', 'System')),
  language text DEFAULT 'English',
  notifications_enabled boolean DEFAULT true,
  widgets_enabled jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure activity_points_history table exists
CREATE TABLE IF NOT EXISTS activity_points_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'redeemed')),
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_points_history ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_hall_ticket ON users(hall_ticket);
CREATE INDEX IF NOT EXISTS idx_engagement_user_id ON engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_academic_info_user_id ON academic_info(user_id);
CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_points_history_user_id ON activity_points_history(user_id);

-- Create comprehensive user profile creation function
CREATE OR REPLACE FUNCTION create_complete_user_profile(
  p_firebase_uid text,
  p_full_name text,
  p_hall_ticket text,
  p_email text,
  p_department text,
  p_academic_year text,
  p_phone_number text,
  p_email_verified boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Insert the user
  INSERT INTO users (
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
  INSERT INTO engagement (
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
  INSERT INTO academic_info (
    user_id
  ) VALUES (
    new_user_id
  );

  -- Create preferences record
  INSERT INTO preferences (
    user_id,
    theme,
    notifications_enabled
  ) VALUES (
    new_user_id,
    'System',
    true
  );

  -- Return the complete user profile
  SELECT json_build_object(
    'id', u.id,
    'firebase_uid', u.firebase_uid,
    'full_name', u.full_name,
    'hall_ticket', u.hall_ticket,
    'email', u.email,
    'department', u.department,
    'academic_year', u.academic_year,
    'phone_number', u.phone_number,
    'role', u.role,
    'email_verified', u.email_verified,
    'profile_picture_url', u.profile_picture_url,
    'is_active', u.is_active,
    'created_at', u.created_at,
    'updated_at', u.updated_at,
    'engagement', json_build_object(
      'activity_points', e.activity_points,
      'badges', e.badges,
      'events_attended', e.events_attended,
      'feedback_count', e.feedback_count
    ),
    'academic_info', json_build_object(
      'current_semester', a.current_semester,
      'cgpa', a.cgpa,
      'subjects_enrolled', a.subjects_enrolled,
      'mentor_name', a.mentor_name,
      'mentor_email', a.mentor_email
    ),
    'preferences', json_build_object(
      'theme', p.theme,
      'language', p.language,
      'notifications_enabled', p.notifications_enabled,
      'widgets_enabled', p.widgets_enabled
    )
  ) INTO result
  FROM users u
  LEFT JOIN engagement e ON u.id = e.user_id
  LEFT JOIN academic_info a ON u.id = a.user_id
  LEFT JOIN preferences p ON u.id = p.user_id
  WHERE u.id = new_user_id;
  
  RETURN result;
END;
$$;

-- Create function to get complete user profile by Firebase UID
CREATE OR REPLACE FUNCTION get_complete_user_profile(p_firebase_uid text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'id', u.id,
    'firebase_uid', u.firebase_uid,
    'full_name', u.full_name,
    'hall_ticket', u.hall_ticket,
    'email', u.email,
    'department', u.department,
    'academic_year', u.academic_year,
    'phone_number', u.phone_number,
    'role', u.role,
    'email_verified', u.email_verified,
    'profile_picture_url', u.profile_picture_url,
    'is_active', u.is_active,
    'created_at', u.created_at,
    'updated_at', u.updated_at,
    'engagement', CASE 
      WHEN e.user_id IS NOT NULL THEN json_build_object(
        'activity_points', e.activity_points,
        'badges', e.badges,
        'events_attended', e.events_attended,
        'feedback_count', e.feedback_count
      )
      ELSE NULL
    END,
    'academic_info', CASE 
      WHEN a.user_id IS NOT NULL THEN json_build_object(
        'current_semester', a.current_semester,
        'cgpa', a.cgpa,
        'subjects_enrolled', a.subjects_enrolled,
        'mentor_name', a.mentor_name,
        'mentor_email', a.mentor_email
      )
      ELSE NULL
    END,
    'preferences', CASE 
      WHEN p.user_id IS NOT NULL THEN json_build_object(
        'theme', p.theme,
        'language', p.language,
        'notifications_enabled', p.notifications_enabled,
        'widgets_enabled', p.widgets_enabled
      )
      ELSE NULL
    END
  ) INTO result
  FROM users u
  LEFT JOIN engagement e ON u.id = e.user_id
  LEFT JOIN academic_info a ON u.id = a.user_id
  LEFT JOIN preferences p ON u.id = p.user_id
  WHERE u.firebase_uid = p_firebase_uid;
  
  RETURN result;
END;
$$;

-- Create function to check if user exists
CREATE OR REPLACE FUNCTION user_exists_by_firebase_uid(p_firebase_uid text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count integer;
BEGIN
  SELECT COUNT(*) INTO user_count
  FROM users
  WHERE firebase_uid = p_firebase_uid;
  
  RETURN user_count > 0;
END;
$$;

-- Create function to check if email exists
CREATE OR REPLACE FUNCTION email_exists(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_count integer;
BEGIN
  SELECT COUNT(*) INTO email_count
  FROM users
  WHERE email = p_email;
  
  RETURN email_count > 0;
END;
$$;

-- Create function to check if hall ticket exists
CREATE OR REPLACE FUNCTION hall_ticket_exists(p_hall_ticket text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ticket_count integer;
BEGIN
  SELECT COUNT(*) INTO ticket_count
  FROM users
  WHERE hall_ticket = p_hall_ticket;
  
  RETURN ticket_count > 0;
END;
$$;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Allow user creation during registration" ON users;
CREATE POLICY "Allow user creation during registration"
  ON users
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated, anon
  USING (
    firebase_uid = (auth.jwt() ->> 'sub') OR
    firebase_uid IS NULL
  );

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (firebase_uid = (auth.jwt() ->> 'sub'))
  WITH CHECK (firebase_uid = (auth.jwt() ->> 'sub'));

-- RLS Policies for engagement table
DROP POLICY IF EXISTS "Allow engagement creation" ON engagement;
CREATE POLICY "Allow engagement creation"
  ON engagement
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own engagement" ON engagement;
CREATE POLICY "Users can read own engagement"
  ON engagement
  FOR SELECT
  TO authenticated, anon
  USING (
    user_id IN (
      SELECT id FROM users WHERE firebase_uid = (auth.jwt() ->> 'sub')
    ) OR
    user_id IS NULL
  );

DROP POLICY IF EXISTS "Users can update own engagement" ON engagement;
CREATE POLICY "Users can update own engagement"
  ON engagement
  FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE firebase_uid = (auth.jwt() ->> 'sub')
    )
  );

-- RLS Policies for academic_info table
DROP POLICY IF EXISTS "Allow academic info creation" ON academic_info;
CREATE POLICY "Allow academic info creation"
  ON academic_info
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own academic info" ON academic_info;
CREATE POLICY "Users can read own academic info"
  ON academic_info
  FOR SELECT
  TO authenticated, anon
  USING (
    user_id IN (
      SELECT id FROM users WHERE firebase_uid = (auth.jwt() ->> 'sub')
    ) OR
    user_id IS NULL
  );

-- RLS Policies for preferences table
DROP POLICY IF EXISTS "Allow preferences creation" ON preferences;
CREATE POLICY "Allow preferences creation"
  ON preferences
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own preferences" ON preferences;
CREATE POLICY "Users can read own preferences"
  ON preferences
  FOR SELECT
  TO authenticated, anon
  USING (
    user_id IN (
      SELECT id FROM users WHERE firebase_uid = (auth.jwt() ->> 'sub')
    ) OR
    user_id IS NULL
  );

-- RLS Policies for activity_points_history table
DROP POLICY IF EXISTS "Users can read own points history" ON activity_points_history;
CREATE POLICY "Users can read own points history"
  ON activity_points_history
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE firebase_uid = (auth.jwt() ->> 'sub')
    )
  );

DROP POLICY IF EXISTS "Allow points history creation" ON activity_points_history;
CREATE POLICY "Allow points history creation"
  ON activity_points_history
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION create_complete_user_profile(text, text, text, text, text, text, text, boolean) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_complete_user_profile(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION user_exists_by_firebase_uid(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION email_exists(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION hall_ticket_exists(text) TO authenticated, anon;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_engagement_updated_at ON engagement;
CREATE TRIGGER update_engagement_updated_at
    BEFORE UPDATE ON engagement
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_academic_info_updated_at ON academic_info;
CREATE TRIGGER update_academic_info_updated_at
    BEFORE UPDATE ON academic_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_preferences_updated_at ON preferences;
CREATE TRIGGER update_preferences_updated_at
    BEFORE UPDATE ON preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_preferences_updated_at_column();