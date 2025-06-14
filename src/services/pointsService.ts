
import { supabase } from "@/integrations/supabase/client";

export interface PointsHistoryEntry {
  id: string;
  transaction_type: 'earned' | 'redeemed';
  points: number;
  reason: string;
  created_at: string;
}

export const getPointsHistory = async (userId: string): Promise<PointsHistoryEntry[]> => {
  const { data, error } = await supabase
    .from('activity_points_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching points history:", error);
    throw error;
  }

  return data || [];
};

export const getUserPoints = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('engagement')
    .select('activity_points')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error("Error fetching user points:", error);
    throw error;
  }

  return data?.activity_points || 0;
};
