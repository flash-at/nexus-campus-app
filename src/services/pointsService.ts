
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

    // Type assertion to ensure proper typing
    return (data || []).map(item => ({
      ...item,
      transaction_type: item.transaction_type as 'earned' | 'spent' | 'redeemed'
    }));
  } catch (error) {
    console.error('Error fetching points history:', error);
    return [];
  }
};

export const getCurrentPoints = async (firebaseUid: string): Promise<number> => {
  try {
    // First get the user's internal ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (!userData) {
      return 0;
    }

    // Get current points from engagement table
    const { data: engagementData } = await supabase
      .from('engagement')
      .select('activity_points')
      .eq('user_id', userData.id)
      .single();

    return engagementData?.activity_points || 0;
  } catch (error) {
    console.error('Error fetching current points:', error);
    return 0;
  }
};

export const getAvailableVouchers = async (): Promise<Voucher[]> => {
  try {
    // Use raw query since vouchers table might not be in types yet
    const { data, error } = await supabase
      .rpc('exec_sql', { 
        query: `
          SELECT * FROM vouchers 
          WHERE is_active = true 
          ORDER BY points_required ASC
        `
      });

    if (error) {
      console.error('Error fetching vouchers:', error);
      return [];
    }

    return (data || []) as Voucher[];
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return [];
  }
};

export const getUserRedemptions = async (userId: string): Promise<VoucherRedemption[]> => {
  try {
    // Use raw query for voucher_redemptions
    const { data, error } = await supabase
      .rpc('exec_sql', { 
        query: `
          SELECT 
            vr.*,
            v.title as voucher_title,
            v.description as voucher_description,
            v.value as voucher_value,
            v.category as voucher_category
          FROM voucher_redemptions vr
          LEFT JOIN vouchers v ON vr.voucher_id = v.id
          WHERE vr.user_id = '${userId}'
          ORDER BY vr.redeemed_at DESC
        `
      });

    if (error) {
      console.error('Error fetching user redemptions:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      voucher_id: item.voucher_id,
      points_spent: item.points_spent,
      redemption_code: item.redemption_code,
      status: item.status,
      redeemed_at: item.redeemed_at,
      used_at: item.used_at,
      expires_at: item.expires_at,
      voucher: item.voucher_title ? {
        id: item.voucher_id,
        title: item.voucher_title,
        description: item.voucher_description,
        value: item.voucher_value,
        category: item.voucher_category,
        points_required: 0, // Will be filled separately if needed
        image_url: '',
        max_redemptions: 0,
        current_redemptions: 0,
        is_active: true,
        created_at: '',
        updated_at: ''
      } : undefined
    }));
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
    
    // Get voucher details using raw query
    const { data: voucherData, error: voucherError } = await supabase
      .rpc('exec_sql', { 
        query: `SELECT * FROM vouchers WHERE id = '${voucherId}' AND is_active = true`
      });

    if (voucherError || !voucherData || voucherData.length === 0) {
      return { success: false, error: 'Voucher not found' };
    }

    const voucher = voucherData[0] as Voucher;

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

    // Create redemption record using raw query
    const { data: redemptionData, error: redemptionError } = await supabase
      .rpc('exec_sql', { 
        query: `
          INSERT INTO voucher_redemptions (
            user_id, voucher_id, points_spent, redemption_code, expires_at
          ) VALUES (
            '${userId}', '${voucherId}', ${voucher.points_required}, 
            '${redemptionCode}', '${expiresAt.toISOString()}'
          ) RETURNING *
        `
      });

    if (redemptionError) {
      console.error('Error creating redemption:', redemptionError);
      return { success: false, error: 'Failed to process redemption' };
    }

    // Deduct points from user's engagement record
    const { error: pointsError } = await supabase
      .from('engagement')
      .update({ 
        activity_points: currentPoints - voucher.points_required,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (pointsError) {
      console.error('Error deducting points:', pointsError);
      return { success: false, error: 'Failed to deduct points' };
    }

    // Add transaction record
    await supabase
      .from('activity_points_history')
      .insert({
        user_id: userId,
        points: -voucher.points_required,
        transaction_type: 'redeemed',
        reason: `Redeemed: ${voucher.title}`,
        reference_id: redemptionData?.[0]?.id
      });

    // Update voucher redemption count
    await supabase
      .rpc('exec_sql', { 
        query: `
          UPDATE vouchers 
          SET current_redemptions = current_redemptions + 1,
              updated_at = now()
          WHERE id = '${voucherId}'
        `
      });

    const redemption: VoucherRedemption = {
      id: redemptionData?.[0]?.id || '',
      user_id: userId,
      voucher_id: voucherId,
      points_spent: voucher.points_required,
      redemption_code: redemptionCode,
      status: 'active',
      redeemed_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    };

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
    // Add to points history
    const { error: historyError } = await supabase
      .from('activity_points_history')
      .insert({
        user_id: userId,
        points: points,
        transaction_type: transactionType,
        reason: reason,
        reference_id: referenceId
      });

    if (historyError) {
      console.error('Error adding points history:', historyError);
      return false;
    }

    // Update user's total points in engagement table
    const { data: currentData } = await supabase
      .from('engagement')
      .select('activity_points')
      .eq('user_id', userId)
      .single();

    const currentPoints = currentData?.activity_points || 0;
    const newPoints = currentPoints + points;

    const { error: updateError } = await supabase
      .from('engagement')
      .update({ 
        activity_points: newPoints,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating points:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding points:', error);
    return false;
  }
};
