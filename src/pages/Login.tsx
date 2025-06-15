import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Shield, Users, Zap } from "lucide-react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile, createUserProfile } from "@/services/userService";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { cleanupAuthState } from "@/utils/authCleanup";
import { Turnstile } from '@marsidev/react-turnstile';
import { useTheme } from 'next-themes';

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Redirect if already logged in
  if (user && user.emailVerified) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!turnstileToken) {
      toast.error("Please complete the security check.");
      return;
    }

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      // Clean up any existing auth state before login
      cleanupAuthState();
      
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      if (!userCredential.user.emailVerified) {
        toast.error("Your email is not verified. Please check your inbox or spam folder.");
        await sendEmailVerification(userCredential.user);
        toast.info("A new verification email has been sent.");
        return;
      }

      // Check if user profile exists in Supabase
      const profile = await getUserProfile(userCredential.user.uid);
      
      if (!profile) {
        toast.error("User profile not found. Please contact support.");
        return;
      }
      
      toast.success("Welcome back to CampusConnect!");
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/user-not-found') {
        toast.error("No account found with this email. Please register first.");
      } else if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect password. Please try again.");
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Invalid email address.");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Clean up any existing auth state before Google login
      cleanupAuthState();
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not redirect to complete registration
      const profile = await getUserProfile(result.user.uid);
      
      if (!profile) {
        toast.info("Please complete your registration with your academic details.");
        navigate("/register");
        return;
      }
      
      toast.success("Google sign-in successful!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  const features = [
    { icon: Shield, title: "Secure Login", description: "Your data is protected with enterprise-grade security" },
    { icon: Users, title: "Join 10K+ Students", description: "Connect with the largest campus community" },
    { icon: Zap, title: "Instant Access", description: "Get access to all campus services immediately" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" asChild className="group">
            <Link to="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </Button>
          <ThemeToggle />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          {/* Left Side - Info */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Logo className="text-white" width={28} height={28} />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CampusConnect
                </h1>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Welcome Back to Your Campus
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Sign in to access your personalized campus experience and connect with your community.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              {/* Mobile Logo */}
              <div className="text-center mb-8 lg:hidden">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Logo className="text-white" width={24} height={24} />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CampusConnect
                  </h1>
                </div>
              </div>

              <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome Back</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Sign in to access your campus services and community
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.name@college.edu.in"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <Lock className="h-4 w-4" />
                          Password
                        </Label>
                        <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-blue-500 pr-12"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Security Check</Label>
                      <Turnstile
                        siteKey="0x4AAAAAABhG1NBeHRl27Rjz"
                        onSuccess={setTurnstileToken}
                        options={{
                          theme: theme === 'dark' ? 'dark' : 'light',
                        }}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isLoading || !turnstileToken}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>

                  <div className="mt-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400 font-medium">Or continue with</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <Button 
                        variant="outline" 
                        className="w-full h-12 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 font-medium"
                        onClick={handleGoogleSignIn}
                      >
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Continue with Google
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8 text-center pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400">
                      Don't have an account?{" "}
                      <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                        Create Account
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
