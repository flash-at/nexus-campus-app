
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/services/userService";

interface ProfileDisplayProps {
  profile: UserProfile;
}

export const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ profile }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.profile_picture_url} alt={profile.full_name} />
            <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{profile.full_name}</CardTitle>
            <p className="text-muted-foreground">{profile.email}</p>
            <Badge variant="secondary" className="mt-1">
              {profile.role}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Academic Information</h4>
            <div className="space-y-1">
              <p><span className="font-medium">Hall Ticket:</span> {profile.hall_ticket}</p>
              <p><span className="font-medium">Department:</span> {profile.department}</p>
              <p><span className="font-medium">Academic Year:</span> {profile.academic_year}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Contact Information</h4>
            <div className="space-y-1">
              <p><span className="font-medium">Phone:</span> {profile.phone_number}</p>
              <p><span className="font-medium">Email Verified:</span> {profile.email_verified ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
        
        {profile.engagement && (
          <div className="mt-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Engagement Stats</h4>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{profile.engagement.activity_points || 0}</p>
                <p className="text-sm text-muted-foreground">Activity Points</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{profile.engagement.feedback_count || 0}</p>
                <p className="text-sm text-muted-foreground">Feedback Given</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
