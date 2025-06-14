
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, BookOpen, Award } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { EditProfileForm } from "./EditProfileForm";
import { Skeleton } from "@/components/ui/skeleton";

const ProfilePageSkeleton = () => (
    <div className="space-y-8">
      <Card className="soft-shadow">
        <CardContent className="p-8">
          <div className="flex items-center space-x-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <div className="flex items-center space-x-4 pt-2">
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-28 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="soft-shadow">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
);

export const ProfilePage = () => {
  const { profile, loading, refetch } = useProfile();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader><CardTitle>Profile Not Found</CardTitle></CardHeader>
        <CardContent>
          <p>We couldn't load your profile. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  const handleUpdateSuccess = () => {
    refetch();
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header */}
      <Card className="soft-shadow">
        <CardContent className="p-8">
          <div className="flex items-center space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.profile_picture_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{profile.full_name}</h2>
              <p className="text-muted-foreground mb-4">{profile.department}</p>
              
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-primary border-primary/30">
                  {profile.hall_ticket}
                </Badge>
                <Badge variant="outline" className="text-accent border-accent/30">
                  {profile.academic_year}
                </Badge>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                  {profile.is_active ? 'Active Student' : 'Inactive'}
                </Badge>
              </div>
            </div>
            
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button>Edit Profile</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <EditProfileForm profile={profile} onSuccess={handleUpdateSuccess} setOpen={setIsEditDialogOpen} />
              </DialogContent>
            </Dialog>
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
                <span className="text-2xl font-bold text-primary">{profile.academic_info?.cgpa?.toFixed(1) ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Semester</span>
                <span className="font-semibold">{profile.academic_info?.current_semester ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subjects</span>
                <span className="font-semibold">{profile.academic_info?.subjects_enrolled?.length ?? 0}</span>
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
                <span className="text-2xl font-bold text-accent">{profile.engagement?.activity_points ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Events Attended</span>
                <span className="font-semibold">{profile.engagement?.events_attended?.length ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Feedback Given</span>
                <span className="font-semibold">{profile.engagement?.feedback_count ?? 0}</span>
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
                <span className="text-sm">{profile.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.phone_number || 'Not provided'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant={profile.email_verified ? "default" : "destructive"}>
                  {profile.email_verified ? 'Email Verified' : 'Not Verified'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements - This part is static for now */}
      <Card className="soft-shadow">
        <CardHeader>
          <CardTitle>Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section will show your badges and achievements soon!</p>
        </CardContent>
      </Card>
    </div>
  );
};
