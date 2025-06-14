
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, User, Building, Shield, CheckCircle } from "lucide-react";

const ProviderRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1 - Personal Info
    fullName: "",
    email: "",
    phone: "",
    
    // Step 2 - Business Info
    businessName: "",
    serviceCategory: "",
    description: "",
    
    // Step 3 - Verification
    adminCode: ""
  });

  const serviceCategories = [
    "Food & Beverages",
    "Printing & Xerox",
    "Stationery & Supplies",
    "Laundry Services",
    "Books & Educational Materials",
    "Electronics & Gadgets",
    "Sports & Recreation",
    "Other Services"
  ];

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Business Info", icon: Building },
    { number: 3, title: "Verification", icon: Shield }
  ];

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.phone) {
          toast.error("Please fill in all personal information fields");
          return false;
        }
        if (!/^[0-9]{10}$/.test(formData.phone)) {
          toast.error("Phone number must be exactly 10 digits");
          return false;
        }
        break;
      case 2:
        if (!formData.businessName || !formData.serviceCategory || !formData.description) {
          toast.error("Please fill in all business information fields");
          return false;
        }
        break;
      case 3:
        if (formData.adminCode !== "CAMPUS_ADMIN_2024") {
          toast.error("Invalid admin code");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsLoading(true);
    
    try {
      // Simulate submission API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Application submitted successfully! You'll receive an email within 6 hours.");
      
      // Redirect to status check page after short delay
      setTimeout(() => {
        navigate("/status-check");
      }, 2000);
      
    } catch (error) {
      toast.error("Submission failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-campus rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">CC</span>
            </div>
            <span className="font-semibold bg-gradient-campus bg-clip-text text-transparent">
              CampusConnect
            </span>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold">Service Provider Registration</CardTitle>
            <CardDescription>
              Join CampusConnect as a verified service provider
            </CardDescription>
            
            {/* Progress Indicator */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                {steps.map((step) => (
                  <div key={step.number} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      currentStep >= step.number 
                        ? 'bg-campus-blue border-campus-blue text-white' 
                        : 'border-slate-300 text-slate-400'
                    }`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs mt-2 text-slate-600">{step.title}</span>
                  </div>
                ))}
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
                  <p className="text-sm text-slate-600">Tell us about yourself</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="bg-slate-50 border-slate-200 focus:border-campus-blue"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@domain.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-slate-50 border-slate-200 focus:border-campus-blue"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ''))}
                    className="bg-slate-50 border-slate-200 focus:border-campus-blue"
                    maxLength={10}
                    required
                  />
                </div>

                <Button onClick={handleNext} className="w-full bg-gradient-campus hover:bg-gradient-campus-dark border-0">
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Business Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Business Information</h3>
                  <p className="text-sm text-slate-600">Details about your service</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="e.g., Campus Cafe, Quick Print Shop"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    className="bg-slate-50 border-slate-200 focus:border-campus-blue"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceCategory">Service Category</Label>
                  <Select value={formData.serviceCategory} onValueChange={(value) => handleInputChange("serviceCategory", value)}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-campus-blue">
                      <SelectValue placeholder="Select your service category" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Service Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your services, specialties, and what makes you unique..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="bg-slate-50 border-slate-200 focus:border-campus-blue"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1 bg-gradient-campus hover:bg-gradient-campus-dark border-0">
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Verification */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Verification</h3>
                  <p className="text-sm text-slate-600">Confirm your application details</p>
                </div>

                {/* Summary */}
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-slate-900">Application Summary</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                    <p><span className="font-medium">Email:</span> {formData.email}</p>
                    <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                    <p><span className="font-medium">Business:</span> {formData.businessName}</p>
                    <p><span className="font-medium">Category:</span> {formData.serviceCategory}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminCode">Admin Code</Label>
                  <Input
                    id="adminCode"
                    type="password"
                    placeholder="Enter the admin code"
                    value={formData.adminCode}
                    onChange={(e) => handleInputChange("adminCode", e.target.value)}
                    className="bg-slate-50 border-slate-200 focus:border-campus-blue"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Contact campus administration for the verification code
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1 bg-gradient-campus hover:bg-gradient-campus-dark border-0"
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : (
                      <>
                        Submit Application
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-campus-blue hover:text-campus-blue-dark font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegister;
