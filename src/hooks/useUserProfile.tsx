
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserProfile, getUserProfile } from '@/services/userService';

export const useUserProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching profile for user:", user.uid);
      
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        console.log("Profile fetched successfully:", userProfile);
        setProfile(userProfile);
        setError(null);
      } else {
        console.log("No profile found for user");
        setProfile(null);
        setError("Profile not found. Please create your profile.");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading, fetchProfile]);

  const refetch = useCallback(() => {
    return fetchProfile();
  }, [fetchProfile]);

  return { 
    profile, 
    loading: loading || authLoading, 
    error,
    refetch 
  };
};
