
-- Add columns to users table for profile picture and active status
ALTER TABLE public.users ADD COLUMN profile_picture_url TEXT;
ALTER TABLE public.users ADD COLUMN is_active BOOLEAN DEFAULT true;

-- The existing RLS policies on the users table will be updated to be more secure.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;

-- Recreate RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Allow user registration" ON public.users
  FOR INSERT WITH CHECK (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create academic_info table
CREATE TABLE public.academic_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_semester INTEGER,
  cgpa REAL,
  subjects_enrolled TEXT[],
  mentor_name TEXT,
  mentor_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.academic_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own academic info" ON public.academic_info
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Create engagement table
CREATE TABLE public.engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_points INTEGER DEFAULT 0,
  badges JSONB,
  last_login TIMESTAMP WITH TIME ZONE,
  events_attended TEXT[],
  feedback_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.engagement ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own engagement stats" ON public.engagement
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  doc_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  verified_by_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own documents" ON public.documents
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Create preferences table
CREATE TABLE public.preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'English',
  theme TEXT DEFAULT 'System',
  notifications_enabled BOOLEAN DEFAULT true,
  widgets_enabled JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own preferences" ON public.preferences
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Create storage bucket for user documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('user_documents', 'user_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for the new storage bucket
DROP POLICY IF EXISTS "Allow users to manage their own documents" ON storage.objects;
CREATE POLICY "Allow users to manage their own documents"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'user_documents' AND
    (storage.foldername(name))[1] = (
        SELECT id::text FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Create triggers to update the 'updated_at' timestamp for new tables
CREATE TRIGGER update_academic_info_updated_at BEFORE UPDATE ON public.academic_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_engagement_updated_at BEFORE UPDATE ON public.engagement
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON public.preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add a function to create related data when a new user is created
CREATE OR REPLACE FUNCTION public.create_user_related_data()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.academic_info(user_id) VALUES (NEW.id);
  INSERT INTO public.engagement(user_id, last_login) VALUES (NEW.id, now());
  INSERT INTO public.preferences(user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is inserted
CREATE TRIGGER on_user_created_create_related_data
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_related_data();
