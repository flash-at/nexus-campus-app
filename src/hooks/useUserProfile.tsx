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
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching profile for user:", user.uid);
      
      const userProfile = await getUserProfile(user.uid);
      
      if (!userProfile) {
        console.warn("No profile found for user:", user.uid);
        setError("User profile not found. Please contact support.");
      } else {
        console.log("Profile fetched successfully:", userProfile.id);
      }
      
      setProfile(userProfile);
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

  return { 
    profile, 
    loading: loading || authLoading, 
    error,
    refetch: fetchProfile 
  };
};