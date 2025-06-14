
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserProfile, getUserProfile } from '@/services/userService';

export const useProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (user) {
      try {
        setLoading(true);
        const userProfile = await getUserProfile(user.id);
        setProfile(userProfile);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchProfile();
      } else {
        setLoading(false);
        setProfile(null);
      }
    }
  }, [user, authLoading, fetchProfile]);

  return { profile, loading: loading || authLoading, refetch: fetchProfile };
};
