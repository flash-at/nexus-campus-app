/*
  # Fix User Profile Issues

  1. Fixes
    - Add missing columns to users table
    - Ensure all related tables have proper foreign key constraints
    - Fix RLS policies to work with Firebase auth
    - Add proper triggers for related data creation

  2. Data Integrity
    - Add function to create missing related records
    - Fix any orphaned records
*/

-- Add missing profile_picture_url column to users if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'profile_picture_url'
    ) THEN
        ALTER TABLE public.users ADD COLUMN profile_picture_url TEXT;
    END IF;
END $$;

-- Add missing is_active column to users if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Ensure academic_info table exists with proper structure
CREATE TABLE IF NOT EXISTS public.academic_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
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
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  activity_points INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT now(),
  events_attended TEXT[] DEFAULT '{}',
  feedback_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure preferences table exists with proper structure
CREATE TABLE IF NOT EXISTS public.preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  theme theme_type DEFAULT 'System',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create or replace function to create related data for existing users
CREATE OR REPLACE FUNCTION public.ensure_user_related_data()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM public.users LOOP
        -- Create academic_info if missing
        IF NOT EXISTS (SELECT 1 FROM public.academic_info WHERE user_id = user_record.id) THEN
            INSERT INTO public.academic_info(user_id) VALUES (user_record.id);
        END IF;
        
        -- Create engagement if missing
        IF NOT EXISTS (SELECT 1 FROM public.engagement WHERE user_id = user_record.id) THEN
            INSERT INTO public.engagement(user_id, last_login) VALUES (user_record.id, now());
        END IF;
        
        -- Create preferences if missing
        IF NOT EXISTS (SELECT 1 FROM public.preferences WHERE user_id = user_record.id) THEN
            INSERT INTO public.preferences(user_id) VALUES (user_record.id);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the function to ensure all existing users have related data
SELECT public.ensure_user_related_data();

-- Fix RLS policies for all related tables
ALTER TABLE public.academic_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their academic info" ON public.academic_info;
CREATE POLICY "Users can manage their academic info"
ON public.academic_info
FOR ALL
USING (
  user_id IN (
    SELECT id FROM public.users 
    WHERE firebase_uid = auth.uid()::text
  )
);

ALTER TABLE public.engagement ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their engagement" ON public.engagement;
CREATE POLICY "Users can manage their engagement"
ON public.engagement
FOR ALL
USING (
  user_id IN (
    SELECT id FROM public.users 
    WHERE firebase_uid = auth.uid()::text
  )
);

ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their preferences" ON public.preferences;
CREATE POLICY "Users can manage their preferences"
ON public.preferences
FOR ALL
USING (
  user_id IN (
    SELECT id FROM public.users 
    WHERE firebase_uid = auth.uid()::text
  )
);

-- Create updated triggers for all tables
CREATE TRIGGER update_academic_info_updated_at
  BEFORE UPDATE ON public.academic_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_engagement_updated_at
  BEFORE UPDATE ON public.engagement
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at
  BEFORE UPDATE ON public.preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();