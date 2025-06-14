
import { supabase } from "@/integrations/supabase/client";

export interface ActivityPointsTransaction {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  transaction_type: 'earned' | 'spent';
  created_at: string;
}

export const POINT_RULES = {
  ACCOUNT_CREATION: 100,
  FEEDBACK_SUBMISSION: 10,
  FEEDBACK_HERO: 50, // For 5+ feedbacks
  WORKSHOP_ATTENDANCE: 25,
  CLUB_JOIN: 50,
  CLUB_LEAVE_COST: 500,
  MINIMUM_CLUB_DAYS: 45
};

export const addActivityPoints = async (
  userId: string, 
  points: number, 
  reason: string,
  transactionType: 'earned' | 'spent' = 'earned'
): Promise<boolean> => {
  try {
    console.log(`Adding ${points} points to user ${userId} for: ${reason}`);
    
    // Start a transaction-like operation
    const { data: currentEngagement, error: fetchError } = await supabase
      .from('engagement')
      .select('activity_points')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching current points:', fetchError);
      return false;
    }

    const currentPoints = currentEngagement?.activity_points || 0;
    const newPoints = transactionType === 'earned' ? currentPoints + points : currentPoints - points;

    // Ensure points don't go negative
    if (newPoints < 0) {
      console.error('Insufficient points for transaction');
      return false;
    }

    // Update engagement table
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

    // Record the transaction using rpc or direct SQL
    try {
      const { error: transactionError } = await supabase.rpc('insert_activity_points_history', {
        p_user_id: userId,
        p_points: transactionType === 'earned' ? points : -points,
        p_reason: reason,
        p_transaction_type: transactionType
      });

      if (transactionError) {
        console.error('Error recording transaction via RPC:', transactionError);
        // Fallback: try direct insert with type assertion
        const { error: directInsertError } = await (supabase as any)
          .from('activity_points_history')
          .insert({
            user_id: userId,
            points: transactionType === 'earned' ? points : -points,
            reason,
            transaction_type: transactionType
          });

        if (directInsertError) {
          console.error('Error recording transaction via direct insert:', directInsertError);
        }
      }
    } catch (rpcError) {
      console.error('RPC function not available, using direct insert:', rpcError);
      // Fallback: try direct insert with type assertion
      const { error: directInsertError } = await (supabase as any)
        .from('activity_points_history')
        .insert({
          user_id: userId,
          points: transactionType === 'earned' ? points : -points,
          reason,
          transaction_type: transactionType
        });

      if (directInsertError) {
        console.error('Error recording transaction via direct insert:', directInsertError);
      }
    }

    console.log(`Successfully updated points. New total: ${newPoints}`);
    return true;
  } catch (error) {
    console.error('Error in addActivityPoints:', error);
    return false;
  }
};

export const getActivityPointsHistory = async (userId: string): Promise<ActivityPointsTransaction[]> => {
  try {
    // Use type assertion to work around TypeScript issues
    const { data, error } = await (supabase as any)
      .from('activity_points_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching points history:', error);
      return [];
    }

    // Ensure data matches our interface with proper type casting
    return (data || []).map((item: any): ActivityPointsTransaction => ({
      id: item.id,
      user_id: item.user_id,
      points: item.points,
      reason: item.reason,
      transaction_type: item.transaction_type as 'earned' | 'spent', // Type assertion for proper typing
      created_at: item.created_at
    }));
  } catch (error) {
    console.error('Error in getActivityPointsHistory:', error);
    return [];
  }
};

export const checkFeedbackHeroEligibility = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('engagement')
      .select('feedback_count')
      .eq('user_id', userId)
      .single();

    if (error) return false;
    
    const feedbackCount = data?.feedback_count || 0;
    return feedbackCount >= 5;
  } catch (error) {
    console.error('Error checking feedback hero eligibility:', error);
    return false;
  }
};

export const canLeaveClub = async (userId: string, clubId: string): Promise<{ canLeave: boolean; reason?: string }> => {
  try {
    // Check if user has been in club for at least 45 days
    const { data: membership, error } = await supabase
      .from('club_memberships')
      .select('joined_at')
      .eq('user_id', userId)
      .eq('club_id', clubId)
      .single();

    if (error || !membership) {
      return { canLeave: false, reason: 'Membership not found' };
    }

    const joinDate = new Date(membership.joined_at);
    const now = new Date();
    const daysDifference = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference < POINT_RULES.MINIMUM_CLUB_DAYS) {
      return { 
        canLeave: false, 
        reason: `You must be in the club for at least ${POINT_RULES.MINIMUM_CLUB_DAYS} days. ${POINT_RULES.MINIMUM_CLUB_DAYS - daysDifference} days remaining.` 
      };
    }

    // Check if user has enough points
    const { data: engagement, error: engagementError } = await supabase
      .from('engagement')
      .select('activity_points')
      .eq('user_id', userId)
      .single();

    if (engagementError || !engagement) {
      return { canLeave: false, reason: 'Unable to check activity points' };
    }

    if (engagement.activity_points < POINT_RULES.CLUB_LEAVE_COST) {
      return { 
        canLeave: false, 
        reason: `Insufficient points. You need ${POINT_RULES.CLUB_LEAVE_COST} points to leave the club.` 
      };
    }

    return { canLeave: true };
  } catch (error) {
    console.error('Error checking club leave eligibility:', error);
    return { canLeave: false, reason: 'Error checking eligibility' };
  }
};
