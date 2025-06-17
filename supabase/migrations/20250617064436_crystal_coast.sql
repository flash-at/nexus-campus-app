/*
  # Complete CampusConnect Database Schema Setup

  1. Tables Creation
    - Create all necessary tables with proper relationships
    - Set up foreign key constraints
    - Add indexes for performance

  2. Functions
    - User registration handling
    - Profile creation utilities
    - Authentication helpers

  3. Security
    - Row Level Security policies
    - Proper access controls
    - Anonymous registration support
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table if it doesn't exist
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

-- Create engagement table if it doesn't exist
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

-- Create academic_info table if it doesn't exist
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

-- Create preferences table if it doesn't exist
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

-- Create activity_points_history table if it doesn't exist
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

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert into users table
  INSERT INTO users (
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
  ) ON CONFLICT (user_id) DO NOTHING;

  -- Create academic_info record
  INSERT INTO academic_info (
    user_id
  ) VALUES (
    new_user_id
  ) ON CONFLICT (user_id) DO NOTHING;

  -- Create preferences record
  INSERT INTO preferences (
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
  FROM users
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
  FROM users u
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
  
  RETURN new_user_id;
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
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION user_exists_by_firebase_uid(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_by_firebase_uid(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_user_profile(text, text, text, text, text, text, text, boolean) TO authenticated, anon;

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
    EXECUTE FUNCTION update_updated_at_column();