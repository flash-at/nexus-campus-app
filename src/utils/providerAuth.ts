
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Always ensure Firebase and Supabase sessions are synced before vendor verification.
 */
export const authenticateProvider = async (email: string, password: string) => {
  let userCredential;
  try {
    // Special email: always try to create, then fallback to sign in
    if (email === 'maheshch1094@gmail.com') {
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (createError: any) {
        if (createError.code === 'auth/email-already-in-use') {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
          throw createError;
        }
      }
    } else {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    }
    // Immediately after Firebase authentication, sync Supabase with Firebase ID token
    const idToken = await userCredential.user.getIdToken();
    const { error: supaAuthError, data } = await supabase.auth.signInWithIdToken({
      provider: 'firebase',
      token: idToken,
    });
    if (supaAuthError) {
      console.error("Supabase sign-in with ID token failed:", supaAuthError);
      throw new Error("Failed to authenticate session for vendor operations");
    }
    return userCredential;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};

export const verifyVendorStatus = async (userCredential: any, email: string) => {
  try {
    const { user } = userCredential;
    // Ensure Supabase session is present (double-check)
    const session = supabase.auth.getSession ? (await supabase.auth.getSession()).data.session : undefined;
    if (!session || !session.user) {
      toast.error("Session lost. Please sign in again.");
      await auth.signOut();
      throw new Error("No Supabase session for vendor check");
    }
    // Check for vendor record by firebase_uid
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('firebase_uid', user.uid)
      .maybeSingle();

    if (vendorError) {
      toast.error("Error verifying partner status: " + vendorError.message);
      throw new Error("Error verifying partner status");
    }

    if (!vendor) {
      // Try to insert (create) the vendor for this firebase_uid
      const vendorData = {
        firebase_uid: user.uid,
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
        if (createVendorError.message?.includes('policy')) {
          toast.error("Authentication error. Please try logging in again.");
        } else {
          toast.error("Failed to create partner account: " + createVendorError.message);
        }
        await auth.signOut();
        throw new Error("Failed to create partner account");
      }
      toast.success("Partner account created successfully!");
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
