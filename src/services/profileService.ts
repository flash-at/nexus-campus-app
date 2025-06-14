
import { supabase } from "@/integrations/supabase/client";
import { User } from "firebase/auth";

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
}

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
  profileData: {
    fullName: string;
    hallTicket: string;
    department: string;
    academicYear: string;
    phoneNumber: string;
  }
): Promise<UserProfile | null> => {
  try {
    console.log("Creating profile for:", firebaseUser.uid);
    
    const userData = {
      firebase_uid: firebaseUser.uid,
      full_name: profileData.fullName,
      hall_ticket: profileData.hallTicket,
      email: firebaseUser.email!,
      department: profileData.department,
      academic_year: profileData.academicYear,
      phone_number: profileData.phoneNumber,
      email_verified: firebaseUser.emailVerified || false,
    };

    console.log("Inserting user data:", userData);

    const { data, error } = await supabase
      .from("users")
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error("Profile creation error:", error);
      return null;
    }

    console.log("Profile created successfully:", data);
    return data as UserProfile;
  } catch (error) {
    console.error("Error creating profile:", error);
    return null;
  }
};

export const getUserProfile = async (firebaseUid: string): Promise<UserProfile | null> => {
  try {
    console.log("Fetching profile for UID:", firebaseUid);
    
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("firebase_uid", firebaseUid)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    if (!data) {
      console.log("No profile found for UID:", firebaseUid);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error("Error fetching profile:", error);
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
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("firebase_uid", firebaseUid)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
};
