
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart, Printer, Calendar, Users, Shield, Zap } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950">
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-campus rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="text-xl font-bold bg-gradient-campus bg-clip-text text-transparent">
              CampusConnect
            </span>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-campus hover:bg-gradient-campus-dark border-0">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <Badge variant="outline" className="mb-6 text-campus-blue border-campus-blue">
            🎓 Smart Campus Platform
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-cyan-800 dark:from-slate-100 dark:via-blue-200 dark:to-cyan-200 bg-clip-text text-transparent leading-tight">
            Your Campus,
            <br />
            Connected & Smart
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Access food delivery, printing services, events, and campus essentials all in one secure platform designed for students.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" asChild className="bg-gradient-campus hover:bg-gradient-campus-dark border-0 shadow-lg">
              <Link to="/register" className="flex items-center">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <benefit.icon className="h-4 w-4 text-campus-green" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Everything You Need on Campus
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From ordering food to printing documents, CampusConnect brings all essential services to your fingertips.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
              <CardHeader className="text-center pb-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 mb-4 mx-auto ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-campus text-white border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Transform Your Campus Experience?
            </h3>
            <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
              Join thousands of students already using CampusConnect to simplify their campus life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="bg-white text-campus-blue hover:bg-slate-100">
                <Link to="/register">Create Account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
                <Link to="/provider/register">Join as Provider</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-campus rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">CC</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">CampusConnect</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            © 2025 CampusConnect. Made with ❤️ for students.
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <Link to="/admin/login" className="text-slate-500 hover:text-campus-blue transition-colors">
              Admin Login
            </Link>
            <span className="text-slate-300">•</span>
            <Link to="/provider/register" className="text-slate-500 hover:text-campus-blue transition-colors">
              Provider Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
