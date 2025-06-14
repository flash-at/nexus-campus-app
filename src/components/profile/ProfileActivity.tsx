
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/services/profileService";
import { Activity, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface ProfileActivityProps {
  profile: UserProfile;
}

export const ProfileActivity = ({ profile }: ProfileActivityProps) => {
  const recentActivities = [
    {
      id: 1,
      action: "Profile Created",
      timestamp: profile.created_at,
      status: "completed",
      description: "Successfully created student profile"
    },
    {
      id: 2,
      action: "Email Verification",
      timestamp: profile.updated_at,
      status: profile.email_verified ? "completed" : "pending",
      description: profile.email_verified ? "Email address verified" : "Email verification pending"
    },
    {
      id: 3,
      action: "Profile Updated",
      timestamp: profile.updated_at,
      status: "completed",
      description: "Profile information updated"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case "pending":
        return <Badge variant="default" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mr-3">
              <Activity className="h-5 w-5 text-orange-500" />
            </div>
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-card border">
                {getStatusIcon(activity.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mr-3">
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </div>
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                100% Complete
              </Badge>
            </div>
            
            <div className="space-y-3">
              {[
                { item: "Basic Information", completed: true },
                { item: "Contact Details", completed: !!profile.phone_number },
                { item: "Academic Info", completed: true },
                { item: "Email Verification", completed: profile.email_verified }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">{item.item}</span>
                  {item.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
