
-- Create clubs table with proper UUID foreign key
CREATE TABLE public.clubs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text,
  chair_id uuid REFERENCES public.users(id),
  password text NOT NULL,
  max_members integer DEFAULT 50,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create club_memberships table
CREATE TABLE public.club_memberships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('member', 'chair', 'vice_chair')),
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, club_id)
);

-- Create activity_allocations table
CREATE TABLE public.activity_allocations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE,
  allocated_by uuid REFERENCES public.users(id),
  points integer NOT NULL,
  reason text,
  allocated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_allocations ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to get current user's UUID (fixed type casting)
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text;
$$;

-- RLS Policies for clubs
CREATE POLICY "Anyone can view clubs" ON public.clubs FOR SELECT USING (true);
CREATE POLICY "Club chairs can update their clubs" ON public.clubs FOR UPDATE 
  USING (chair_id = public.get_current_user_id());

-- RLS Policies for club_memberships
CREATE POLICY "Users can view their own memberships" ON public.club_memberships FOR SELECT 
  USING (user_id = public.get_current_user_id());
CREATE POLICY "Club chairs can view their club memberships" ON public.club_memberships FOR SELECT 
  USING (club_id IN (SELECT id FROM public.clubs WHERE chair_id = public.get_current_user_id()));
CREATE POLICY "Users can join clubs" ON public.club_memberships FOR INSERT 
  WITH CHECK (user_id = public.get_current_user_id());

-- RLS Policies for activity_allocations
CREATE POLICY "Users can view their own allocations" ON public.activity_allocations FOR SELECT 
  USING (student_id = public.get_current_user_id());
CREATE POLICY "Club chairs can view their club allocations" ON public.activity_allocations FOR SELECT 
  USING (club_id IN (SELECT id FROM public.clubs WHERE chair_id = public.get_current_user_id()));
CREATE POLICY "Club chairs can create allocations" ON public.activity_allocations FOR INSERT 
  WITH CHECK (club_id IN (SELECT id FROM public.clubs WHERE chair_id = public.get_current_user_id()));

-- Insert sample clubs with passwords (chair_id will be null initially)
INSERT INTO public.clubs (name, description, category, password) VALUES 
('Tech Club', 'Technology and programming enthusiasts', 'Technical', 'tech2024'),
('Arts Club', 'Creative arts and design', 'Cultural', 'arts2024'),
('Sports Club', 'Athletic activities and competitions', 'Sports', 'sports2024'),
('Music Club', 'Musical performances and learning', 'Cultural', 'music2024'),
('Drama Club', 'Theater and performing arts', 'Cultural', 'drama2024'),
('Photography Club', 'Photography and visual arts', 'Cultural', 'photo2024'),
('Debate Club', 'Public speaking and debates', 'Academic', 'debate2024'),
('Robotics Club', 'Robotics and automation', 'Technical', 'robot2024');

-- Add triggers for updated_at
CREATE TRIGGER update_clubs_updated_at
  BEFORE UPDATE ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update user activity points when allocation is made
CREATE OR REPLACE FUNCTION public.update_user_activity_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.engagement 
  SET activity_points = COALESCE(activity_points, 0) + NEW.points,
      updated_at = now()
  WHERE user_id = NEW.student_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update user points when allocation is made
CREATE TRIGGER on_activity_allocation_created
  AFTER INSERT ON public.activity_allocations
  FOR EACH ROW EXECUTE FUNCTION public.update_user_activity_points();
