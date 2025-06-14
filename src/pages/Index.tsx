
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Feather,
  BookOpen,
  Briefcase,
  University,
  Star,
  CheckCircle,
  Quote,
  ShieldCheck
} from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  const features = [
    {
      icon: University,
      title: "Unified Campus Hub",
      description: "Access all campus services, from dining to printing, in one centralized platform.",
      color: "text-blue-500",
    },
    {
      icon: BookOpen,
      title: "Academic Excellence",
      description: "Tools and resources to support your studies, track progress, and collaborate.",
      color: "text-purple-500",
    },
    {
      icon: Briefcase,
      title: "Career Development",
      description: "Connect with mentors, find internships, and prepare for your future career.",
      color: "text-emerald-500",
    },
    {
      icon: Feather,
      title: "Student Life",
      description: "Discover events, join clubs, and engage with the vibrant campus community.",
      color: "text-amber-500",
    },
  ];

  const testimonials = [
    {
      name: "Ananya Sharma",
      role: "Engineering, 2nd Year",
      text: "CampusConnect has truly streamlined my college life. It's the one app I use every single day for everything from academics to social events.",
    },
    {
      name: "Rohan Gupta",
      role: "Business, Final Year",
      text: "The career hub is a fantastic resource. I found my summer internship through the platform and connected with amazing mentors.",
    },
  ];

  return (
    <div className="bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Logo className="text-white" width={22} height={22} />
            </div>
            <span className="text-xl font-semibold">
              CampusConnect
            </span>
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            <a href="#cta" className="text-muted-foreground hover:text-foreground transition-colors">Join Us</a>
          </nav>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-28 lg:py-40 border-b">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom_1px_center"></div>
        <div className="container mx-auto px-6 text-center relative">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-gray-900 dark:text-gray-100 animate-fade-in">
            Elevate Your Campus Experience.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fade-in" style={{animationDelay: '200ms'}}>
            CampusConnect is the essential platform for modern students, bringing together academics, services, and community into one seamless, intelligent hub.
          </p>
          <div className="flex gap-4 justify-center animate-fade-in" style={{animationDelay: '400ms'}}>
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link to="/register">
                Join Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
              <Link to="/provider/register">Partner with Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">A Foundation for Success</h2>
            <p className="text-muted-foreground text-lg">
              We provide the tools and connections you need to thrive during your academic journey and beyond.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 bg-background rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 mb-5`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">From Our Students</h2>
            <p className="text-muted-foreground text-lg">
              Hear what the CampusConnect community has to say about their experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 border-border/60 shadow-sm animate-fade-in" style={{animationDelay: `${index * 150}ms`}}>
                <Quote className="w-10 h-10 text-blue-200 dark:text-blue-900 mb-4" fill="currentColor" />
                <p className="text-muted-foreground text-lg mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-muted-foreground text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-24 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12 text-center shadow-xl">
            <h3 className="text-4xl font-serif font-bold mb-4">Ready to Connect?</h3>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
              Create your free account today and unlock a smarter way to navigate campus life.
            </p>
            <Button size="lg" variant="secondary" asChild className="bg-white text-blue-600 hover:bg-gray-100 h-14 px-10 text-lg font-semibold shadow-2xl hover:shadow-none transition-shadow transform hover:-translate-y-1">
              <Link to="/register">
                <CheckCircle className="mr-3 h-6 w-6" />
                Create Your Account
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-12 gap-8 mb-8">
            <div className="col-span-12 md:col-span-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Logo className="text-white" width={20} height={20} />
                </div>
                <span className="text-lg font-semibold">CampusConnect</span>
              </div>
              <p className="text-muted-foreground">
                The essential platform for modern campus life.
              </p>
            </div>
            
            <div className="col-span-6 md:col-span-2">
              <h4 className="font-semibold mb-4 text-foreground">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors">For Students</Link></li>
                <li><Link to="/provider/register" className="text-muted-foreground hover:text-foreground transition-colors">For Partners</Link></li>
              </ul>
            </div>
            
            <div className="col-span-6 md:col-span-2">
              <h4 className="font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            <div className="col-span-6 md:col-span-2">
              <h4 className="font-semibold mb-4 text-foreground">Login</h4>
              <ul className="space-y-3">
                <li><Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Student Portal</Link></li>
                <li><Link to="/provider/login" className="text-muted-foreground hover:text-foreground transition-colors">Partner Portal</Link></li>
                <li><Link to="/admin/login" className="text-muted-foreground hover:text-foreground transition-colors">Admin Portal</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-muted-foreground mb-4 md:mb-0">
              © 2025 CampusConnect. All rights reserved.
            </p>
            <div className="flex space-x-4 text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
