
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { createUserProfile, checkHallTicketExists } from "@/services/profileService";
import { toast } from "sonner";

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
    
    try {
      // Check if hall ticket already exists
      const hallTicketExists = await checkHallTicketExists(formData.hallTicket);
      if (hallTicketExists) {
        toast.error("This Hall Ticket number is already registered");
        return;
      }

      // Create the profile
      const createdProfile = await createUserProfile(user, formData);
      
      if (createdProfile) {
        toast.success("Profile created successfully!");
        onSuccess();
      } else {
        toast.error("Failed to create profile. Please try again.");
      }
    } catch (error) {
      console.error("Profile creation error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Your Profile</CardTitle>
        <CardDescription>
          Welcome! Please provide your details to set up your student profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              value={formData.fullName} 
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder="e.g., John Doe" 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="hallTicket">Hall Ticket Number</Label>
            <Input 
              id="hallTicket" 
              value={formData.hallTicket} 
              onChange={(e) => handleInputChange("hallTicket", e.target.value.toUpperCase())}
              placeholder="e.g., 2303A52037" 
              maxLength={10}
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="department">Department</Label>
            <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
              <SelectTrigger>
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
          
          <div>
            <Label htmlFor="academicYear">Academic Year</Label>
            <Select value={formData.academicYear} onValueChange={(value) => handleInputChange("academicYear", value)}>
              <SelectTrigger>
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
          
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input 
              id="phoneNumber" 
              type="tel" 
              value={formData.phoneNumber} 
              onChange={(e) => handleInputChange("phoneNumber", e.target.value.replace(/\D/g, ''))}
              placeholder="e.g., 9876543210" 
              maxLength={10}
              required 
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? "Creating Profile..." : "Create Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
