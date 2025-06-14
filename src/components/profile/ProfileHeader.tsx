
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/services/profileService";
import { Edit, MapPin, Calendar, Phone, Mail } from "lucide-react";

interface ProfileHeaderProps {
  profile: UserProfile;
  onEditClick: () => void;
}

export const ProfileHeader = ({ profile, onEditClick }: ProfileHeaderProps) => {
  return (
    <Card className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700" />
      
      <CardContent className="relative p-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Profile Picture */}
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-white/20 shadow-2xl">
              <AvatarImage src={profile.profile_picture_url || undefined} />
              <AvatarFallback className="bg-white/10 text-white text-4xl font-bold">
                {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white/20 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{profile.full_name}</h1>
              <p className="text-xl text-white/80 mb-1">{profile.department}</p>
              <p className="text-white/70">{profile.academic_year} Student</p>
            </div>

            {/* Quick Info Badges */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                🎓 {profile.hall_ticket}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                📧 {profile.email_verified ? 'Verified' : 'Unverified'}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                ⭐ {profile.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* Contact Quick View */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-white/80">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
              {profile.phone_number && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{profile.phone_number}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <Button 
            onClick={onEditClick}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            size="lg"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
