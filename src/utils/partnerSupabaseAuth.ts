
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PartnerProfile {
  id: string;
  email: string;
  business_name: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
}

export const signInPartner = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Check if user has vendor record
    if (data.user) {
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('firebase_uid', data.user.id)
        .single();

      if (vendorError || !vendor) {
        throw new Error("No partner account found");
      }

      if (vendor.status !== 'approved') {
        throw new Error("Partner account pending approval");
      }

      return { user: data.user, vendor };
    }

    throw new Error("Authentication failed");
  } catch (error: any) {
    console.error("Partner sign in error:", error);
    throw error;
  }
};

export const signUpPartner = async (email: string, password: string, partnerData: {
  businessName: string;
  category: string;
  description: string;
}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/partner-dashboard`
      }
    });

    if (error) throw error;

    if (data.user) {
      // Create vendor record
      const { error: vendorError } = await supabase
        .from('vendors')
        .insert({
          firebase_uid: data.user.id,
          business_name: partnerData.businessName,
          category: partnerData.category,
          description: partnerData.description,
          status: 'pending'
        });

      if (vendorError) {
        console.error("Vendor creation error:", vendorError);
        throw new Error("Failed to create partner account");
      }

      return data.user;
    }

    throw new Error("Sign up failed");
  } catch (error: any) {
    console.error("Partner sign up error:", error);
    throw error;
  }
};

export const signOutPartner = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Partner sign out error:", error);
    throw error;
  }
};

export const getPartnerAuthErrorMessage = (error: any) => {
  switch (error.message) {
    case 'Invalid login credentials':
      return "Incorrect email or password";
    case 'Email not confirmed':
      return "Please verify your email address";
    case 'No partner account found':
      return "No partner account found with this email";
    case 'Partner account pending approval':
      return "Your partner account is pending approval";
    default:
      return error.message || "Sign in failed. Please try again.";
  }
};
