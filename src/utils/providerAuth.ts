
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Simplified authentication using only Supabase
 */
export const authenticateProvider = async (email: string, password: string) => {
  try {
    // First try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // If sign in fails and it's because user doesn't exist, try to sign up
      if (signInError.message.includes('Invalid login credentials') || 
          signInError.message.includes('Email not confirmed')) {
        console.log("Sign in failed, attempting to create account...");
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/partner-dashboard`
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        if (signUpData.user && !signUpData.session) {
          toast.info("Please check your email to confirm your account");
          throw new Error("Email confirmation required");
        }

        return signUpData;
      }
      throw signInError;
    }

    return signInData;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};

export const verifyVendorStatus = async (authData: any, email: string) => {
  try {
    const { user } = authData;
    
    if (!user) {
      throw new Error("No user data available");
    }

    // Check for vendor record by user id
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('firebase_uid', user.id)
      .maybeSingle();

    if (vendorError) {
      console.error("Error checking vendor status:", vendorError);
      toast.error("Error verifying partner status: " + vendorError.message);
      throw new Error("Error verifying partner status");
    }

    if (!vendor) {
      // Create vendor record
      const vendorData = {
        firebase_uid: user.id,
        business_name: email === 'maheshch1094@gmail.com' ? 'Campus Vendor' : 'Partner Business',
        category: 'Food & Beverages',
        description: 'Campus service provider',
        status: 'approved'
      };

      const { data: newVendor, error: createVendorError } = await supabase
        .from('vendors')
        .insert(vendorData)
        .select()
        .single();

      if (createVendorError) {
        console.error("Error creating vendor:", createVendorError);
        toast.error("Failed to create partner account: " + createVendorError.message);
        throw new Error("Failed to create partner account");
      }

      toast.success("Partner account created successfully!");
    } else if (vendor.status !== 'approved') {
      toast.error("Your partner account is pending approval");
      throw new Error("Account pending approval");
    } else {
      toast.success("Welcome back, partner!");
    }
  } catch (error) {
    console.error("Error in verifyVendorStatus:", error);
    throw error;
  }
};

export const getAuthErrorMessage = (error: any) => {
  const message = error?.message || error?.toString() || 'Unknown error';
  
  if (message.includes('Invalid login credentials')) {
    return "Incorrect email or password";
  }
  if (message.includes('Email not confirmed')) {
    return "Please check your email and confirm your account";
  }
  if (message.includes('User already registered')) {
    return "Account already exists. Please sign in instead.";
  }
  if (message.includes('Password should be at least')) {
    return "Password should be at least 6 characters";
  }
  if (message.includes('Invalid email')) {
    return "Please enter a valid email address";
  }
  if (message.includes('Too many requests')) {
    return "Too many attempts. Please try again later.";
  }
  if (message.includes('Email confirmation required')) {
    return "Please check your email to confirm your account";
  }
  
  return "Sign in failed. Please try again.";
};
