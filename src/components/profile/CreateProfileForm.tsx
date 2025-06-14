
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { createUserProfile, checkHallTicketExists } from "@/services/profileService";
import { toast } from "sonner";
import { User, GraduationCap, Building, Calendar, Phone, UserCheck } from "lucide-react";

interface CreateProfileFormProps {
  onSuccess: () => void;
}

export const CreateProfileForm = ({ onSuccess }: CreateProfileFormProps) => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    hallTicket: "",
    department: "",
    academicYear: "",
    phoneNumber: "",
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { fullName, hallTicket, department, academicYear, phoneNumber } = formData;
    
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    
    if (!hallTicket.trim() || hallTicket.length !== 10) {
      toast.error("Hall ticket must be exactly 10 characters");
      return false;
    }
    
    if (!department) {
      toast.error("Please select your department");
      return false;
    }
    
    if (!academicYear) {
      toast.error("Please select your academic year");
      return false;
    }
    
    if (!phoneNumber.trim() || phoneNumber.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create a profile");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    const toastId = toast.loading("Creating your profile...");
    
    try {
      // Check if hall ticket already exists
      const hallTicketExists = await checkHallTicketExists(formData.hallTicket);
      if (hallTicketExists) {
        toast.dismiss(toastId);
        toast.error("This Hall Ticket number is already registered");
        return;
      }

      // Create the profile
      const createdProfile = await createUserProfile(user, formData);
      
      toast.dismiss(toastId);
      
      if (createdProfile) {
        toast.success("Profile created successfully! Welcome to CampusConnect! 🎉");
        onSuccess();
      } else {
        toast.error("Failed to create profile. Please try again.");
      }
    } catch (error) {
      console.error("Profile creation error:", error);
      toast.dismiss(toastId);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Welcome to CampusConnect! 
        </h1>
        <p className="text-muted-foreground text-lg">
          Let's set up your student profile to get started
        </p>
      </div>

      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            Create Your Profile
          </CardTitle>
          <CardDescription className="text-base">
            Please provide your academic details to complete your registration
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Full Name
              </Label>
              <Input 
                id="fullName" 
                value={formData.fullName} 
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Enter your full name (e.g., John Doe)" 
                className="h-12 text-base"
                required 
              />
            </div>
            
            {/* Hall Ticket */}
            <div className="space-y-2">
              <Label htmlFor="hallTicket" className="text-sm font-semibold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                Hall Ticket Number
              </Label>
              <Input 
                id="hallTicket" 
                value={formData.hallTicket} 
                onChange={(e) => handleInputChange("hallTicket", e.target.value.toUpperCase())}
                placeholder="Enter your hall ticket (e.g., 2303A52037)" 
                className="h-12 text-base font-mono"
                maxLength={10}
                required 
              />
            </div>
            
            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-semibold flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                Department
              </Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept} className="text-base">
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Academic Year */}
            <div className="space-y-2">
              <Label htmlFor="academicYear" className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Academic Year
              </Label>
              <Select value={formData.academicYear} onValueChange={(value) => handleInputChange("academicYear", value)}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select your current year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year} className="text-base">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-semibold flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                Phone Number
              </Label>
              <Input 
                id="phoneNumber" 
                type="tel" 
                value={formData.phoneNumber} 
                onChange={(e) => handleInputChange("phoneNumber", e.target.value.replace(/\D/g, ''))}
                placeholder="Enter your 10-digit phone number" 
                className="h-12 text-base font-mono"
                maxLength={10}
                required 
              />
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg" 
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating Profile...
                </>
              ) : (
                "Create My Profile 🚀"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
