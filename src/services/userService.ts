
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
}

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

export const getUserProfile = async (firebaseUid: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("firebase_uid", firebaseUid)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
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
