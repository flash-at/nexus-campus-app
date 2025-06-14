
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart, Printer, Calendar, Users, Shield, Zap, Star, CheckCircle, Globe, Smartphone } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  const features = [
    {
      icon: ShoppingCart,
      title: "Campus Food Delivery",
      description: "Order from your favorite campus restaurants with real-time tracking and fast delivery",
      color: "from-orange-400 to-red-500",
      stats: "15+ Restaurants"
    },
    {
      icon: Printer,
      title: "Smart Printing",
      description: "Print documents instantly across campus with our smart printing network",
      color: "from-blue-400 to-cyan-500",
      stats: "50+ Locations"
    },
    {
      icon: Calendar,
      title: "Campus Events",
      description: "Never miss out on campus activities, club meetings, and academic events",
      color: "from-purple-400 to-pink-500",
      stats: "200+ Events/Month"
    },
    {
      icon: Users,
      title: "Student Community",
      description: "Connect with peers, find study groups, and build lasting relationships",
      color: "from-green-400 to-emerald-500",
      stats: "5000+ Students"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      text: "CampusConnect made my campus life so much easier. I can order food between classes and never worry about printing assignments.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Business Major",
      text: "The community features helped me find my study group and stay updated with all campus events. It's a game-changer!",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Graduate Student",
      text: "From food delivery to event notifications, this platform has everything a student needs in one place.",
      rating: 5
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Students" },
    { number: "50+", label: "Partner Restaurants" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Logo className="text-white dark:text-white" width={24} height={24} />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CampusConnect
              </span>
              <div className="text-xs text-slate-500 dark:text-slate-400">Smart Campus Platform</div>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="#features" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
              Features
            </Link>
            <Link to="#about" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
              About
            </Link>
            <Link to="#testimonials" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
              Reviews
            </Link>
          </nav>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-8 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
              🚀 Launching Campus Revolution
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-slate-100 dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Your Campus Life,
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Simplified & Connected
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience the future of campus living with our all-in-one platform. From food delivery to event management, 
              we bring everything you need right to your fingertips.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                <Link to="/register" className="flex items-center">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" asChild className="px-8 py-4 text-lg">
                <Link to="/demo">
                  <Globe className="mr-2 h-5 w-5" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Everything You Need on Campus
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Discover powerful features designed specifically for the modern student lifestyle
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{feature.stats}</div>
                </CardHeader>
                <CardContent className="relative z-10 text-center">
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Loved by Students Everywhere
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              See what our community has to say about their experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{testimonial.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Campus Experience?
            </h3>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join thousands of students who have already discovered the future of campus life. 
              Get started today and see the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" variant="secondary" asChild className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 text-lg">
                <Link to="/register">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Create Free Account
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                <Link to="/provider/register">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Partner With Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Logo className="text-white" width={20} height={20} />
                </div>
                <span className="text-xl font-semibold">CampusConnect</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Empowering students with smart campus solutions for a better college experience.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="#" className="hover:text-white transition-colors">Food Delivery</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Printing Services</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Events</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Access</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Student Login</Link></li>
                <li><Link to="/admin/login" className="hover:text-white transition-colors">Admin Portal</Link></li>
                <li><Link to="/provider/register" className="hover:text-white transition-colors">Partner Portal</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-400 text-sm">
              © 2025 CampusConnect. Made with ❤️ for students, by students.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #000 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .dark .bg-grid-pattern {
          background-image: radial-gradient(circle, #fff 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
};

export default Index;
