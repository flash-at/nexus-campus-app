
import { supabase } from "@/integrations/supabase/client";

export interface Club {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  chair_id: string | null;
  password: string;
  max_members: number | null;
  created_at: string;
  updated_at: string;
}

export interface ClubMembership {
  id: string;
  user_id: string;
  club_id: string;
  role: string | null;
  joined_at: string | null;
}

export interface ActivityAllocation {
  id: string;
  student_id: string;
  club_id: string;
  allocated_by: string | null;
  points: number;
  reason: string | null;
  allocated_at: string;
}

export const getAllClubs = async (): Promise<Club[]> => {
  try {
    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching clubs:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return [];
  }
};

export const joinClub = async (clubId: string, password: string): Promise<boolean> => {
  try {
    // First verify the password
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .select("password")
      .eq("id", clubId)
      .single();

    if (clubError || !club) {
      console.error("Error fetching club:", clubError);
      return false;
    }

    if (club.password !== password) {
      console.error("Invalid password");
      return false;
    }

    // Get current user ID
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("firebase_uid", (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!userData) {
      console.error("User not found");
      return false;
    }

    // Join the club
    const { error } = await supabase
      .from("club_memberships")
      .insert({
        user_id: userData.id,
        club_id: clubId,
        role: 'member'
      });

    if (error) {
      console.error("Error joining club:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error joining club:", error);
    return false;
  }
};

export const getUserClubs = async (): Promise<Club[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("firebase_uid", user.user.id)
      .single();

    if (!userData) return [];

    const { data, error } = await supabase
      .from("club_memberships")
      .select(`
        clubs (*)
      `)
      .eq("user_id", userData.id);

    if (error) {
      console.error("Error fetching user clubs:", error);
      return [];
    }

    return data?.map(item => item.clubs).filter(Boolean) || [];
  } catch (error) {
    console.error("Error fetching user clubs:", error);
    return [];
  }
};

export const allocateActivityPoints = async (
  studentId: string,
  clubId: string,
  points: number,
  reason: string
): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("firebase_uid", user.user.id)
      .single();

    if (!userData) return false;

    const { error } = await supabase
      .from("activity_allocations")
      .insert({
        student_id: studentId,
        club_id: clubId,
        allocated_by: userData.id,
        points,
        reason
      });

    if (error) {
      console.error("Error allocating points:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error allocating points:", error);
    return false;
  }
};

export const getUserAllocations = async (): Promise<ActivityAllocation[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("firebase_uid", user.user.id)
      .single();

    if (!userData) return [];

    const { data, error } = await supabase
      .from("activity_allocations")
      .select("*")
      .eq("student_id", userData.id)
      .order("allocated_at", { ascending: false });

    if (error) {
      console.error("Error fetching allocations:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching allocations:", error);
    return [];
  }
};
