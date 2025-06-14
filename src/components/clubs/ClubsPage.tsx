
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Calendar } from 'lucide-react';
import { getAllClubs, joinClub, getUserClubs, Club } from '@/services/clubService';
import { toast } from 'sonner';

const ClubsPage = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [userClubs, setUserClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [password, setPassword] = useState('');
  const [joiningClub, setJoiningClub] = useState(false);

  useEffect(() => {
    loadClubs();
    loadUserClubs();
  }, []);

  const loadClubs = async () => {
    const clubsData = await getAllClubs();
    setClubs(clubsData);
    setLoading(false);
  };

  const loadUserClubs = async () => {
    const userClubsData = await getUserClubs();
    setUserClubs(userClubsData);
  };

  const handleJoinClub = async () => {
    if (!selectedClub || !password) return;

    setJoiningClub(true);
    const success = await joinClub(selectedClub.id, password);
    
    if (success) {
      toast.success(`Successfully joined ${selectedClub.name}!`);
      setSelectedClub(null);
      setPassword('');
      loadUserClubs();
    } else {
      toast.error('Failed to join club. Please check your password.');
    }
    setJoiningClub(false);
  };

  const isUserMember = (clubId: string) => {
    return userClubs.some(club => club.id === clubId);
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'Technical': return 'bg-blue-500';
      case 'Cultural': return 'bg-purple-500';
      case 'Sports': return 'bg-green-500';
      case 'Academic': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Campus Clubs</h1>
        <p className="text-gray-600">Discover and join clubs that match your interests</p>
      </div>

      {userClubs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Clubs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {userClubs.map((club) => (
              <Card key={club.id} className="border-2 border-green-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{club.name}</CardTitle>
                    <Badge className="bg-green-500 text-white">Member</Badge>
                  </div>
                  {club.category && (
                    <Badge className={`${getCategoryColor(club.category)} text-white w-fit`}>
                      {club.category}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {club.description || 'No description available'}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Max: {club.max_members || 50}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">All Clubs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Card key={club.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{club.name}</CardTitle>
                  {isUserMember(club.id) && (
                    <Badge className="bg-green-500 text-white">Member</Badge>
                  )}
                </div>
                {club.category && (
                  <Badge className={`${getCategoryColor(club.category)} text-white w-fit`}>
                    {club.category}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {club.description || 'No description available'}
                </CardDescription>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Max: {club.max_members || 50}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>Activities</span>
                  </div>
                </div>
                {!isUserMember(club.id) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        onClick={() => setSelectedClub(club)}
                      >
                        Join Club
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Join {club.name}</DialogTitle>
                        <DialogDescription>
                          Enter the club password to join {club.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          type="password"
                          placeholder="Club password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleJoinClub}
                            disabled={joiningClub || !password}
                            className="flex-1"
                          >
                            {joiningClub ? 'Joining...' : 'Join Club'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSelectedClub(null);
                              setPassword('');
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClubsPage;
