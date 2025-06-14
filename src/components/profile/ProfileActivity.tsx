
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/services/userService";
import { Activity, Calendar, MessageSquare, Award, TrendingUp, Users } from "lucide-react";

interface ProfileActivityProps {
  profile: UserProfile;
}

export const ProfileActivity = ({ profile }: ProfileActivityProps) => {
  const recentActivities = [
    {
      type: "event",
      title: "Joined Tech Workshop",
      description: "Participated in AI & Machine Learning workshop",
      date: "2 days ago",
      icon: "🎯",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      type: "feedback",
      title: "Submitted Feedback",
      description: "Provided valuable feedback for campus services",
      date: "5 days ago",
      icon: "💬",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      type: "achievement",
      title: "Earned New Badge",
      description: "Active Participant badge unlocked",
      date: "1 week ago",
      icon: "🏆",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  const badges = Array.isArray(profile.engagement?.badges) ? profile.engagement.badges : [];
  const defaultBadges = [
    { name: "Early Adopter", icon: "🌟", description: "First 100 users" },
    { name: "Active Student", icon: "⚡", description: "Regular app usage" },
    { name: "Feedback Hero", icon: "💬", description: "Submitted 5+ feedbacks" }
  ];

  const displayBadges = badges.length > 0 ? badges : defaultBadges;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
      {/* Recent Activity */}
      <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200/30 dark:border-gray-700/30 hover:scale-102 transition-all duration-200">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${activity.bgColor} flex items-center justify-center flex-shrink-0`}>
                <span className="text-lg sm:text-xl">{activity.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm sm:text-base mb-1 truncate">{activity.title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{activity.description}</p>
                <span className="text-xs text-muted-foreground">{activity.date}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements & Badges */}
      <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Award className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-yellow-500" />
            Achievements & Badges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Activity Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/20 border border-blue-500/20">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{profile.engagement?.activity_points || 0}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Activity Points</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/20 border border-emerald-500/20">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">{profile.engagement?.events_attended?.length || 0}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Events Joined</div>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h5 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Earned Badges</h5>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {displayBadges.slice(0, 3).map((badge, index) => (
                <div key={index} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/20 border border-yellow-500/20 hover:scale-102 transition-all duration-200">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-sm sm:text-base">{typeof badge === 'object' ? badge.icon : '🏆'}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs sm:text-sm truncate">
                      {typeof badge === 'object' ? badge.name : badge}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {typeof badge === 'object' ? badge.description : 'Achievement earned'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/20 border border-purple-500/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm font-semibold">Progress to Next Level</span>
              <span className="text-xs sm:text-sm text-muted-foreground">Level {Math.floor((profile.engagement?.activity_points || 0) / 100) + 1}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{ width: `${((profile.engagement?.activity_points || 0) % 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
