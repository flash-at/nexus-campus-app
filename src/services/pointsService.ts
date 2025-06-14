
import { supabase } from "@/integrations/supabase/client";

export interface PointsTransaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: 'earned' | 'spent' | 'redeemed';
  reason: string;
  reference_id?: string;
  created_at: string;
  created_by?: string;
  metadata?: any;
}

export interface Voucher {
  id: string;
  title: string;
  description?: string;
  points_required: number;
  value: number;
  category: string;
  image_url?: string;
  terms_conditions?: string;
  valid_until?: string;
  max_redemptions: number;
  current_redemptions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoucherRedemption {
  id: string;
  user_id: string;
  voucher_id: string;
  points_spent: number;
  redemption_code: string;
  status: 'active' | 'used' | 'expired';
  redeemed_at: string;
  used_at?: string;
  expires_at: string;
  voucher?: Voucher;
}

export const getPointsHistory = async (userId: string): Promise<PointsTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('activity_points_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching points history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching points history:', error);
    return [];
  }
};

export const getCurrentPoints = async (firebaseUid: string): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('get_user_points', {
      user_firebase_uid: firebaseUid
    });

    if (error) {
      console.error('Error fetching current points:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Error fetching current points:', error);
    return 0;
  }
};

export const getAvailableVouchers = async (): Promise<Voucher[]> => {
  try {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('is_active', true)
      .order('points_required', { ascending: true });

    if (error) {
      console.error('Error fetching vouchers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return [];
  }
};

export const getUserRedemptions = async (userId: string): Promise<VoucherRedemption[]> => {
  try {
    const { data, error } = await supabase
      .from('voucher_redemptions')
      .select(`
        *,
        voucher:vouchers(*)
      `)
      .eq('user_id', userId)
      .order('redeemed_at', { ascending: false });

    if (error) {
      console.error('Error fetching user redemptions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user redemptions:', error);
    return [];
  }
};

export const redeemVoucher = async (
  voucherId: string,
  userId: string
): Promise<{ success: boolean; redemption?: VoucherRedemption; error?: string }> => {
  try {
    // Generate unique redemption code
    const redemptionCode = `CC-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    // Get voucher details first
    const { data: voucher, error: voucherError } = await supabase
      .from('vouchers')
      .select('*')
      .eq('id', voucherId)
      .single();

    if (voucherError || !voucher) {
      return { success: false, error: 'Voucher not found' };
    }

    // Check if user has enough points
    const { data: userData } = await supabase
      .from('users')
      .select('id, firebase_uid')
      .eq('id', userId)
      .single();

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    const currentPoints = await getCurrentPoints(userData.firebase_uid);
    if (currentPoints < voucher.points_required) {
      return { success: false, error: 'Insufficient points' };
    }

    // Calculate expiry date (30 days from redemption)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create redemption record
    const { data: redemption, error: redemptionError } = await supabase
      .from('voucher_redemptions')
      .insert({
        user_id: userId,
        voucher_id: voucherId,
        points_spent: voucher.points_required,
        redemption_code: redemptionCode,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (redemptionError) {
      console.error('Error creating redemption:', redemptionError);
      return { success: false, error: 'Failed to process redemption' };
    }

    // Deduct points using secure function
    const { error: pointsError } = await supabase.rpc('add_activity_points', {
      target_user_id: userId,
      points_amount: -voucher.points_required,
      transaction_reason: `Redeemed: ${voucher.title}`,
      transaction_type: 'redeemed',
      reference_id: redemption.id
    });

    if (pointsError) {
      console.error('Error deducting points:', pointsError);
      // Try to rollback redemption
      await supabase
        .from('voucher_redemptions')
        .delete()
        .eq('id', redemption.id);
      return { success: false, error: 'Failed to deduct points' };
    }

    // Update voucher redemption count
    await supabase
      .from('vouchers')
      .update({ 
        current_redemptions: voucher.current_redemptions + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', voucherId);

    return { success: true, redemption };
  } catch (error) {
    console.error('Error redeeming voucher:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const addPoints = async (
  userId: string,
  points: number,
  reason: string,
  transactionType: 'earned' | 'spent' = 'earned',
  referenceId?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('add_activity_points', {
      target_user_id: userId,
      points_amount: points,
      transaction_reason: reason,
      transaction_type: transactionType,
      reference_id: referenceId
    });

    if (error) {
      console.error('Error adding points:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding points:', error);
    return false;
  }
};
