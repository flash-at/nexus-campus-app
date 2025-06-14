
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Profile {
  full_name?: string;
  hall_ticket?: string;
  profile_picture?: string;
  cgpa?: number;
  activity_points?: number;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Mock profile data - in a real app this would come from your backend
      const mockProfile: Profile = {
        full_name: user.displayName || user.email?.split('@')[0] || 'Student',
        hall_ticket: 'CS21B0001',
        profile_picture: user.photoURL || undefined,
        cgpa: 8.7,
        activity_points: 450
      };
      
      setProfile(mockProfile);
      setLoading(false);
    }
  }, [user]);

  return { profile, loading };
};
