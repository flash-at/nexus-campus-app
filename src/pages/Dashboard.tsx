
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProfilePage } from "@/components/profile/ProfilePage";
import ClubsPage from "@/components/clubs/ClubsPage";
import ActivityPage from "@/components/activity/ActivityPage";
import { LogOut, User, Users, Trophy, FileText, ShoppingCart, Settings } from "lucide-react";
import { useState } from "react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { profile, loading } = useUserProfile();
  const [activeTab, setActiveTab] = useState("overview");

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campus-blue"></div>
        </div>
      </ProtectedRoute>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfilePage />;
      case "clubs":
        return <ClubsPage />;
      case "activity":
        return <ActivityPage />;
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activity Points</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.engagement?.activity_points || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Current semester total
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CGPA</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.academic_info?.cgpa || "N/A"}</div>
                  <p className="text-xs text-muted-foreground">
                    Overall performance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.academic_info?.current_semester || "N/A"}</div>
                  <p className="text-xs text-muted-foreground">
                    Academic progress
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.engagement?.events_attended?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    This semester
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Access your most used features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("clubs")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Browse & Join Clubs
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("activity")}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    View Activity Points
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest campus engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Profile created</p>
                        <p className="text-xs text-muted-foreground">Welcome to Campus Connect!</p>
                      </div>
                    </div>
                    {profile?.engagement?.last_login && (
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Last login</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(profile.engagement.last_login).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">Campus Connect</h1>
                <Separator orientation="vertical" className="h-6" />
                <nav className="flex space-x-4">
                  <Button
                    variant={activeTab === "overview" ? "default" : "ghost"}
                    onClick={() => setActiveTab("overview")}
                    size="sm"
                  >
                    Overview
                  </Button>
                  <Button
                    variant={activeTab === "profile" ? "default" : "ghost"}
                    onClick={() => setActiveTab("profile")}
                    size="sm"
                  >
                    Profile
                  </Button>
                  <Button
                    variant={activeTab === "clubs" ? "default" : "ghost"}
                    onClick={() => setActiveTab("clubs")}
                    size="sm"
                  >
                    Clubs
                  </Button>
                  <Button
                    variant={activeTab === "activity" ? "default" : "ghost"}
                    onClick={() => setActiveTab("activity")}
                    size="sm"
                  >
                    Activity
                  </Button>
                </nav>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.profile_picture_url || ""} />
                    <AvatarFallback>
                      {profile?.full_name ? getInitials(profile.full_name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      {profile?.full_name || "User"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {profile?.hall_ticket}
                    </span>
                  </div>
                  <Badge variant="secondary">{profile?.role || "student"}</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
