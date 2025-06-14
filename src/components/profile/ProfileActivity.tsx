
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/services/userService";
import { Activity, Clock, CheckCircle, AlertCircle, Trophy, Target, Zap, Star, Calendar, Award } from "lucide-react";

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
      description: "Successfully joined CampusConnect",
      icon: "🎉",
      color: "text-green-600"
    },
    {
      id: 2,
      action: "Email Verification",
      timestamp: profile.updated_at,
      status: profile.email_verified ? "completed" : "pending",
      description: profile.email_verified ? "Email address verified" : "Email verification pending",
      icon: profile.email_verified ? "✅" : "⏳",
      color: profile.email_verified ? "text-green-600" : "text-yellow-600"
    },
    {
      id: 3,
      action: "Last Login",
      timestamp: profile.engagement?.last_login || profile.updated_at,
      status: "completed",
      description: "Active session recorded",
      icon: "🔐",
      color: "text-blue-600"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 font-semibold">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 font-semibold">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const achievements = [
    { name: "Welcome Aboard", description: "Joined CampusConnect", earned: true, icon: "🚀" },
    { name: "First Steps", description: "Completed profile setup", earned: true, icon: "👣" },
    { name: "Verified User", description: "Email verification", earned: profile.email_verified, icon: "✅" },
    { name: "Active Member", description: "Regular app usage", earned: (profile.engagement?.activity_points || 0) > 10, icon: "⚡" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recent Activity */}
      <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-red-600/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/30 flex items-center justify-center mr-4 shadow-lg">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-orange-600">Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300">
                <div className="flex-shrink-0 text-2xl">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold truncate">{activity.action}</p>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                {getStatusIcon(activity.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements & Progress */}
      <Card className="hover:shadow-2xl transition-all duration-500 border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-indigo-600/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/30 flex items-center justify-center mr-4 shadow-lg">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-purple-600">Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Activity Points Display */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                  Activity Points
                </span>
                <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 font-bold">
                  {profile.engagement?.activity_points || 0} pts
                </Badge>
              </div>
            </div>
            
            {/* Achievement List */}
            {achievements.map((achievement, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                achievement.earned 
                  ? 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20' 
                  : 'bg-gray-500/10 border-gray-500/20 hover:bg-gray-500/20'
              }`}>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{achievement.icon}</span>
                  <div>
                    <span className="text-sm font-bold">{achievement.name}</span>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
                {achievement.earned ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
