
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
  signOut: () => Promise<void>;
}

const PartnerAuthContext = createContext<PartnerAuthContextType>({
  user: null,
  session: null,
  partner: null,
  loading: true,
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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPartnerProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Partner auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchPartnerProfile(session.user.id);
        } else if (!session?.user) {
          setPartner(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setPartner(null);
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const fetchPartnerProfile = async (userId: string) => {
    setLoading(true);
    try {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('firebase_uid', userId)
        .single();

      if (error) {
        setPartner(null);
        await signOut();
        if (error.code === 'PGRST116') { // Not found
          toast.error("No partner account found with this email.");
        } else {
          toast.error("Error fetching your partner profile.");
          console.error("Error fetching partner profile:", error);
        }
      } else if (vendor.status !== 'approved') {
        setPartner(null);
        await signOut();
        toast.error("Your partner account is pending approval.");
      } else {
        setPartner(vendor as PartnerProfile);
      }
    } catch (error) {
      console.error("Critical error fetching partner profile:", error);
      setPartner(null);
      await signOut();
      toast.error("A critical error occurred while verifying your status.");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    partner,
    loading,
    signOut,
  };

  return (
    <PartnerAuthContext.Provider value={value}>
      {children}
    </PartnerAuthContext.Provider>
  );
};
