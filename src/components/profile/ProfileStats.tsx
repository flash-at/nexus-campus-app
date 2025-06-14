
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/services/profileService";
import { BookOpen, Award, TrendingUp, Users, Calendar, Star } from "lucide-react";

interface ProfileStatsProps {
  profile: UserProfile;
}

export const ProfileStats = ({ profile }: ProfileStatsProps) => {
  const stats = [
    {
      title: "Academic Info",
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      items: [
        { label: "Department", value: profile.department },
        { label: "Academic Year", value: profile.academic_year },
        { label: "Hall Ticket", value: profile.hall_ticket },
        { label: "Role", value: profile.role.charAt(0).toUpperCase() + profile.role.slice(1) }
      ]
    },
    {
      title: "Contact Details",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      items: [
        { label: "Email", value: profile.email },
        { label: "Phone", value: profile.phone_number || "Not provided" },
        { label: "Email Status", value: profile.email_verified ? "Verified" : "Not verified" },
        { label: "Account Status", value: profile.is_active ? "Active" : "Inactive" }
      ]
    },
    {
      title: "Account Info",
      icon: Calendar,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      items: [
        { label: "Member Since", value: new Date(profile.created_at).toLocaleDateString() },
        { label: "Last Updated", value: new Date(profile.updated_at).toLocaleDateString() },
        { label: "Profile Status", value: "Complete" },
        { label: "Data Privacy", value: "Protected" }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {stats.map((section) => {
        const Icon = section.icon;
        return (
          <Card key={section.title} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <div className={`w-10 h-10 rounded-xl ${section.bgColor} flex items-center justify-center mr-3`}>
                  <Icon className={`h-5 w-5 ${section.color}`} />
                </div>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm text-muted-foreground font-medium">{item.label}</span>
                  <span className="text-sm font-semibold text-right max-w-[60%] truncate">
                    {item.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
