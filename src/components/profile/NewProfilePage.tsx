
import { useState } from "react";
import { ProfileStats } from "./ProfileStats";
import { ProfileActivity } from "./ProfileActivity";
import { ProfileDisplay } from "./ProfileDisplay";
import { ActivityPointsHistory } from "./ActivityPointsHistory";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProfilePageSkeleton = () => (
  <div className="space-y-8">
    <Card>
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
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const NewProfilePage = () => {
  const { profile, loading, refetch } = useUserProfile();

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
        <p className="text-muted-foreground">Please make sure you're logged in and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Profile Header */}
      <ProfileDisplay profile={profile} onUpdate={refetch} />

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="points">Points History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          <ProfileStats profile={profile} />
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-8">
          <ProfileActivity profile={profile} />
        </TabsContent>
        
        <TabsContent value="points" className="space-y-8">
          <ActivityPointsHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};
