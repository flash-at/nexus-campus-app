
import { useUserProfile } from "@/hooks/useUserProfile";
import { CreateProfileForm } from "./CreateProfileForm";
import { ProfileDisplay } from "./ProfileDisplay";
import { Skeleton } from "@/components/ui/skeleton";

export const NewProfilePage = () => {
  const { profile, loading, refetch } = useUserProfile();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <div className="flex items-center space-x-4 pt-2">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <CreateProfileForm onSuccess={refetch} />;
  }

  return <ProfileDisplay profile={profile} onUpdate={refetch} />;
};
