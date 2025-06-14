
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Award, Star } from 'lucide-react';
import { getUserAllocations, ActivityAllocation } from '@/services/clubService';
import { useUserProfile } from '@/hooks/useUserProfile';

const ActivityPage = () => {
  const [allocations, setAllocations] = useState<ActivityAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useUserProfile();

  useEffect(() => {
    loadAllocations();
  }, []);

  const loadAllocations = async () => {
    const allocationsData = await getUserAllocations();
    setAllocations(allocationsData);
    setLoading(false);
  };

  const totalPoints = allocations.reduce((sum, allocation) => sum + allocation.points, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campus-blue"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Points</h1>
        <p className="text-gray-600">Track your campus engagement and achievements</p>
      </div>

      {/* Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.engagement?.activity_points || 0}</div>
            <p className="text-xs text-blue-100">
              Current total from profile
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Allocations</CardTitle>
            <Award className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-green-100">
              Points from allocations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <Star className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allocations.length}</div>
            <p className="text-xs text-purple-100">
              Total activities recorded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Allocations List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity Allocations</h2>
        {allocations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
              <p className="text-gray-500">
                Join clubs and participate in activities to start earning points!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {allocations.map((allocation) => (
              <Card key={allocation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge 
                          className={`${allocation.points > 0 ? 'bg-green-500' : 'bg-red-500'} text-white`}
                        >
                          {allocation.points > 0 ? '+' : ''}{allocation.points} points
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(allocation.allocated_at)}</span>
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {allocation.reason || 'Activity participation'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Club Activity • Allocated by club administrator
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {allocation.points}
                      </div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
