
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  Printer, 
  Calendar, 
  Users, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  HelpCircle,
  Bell,
  Settings,
  LogOut,
  BookOpen,
  TrendingUp,
  Star
} from "lucide-react";

const Dashboard = () => {
  const [user] = useState({
    name: "Mahesh Ch.",
    email: "mahesh@sru.edu.in",
    hallTicket: "2303A52037",
    department: "CSE",
    academicYear: "2nd Year",
    verified: true
  });

  const services = [
    {
      icon: ShoppingCart,
      title: "Campus Food",
      description: "Order from restaurants",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      href: "/food"
    },
    {
      icon: Printer,
      title: "Printing Services",
      description: "Print documents easily",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      href: "/printing"
    },
    {
      icon: Calendar,
      title: "Events & Clubs",
      description: "Campus activities",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      href: "/events"
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with peers",
      color: "text-green-500",
      bgColor: "bg-green-50",
      href: "/community"
    }
  ];

  const quickActions = [
    { icon: CreditCard, title: "Payments & Wallet", href: "/wallet" },
    { icon: FileText, title: "Forms & Applications", href: "/forms" },
    { icon: MessageSquare, title: "Complaints & Feedback", href: "/complaints" },
    { icon: HelpCircle, title: "Mentor & Helpdesk", href: "/help" }
  ];

  const recentActivity = [
    { 
      type: "order", 
      title: "Food order from Campus Canteen", 
      time: "2 hours ago", 
      status: "delivered",
      amount: "₹125"
    },
    { 
      type: "print", 
      title: "Document printed at Xerox Center", 
      time: "1 day ago", 
      status: "completed",
      amount: "₹15"
    },
    { 
      type: "event", 
      title: "Registered for Tech Fest 2025", 
      time: "2 days ago", 
      status: "confirmed",
      amount: "Free"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950">
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-campus rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CC</span>
                </div>
                <span className="text-xl font-bold bg-gradient-campus bg-clip-text text-transparent">
                  CampusConnect
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-gradient-campus text-white text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Welcome back, {user.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {user.department} • {user.academicYear} • {user.hallTicket}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Verified
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${service.bgColor} mb-4 mx-auto ${service.color}`}>
                  <service.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center mb-4">
                  {service.description}
                </CardDescription>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={service.href}>Explore</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-campus-blue" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Access frequently used features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="justify-start h-auto p-4 hover:bg-slate-50"
                      asChild
                    >
                      <Link to={action.href}>
                        <action.icon className="h-5 w-5 mr-3 text-slate-500" />
                        <span>{action.title}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Academic Progress */}
            <Card className="mt-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-campus-green" />
                  Academic Progress
                </CardTitle>
                <CardDescription>
                  Track your academic journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current CGPA</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">8.5</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Credits Completed</span>
                    <span className="text-sm text-slate-600">45/180</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Attendance</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">92%</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link to="/academic">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest transactions and interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'order' ? 'bg-orange-100 text-orange-600' :
                        activity.type === 'print' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'order' && <ShoppingCart className="h-4 w-4" />}
                        {activity.type === 'print' && <Printer className="h-4 w-4" />}
                        {activity.type === 'event' && <Calendar className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                          >
                            {activity.status}
                          </Badge>
                          <span className="text-sm font-medium text-slate-900">
                            {activity.amount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-campus-blue hover:text-campus-blue-dark">
                  View All Activity
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6 bg-gradient-campus text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Campus Points</h3>
                  <div className="text-3xl font-bold">1,247</div>
                  <p className="text-blue-100 text-sm">Earned this semester</p>
                  <Button variant="secondary" size="sm" className="mt-4">
                    Redeem Rewards
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Logout */}
        <div className="mt-8 text-center">
          <Button variant="ghost" className="text-slate-500 hover:text-slate-700" asChild>
            <Link to="/login">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
