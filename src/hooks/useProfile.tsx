
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserProfile, FullUserProfile } from '@/services/userService';

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FullUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
        setLoading(false);
      } else {
        setProfile(null);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, loading };
};
