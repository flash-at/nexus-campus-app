import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const ProviderLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let userCredential;
      
      // For the specific partner email, always try to create/reset the account
      if (email === 'maheshch1094@gmail.com') {
        try {
          // Try to create a new account first
          console.log("Creating partner account...");
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Create vendor record in Supabase
          const { error: vendorError } = await supabase
            .from('vendors')
            .insert({
              firebase_uid: userCredential.user.uid,
              business_name: 'Campus Vendor',
              category: 'Food & Beverages',
              description: 'Campus service provider',
              status: 'approved'
            });

          if (vendorError) {
            console.error('Error creating vendor record:', vendorError);
          }

          toast.success("Partner account created successfully!");
        } catch (createError: any) {
          // If account already exists, try to sign in
          if (createError.code === 'auth/email-already-in-use') {
            console.log("Account exists, trying to sign in...");
            userCredential = await signInWithEmailAndPassword(auth, email, password);
          } else {
            throw createError;
          }
        }
      } else {
        // For other emails, just try to sign in
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      if (userCredential?.user) {
        // Check if this user is a registered vendor
        const { data: vendor, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('firebase_uid', userCredential.user.uid)
          .single();

        if (vendorError && vendorError.code !== 'PGRST116') {
          console.error('Error checking vendor status:', vendorError);
          toast.error("Error verifying partner status");
          return;
        }

        if (!vendor) {
          toast.error("This account is not registered as a partner");
          await auth.signOut();
          return;
        }

        if (vendor.status !== 'approved') {
          toast.error("Your partner account is pending approval");
          await auth.signOut();
          return;
        }

        toast.success("Signed in successfully!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      let errorMessage = "Sign in failed. Please try again.";
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email";
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = "Incorrect email or password";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password should be at least 6 characters";
          break;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-gray-950 dark:via-green-950 dark:to-teal-950">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" asChild className="group">
            <Link to="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </Button>
          <ThemeToggle />
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl flex items-center justify-center">
                  <Logo className="text-white" width={28} height={28} />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  CampusConnect
                </h1>
              </div>
            </div>

            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Partner Portal</CardTitle>
                <CardDescription>Sign in to manage your services</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Mail className="h-4 w-4" />
                      Business Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="manager@business.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-green-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <Lock className="h-4 w-4" />
                        Password
                      </Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-green-500 pr-12"
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

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center text-center pt-0 pb-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    Not a partner yet?{" "}
                    <Link to="/provider/register" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
                      Register Here
                    </Link>
                  </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderLogin;
