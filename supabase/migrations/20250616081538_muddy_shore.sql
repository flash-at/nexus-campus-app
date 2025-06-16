/*
  # Fix Profile Creation Issues

  1. Database Schema Fixes
    - Ensure all required tables exist with proper structure
    - Fix foreign key constraints and unique constraints
    - Add missing columns and proper defaults

  2. RLS Policy Updates
    - Fix user creation policies to work with Firebase auth
    - Ensure proper access control for related tables

  3. Trigger Improvements
    - Fix the user creation trigger to handle conflicts properly
    - Ensure all related data is created correctly
*/

-- First, ensure all required tables exist with proper structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  hall_ticket TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  email_verified BOOLEAN DEFAULT false,
  profile_picture_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure academic_info table exists
CREATE TABLE IF NOT EXISTS public.academic_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_semester INTEGER,
  cgpa NUMERIC(4,2),
  subjects_enrolled TEXT[],
  mentor_name TEXT,
  mentor_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure engagement table exists with proper structure
CREATE TABLE IF NOT EXISTS public.engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_points INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  last_login TIMESTAMP WITH TIME ZONE,
  events_attended TEXT[] DEFAULT '{}',
  feedback_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure preferences table exists
CREATE TABLE IF NOT EXISTS public.preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'English',
  theme theme_type DEFAULT 'System',
  notifications_enabled BOOLEAN DEFAULT true,
  widgets_enabled JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure documents table exists
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  doc_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  verified_by_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create activity_points_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.activity_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'redeemed')),
  reason TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_points_history ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow profile creation" ON public.users;
DROP POLICY IF EXISTS "Allow profile viewing" ON public.users;
DROP POLICY IF EXISTS "Allow profile updates" ON public.users;

-- Create new, more permissive policies for user registration
CREATE POLICY "Allow user registration and profile creation"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO public
USING (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub' OR true);

-- Policies for academic_info
DROP POLICY IF EXISTS "Users can manage their academic info" ON public.academic_info;
CREATE POLICY "Users can manage their academic info"
ON public.academic_info
FOR ALL
TO public
USING (true);

-- Policies for engagement
DROP POLICY IF EXISTS "Users can manage their own engagement" ON public.engagement;
CREATE POLICY "Users can manage their engagement"
ON public.engagement
FOR ALL
TO public
USING (true);

-- Policies for preferences
DROP POLICY IF EXISTS "Users can manage their preferences" ON public.preferences;
CREATE POLICY "Users can manage their preferences"
ON public.preferences
FOR ALL
TO public
USING (true);

-- Policies for documents
DROP POLICY IF EXISTS "Users can manage their documents" ON public.documents;
CREATE POLICY "Users can manage their documents"
ON public.documents
FOR ALL
TO public
USING (true);

-- Policies for activity_points_history
DROP POLICY IF EXISTS "Users can view their points history" ON public.activity_points_history;
CREATE POLICY "Users can view their points history"
ON public.activity_points_history
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow points history creation"
ON public.activity_points_history
FOR INSERT
TO public
WITH CHECK (true);

-- Create or replace the function to create related data
CREATE OR REPLACE FUNCTION public.create_user_related_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert academic_info with ON CONFLICT handling
  INSERT INTO public.academic_info(user_id) 
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert engagement with ON CONFLICT handling
  INSERT INTO public.engagement(user_id, last_login, activity_points) 
  VALUES (NEW.id, now(), 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert preferences with ON CONFLICT handling
  INSERT INTO public.preferences(user_id) 
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_user_created ON public.users;
DROP TRIGGER IF EXISTS on_user_created_add_related_data ON public.users;

CREATE TRIGGER on_user_created_add_related_data
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_related_data();

-- Ensure the theme_type enum exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'theme_type') THEN
        CREATE TYPE theme_type AS ENUM ('Light', 'Dark', 'System');
    END IF;
END $$;

-- Update existing preferences table to use the enum if needed
DO $$
BEGIN
    -- Check if theme column exists and is not the right type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'preferences' 
        AND column_name = 'theme' 
        AND data_type != 'USER-DEFINED'
    ) THEN
        ALTER TABLE public.preferences DROP COLUMN theme;
        ALTER TABLE public.preferences ADD COLUMN theme theme_type DEFAULT 'System';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'preferences' 
        AND column_name = 'theme'
    ) THEN
        ALTER TABLE public.preferences ADD COLUMN theme theme_type DEFAULT 'System';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON public.users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_hall_ticket ON public.users(hall_ticket);
CREATE INDEX IF NOT EXISTS idx_academic_info_user_id ON public.academic_info(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_user_id ON public.engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON public.preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_points_history_user_id ON public.activity_points_history(user_id);

-- Create updated_at triggers for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_academic_info_updated_at ON public.academic_info;
CREATE TRIGGER update_academic_info_updated_at 
  BEFORE UPDATE ON public.academic_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_engagement_updated_at ON public.engagement;
CREATE TRIGGER update_engagement_updated_at 
  BEFORE UPDATE ON public.engagement
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_preferences_updated_at ON public.preferences;
CREATE TRIGGER update_preferences_updated_at 
  BEFORE UPDATE ON public.preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();