
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { UserCog, ArrowLeft } from "lucide-react";

const ClubAdminLogin = () => {
  const [selectedClub, setSelectedClub] = useState("");
  const [hallTicket, setHallTicket] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clubs, setClubs] = useState([]);
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  React.useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Verify hall ticket matches current user
      if (hallTicket !== profile?.hall_ticket) {
        throw new Error("Hall ticket doesn't match your profile");
      }

      // Verify club password and check if user has admin role
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('id, name, password')
        .eq('id', selectedClub)
        .single();

      if (clubError) throw clubError;

      if (clubData.password !== password) {
        throw new Error("Invalid club password");
      }

      // Check if user has chair or vice_chair role in this club
      const { data: roleData, error: roleError } = await supabase
        .from('club_roles')
        .select('role')
        .eq('club_id', selectedClub)
        .eq('user_id', profile?.id)
        .in('role', ['chair', 'vice_chair']);

      if (roleError) throw roleError;

      if (!roleData || roleData.length === 0) {
        throw new Error("You don't have admin access to this club");
      }

      // Store club admin session in localStorage
      localStorage.setItem('club_admin_session', JSON.stringify({
        clubId: selectedClub,
        clubName: clubData.name,
        userRole: roleData[0].role,
        userId: profile?.id
      }));

      navigate('/club-admin');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 left-4"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center">
            <UserCog className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Club Admin Login</CardTitle>
          <p className="text-muted-foreground">Access your club management panel</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="club">Select Club</Label>
              <Select value={selectedClub} onValueChange={setSelectedClub} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your club" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hallTicket">Hall Ticket Number</Label>
              <Input
                id="hallTicket"
                type="text"
                value={hallTicket}
                onChange={(e) => setHallTicket(e.target.value)}
                placeholder="Enter your hall ticket"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Club Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter club password"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login to Club Admin"}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => navigate('/create-club')}
                className="text-sm"
              >
                Create New Club
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubAdminLogin;
