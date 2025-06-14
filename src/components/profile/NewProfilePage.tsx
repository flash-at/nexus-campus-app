
import { useUserProfile } from "@/hooks/useUserProfile";
import { CreateProfileForm } from "./CreateProfileForm";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { ProfileActivity } from "./ProfileActivity";
import { EditProfileForm } from "./EditProfileForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";

const ProfileSkeleton = () => (
  <div className="space-y-8">
    <div className="relative overflow-hidden rounded-lg">
      <Skeleton className="h-64 w-full" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export const NewProfilePage = () => {
  const { profile, loading, refetch } = useUserProfile();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return <CreateProfileForm onSuccess={refetch} />;
  }

  const handleUpdateSuccess = () => {
    refetch();
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Profile Header */}
      <ProfileHeader 
        profile={profile} 
        onEditClick={() => setIsEditDialogOpen(true)} 
      />

      {/* Profile Stats */}
      <ProfileStats profile={profile} />

      {/* Profile Activity */}
      <ProfileActivity profile={profile} />

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <EditProfileForm 
            profile={profile} 
            onSuccess={handleUpdateSuccess} 
            setOpen={setIsEditDialogOpen} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
