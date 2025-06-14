
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Mail, User, Phone, GraduationCap, Sparkles, Shield, Users, BookOpen, AlertCircle } from "lucide-react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile, checkHallTicketExists } from "@/services/userService";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    fullName: "",
    hallTicket: "",
    email: "",
    department: "",
    academicYear: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const departments = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering", 
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical & Electronics Engineering",
    "Information Technology",
    "Chemical Engineering",
    "Biotechnology"
  ];

  const academicYears = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'fullName':
        if (!value || value.length < 2 || value.length > 60) {
          newErrors.fullName = "Full name must be between 2-60 characters";
        } else {
          delete newErrors.fullName;
        }
        break;
      case 'hallTicket':
        const hallTicketRegex = /^[0-9A-Z]{10}$/;
        if (!hallTicketRegex.test(value)) {
          newErrors.hallTicket = "Hall ticket must be exactly 10 characters (numbers and uppercase letters only)";
        } else {
          delete newErrors.hallTicket;
        }
        break;
      case 'email':
        if (!value.endsWith('.edu.in')) {
          newErrors.email = "Email must end with .edu.in";
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(value)) {
          newErrors.phone = "Phone number must be exactly 10 digits";
        } else {
          delete newErrors.phone;
        }
        break;
      case 'password':
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(value)) {
          newErrors.password = "Password must contain at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 symbol";
        } else {
          delete newErrors.password;
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName || formData.fullName.length < 2 || formData.fullName.length > 60) {
      newErrors.fullName = "Full name must be between 2-60 characters";
    }

    const hallTicketRegex = /^[0-9A-Z]{10}$/;
    if (!hallTicketRegex.test(formData.hallTicket)) {
      newErrors.hallTicket = "Hall ticket must be exactly 10 characters (numbers and uppercase letters only)";
    }

    if (!formData.email.endsWith('.edu.in')) {
      newErrors.email = "Email must end with .edu.in";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must contain at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 symbol";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.department || !formData.academicYear) {
      newErrors.department = "Please select your department and academic year";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    try {
      const hallTicketExists = await checkHallTicketExists(formData.hallTicket);
      if (hallTicketExists) {
        newErrors.hallTicket = "This hall ticket number is already registered";
        setErrors(newErrors);
        return false;
      }
    } catch (error) {
      console.error("Error checking hall ticket:", error);
      toast.error("Unable to verify hall ticket. Please try again.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Starting registration process...");
    
    const isValid = await validateForm();
    if (!isValid) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Creating Firebase user...");
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      console.log("Firebase user created successfully:", userCredential.user.uid);
      
      // Send email verification
      try {
        await sendEmailVerification(userCredential.user);
        console.log("Email verification sent");
      } catch (verificationError) {
        console.warn("Email verification failed:", verificationError);
        // Continue with registration even if email verification fails
      }
      
      // Create user profile in Supabase
      console.log("Creating user profile...");
      const profile = await createUserProfile(userCredential.user, {
        fullName: formData.fullName,
        hallTicket: formData.hallTicket,
        department: formData.department,
        academicYear: formData.academicYear,
        phoneNumber: formData.phone,
      });

      if (profile) {
        console.log("User profile created successfully");
        toast.success("Registration successful! Please check your email to verify your account.", {
          duration: 5000,
        });
        
        // Clear form
        setFormData({
          fullName: "",
          hallTicket: "",
          email: "",
          department: "",
          academicYear: "",
          phone: "",
          password: "",
          confirmPassword: ""
        });
        
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error("Failed to create user profile");
      }
      
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = "An account with this email already exists. Please try logging in instead.";
            break;
          case 'auth/weak-password':
            errorMessage = "Password is too weak. Please choose a stronger password.";
            break;
          case 'auth/invalid-email':
            errorMessage = "Please enter a valid email address.";
            break;
          case 'auth/configuration-not-found':
            errorMessage = "Authentication service is temporarily unavailable. Please try again later.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Network error. Please check your connection and try again.";
            break;
          default:
            errorMessage = `Registration failed: ${error.message}`;
        }
      }
      
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <ThemeToggle />
        </div>

        <div className="max-w-md mx-auto">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Logo className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                CampusConnect
              </h1>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Create Your Account
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Join the campus community and access all services
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    onBlur={(e) => handleBlur("fullName", e.target.value)}
                    className={`${errors.fullName ? 'border-red-500 focus:border-red-500' : ''}`}
                    required
                  />
                  {errors.fullName && (
                    <p className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Hall Ticket */}
                <div className="space-y-2">
                  <Label htmlFor="hallTicket" className="flex items-center gap-2 text-sm font-medium">
                    <GraduationCap className="h-4 w-4" />
                    Hall Ticket Number
                  </Label>
                  <Input
                    id="hallTicket"
                    type="text"
                    placeholder="e.g., 2303A52037"
                    value={formData.hallTicket}
                    onChange={(e) => handleInputChange("hallTicket", e.target.value.toUpperCase())}
                    onBlur={(e) => handleBlur("hallTicket", e.target.value)}
                    className={`font-mono ${errors.hallTicket ? 'border-red-500 focus:border-red-500' : ''}`}
                    maxLength={10}
                    required
                  />
                  {errors.hallTicket && (
                    <p className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      {errors.hallTicket}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.name@college.edu.in"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={(e) => handleBlur("email", e.target.value)}
                    className={`${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    required
                  />
                  {errors.email && (
                    <p className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Department and Academic Year */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Department</Label>
                    <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                      <SelectTrigger className={`${errors.department ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Academic Year</Label>
                    <Select value={formData.academicYear} onValueChange={(value) => handleInputChange("academicYear", value)}>
                      <SelectTrigger className={`${errors.department ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {errors.department && (
                    <p className="flex items-center gap-1 text-sm text-red-500 col-span-2">
                      <AlertCircle className="h-3 w-3" />
                      {errors.department}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ''))}
                    onBlur={(e) => handleBlur("phone", e.target.value)}
                    className={`${errors.phone ? 'border-red-500 focus:border-red-500' : ''}`}
                    maxLength={10}
                    required
                  />
                  {errors.phone && (
                    <p className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      onBlur={(e) => handleBlur("password", e.target.value)}
                      className={`pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
                      className={`pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Create Account</span>
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center mt-6 pt-4 border-t">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Sign In
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
