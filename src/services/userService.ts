import { supabase } from "@/integrations/supabase/client";
import { User } from "firebase/auth";
import { Database } from "@/integrations/supabase/types";

type UserProfileTable = Database['public']['Tables']['users']['Row'];
type AcademicInfoTable = Database['public']['Tables']['academic_info']['Row'];
type EngagementTable = Database['public']['Tables']['engagement']['Row'];

export type UserProfile = UserProfileTable;

export interface FullUserProfile extends UserProfile {
  academic_info: AcademicInfoTable | null;
  engagement: EngagementTable | null;
}

export const checkHallTicketExists = async (hallTicket: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("hall_ticket")
      .eq("hall_ticket", hallTicket)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error checking hall ticket:", error);
      return false;
    }

    return data !== null;
  } catch (error) {
    console.error("Error checking hall ticket:", error);
    return false;
  }
};

export const createUserProfile = async (
  firebaseUser: User,
  additionalData: {
    fullName: string;
    hallTicket: string;
    department: string;
    academicYear: string;
    phoneNumber: string;
  }
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert({
        firebase_uid: firebaseUser.uid,
        full_name: additionalData.fullName,
        hall_ticket: additionalData.hallTicket,
        email: firebaseUser.email!,
        department: additionalData.department,
        academic_year: additionalData.academicYear,
        phone_number: additionalData.phoneNumber,
        email_verified: firebaseUser.emailVerified,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error creating user profile:", error);
    return null;
  }
};

export const getUserProfile = async (firebaseUid: string): Promise<FullUserProfile | null> => {
  try {
    // Note: one-to-one relations are returned as objects, not arrays if you .single()
    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        academic_info(*),
        engagement(*)
      `)
      .eq("firebase_uid", firebaseUid)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data as FullUserProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const updateUserProfile = async (
  firebaseUid: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("firebase_uid", firebaseUid)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
};
