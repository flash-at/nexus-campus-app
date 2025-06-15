import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Mail, User, Phone, GraduationCap, Sparkles, Shield, Users, BookOpen, AlertCircle, CheckCircle } from "lucide-react";
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

  // NEW: Allow non-edu sign up toggle
  const [allowNonEdu, setAllowNonEdu] = useState(false);

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

  // Modified validateField for email check
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
        if (!allowNonEdu) {
          if (!value.endsWith('.edu.in')) {
            newErrors.email = "Email must end with .edu.in (tap below if you want to use a personal Gmail)";
          } else {
            delete newErrors.email;
          }
        } else {
          // Relaxed: Accept any email, just require basic email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            newErrors.email = "Please enter a valid email address";
          } else {
            delete newErrors.email;
          }
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

  // Adjusted validateForm to support allowNonEdu
  const validateForm = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName || formData.fullName.length < 2 || formData.fullName.length > 60) {
      newErrors.fullName = "Full name must be between 2-60 characters";
    }

    const hallTicketRegex = /^[0-9A-Z]{10}$/;
    if (!hallTicketRegex.test(formData.hallTicket)) {
      newErrors.hallTicket = "Hall ticket must be exactly 10 characters (numbers and uppercase letters only)";
    }

    // Changed email check for personal emails
    if (!allowNonEdu) {
      if (!formData.email.endsWith('.edu.in')) {
        newErrors.email = "Email must end with .edu.in";
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
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

    // Only check hall-ticket collision if NOT a personal account
    if (!allowNonEdu) {
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
    }

    return true;
  };

const checkFirebaseUidExists = async (firebaseUid: string): Promise<boolean> => {
  try {
    // Check if user with this Firebase UID exists in Supabase
    const { data, error } = await import("@/integrations/supabase/client").then(m => m.supabase)
      .from("users")
      .select("id")
      .eq("firebase_uid", firebaseUid)
      .maybeSingle();
    if (error) {
      console.warn("Error checking Firebase UID in users table:", error);
      return false;
    }
    return !!data;
  } catch (e) {
    console.error("Exception while checking firebase_uid:", e);
    return false;
  }
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

      // Check Supabase for existing user (avoid duplicate profile error)
      const alreadyExists = await checkFirebaseUidExists(userCredential.user.uid);
      if (alreadyExists) {
        toast.error("An account for this user already exists. Please try logging in instead.");
        setIsLoading(false);
        return;
      }

      // Send email verification
      try {
        await sendEmailVerification(userCredential.user);
        console.log("Email verification sent");
      } catch (verificationError) {
        console.warn("Email verification failed:", verificationError);
        // Continue with registration even if email verification fails
        toast.warning("Verification email could not be sent, but your account was created.");
      }

      // Create user profile in Supabase
      console.log("Creating user profile in Supabase...");
      const profile = await createUserProfile(userCredential.user, {
        fullName: formData.fullName,
        hallTicket: formData.hallTicket,
        department: formData.department,
        academicYear: formData.academicYear,
        phoneNumber: formData.phone,
      });

      if (profile) {
        console.log("User profile created successfully:", profile.id);
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
        throw new Error("Failed to create user profile in Supabase.");
      }

    } catch (error: any) {
      console.error("Registration error at step:", error);

      let errorMessage = "Registration failed. Please try again.";

      // Supabase error detail extraction and friendly handling
      if (error && error.code && error.message) {
        // Detect duplicate/constraint errors for academic_info_user_id_key, users_pkey, users_hall_ticket_key, etc.
        if (
          typeof error.message === "string" &&
          (
            error.message.includes("duplicate key") ||
            (error.details && (error.details.includes("already exists") || error.details.includes("duplicate")))
          )
        ) {
          errorMessage = "A user with this email, hall ticket, or account already exists. Please login instead.";
        } else {
          errorMessage = `Supabase error: ${error.message}`;
        }
        if (error.details) errorMessage += ` (${error.details})`;
      } else if (error && error.error) {
        errorMessage = error.error;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Additional Firebase error parsing unchanged
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
            // Supabase codes are usually different, so prefer message
            break;
        }
      }

      toast.error(errorMessage, {
        duration: 6000,
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

  const features = [
    { icon: Shield, title: "Secure", description: "Your data is protected" },
    { icon: Users, title: "Community", description: "Connect with 10K+ students" },
    { icon: BookOpen, title: "Academic", description: "Manage your campus life" }
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

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
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
                Join the Future of Campus Life
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Connect with thousands of students, access campus services instantly, 
                and make your college experience unforgettable.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Create Your Account
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Join the campus community
                </p>
              </div>

              <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6 hidden lg:block">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Your Account</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Join the campus community and access all services
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                        className={`h-12 ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} bg-gray-50 dark:bg-gray-700`}
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
                      <Label htmlFor="hallTicket" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                        className={`h-12 font-mono ${errors.hallTicket ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} bg-gray-50 dark:bg-gray-700`}
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

                    {/* Email (modified) */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={
                          !allowNonEdu
                            ? "your.name@college.edu.in"
                            : "your.email@gmail.com"
                        }
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        onBlur={(e) => handleBlur("email", e.target.value)}
                        className={`h-12 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} bg-gray-50 dark:bg-gray-700`}
                        required
                      />
                      <div className="flex items-center gap-2">
                        {!allowNonEdu ? (
                          <button
                            type="button"
                            className="text-xs text-blue-600 hover:underline px-0 py-1 bg-transparent border-0 focus:outline-none"
                            onClick={() => setAllowNonEdu(true)}
                          >
                            Don't have a college email? <span className="underline">Register with Gmail &rarr;</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="text-xs text-gray-500 hover:underline px-0 py-1 bg-transparent border-0 focus:outline-none"
                            onClick={() => setAllowNonEdu(false)}
                          >
                            Use college email instead
                          </button>
                        )}
                      </div>
                      {errors.email && (
                        <p className="flex items-center gap-1 text-sm text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          {errors.email}
                        </p>
                      )}
                      {!allowNonEdu ? (
                        <p className="text-xs text-gray-500 mt-0.5">Use your institutional .edu.in email to unlock all features and faster verification. <br />Don't have one? <span className="text-blue-600 underline cursor-pointer" onClick={() => setAllowNonEdu(true)}>Register with your Gmail</span>.</p>
                      ) : (
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">Personal email sign-up may have limited access to some features.</p>
                      )}
                    </div>

                    {/* Department and Academic Year */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Department</Label>
                        <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                          <SelectTrigger className={`h-12 ${errors.department ? 'border-red-500' : 'border-gray-300'} bg-gray-50 dark:bg-gray-700`}>
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
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Academic Year</Label>
                        <Select value={formData.academicYear} onValueChange={(value) => handleInputChange("academicYear", value)}>
                          <SelectTrigger className={`h-12 ${errors.department ? 'border-red-500' : 'border-gray-300'} bg-gray-50 dark:bg-gray-700`}>
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
                    </div>
                    
                    {errors.department && (
                      <p className="flex items-center gap-1 text-sm text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        {errors.department}
                      </p>
                    )}

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                        className={`h-12 ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} bg-gray-50 dark:bg-gray-700`}
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
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          onBlur={(e) => handleBlur("password", e.target.value)}
                          className={`h-12 pr-12 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} bg-gray-50 dark:bg-gray-700`}
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
                      {errors.password && (
                        <p className="flex items-center gap-1 text-sm text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
                          className={`h-12 pr-12 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} bg-gray-50 dark:bg-gray-700`}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
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
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-5 h-5" />
                          <span>Create Account</span>
                        </div>
                      )}
                    </Button>
                  </form>

                  <div className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400">
                      Already have an account?{" "}
                      <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                        Sign In
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

export default Register;
