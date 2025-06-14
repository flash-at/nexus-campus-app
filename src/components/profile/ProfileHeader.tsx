
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/services/userService";
import { Edit, MapPin, Calendar, Phone, Mail, IdCard, Trophy } from "lucide-react";

interface ProfileHeaderProps {
  profile: UserProfile;
  onEditClick: () => void;
}

export const ProfileHeader = ({ profile, onEditClick }: ProfileHeaderProps) => {
  return (
    <Card className="relative overflow-hidden shadow-2xl">
      {/* Enhanced Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700" />
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 via-blue-500/20 to-purple-600/20" />
      
      <CardContent className="relative p-8 text-white">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Enhanced Profile Picture */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full opacity-75 blur-lg"></div>
            <Avatar className="relative w-36 h-36 border-4 border-white/30 shadow-2xl">
              <AvatarImage src={profile.profile_picture_url || undefined} />
              <AvatarFallback className="bg-white/10 text-white text-5xl font-bold backdrop-blur-sm">
                {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white/30 flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          {/* Enhanced Profile Info */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {profile.full_name}
              </h1>
              <p className="text-2xl text-white/90 mb-2 font-semibold">{profile.department}</p>
              <p className="text-xl text-white/80">{profile.academic_year} Student</p>
            </div>

            {/* Enhanced Badges */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Badge variant="secondary" className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-white border-white/30 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                <IdCard className="w-4 h-4 mr-2" />
                ID: {profile.hall_ticket}
              </Badge>
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border-white/30 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                <Mail className="w-4 h-4 mr-2" />
                {profile.email_verified ? 'Verified' : 'Unverified'}
              </Badge>
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-white/30 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                <Trophy className="w-4 h-4 mr-2" />
                {profile.engagement?.activity_points || 0} Points
              </Badge>
            </div>

            {/* Enhanced Contact Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/90">
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <Mail className="w-5 h-5 text-cyan-300" />
                <span className="truncate">{profile.email}</span>
              </div>
              {profile.phone_number && (
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <Phone className="w-5 h-5 text-green-300" />
                  <span>{profile.phone_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Edit Button */}
          <div className="flex flex-col gap-4">
            <Button 
              onClick={onEditClick}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              size="lg"
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
