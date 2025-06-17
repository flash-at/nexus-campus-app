/*
  # Add Missing Columns and Fix Data Types

  1. Add missing columns that might be referenced in the application
  2. Fix any data type mismatches
  3. Add proper constraints and defaults
*/

-- Add missing columns to users table if they don't exist
DO $$
BEGIN
  -- Add profile_picture_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'profile_picture_url'
  ) THEN
    ALTER TABLE users ADD COLUMN profile_picture_url text;
  END IF;

  -- Add is_active if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE users ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add missing columns to engagement table if they don't exist
DO $$
BEGIN
  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'engagement' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE engagement ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add missing columns to academic_info table if they don't exist
DO $$
BEGIN
  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'academic_info' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE academic_info ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add missing columns to preferences table if they don't exist
DO $$
BEGIN
  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'preferences' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE preferences ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Ensure proper defaults and constraints
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'student';
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT false;
ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE users ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE engagement ALTER COLUMN activity_points SET DEFAULT 0;
ALTER TABLE engagement ALTER COLUMN feedback_count SET DEFAULT 0;
ALTER TABLE engagement ALTER COLUMN badges SET DEFAULT '[]'::jsonb;
ALTER TABLE engagement ALTER COLUMN events_attended SET DEFAULT '{}'::text[];
ALTER TABLE engagement ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE engagement ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE preferences ALTER COLUMN theme SET DEFAULT 'System';
ALTER TABLE preferences ALTER COLUMN notifications_enabled SET DEFAULT true;
ALTER TABLE preferences ALTER COLUMN language SET DEFAULT 'English';
ALTER TABLE preferences ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE preferences ALTER COLUMN updated_at SET DEFAULT now();

-- Add unique constraints where needed
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_firebase_uid_unique UNIQUE (firebase_uid);
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_hall_ticket_unique UNIQUE (hall_ticket);
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_email_unique UNIQUE (email);

-- Add foreign key constraints where missing
ALTER TABLE academic_info ADD CONSTRAINT IF NOT EXISTS academic_info_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE engagement ADD CONSTRAINT IF NOT EXISTS engagement_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE preferences ADD CONSTRAINT IF NOT EXISTS preferences_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE documents ADD CONSTRAINT IF NOT EXISTS documents_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE activity_points_history ADD CONSTRAINT IF NOT EXISTS activity_points_history_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;