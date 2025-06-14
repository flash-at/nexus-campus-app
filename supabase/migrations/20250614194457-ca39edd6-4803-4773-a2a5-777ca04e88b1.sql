
-- Create activity_points_history table to track all points transactions
CREATE TABLE public.activity_points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.activity_points_history ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_points_history
CREATE POLICY "Users can view their own points history" 
  ON public.activity_points_history 
  FOR SELECT 
  USING (user_id IN (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text));

CREATE POLICY "Users can insert their own points history" 
  ON public.activity_points_history 
  FOR INSERT 
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text));

-- Create index for better performance
CREATE INDEX idx_activity_points_history_user_id ON public.activity_points_history(user_id);
CREATE INDEX idx_activity_points_history_created_at ON public.activity_points_history(created_at DESC);

-- Update existing users with account creation points if they don't have them
-- This ensures existing users get the 100 points bonus
UPDATE public.engagement 
SET activity_points = GREATEST(COALESCE(activity_points, 0), 100)
WHERE activity_points < 100 OR activity_points IS NULL;
