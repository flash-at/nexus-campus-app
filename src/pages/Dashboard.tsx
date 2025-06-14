import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  FileText, 
  Store, 
  MessageSquare, 
  Users,
  TrendingUp,
  BookOpen,
  Target,
  Newspaper,
  MessageCircle,
  Bot,
  Briefcase,
  Shield,
  Settings,
  LogOut,
  Bell,
  Clock,
  Zap
} from "lucide-react";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { useProfile } from "@/hooks/useProfile";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const { profile } = useProfile();
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

  const dashboardSections = [
    { id: "overview", label: "Dashboard", icon: TrendingUp },
    { id: "profile", label: "Profile", icon: User },
    { id: "services", label: "Services", icon: ShoppingBag },
    { id: "events", label: "Events & Clubs", icon: Calendar },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "forms", label: "Forms", icon: FileText },
    { id: "store", label: "Campus Store", icon: Store },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "mentor", label: "Mentor", icon: Users },
  ];

  const advancedFeatures = [
    { id: "progress", label: "Academic Progress", icon: TrendingUp },
    { id: "notes", label: "Notes & Planner", icon: BookOpen },
    { id: "gamification", label: "Achievements", icon: Target },
    { id: "news", label: "Campus News", icon: Newspaper },
    { id: "connect", label: "Peer Connect", icon: MessageCircle },
    { id: "ai", label: "AI Assistant", icon: Bot },
    { id: "career", label: "Career Hub", icon: Briefcase },
    { id: "vault", label: "Document Vault", icon: Shield },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-blue-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CampusConnect</h1>
            <Badge variant="outline" className="text-primary border-primary/30">
              Student Portal
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                3
              </span>
            </Button>
            
            <Avatar>
              <AvatarImage src={profile?.profile_picture} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {profile?.full_name?.split(' ').map(n => n[0]).join('') || user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-right">
              <p className="text-sm font-medium">{profile?.full_name || user.displayName || user.email?.split('@')[0]}</p>
              <p className="text-xs text-muted-foreground">{profile?.hall_ticket || 'CS21B0001'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-card/30 backdrop-blur-xl min-h-screen p-6">
          <div className="space-y-6">
            {/* Core Features */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Core Features
              </h3>
              <div className="space-y-1">
                {dashboardSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveSection(section.id)}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {section.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Features */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Advanced Features
              </h3>
              <div className="space-y-1">
                {advancedFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Button
                      key={feature.id}
                      variant={activeSection === feature.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveSection(feature.id)}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {feature.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Settings */}
            <div className="pt-6 border-t border-border">
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeSection === "profile" && <ProfilePage />}
          
          {activeSection === "overview" && (
            <div className="space-y-8 animate-fade-in">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      👋 Welcome back, {profile?.full_name?.split(' ')[0] || user.displayName?.split(' ')[0] || 'Student'}!
                    </h2>
                    <p className="text-white/80 text-lg">Ready to make your campus life easier?</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80">Today's Date</p>
                    <p className="text-xl font-semibold">June 14, 2025</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">3</p>
                        <p className="text-sm text-muted-foreground">Events Today</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{profile?.cgpa?.toFixed(1) || '8.7'}</p>
                        <p className="text-sm text-muted-foreground">CGPA</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                        <Target className="h-6 w-6 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{profile?.activity_points || 450}</p>
                        <p className="text-sm text-muted-foreground">Activity Points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-primary" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20">
                      <ShoppingBag className="h-4 w-4 mr-3" />
                      Order Food from Campus
                    </Button>
                    <Button className="w-full justify-start bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/20">
                      <FileText className="h-4 w-4 mr-3" />
                      Submit Assignment
                    </Button>
                    <Button className="w-full justify-start bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20">
                      <Calendar className="h-4 w-4 mr-3" />
                      View Class Schedule
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 rounded-xl bg-card border">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Food order delivered</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 rounded-xl bg-card border">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Joined study group</p>
                        <p className="text-xs text-muted-foreground">Yesterday</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 rounded-xl bg-card border">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Form submitted</p>
                        <p className="text-xs text-muted-foreground">2 days ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Events & Notifications */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      Upcoming Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Tech Club Meeting</h4>
                            <p className="text-sm text-muted-foreground">Discussion on AI trends</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Today</p>
                          <p className="text-xs text-muted-foreground">4:00 PM</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-purple-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Assignment Deadline</h4>
                            <p className="text-sm text-muted-foreground">Data Structures project</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Tomorrow</p>
                          <p className="text-xs text-muted-foreground">11:59 PM</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-orange-500" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-sm font-medium text-blue-500">New service request approved</p>
                        <p className="text-xs text-muted-foreground mt-1">Your printing request is ready</p>
                      </div>
                      
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <p className="text-sm font-medium text-purple-500">Resume deadline reminder</p>
                        <p className="text-xs text-muted-foreground mt-1">3 days left to submit</p>
                      </div>
                      
                      <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <p className="text-sm font-medium text-green-500">New club invitation</p>
                        <p className="text-xs text-muted-foreground mt-1">Photography club wants you!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Other sections */}
          {activeSection !== "overview" && activeSection !== "profile" && (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
                {(() => {
                  const section = [...dashboardSections, ...advancedFeatures].find(s => s.id === activeSection);
                  const Icon = section?.icon || FileText;
                  return <Icon className="h-8 w-8 text-primary" />;
                })()}
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {[...dashboardSections, ...advancedFeatures].find(s => s.id === activeSection)?.label}
              </h3>
              <p className="text-muted-foreground mb-6">
                This section is coming soon! We're working hard to bring you amazing features.
              </p>
              <Button onClick={() => setActiveSection("overview")}>
                Back to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
