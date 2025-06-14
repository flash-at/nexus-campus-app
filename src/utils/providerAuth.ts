
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const authenticateProvider = async (email: string, password: string) => {
  let userCredential;
  
  try {
    // For the specific partner email, always try to create/reset the account
    if (email === 'maheshch1094@gmail.com') {
      try {
        // Try to create a new account first
        console.log("Creating partner account...");
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Account created successfully:", userCredential.user.uid);
      } catch (createError: any) {
        // If account already exists, try to sign in
        if (createError.code === 'auth/email-already-in-use') {
          console.log("Account exists, trying to sign in...");
          userCredential = await signInWithEmailAndPassword(auth, email, password);
          console.log("Signed in successfully:", userCredential.user.uid);
        } else {
          throw createError;
        }
      }
    } else {
      // For other emails, just try to sign in
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    }

    // Set the Supabase session with Firebase token
    if (userCredential?.user) {
      const token = await userCredential.user.getIdToken();
      console.log("Setting Supabase session with Firebase token...");
      
      // Use signInWithIdToken instead of setSession for better compatibility
      const { data, error: sessionError } = await supabase.auth.signInWithIdToken({
        provider: 'firebase',
        token: token
      });

      if (sessionError) {
        console.error("Failed to set Supabase session:", sessionError);
        throw new Error("Failed to establish session");
      }

      console.log("Supabase session established successfully");
      
      // Add a delay to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return userCredential;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};

export const verifyVendorStatus = async (userCredential: any, email: string) => {
  console.log("Checking vendor status for user:", userCredential.user.uid);
  
  try {
    // Double-check that we have an active session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error("No active Supabase session:", sessionError);
      throw new Error("Authentication session not established");
    }
    
    console.log("Active Supabase session confirmed, user:", session.user?.id);
    
    // Check if this user is a registered vendor
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('firebase_uid', userCredential.user.uid)
      .maybeSingle();

    console.log("Vendor query result:", { vendor, vendorError });

    if (vendorError && vendorError.code !== 'PGRST116') {
      console.error('Error checking vendor status:', vendorError);
      toast.error("Error verifying partner status");
      throw new Error("Error verifying partner status");
    }

    if (!vendor) {
      // Create the vendor record
      console.log("Creating vendor record...");
      
      const vendorData = {
        firebase_uid: userCredential.user.uid,
        business_name: email === 'maheshch1094@gmail.com' ? 'Campus Vendor' : 'Partner Business',
        category: 'Food & Beverages',
        description: 'Campus service provider',
        status: 'approved'
      };
      
      console.log("Inserting vendor data:", vendorData);
      
      // Use upsert to handle potential conflicts
      const { data: newVendor, error: createVendorError } = await supabase
        .from('vendors')
        .upsert(vendorData, { 
          onConflict: 'firebase_uid',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (createVendorError) {
        console.error('Error creating vendor record:', createVendorError);
        console.error('Detailed error:', JSON.stringify(createVendorError, null, 2));
        
        // Try a simple insert as fallback
        const { data: fallbackVendor, error: fallbackError } = await supabase
          .from('vendors')
          .insert(vendorData)
          .select()
          .single();
          
        if (fallbackError) {
          console.error('Fallback insert also failed:', fallbackError);
          toast.error("Failed to create partner account. Please contact support.");
          await auth.signOut();
          throw new Error("Failed to create partner account");
        }
        
        console.log("Vendor record created via fallback:", fallbackVendor);
        toast.success("Partner account created successfully!");
      } else {
        console.log("Vendor record created:", newVendor);
        toast.success("Partner account created successfully!");
      }
    } else if (vendor.status !== 'approved') {
      toast.error("Your partner account is pending approval");
      await auth.signOut();
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
  switch (error.code) {
    case 'auth/user-not-found':
      return "No account found with this email";
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return "Incorrect email or password";
    case 'auth/invalid-email':
      return "Invalid email address";
    case 'auth/user-disabled':
      return "This account has been disabled";
    case 'auth/too-many-requests':
      return "Too many failed attempts. Please try again later.";
    case 'auth/weak-password':
      return "Password should be at least 6 characters";
    default:
      return "Sign in failed. Please try again.";
  }
};
