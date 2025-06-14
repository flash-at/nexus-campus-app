
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Calendar, Users, Search, Plus, Lock, UserCheck, LogOut, MapPin, Clock } from "lucide-react";

export const EventsAndClubsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clubs, setClubs] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubPassword, setClubPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { profile } = useUserProfile();

  useEffect(() => {
    fetchClubs();
    fetchMyClubs();
    fetchEvents();
  }, [profile]);

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select(`
          id,
          name,
          description,
          category,
          max_members,
          created_at,
          club_memberships (count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const fetchMyClubs = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('club_memberships')
        .select(`
          id,
          role,
          joined_at,
          clubs (
            id,
            name,
            description,
            category
          )
        `)
        .eq('user_id', profile.id);
      
      if (error) throw error;
      setMyClubs(data || []);
    } catch (error) {
      console.error('Error fetching my clubs:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleJoinClub = async () => {
    if (!selectedClub || !profile?.id) return;
    
    setLoading(true);
    setError("");

    try {
      // Check if user has already reached the 3 club limit
      if (myClubs.length >= 3) {
        throw new Error("You can only join up to 3 clubs");
      }

      // Check if user is already a member
      const existingMembership = myClubs.find(
        membership => membership.clubs.id === selectedClub.id
      );
      if (existingMembership) {
        throw new Error("You are already a member of this club");
      }

      // Verify club password
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('password')
        .eq('id', selectedClub.id)
        .single();

      if (clubError) throw clubError;

      if (clubData.password !== clubPassword) {
        throw new Error("Incorrect club password");
      }

      // Join the club
      const { error: joinError } = await supabase
        .from('club_memberships')
        .insert({
          club_id: selectedClub.id,
          user_id: profile.id,
          role: 'member'
        });

      if (joinError) throw joinError;

      // Refresh data
      await fetchMyClubs();
      setJoinDialogOpen(false);
      setClubPassword("");
      setSelectedClub(null);
      
      alert('Successfully joined the club!');
    } catch (error) {
      console.error('Error joining club:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveClub = async (clubId) => {
    if (!profile?.id) return;
    
    try {
      const { error } = await supabase
        .from('club_memberships')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', profile.id);

      if (error) throw error;

      await fetchMyClubs();
      alert('Successfully left the club!');
    } catch (error) {
      console.error('Error leaving club:', error);
      alert('Failed to leave club. Please try again.');
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Events & Clubs</h2>
          <p className="text-muted-foreground">Discover and join campus activities</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search events and clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-80"
          />
        </div>
      </div>

      <Tabs defaultValue="clubs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clubs">All Clubs</TabsTrigger>
          <TabsTrigger value="my-clubs">My Clubs ({myClubs.length}/3)</TabsTrigger>
          <TabsTrigger value="events">Upcoming Events</TabsTrigger>
        </TabsList>

        <TabsContent value="clubs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => {
              const memberCount = club.club_memberships?.[0]?.count || 0;
              const isJoined = myClubs.some(membership => membership.clubs.id === club.id);
              
              return (
                <Card key={club.id} className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold">{club.name}</CardTitle>
                        <Badge variant="outline" className="mt-2">
                          {club.category}
                        </Badge>
                      </div>
                      {isJoined && (
                        <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Joined
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {club.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {memberCount}/{club.max_members} members
                      </div>
                    </div>

                    {!isJoined ? (
                      <Dialog open={joinDialogOpen && selectedClub?.id === club.id} onOpenChange={setJoinDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full"
                            onClick={() => setSelectedClub(club)}
                            disabled={myClubs.length >= 3}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {myClubs.length >= 3 ? "Club Limit Reached" : "Join Club"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Join {club.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="password">Club Password</Label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                  id="password"
                                  type="password"
                                  placeholder="Enter club password"
                                  value={clubPassword}
                                  onChange={(e) => setClubPassword(e.target.value)}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            
                            {error && (
                              <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                              </Alert>
                            )}
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setJoinDialogOpen(false);
                                  setClubPassword("");
                                  setError("");
                                }}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleJoinClub}
                                disabled={loading || !clubPassword}
                                className="flex-1"
                              >
                                {loading ? "Joining..." : "Join Club"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          if (confirm('Are you sure you want to leave this club?')) {
                            handleLeaveClub(club.id);
                          }
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Leave Club
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {filteredClubs.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No clubs found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-clubs" className="space-y-4">
          {myClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClubs.map((membership) => (
                <Card key={membership.id} className="shadow-lg border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold">{membership.clubs.name}</CardTitle>
                        <Badge variant="outline" className="mt-2">
                          {membership.clubs.category}
                        </Badge>
                      </div>
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        {membership.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {membership.clubs.description}
                    </p>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Joined on {new Date(membership.joined_at).toLocaleDateString()}</p>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        if (confirm('Are you sure you want to leave this club?')) {
                          handleLeaveClub(membership.clubs.id);
                        }
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave Club
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No clubs joined yet</h3>
              <p className="text-muted-foreground mb-4">You can join up to 3 clubs. Explore and find ones that interest you!</p>
              <Button onClick={() => setSearchTerm("")}>
                Browse All Clubs
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">{event.title}</CardTitle>
                    {event.category && (
                      <Badge variant="outline">{event.category}</Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {new Date(event.event_date).toLocaleDateString()} at{' '}
                        {new Date(event.event_date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {event.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                      )}
                    </div>

                    <Button className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Register for Event
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
              <p className="text-muted-foreground">Check back later for new events and activities</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
