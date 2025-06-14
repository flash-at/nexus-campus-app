import { supabase } from "@/integrations/supabase/client";
import { User } from "firebase/auth";

export interface AcademicInfo {
  id: string;
  user_id: string;
  current_semester: number | null;
  cgpa: number | null;
  subjects_enrolled: string[] | null;
  mentor_name: string | null;
  mentor_email: string | null;
}

export interface Engagement {
    id: string;
    user_id: string;
    activity_points: number;
    badges: any | null; // JSONB
    last_login: string | null;
    events_attended: string[] | null;
    feedback_count: number;
}

export interface UserDocument {
    id: string;
    user_id: string;
    doc_type: string;
    doc_url: string;
    file_name: string;
    verified_by_admin: boolean;
}

export interface Preferences {
    id: string;
    user_id: string;
    language: string;
    theme: string;
    notifications_enabled: boolean;
    widgets_enabled: any | null; // JSONB
}

export interface UserProfile {
  id: string;
  firebase_uid: string;
  full_name: string;
  hall_ticket: string;
  email: string;
  department: string;
  academic_year: string;
  phone_number: string;
  role: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  profile_picture_url: string | null;
  is_active: boolean | null;

  academic_info: AcademicInfo | null;
  engagement: Engagement | null;
  documents: UserDocument[];
  preferences: Preferences | null;
}


export const checkHallTicketExists = async (hallTicket: string): Promise<boolean> => {
  try {
    console.log("Checking hall ticket:", hallTicket);
    const { data, error } = await supabase
      .from("users")
      .select("hall_ticket")
      .eq("hall_ticket", hallTicket)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error checking hall ticket:", error);
      return false;
    }

    console.log("Hall ticket check result:", data !== null);
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
    console.log("Creating user profile for Firebase UID:", firebaseUser.uid);
    console.log("Firebase user email:", firebaseUser.email);
    console.log("Additional data:", additionalData);

    const insertData = {
      firebase_uid: firebaseUser.uid,
      full_name: additionalData.fullName,
      hall_ticket: additionalData.hallTicket,
      email: firebaseUser.email!,
      department: additionalData.department,
      academic_year: additionalData.academicYear,
      phone_number: additionalData.phoneNumber,
      email_verified: firebaseUser.emailVerified,
    };

    console.log("Inserting data:", insertData);

    // Use the anon key directly without trying to set a session
    const { data, error } = await supabase
      .from("users")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating user profile:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return null;
    }

    console.log("User profile created successfully:", data);

    // After successful creation, fetch the full profile
    return await getUserProfile(firebaseUser.uid);
  } catch (error) {
    console.error("Error creating user profile:", error);
    return null;
  }
};

export const getUserProfile = async (firebaseUid: string): Promise<UserProfile | null> => {
  try {
    console.log("Fetching user profile for UID:", firebaseUid);
    
    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        academic_info(*),
        engagement(*),
        documents(*),
        preferences(*)
      `)
      .eq("firebase_uid", firebaseUid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        console.warn("No user profile found for uid:", firebaseUid);
        return null;
      }
      console.error("Error fetching user profile:", error);
      return null;
    }

    console.log("User profile fetched successfully:", data);
    return data as UserProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const updateUserProfile = async (
  firebaseUid: string,
  updates: {
    full_name?: string;
    phone_number?: string;
  }
): Promise<UserProfile | null> => {
  try {
    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("firebase_uid", firebaseUid);

    if (error) {
      console.error("Error updating user profile:", error);
      return null;
    }

    // After successful update, fetch the full profile to get all relations
    return await getUserProfile(firebaseUid);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
};
