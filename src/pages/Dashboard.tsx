
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
  Bell,
  Settings,
  TrendingUp,
  Clock,
  MapPin,
  Star,
  Users,
  Zap
} from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

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
      icon: <Coffee className="h-8 w-8" />,
      gradient: "from-orange-500 to-red-500",
      count: "15+ Outlets",
      status: "Available",
      stats: "⚡ 15 min avg delivery"
    },
    {
      title: "Printing & Xerox",
      description: "Print documents, notes, and assignments",
      icon: <Printer className="h-8 w-8" />,
      gradient: "from-blue-500 to-cyan-500",
      count: "50+ Locations",
      status: "Online",
      stats: "📄 50+ pages printed today"
    },
    {
      title: "Campus Store",
      description: "Stationery, books, and daily essentials",
      icon: <Store className="h-8 w-8" />,
      gradient: "from-green-500 to-emerald-500",
      count: "2 Stores",
      status: "Open",
      stats: "🛍️ 200+ items available"
    },
    {
      title: "Study Materials",
      description: "Notes, books, and academic resources",
      icon: <BookOpen className="h-8 w-8" />,
      gradient: "from-purple-500 to-pink-500",
      count: "Available",
      status: "Updated",
      stats: "📚 50+ subjects covered"
    }
  ];

  const quickActions = [
    { title: "My Profile", icon: <User className="h-6 w-6" />, description: "View and edit profile", color: "bg-blue-500" },
    { title: "Order History", icon: <ShoppingBag className="h-6 w-6" />, description: "Track past orders", color: "bg-green-500" },
    { title: "Events", icon: <Calendar className="h-6 w-6" />, description: "Campus events & clubs", color: "bg-purple-500" },
    { title: "Payments", icon: <CreditCard className="h-6 w-6" />, description: "Wallet & transactions", color: "bg-orange-500" },
    { title: "Forms", icon: <FileText className="h-6 w-6" />, description: "Applications & forms", color: "bg-pink-500" },
    { title: "Support", icon: <HelpCircle className="h-6 w-6" />, description: "Help & complaints", color: "bg-red-500" }
  ];

  const recentOrders = [
    {
      id: "ORD001",
      title: "Campus Cafeteria",
      subtitle: "Veg Biryani + Cold Drink",
      amount: "₹180",
      status: "Delivered",
      time: "2 hours ago",
      statusColor: "bg-green-100 text-green-800"
    },
    {
      id: "ORD002", 
      title: "Xerox Center",
      subtitle: "50 pages - Computer Networks Notes",
      amount: "₹25",
      status: "Processing",
      time: "30 minutes ago",
      statusColor: "bg-yellow-100 text-yellow-800"
    },
    {
      id: "ORD003",
      title: "Campus Store",
      subtitle: "Notebook + Pens (3 items)",
      amount: "₹120",
      status: "Ready",
      time: "1 hour ago",
      statusColor: "bg-blue-100 text-blue-800"
    }
  ];

  const upcomingEvents = [
    {
      title: "Tech Fest 2024",
      date: "Tomorrow",
      time: "10:00 AM",
      location: "Main Auditorium",
      type: "Competition",
      attendees: "500+"
    },
    {
      title: "Career Fair",
      date: "Dec 15, 2024",
      time: "9:00 AM",
      location: "Sports Complex",
      type: "Placement",
      attendees: "50+ Companies"
    },
    {
      title: "Cultural Night",
      date: "Dec 20, 2024",
      time: "6:00 PM",
      location: "Open Ground",
      type: "Cultural",
      attendees: "1000+"
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/80 dark:supports-[backdrop-filter]:bg-gray-950/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Logo className="text-white" width={24} height={24} />
                </div>
                <div>
                  <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CampusConnect</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Smart Campus Platform</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </Button>
              <ThemeToggle />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.displayName || user.email?.split('@')[0]}</p>
                  <Badge variant={user.emailVerified ? "default" : "destructive"} className="text-xs">
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Welcome back, {user.displayName?.split(' ')[0] || "Student"}! 👋
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Here's what's happening on your campus today
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">15</div>
                <div className="text-sm opacity-90">Orders This Month</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">₹1,250</div>
                <div className="text-sm opacity-90">Total Spent</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">4.8</div>
                <div className="text-sm opacity-90">Avg Rating</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-4 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm opacity-90">Events Attended</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {serviceCategories.map((service, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden cursor-pointer">
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              <CardHeader className="relative z-10 text-center pb-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} mb-4 mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <div className="text-white">{service.icon}</div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {service.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{service.count}</div>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-sm mb-3 leading-relaxed">
                  {service.description}
                </CardDescription>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {service.stats}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Zap className="h-6 w-6 mr-3 text-blue-600" />
              Quick Actions
            </CardTitle>
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
                  className="h-auto flex-col space-y-3 p-6 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl group transition-all duration-300 hover:shadow-lg"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">{action.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <ShoppingBag className="h-6 w-6 mr-3 text-green-600" />
                Recent Orders
              </CardTitle>
              <CardDescription>Your latest purchases and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
                        {order.id.slice(-2)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{order.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{order.subtitle}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{order.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{order.amount}</p>
                      <Badge className={`text-xs ${order.statusColor}`}>{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Calendar className="h-6 w-6 mr-3 text-purple-600" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Don't miss these campus activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {event.attendees}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
