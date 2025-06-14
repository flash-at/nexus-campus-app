
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

    console.log("Firebase authentication successful, Firebase UID:", userCredential?.user?.uid);
    return userCredential;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};

export const verifyVendorStatus = async (userCredential: any, email: string) => {
  console.log("Starting vendor verification for user:", userCredential.user.uid);
  
  try {
    // First, let's try to query without Supabase auth to see if RLS is the issue
    console.log("Checking if vendor exists...");
    
    // Check if this user is a registered vendor using the Firebase UID directly
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('firebase_uid', userCredential.user.uid)
      .maybeSingle();

    console.log("Vendor query result:", { vendor, vendorError });

    if (vendorError) {
      console.error('Error checking vendor status:', vendorError);
      toast.error("Error verifying partner status: " + vendorError.message);
      throw new Error("Error verifying partner status");
    }

    if (!vendor) {
      // Create the vendor record
      console.log("Creating vendor record for Firebase UID:", userCredential.user.uid);
      
      const vendorData = {
        firebase_uid: userCredential.user.uid,
        business_name: email === 'maheshch1094@gmail.com' ? 'Campus Vendor' : 'Partner Business',
        category: 'Food & Beverages',
        description: 'Campus service provider',
        status: 'approved'
      };
      
      console.log("Attempting to insert vendor data:", vendorData);
      
      // Try direct insert first
      const { data: newVendor, error: createVendorError } = await supabase
        .from('vendors')
        .insert(vendorData)
        .select()
        .single();

      if (createVendorError) {
        console.error('Error creating vendor record:', createVendorError);
        console.error('Error details:', {
          code: createVendorError.code,
          message: createVendorError.message,
          details: createVendorError.details,
          hint: createVendorError.hint
        });
        
        // Check if it's an RLS policy violation
        if (createVendorError.message?.includes('policy')) {
          console.error('RLS Policy violation detected');
          toast.error("Authentication error. Please try logging in again.");
        } else {
          toast.error("Failed to create partner account: " + createVendorError.message);
        }
        
        await auth.signOut();
        throw new Error("Failed to create partner account");
      }
      
      console.log("Vendor record created successfully:", newVendor);
      toast.success("Partner account created successfully!");
    } else if (vendor.status !== 'approved') {
      toast.error("Your partner account is pending approval");
      await auth.signOut();
      throw new Error("Account pending approval");
    } else {
      console.log("Existing vendor found:", vendor);
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
