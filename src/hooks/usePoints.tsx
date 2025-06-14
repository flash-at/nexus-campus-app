
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserPoints, getPointsHistory, PointsHistoryEntry } from '@/services/pointsService';

export const usePoints = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<PointsHistoryEntry[]>([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [pointsData, historyData] = await Promise.all([
        getUserPoints(user.id),
        getPointsHistory(user.id)
      ]);
      
      setPoints(pointsData);
      setHistory(historyData);
    } catch (error) {
      console.error('Error fetching points data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { points, history, loading, refetch: fetchData };
};
