import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Menu, 
  X, 
  Home, 
  User, 
  Calendar, 
  Users, 
  Trophy, 
  ShoppingBag, 
  MessageCircle, 
  Settings,
  Bell,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  ChevronRight
} from "lucide-react";
import { NewProfilePage } from "@/components/profile/NewProfilePage";
import { EventsAndClubsPage } from "@/components/events/EventsAndClubsPage";
import NotificationDropdown from "@/components/NotificationDropdown";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { profile } = useUserProfile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleProfileClick = () => {
    setActiveSection("profile");
  };

  const handleLeaderboardClick = () => {
    setActiveSection("leaderboard");
  };

  // Generate leaderboard data with only real users
  const generateLeaderboardData = () => {
    // For now, only show the current user until we have more real users
    const currentUser = {
      name: profile?.full_name || "You",
      department: profile?.department || "Computer Science",
      points: profile?.engagement?.activity_points || 0, // Use actual activity points from engagement
      avatar: profile?.full_name?.split(' ').map(n => n[0]).join('') || "YO",
      isCurrentUser: true,
      rank: 1
    };

    return [currentUser];
  };

  const leaderboardData = generateLeaderboardData();
  const currentUserRank = leaderboardData.find(user => user.isCurrentUser)?.rank || 1;

  const dashboardSections = [
    { id: "overview", icon: Home, label: "Overview" },
    { id: "profile", icon: User, label: "Profile" },
    { id: "events", icon: Calendar, label: "Events & Clubs" },
    { id: "leaderboard", icon: Trophy, label: "Leaderboard" },
    { id: "orders", icon: ShoppingBag, label: "Orders" },
    { id: "feedback", icon: MessageCircle, label: "Feedback" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const advancedFeatures = [
    {
      title: "Academic Tracker",
      description: "Track your academic progress and achievements",
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      status: "Coming Soon"
    },
    {
      title: "Smart Recommendations",
      description: "Get personalized event and club suggestions",
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      status: "Beta"
    },
    {
      title: "Collaboration Hub",
      description: "Connect and collaborate with peers",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      status: "New"
    }
  ];

  if (!profile || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Campus Portal</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <NotificationDropdown />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProfileClick}
              className="flex items-center space-x-2"
            >
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                <AvatarImage src={profile.profile_picture_url || undefined} />
                <AvatarFallback className="text-xs">
                  {profile.full_name?.split(' ').map(n => n[0]).join('') || user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">{profile.full_name || user.displayName}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            <div className="flex-1 overflow-y-auto py-4 sm:py-6">
              <nav className="space-y-1 px-2 sm:px-4">
                {dashboardSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm sm:text-base"
                      onClick={() => {
                        setActiveSection(section.id);
                        setIsSidebarOpen(false);
                      }}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                      {section.label}
                    </Button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content - Mobile Optimized */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-h-screen">
          {activeSection === "profile" && <NewProfilePage />}
          {activeSection === "events" && <EventsAndClubsPage />}
          
          {activeSection === "orders" && (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">Orders</h2>
                  <p className="text-muted-foreground text-sm sm:text-base">Manage your campus service orders</p>
                </div>
              </div>
              <Card className="shadow-lg">
                <CardContent className="p-6 sm:p-8 text-center">
                  <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                    You haven't placed any orders yet. Start exploring our campus services!
                  </p>
                  <Button>Browse Services</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "leaderboard" && (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">Leaderboard</h2>
                  <p className="text-muted-foreground text-sm sm:text-base">Campus activity rankings based on points</p>
                </div>
              </div>

              {/* Current User Position */}
              <Card className="shadow-lg border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-primary" />
                    Your Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        #{currentUserRank}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.profile_picture_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile?.full_name?.split(' ').map(n => n[0]).join('') || user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile?.full_name || user.displayName || 'You'}</p>
                        <p className="text-sm text-muted-foreground">{profile?.department || 'Computer Science'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{profile?.engagement?.activity_points || 0}</p>
                      <p className="text-sm text-muted-foreground">Activity Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Rankings */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Top Rankings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {leaderboardData.map((user, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${user.isCurrentUser ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          #{user.rank}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{user.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.department}</p>
                        </div>
                        {user.isCurrentUser && (
                          <Badge variant="secondary" className="ml-2">You</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{user.points}</p>
                        <p className="text-sm text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeSection === "overview" && (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
              {/* Welcome Banner */}
              <Card className="shadow-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="space-y-2">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Welcome back, {profile.full_name?.split(' ')[0] || 'Student'}!</h2>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {profile.department} • {profile.academic_year} • {profile.hall_ticket}
                      </p>
                    </div>
                    <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-primary/20 mx-auto sm:mx-0">
                      <AvatarImage src={profile.profile_picture_url || undefined} />
                      <AvatarFallback className="text-lg sm:text-xl bg-primary/10">
                        {profile.full_name?.split(' ').map(n => n[0]).join('') || user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto sm:mx-0">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-500" />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">{profile.engagement?.events_attended?.length || 0}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Events</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto sm:mx-0">
                        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-500" />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">{profile.engagement?.feedback_count || 0}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Feedback</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:bg-primary/5"
                  onClick={handleLeaderboardClick}
                >
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto sm:mx-0">
                        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-500" />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">#{currentUserRank}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Leaderboard</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto sm:mx-0">
                        <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-emerald-500" />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">{profile?.engagement?.activity_points || 0}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Activity Points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Advanced Features Preview */}
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Advanced Features</h3>
                  <Badge variant="secondary" className="text-xs">Preview</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {advancedFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-start space-x-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${feature.bgColor} flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.color}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-sm sm:text-base">{feature.title}</h4>
                                <Badge variant="outline" className="text-xs">{feature.status}</Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-3">{feature.description}</p>
                              <Button variant="outline" size="sm" className="w-full">
                                Learn More
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === "settings" && (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Settings</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Manage your account preferences</p>
              </div>
              <Card className="shadow-lg">
                <CardContent className="p-6 sm:p-8 text-center">
                  <Settings className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Settings Panel</h3>
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                    Advanced settings and preferences will be available here.
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Feedback Section */}
          {activeSection === "feedback" && (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Feedback</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Share your thoughts and suggestions</p>
              </div>
              <Card className="shadow-lg">
                <CardContent className="p-6 sm:p-8 text-center">
                  <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Feedback System</h3>
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                    Help us improve the campus experience by sharing your feedback.
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
