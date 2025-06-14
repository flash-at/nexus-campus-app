
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { createUserProfile, checkHallTicketExists } from "@/services/userService";
import { toast } from "sonner";
import { useState } from "react";
import { GraduationCap, User, Building, Calendar, Phone, IdCard } from "lucide-react";

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters.").max(60),
  hallTicket: z.string().min(8, "Hall ticket must be at least 8 characters.").max(15),
  department: z.string().min(2, "Please select a department."),
  academicYear: z.string().min(4, "Please select your academic year."),
  phoneNumber: z.string().length(10, "Phone number must be 10 digits."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const departments = [
  "Computer Science and Engineering",
  "Electronics and Communication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical and Electronics Engineering",
  "Information Technology",
  "Chemical Engineering",
  "Biotechnology",
  "Aerospace Engineering",
  "Automobile Engineering"
];

const academicYears = [
  "1st Year",
  "2nd Year", 
  "3rd Year",
  "4th Year",
  "5th Year"
];

interface CreateProfileFormProps {
  onSuccess: () => void;
}

export const CreateProfileForm = ({ onSuccess }: CreateProfileFormProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      hallTicket: "",
      department: "",
      academicYear: "",
      phoneNumber: "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
      toast.error("You must be logged in to create a profile.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Creating your profile...");

    try {
      // Check if hall ticket already exists
      const hallTicketExists = await checkHallTicketExists(data.hallTicket);
      if (hallTicketExists) {
        toast.dismiss(toastId);
        toast.error("Hall ticket already exists. Please use a different hall ticket.");
        setIsLoading(false);
        return;
      }

      const profile = await createUserProfile(user, {
        fullName: data.fullName,
        hallTicket: data.hallTicket,
        department: data.department,
        academicYear: data.academicYear,
        phoneNumber: data.phoneNumber,
      });

      toast.dismiss(toastId);

      if (profile) {
        toast.success("🎉 Welcome to CampusConnect! Your profile has been created successfully!");
        onSuccess();
      } else {
        toast.error("Failed to create profile. Please try again.");
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Profile creation error:", error);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <GraduationCap className="w-10 h-10" />
          </div>
          <CardTitle className="text-3xl font-bold mb-2">Join CampusConnect</CardTitle>
          <p className="text-blue-100">Create your profile to get your unique CampusConnect ID</p>
        </CardHeader>
        
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                      <User className="w-4 h-4 mr-2 text-blue-600" />
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your full name" 
                        className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hallTicket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                      <IdCard className="w-4 h-4 mr-2 text-purple-600" />
                      Hall Ticket Number
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., CS21B0001" 
                        className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                        <Building className="w-4 h-4 mr-2 text-green-600" />
                        Department
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="academicYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                        <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                        Academic Year
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                      <Phone className="w-4 h-4 mr-2 text-pink-600" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter 10-digit phone number" 
                        className="h-12 border-2 border-gray-200 focus:border-pink-500 rounded-xl transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isLoading || !form.formState.isValid}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Creating Profile...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <GraduationCap className="w-5 h-5 mr-3" />
                    Get My CampusConnect ID
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
