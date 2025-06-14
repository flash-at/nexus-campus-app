
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  ShoppingCart, 
  Printer, 
  Calendar, 
  Users, 
  Star, 
  CheckCircle, 
  Globe, 
  Smartphone,
  Coffee,
  BookOpen,
  Clock,
  Shield,
  Zap,
  Award,
  TrendingUp,
  Heart,
  MessageCircle
} from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  const features = [
    {
      icon: ShoppingCart,
      title: "Food Delivery",
      description: "Order from campus restaurants with lightning-fast delivery",
      gradient: "from-orange-500 to-red-500",
      stats: "15+ Restaurants",
      delay: "0ms"
    },
    {
      icon: Printer,
      title: "Smart Printing",
      description: "Print documents instantly across all campus locations",
      gradient: "from-blue-500 to-cyan-500",
      stats: "50+ Locations",
      delay: "100ms"
    },
    {
      icon: Calendar,
      title: "Campus Events",
      description: "Stay updated with all campus activities and club meetings",
      gradient: "from-purple-500 to-pink-500",
      stats: "200+ Events/Month",
      delay: "200ms"
    },
    {
      icon: Users,
      title: "Student Hub",
      description: "Connect with peers and build lasting relationships",
      gradient: "from-green-500 to-emerald-500",
      stats: "5000+ Students",
      delay: "300ms"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science, 3rd Year",
      avatar: "SC",
      text: "CampusConnect transformed how I manage my daily campus life. From ordering food to printing assignments, everything is seamless.",
      rating: 5,
      color: "from-blue-500 to-purple-500"
    },
    {
      name: "Michael Rodriguez",
      role: "Business Administration, 2nd Year",
      avatar: "MR",
      text: "The community features helped me find my study group and connect with like-minded students. It's indispensable!",
      rating: 5,
      color: "from-green-500 to-teal-500"
    },
    {
      name: "Emily Johnson",
      role: "Engineering, Final Year",
      avatar: "EJ",
      text: "From event notifications to quick food orders, this platform has everything a student needs in one beautiful interface.",
      rating: 5,
      color: "from-pink-500 to-orange-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Students", icon: Users },
    { number: "50+", label: "Campus Partners", icon: Award },
    { number: "99.9%", label: "Uptime", icon: Shield },
    { number: "24/7", label: "Support", icon: Clock }
  ];

  const benefits = [
    { icon: Zap, title: "Lightning Fast", description: "Get your orders in minutes" },
    { icon: Shield, title: "Secure & Safe", description: "Your data is protected" },
    { icon: Heart, title: "Student First", description: "Built by students, for students" },
    { icon: TrendingUp, title: "Always Improving", description: "Regular updates and new features" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/80 dark:supports-[backdrop-filter]:bg-gray-950/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Logo className="text-white" width={28} height={28} />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CampusConnect
                </span>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Smart Campus Living</div>
              </div>
            </Link>
            
            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors font-medium">
                Features
              </Link>
              <Link to="#testimonials" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors font-medium">
                Reviews
              </Link>
              <Link to="#about" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors font-medium">
                About
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="ghost" asChild className="hidden sm:inline-flex font-medium">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="container mx-auto px-6 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="font-medium">Revolutionizing Campus Life</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-gray-100 dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Your Campus,
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Experience seamless campus living with our intelligent platform. From instant food delivery to smart printing, 
              everything you need is just a tap away.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
                <Link to="/register" className="flex items-center">
                  Start Your Journey
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" asChild className="px-10 py-6 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                <Link to="/demo">
                  <Globe className="mr-3 h-6 w-6" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="group">
                  <div className="flex flex-col items-center p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                    <stat.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Everything You Need, One Platform
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Discover powerful features designed specifically for modern student life
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: feature.delay }}
              >
                <Card className="h-full border-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  <CardHeader className="text-center pb-4 relative z-10">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.gradient} mb-6 mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110`}>
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-3 text-gray-900 dark:text-gray-100">{feature.title}</CardTitle>
                    <Badge variant="outline" className="mb-4 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      {feature.stats}
                    </Badge>
                  </CardHeader>
                  <CardContent className="relative z-10 text-center px-6">
                    <CardDescription className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Why Choose CampusConnect?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Loved by Students Everywhere
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              See what our community has to say about their experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${testimonial.color} flex items-center justify-center text-white font-bold mr-4`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{testimonial.name}</div>
                      <div className="text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h3 className="text-4xl md:text-6xl font-bold mb-8">
              Ready to Transform Your Campus Life?
            </h3>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed">
              Join thousands of students who have already discovered the future of campus living. 
              Get started today and experience the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Button size="lg" variant="secondary" asChild className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-6 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
                <Link to="/register">
                  <CheckCircle className="mr-3 h-6 w-6" />
                  Create Free Account
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-2 border-white text-white hover:bg-white/10 px-10 py-6 text-lg font-semibold transition-all duration-300">
                <Link to="/provider/register">
                  <Smartphone className="mr-3 h-6 w-6" />
                  Partner With Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Logo className="text-white" width={28} height={28} />
                </div>
                <div>
                  <span className="text-2xl font-bold">CampusConnect</span>
                  <div className="text-gray-400 text-sm">Smart Campus Living</div>
                </div>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                Empowering students with intelligent campus solutions for a seamless, connected college experience.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Platform</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Food Delivery</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Printing Services</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Events</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Support</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                © 2025 CampusConnect. Made with ❤️ for students, by students.
              </p>
              <div className="flex space-x-6">
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Student Login</Link>
                <Link to="/admin/login" className="text-gray-400 hover:text-white transition-colors">Admin Portal</Link>
                <Link to="/provider/register" className="text-gray-400 hover:text-white transition-colors">Partner Portal</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
