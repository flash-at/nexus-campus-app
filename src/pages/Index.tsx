
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart, Printer, Calendar, Users, Shield, Zap, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  const features = [
    {
      icon: ShoppingCart,
      title: "Campus Food",
      description: "Order from campus restaurants and track delivery in real-time",
      color: "text-orange-500"
    },
    {
      icon: Printer,
      title: "Printing Services",
      description: "Easy document printing with pickup notifications",
      color: "text-blue-500"
    },
    {
      icon: Calendar,
      title: "Events & Clubs",
      description: "Stay updated with campus events and club activities",
      color: "text-purple-500"
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with peers and access mentor support",
      color: "text-green-500"
    }
  ];

  const benefits = [
    { icon: Shield, text: "Secure & Verified" },
    { icon: Zap, text: "Real-time Updates" },
    { icon: Users, text: "Campus Community" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 transition-colors duration-300">
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur-md dark:bg-slate-900/80 dark:border-slate-800 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-campus rounded-xl blur-sm opacity-30"></div>
              <div className="relative w-10 h-10 bg-gradient-campus rounded-xl flex items-center justify-center shadow-lg">
                <Logo className="text-white" width={24} height={24} />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-campus bg-clip-text text-transparent">
                CampusConnect
              </span>
              <div className="flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Smart Campus Platform</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-campus hover:bg-gradient-campus-dark border-0 shadow-lg">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <Badge variant="outline" className="mb-8 text-campus-blue border-campus-blue bg-blue-50 dark:bg-blue-950/50 px-4 py-2">
            🎓 Smart Campus Platform
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-slate-900 via-blue-800 to-cyan-700 dark:from-slate-100 dark:via-blue-200 dark:to-cyan-200 bg-clip-text text-transparent leading-tight">
            Your Campus,
            <br />
            <span className="relative">
              Connected & Smart
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-campus rounded-full"></div>
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Access food delivery, printing services, events, and campus essentials all in one secure platform designed for students.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button size="lg" asChild className="bg-gradient-campus hover:bg-gradient-campus-dark border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <Link to="/register" className="flex items-center px-8 py-3">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <div className="flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 px-3 py-2 rounded-full backdrop-blur-sm">
                  <benefit.icon className="h-4 w-4 text-campus-green" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-slate-100">
            Everything You Need on Campus
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            From ordering food to printing documents, CampusConnect brings all essential services to your fingertips.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/50 dark:to-blue-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="text-center pb-4 relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 mb-6 mx-auto ${feature.color} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-center text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-campus text-white border-0 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-white/10"></div>
          <CardContent className="p-16 text-center relative z-10">
            <h3 className="text-4xl font-bold mb-6">
              Ready to Transform Your Campus Experience?
            </h3>
            <p className="text-blue-100 mb-10 text-xl max-w-3xl mx-auto leading-relaxed">
              Join thousands of students already using CampusConnect to simplify their campus life and stay connected with their community.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" variant="secondary" asChild className="bg-white text-campus-blue hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3">
                <Link to="/register">Create Account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3">
                <Link to="/provider/register">Join as Provider</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-md dark:bg-slate-900/80 dark:border-slate-800 py-12 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-campus rounded-lg blur-sm opacity-30"></div>
                <div className="relative w-8 h-8 bg-gradient-campus rounded-lg flex items-center justify-center">
                  <Logo className="text-white" width={20} height={20} />
                </div>
              </div>
              <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">CampusConnect</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-center max-w-2xl">
              © 2025 CampusConnect. Made with ❤️ for students, by students. Empowering campus communities worldwide.
            </p>
            <div className="flex justify-center space-x-8 text-sm">
              <Link to="/admin/login" className="text-slate-500 hover:text-campus-blue transition-colors duration-200">
                Admin Login
              </Link>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <Link to="/provider/register" className="text-slate-500 hover:text-campus-blue transition-colors duration-200">
                Provider Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
