
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const authenticateProvider = async (email: string, password: string) => {
  let userCredential;
  
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

  return userCredential;
};

export const verifyVendorStatus = async (userCredential: any, email: string) => {
  console.log("Checking vendor status for user:", userCredential.user.uid);
  
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
    // For the specific partner email, create the vendor record if it doesn't exist
    if (email === 'maheshch1094@gmail.com') {
      console.log("Creating vendor record for partner...");
      
      const { data: newVendor, error: createVendorError } = await supabase
        .from('vendors')
        .insert({
          firebase_uid: userCredential.user.uid,
          business_name: 'Campus Vendor',
          category: 'Food & Beverages',
          description: 'Campus service provider',
          status: 'approved'
        })
        .select()
        .single();

      if (createVendorError) {
        console.error('Error creating vendor record:', createVendorError);
        toast.error("Failed to create partner account. Please contact support.");
        await auth.signOut();
        throw new Error("Failed to create partner account");
      }
      
      console.log("Vendor record created:", newVendor);
      toast.success("Partner account created successfully!");
    } else {
      toast.error("This account is not registered as a partner");
      await auth.signOut();
      throw new Error("Account not registered as partner");
    }
  } else if (vendor.status !== 'approved') {
    toast.error("Your partner account is pending approval");
    await auth.signOut();
    throw new Error("Account pending approval");
  } else {
    toast.success("Welcome back, partner!");
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
