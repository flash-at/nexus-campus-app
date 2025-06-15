
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { PartnerProfile } from "@/utils/partnerSupabaseAuth";
import { toast } from "sonner";

interface PartnerAuthContextType {
  user: User | null;
  session: Session | null;
  partner: PartnerProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const PartnerAuthContext = createContext<PartnerAuthContextType>({
  user: null,
  session: null,
  partner: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const usePartnerAuth = () => {
  const context = useContext(PartnerAuthContext);
  if (!context) {
    throw new Error("usePartnerAuth must be used within a PartnerAuthProvider");
  }
  return context;
};

interface PartnerAuthProviderProps {
  children: ReactNode;
}

export const PartnerAuthProvider = ({ children }: PartnerAuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setPartner(null);
      setUser(null);
      setSession(null);
    }
  };

  const fetchPartnerProfile = async (userId: string) => {
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('firebase_uid', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error("No partner account found with this email.");
      }
      console.error("Error fetching partner profile:", error);
      throw new Error("Error fetching your partner profile.");
    }

    if (vendor.status !== 'approved') {
      throw new Error("Your partner account is pending approval.");
    }

    setPartner(vendor as PartnerProfile);
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Authentication failed");

      await fetchPartnerProfile(data.user.id);
      
      // Set session/user state after all checks pass
      setSession(data.session);
      setUser(data.user);

    } catch (error) {
      await signOut();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          await fetchPartnerProfile(session.user.id);
          setSession(session);
          setUser(session.user);
        } catch (error: any) {
          toast.error(`Session invalid: ${error.message}. Please sign in again.`);
          await signOut();
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setPartner(null);
          setUser(null);
          setSession(null);
        } else if (event === 'SIGNED_IN') {
           setSession(session);
           setUser(session?.user ?? null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    partner,
    loading,
    signIn,
    signOut,
  };

  return (
    <PartnerAuthContext.Provider value={value}>
      {children}
    </PartnerAuthContext.Provider>
  );
};
