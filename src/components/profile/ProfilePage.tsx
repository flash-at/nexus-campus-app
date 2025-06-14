
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Award } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

export const ProfilePage = () => {
  const { profile } = useProfile();
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header */}
      <Card className="soft-shadow">
        <CardContent className="p-8">
          <div className="flex items-center space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile?.profile_picture} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{profile?.full_name || 'Student Name'}</h2>
              <p className="text-muted-foreground mb-4">Computer Science Engineering</p>
              
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-primary border-primary/30">
                  {profile?.hall_ticket || 'CS21B0001'}
                </Badge>
                <Badge variant="outline" className="text-accent border-accent/30">
                  Final Year
                </Badge>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                  Active Student
                </Badge>
              </div>
            </div>
            
            <Button>Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Academic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="soft-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              Academic Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">CGPA</span>
                <span className="text-2xl font-bold text-primary">{profile?.cgpa?.toFixed(1) || '8.7'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Semester</span>
                <span className="font-semibold">8th</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Credits Completed</span>
                <span className="font-semibold">156/160</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="soft-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-accent" />
              Activities & Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Activity Points</span>
                <span className="text-2xl font-bold text-accent">{profile?.activity_points || 450}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Events Attended</span>
                <span className="font-semibold">15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Clubs Joined</span>
                <span className="font-semibold">3</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="soft-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-emerald-500" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user?.email || 'student@example.com'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Hostel Block A, Room 204</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card className="soft-shadow">
        <CardHeader>
          <CardTitle>Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-4 p-4 rounded-xl border border-border">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Dean's List</h4>
                <p className="text-sm text-muted-foreground">Achieved for semester 7</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 rounded-xl border border-border">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold">Research Paper Published</h4>
                <p className="text-sm text-muted-foreground">AI in Education - IEEE Conference</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
