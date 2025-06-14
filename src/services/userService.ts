
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  firebase_uid: string;
  full_name: string;
  email: string;
  hall_ticket: string;
  department: string;
  academic_year: string;
  phone_number: string;
  profile_picture_url?: string;
  is_active: boolean;
  email_verified: boolean;
  role: string;
  created_at: string;
  updated_at: string;
  academic_info?: {
    current_semester?: number;
    cgpa?: number;
    subjects_enrolled?: string[];
    mentor_name?: string;
    mentor_email?: string;
  };
  engagement?: {
    activity_points?: number;
    badges?: any[];
    last_login?: string;
    feedback_count?: number;
    events_attended?: string[];
  };
  preferences?: {
    theme?: string;
    language?: string;
    notifications_enabled?: boolean;
  };
}

interface CreateProfileData {
  fullName: string;
  hallTicket: string;
  department: string;
  academicYear: string;
  phoneNumber: string;
}

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select(`
      *,
      academic_info(*),
      engagement(*),
      preferences(*)
    `)
    .eq('firebase_uid', userId)
    .single();

  if (userError) {
    console.error("Error fetching user profile:", userError);
    throw userError;
  }

  return {
    ...user,
    engagement: user.engagement ? {
      ...user.engagement,
      badges: Array.isArray(user.engagement.badges) ? user.engagement.badges : []
    } : undefined
  };
};

export const createUserProfile = async (user: User, profileData: CreateProfileData): Promise<UserProfile | null> => {
  try {
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        firebase_uid: user.id,
        full_name: profileData.fullName,
        email: user.email || '',
        hall_ticket: profileData.hallTicket,
        department: profileData.department,
        academic_year: profileData.academicYear,
        phone_number: profileData.phoneNumber,
        email_verified: !!user.email_confirmed_at,
        role: 'student'
      })
      .select()
      .single();

    if (userError) {
      console.error("Error creating user profile:", userError);
      throw userError;
    }

    return newUser;
  } catch (error) {
    console.error("Error in createUserProfile:", error);
    throw error;
  }
};

export const checkHallTicketExists = async (hallTicket: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('hall_ticket', hallTicket)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.error("Error checking hall ticket:", error);
    throw error;
  }

  return !!data;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('firebase_uid', userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    throw error;
  }
};
