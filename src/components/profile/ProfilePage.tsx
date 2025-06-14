
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, BookOpen, Award, FileText, Settings, Shield } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileSkeleton = () => (
    <div className="space-y-8">
        <Card>
            <CardContent className="p-8">
                <div className="flex items-center space-x-6">
                    <Skeleton className="w-24 h-24 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <div className="flex space-x-4 pt-2">
                           <Skeleton className="h-6 w-24" />
                           <Skeleton className="h-6 w-24" />
                           <Skeleton className="h-6 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-24" />
                </div>
            </CardContent>
        </Card>
        <div className="grid grid-cols-5 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
        <Card>
            <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
            </CardContent>
        </Card>
    </div>
);

export const ProfilePage = () => {
  const { profile, loading } = useProfile();
  const { user } = useAuth();

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>We couldn't load your profile information. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

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
              <h2 className="text-3xl font-bold mb-1">{profile.full_name}</h2>
              <p className="text-muted-foreground mb-2">{profile.department}</p>
              
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-primary border-primary/30">
                  {profile.hall_ticket}
                </Badge>
                <Badge variant="outline" className="text-accent border-accent/30">
                  {profile.academic_year}
                </Badge>
                {profile.email_verified ? (
                   <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                     Email Verified
                   </Badge>
                ) : (
                    <Badge variant="destructive">
                     Email Not Verified
                   </Badge>
                )}
              </div>
            </div>
            
            <Button>Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                         <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{profile.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{profile.phone_number}</span>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="academic" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Academic Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">CGPA</span>
                                <span className="text-2xl font-bold text-primary">{profile.academic_info?.cgpa?.toFixed(1) || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Current Semester</span>
                                <span className="font-semibold">{profile.academic_info?.current_semester || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Mentor</span>
                                <span className="font-semibold">{profile.academic_info?.mentor_name || 'Not Assigned'}</span>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Subjects Enrolled</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-6">
                           {(profile.academic_info?.subjects_enrolled && profile.academic_info.subjects_enrolled.length > 0) ? (
                                profile.academic_info.subjects_enrolled.map(subject => (
                                    <Badge key={subject} variant="secondary">{subject}</Badge>
                                ))
                           ) : <p className="text-sm text-muted-foreground">No subjects enrolled.</p>}
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
                 <Card>
                    <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
                    <CardContent className="pt-6"><p>Document management coming soon.</p></CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="engagement" className="mt-6">
                 <Card>
                    <CardHeader><CardTitle>Engagement</CardTitle></CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Activity Points</span>
                            <span className="text-2xl font-bold text-accent">{profile.engagement?.activity_points || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Events Attended</span>
                            <span className="font-semibold">{profile.engagement?.events_attended?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Feedback Submitted</span>
                            <span className="font-semibold">{profile.engagement?.feedback_count || 0}</span>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
                 <Card>
                    <CardHeader><CardTitle>Preferences & Security</CardTitle></CardHeader>
                    <CardContent className="pt-6"><p>Settings management coming soon.</p></CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
};
