
import { supabase } from "@/integrations/supabase/client";

export interface PointsHistoryEntry {
  id: string;
  transaction_type: 'earned' | 'redeemed';
  points: number;
  reason: string;
  created_at: string;
}

export interface PointsTransaction {
  id: string;
  transaction_type: 'earned' | 'redeemed';
  points: number;
  reason: string;
  created_at: string;
}

export interface Voucher {
  id: string;
  title: string;
  description?: string;
  points_required: number;
  value: number;
  category: string;
  current_redemptions: number;
  max_redemptions: number;
  valid_until?: string;
  terms_conditions?: string;
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

  return (data || []).map(item => ({
    ...item,
    transaction_type: item.transaction_type as 'earned' | 'redeemed'
  }));
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

export const getAvailableVouchers = async (): Promise<Voucher[]> => {
  // Mock data for now - replace with actual Supabase query when vouchers table exists
  return [
    {
      id: '1',
      title: 'Coffee Shop Voucher',
      description: 'Get a free coffee at campus cafe',
      points_required: 100,
      value: 5,
      category: 'Food',
      current_redemptions: 5,
      max_redemptions: 50,
      terms_conditions: 'Valid for 30 days from redemption'
    },
    {
      id: '2',
      title: 'Bookstore Discount',
      description: '20% off on textbooks',
      points_required: 200,
      value: 10,
      category: 'Education',
      current_redemptions: 12,
      max_redemptions: 25,
      terms_conditions: 'Cannot be combined with other offers'
    }
  ];
};

export const redeemVoucher = async (voucherId: string, userId: string): Promise<boolean> => {
  // Mock implementation - replace with actual Supabase operations when needed
  console.log(`Redeeming voucher ${voucherId} for user ${userId}`);
  return true;
};
