
import { supabase } from "@/integrations/supabase/client";
import { User } from "firebase/auth";
import { addActivityPoints, POINT_RULES } from "./activityPointsService";

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
    badges: any | null;
    last_login: string | null;
    events_attended: string[] | null;
    feedback_count: number;
    created_at: string;
    updated_at: string;
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
    theme: 'Light' | 'Dark' | 'System';
    notifications_enabled: boolean;
    widgets_enabled: any | null;
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

// Helper function to get default engagement data
const getDefaultEngagement = (userId: string): Engagement => ({
  id: '',
  user_id: userId,
  activity_points: POINT_RULES.ACCOUNT_CREATION, // Start with account creation points
  badges: null,
  last_login: null,
  events_attended: [],
  feedback_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

export const checkHallTicketExists = async (hallTicket: string): Promise<boolean> => {
  try {
    console.log("Checking hall ticket:", hallTicket);
    const { data, error } = await supabase
      .from("users")
      .select("hall_ticket")
      .eq("hall_ticket", hallTicket)
      .maybeSingle();

    if (error) {
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

    // Insert the user profile using the permissive RLS policy
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

    // After creating the user profile, manually create engagement data with account creation points
    await ensureEngagementData(data.id, true);

    // Fetch the complete profile with relations
    const completeProfile = await getUserProfile(firebaseUser.uid);
    
    return completeProfile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    return null;
  }
};

// Function to ensure engagement data exists for a user
const ensureEngagementData = async (userId: string, isNewUser: boolean = false): Promise<void> => {
  try {
    // Check if engagement data exists
    const { data: existingEngagement } = await supabase
      .from("engagement")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingEngagement) {
      // Create engagement data with default values
      const { error } = await supabase
        .from("engagement")
        .insert({
          user_id: userId,
          activity_points: isNewUser ? POINT_RULES.ACCOUNT_CREATION : 0,
          feedback_count: 0,
          events_attended: [],
          last_login: new Date().toISOString()
        });

      if (error) {
        console.error("Error creating engagement data:", error);
      } else {
        console.log("Created engagement data for user:", userId);
        
        // If this is a new user, record the account creation points in history
        if (isNewUser) {
          await addActivityPoints(userId, POINT_RULES.ACCOUNT_CREATION, "Account creation bonus");
        }
      }
    }
  } catch (error) {
    console.error("Error ensuring engagement data:", error);
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
      .maybeSingle();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    if (!data) {
      console.log("No user profile found for UID:", firebaseUid);
      return null;
    }

    // Ensure engagement data exists if it's null
    if (!data.engagement) {
      console.log("Engagement data is null, ensuring it exists for user:", data.id);
      await ensureEngagementData(data.id);
      
      // Refetch the profile to get the newly created engagement data
      const { data: updatedData } = await supabase
        .from("users")
        .select(`
          *,
          academic_info(*),
          engagement(*),
          documents(*),
          preferences(*)
        `)
        .eq("firebase_uid", firebaseUid)
        .maybeSingle();

      if (updatedData && updatedData.engagement) {
        data.engagement = updatedData.engagement;
      } else {
        // Fallback to ensure we always have engagement data
        data.engagement = getDefaultEngagement(data.id);
      }
    }

    // Ensure engagement is properly structured as a final fallback
    if (!data.engagement) {
      data.engagement = getDefaultEngagement(data.id);
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
