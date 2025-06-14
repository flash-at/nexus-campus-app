
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  HelpCircle,
  LogOut,
  Store,
  Printer,
  Coffee,
  BookOpen,
  Bell
} from "lucide-react";

const Dashboard = () => {
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

  const serviceCategories = [
    {
      title: "Food & Beverages",
      description: "Order from campus cafeterias and food courts",
      icon: <Coffee className="h-6 w-6" />,
      color: "bg-orange-500",
      count: "5 outlets"
    },
    {
      title: "Printing & Xerox",
      description: "Print documents, notes, and assignments",
      icon: <Printer className="h-6 w-6" />,
      color: "bg-blue-500",
      count: "3 centers"
    },
    {
      title: "Campus Store",
      description: "Stationery, books, and daily essentials",
      icon: <Store className="h-6 w-6" />,
      color: "bg-green-500",
      count: "2 stores"
    },
    {
      title: "Study Materials",
      description: "Notes, books, and academic resources",
      icon: <BookOpen className="h-6 w-6" />,
      color: "bg-purple-500",
      count: "Available"
    }
  ];

  const quickActions = [
    { title: "My Profile", icon: <User className="h-5 w-5" />, description: "View and edit profile" },
    { title: "Order History", icon: <ShoppingBag className="h-5 w-5" />, description: "Track past orders" },
    { title: "Events", icon: <Calendar className="h-5 w-5" />, description: "Campus events & clubs" },
    { title: "Payments", icon: <CreditCard className="h-5 w-5" />, description: "Wallet & transactions" },
    { title: "Forms", icon: <FileText className="h-5 w-5" />, description: "Applications & forms" },
    { title: "Support", icon: <HelpCircle className="h-5 w-5" />, description: "Help & complaints" }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campus-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-campus rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">CC</span>
              </div>
              <div>
                <h1 className="font-semibold text-slate-900">CampusConnect</h1>
                <p className="text-xs text-slate-500">Smart Campus Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user.displayName || user.email}</p>
                  <div className="flex items-center space-x-1">
                    <Badge variant={user.emailVerified ? "default" : "destructive"} className="text-xs">
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome back, {user.displayName || "Student"}! 👋
          </h2>
          <p className="text-slate-600">
            Access all your campus services from one convenient platform
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {serviceCategories.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    {service.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {service.count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-slate-900 mb-1">{service.title}</h3>
                <p className="text-sm text-slate-600">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used features and tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto flex-col space-y-2 p-4 hover:bg-slate-100"
                >
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    {action.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-slate-500">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Campus Cafeteria</p>
                    <p className="text-xs text-slate-500">2 items • ₹180</p>
                  </div>
                  <Badge variant="outline">Delivered</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Xerox Center</p>
                    <p className="text-xs text-slate-500">50 pages • ₹25</p>
                  </div>
                  <Badge variant="secondary">Processing</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-medium text-sm">Tech Fest 2024</p>
                  <p className="text-xs text-slate-500">Tomorrow, 10:00 AM • Auditorium</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-medium text-sm">Career Fair</p>
                  <p className="text-xs text-slate-500">Dec 15, 2024 • Main Campus</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
