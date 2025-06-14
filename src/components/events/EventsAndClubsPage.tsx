
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { 
  Calendar, Users, Search, MapPin, Clock, User, Trophy, 
  Plus, UserPlus, UserCheck, AlertCircle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  max_members: number;
  member_count?: number;
  is_member?: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  category: string;
  created_by: string;
}

interface ClubMembership {
  id: string;
  club_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  clubs: {
    name: string;
    category: string;
  };
}

export const EventsAndClubsPage = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [myMemberships, setMyMemberships] = useState<ClubMembership[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { profile } = useUserProfile();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadClubs(),
      loadEvents(),
      loadMyMemberships()
    ]);
    setLoading(false);
  };

  const loadClubs = async () => {
    try {
      const { data: clubsData, error } = await supabase
        .from('clubs')
        .select(`
          *,
          club_memberships(id)
        `);

      if (error) throw error;

      const clubsWithMemberCount = clubsData?.map(club => ({
        ...club,
        member_count: club.club_memberships?.length || 0
      })) || [];

      setClubs(clubsWithMemberCount);
    } catch (error) {
      console.error('Error loading clubs:', error);
      toast({
        title: "Error",
        description: "Failed to load clubs",
        variant: "destructive"
      });
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    }
  };

  const loadMyMemberships = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!userData) return;

      const { data, error } = await supabase
        .from('club_memberships')
        .select(`
          *,
          clubs(name, category)
        `)
        .eq('user_id', userData.id);

      if (error) throw error;
      setMyMemberships(data || []);
    } catch (error) {
      console.error('Error loading memberships:', error);
    }
  };

  const joinClub = async (clubId: string, password: string) => {
    try {
      // Check if already at limit of 3 clubs
      if (myMemberships.length >= 3) {
        toast({
          title: "Club Limit Reached",
          description: "You can only join a maximum of 3 clubs",
          variant: "destructive"
        });
        return;
      }

      // Get current user
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!userData) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive"
        });
        return;
      }

      // Verify club password
      const { data: clubData } = await supabase
        .from('clubs')
        .select('password')
        .eq('id', clubId)
        .single();

      if (clubData?.password !== password) {
        toast({
          title: "Invalid Password",
          description: "Incorrect club password",
          variant: "destructive"
        });
        return;
      }

      // Join the club
      const { error } = await supabase
        .from('club_memberships')
        .insert({
          user_id: userData.id,
          club_id: clubId,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You have successfully joined the club",
      });

      // Reload data
      loadData();
    } catch (error: any) {
      console.error('Error joining club:', error);
      if (error.code === '23505') {
        toast({
          title: "Already a Member",
          description: "You are already a member of this club",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to join club",
          variant: "destructive"
        });
      }
    }
  };

  const leaveClub = async (membershipId: string) => {
    try {
      const { error } = await supabase
        .from('club_memberships')
        .delete()
        .eq('id', membershipId);

      if (error) throw error;

      toast({
        title: "Left Club",
        description: "You have left the club",
      });

      loadData();
    } catch (error) {
      console.error('Error leaving club:', error);
      toast({
        title: "Error",
        description: "Failed to leave club",
        variant: "destructive"
      });
    }
  };

  const isClubMember = (clubId: string) => {
    return myMemberships.some(membership => membership.club_id === clubId);
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold">Events & Clubs</h2>
          <p className="text-muted-foreground">
            Discover campus events and join clubs that match your interests
          </p>
        </div>
        <div className="flex items-center space-x-2 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events and clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* My Memberships Section */}
      {myMemberships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2" />
              My Clubs ({myMemberships.length}/3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myMemberships.map((membership) => (
                <div key={membership.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{membership.clubs.name}</h4>
                    <Badge variant="outline">{membership.clubs.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Joined {new Date(membership.joined_at).toLocaleDateString()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => leaveClub(membership.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Leave Club
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="clubs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clubs" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Clubs
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clubs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <Card key={club.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{club.name}</CardTitle>
                    <Badge variant="outline">{club.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{club.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {club.member_count} / {club.max_members} members
                    </div>
                  </div>

                  {isClubMember(club.id) ? (
                    <Button disabled className="w-full">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Member
                    </Button>
                  ) : myMemberships.length >= 3 ? (
                    <Button disabled className="w-full">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Club Limit Reached (3/3)
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => {
                        const password = prompt(`Enter password for ${club.name}:`);
                        if (password) {
                          joinClub(club.id, password);
                        }
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Club
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge variant="outline">{event.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{event.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatDate(event.event_date)}
                    </div>
                    {event.location && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                    )}
                  </div>

                  <Button className="w-full mt-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    Register for Event
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "No events match your search." : "No upcoming events at the moment."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
