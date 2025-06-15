
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut, getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { syncSupabaseSession } from "@/utils/syncSupabaseSession";
import { cleanupAuthState } from "@/utils/authCleanup";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  supabaseSession: any | null;
  signOut: () => Promise<void>;
  cleanupAndReload: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  supabaseSession: null,
  signOut: async () => {},
  cleanupAndReload: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseSession, setSupabaseSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const cleanupAndReload = () => {
    console.log('[Auth] Manual cleanup and reload triggered');
    cleanupAuthState();
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  };

  useEffect(() => {
    console.log('[Auth] Setting up auth state listener...');
    
    // Listen to Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[Auth] Firebase auth state changed:', {
        hasUser: !!firebaseUser,
        uid: firebaseUser?.uid,
        email: firebaseUser?.email,
        emailVerified: firebaseUser?.emailVerified
      });
      
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        try {
          console.log('[Auth] Getting Firebase ID token...');
          const idToken = await getIdToken(firebaseUser, true);
          console.log('[Auth] Firebase ID token obtained, length:', idToken?.length);
          
          console.log('[Auth] Syncing Supabase session...');
          const session = await syncSupabaseSession(idToken);
          console.log('[Auth] Supabase session sync result:', {
            hasSession: !!session,
            hasUser: !!session?.user,
            userId: session?.user?.id,
            hasAccessToken: !!session?.access_token,
            accessTokenLength: session?.access_token?.length
          });
          
          setSupabaseSession(session);
        } catch (error) {
          console.error('[Auth] Failed to sync Supabase session:', error);
          console.error('[Auth] Error details:', {
            message: error?.message,
            stack: error?.stack,
            cause: error?.cause
          });
          setSupabaseSession(null);
        }
      } else {
        console.log('[Auth] No Firebase user, clearing Supabase session');
        setSupabaseSession(null);
      }
    });

    return () => {
      console.log('[Auth] Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('[Auth] Starting sign out process...');
      
      // Clean up auth state first
      const removedCount = cleanupAuthState();
      console.log('[Auth] Cleaned up auth state, removed', removedCount, 'keys');
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      console.log('[Auth] Firebase sign out complete');
      
      // Clear Supabase session
      setSupabaseSession(null);
      console.log('[Auth] Cleared Supabase session state');
      
    } catch (error) {
      console.error('[Auth] Error during sign out:', error);
    }
  };

  // Log current auth state every time it changes
  useEffect(() => {
    console.log('[Auth] Current auth state:', {
      hasUser: !!user,
      userEmail: user?.email,
      hasSupabaseSession: !!supabaseSession,
      supabaseUserId: supabaseSession?.user?.id,
      loading
    });
  }, [user, supabaseSession, loading]);

  const value = {
    user,
    loading,
    supabaseSession,
    signOut,
    cleanupAndReload,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
