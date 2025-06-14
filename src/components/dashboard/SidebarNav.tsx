
import {
  Calendar,
  CreditCard,
  Gift,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  Trophy,
  User,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarNavItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
}

const sidebarItems: SidebarNavItem[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "id-card", label: "ID Card", icon: CreditCard },
  { id: "points", label: "Points & Vouchers", icon: Gift },
  { id: "events", label: "Events & Clubs", icon: Calendar },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "campus-store", label: "Campus Store", icon: ShoppingBag },
];

interface Props {
  className?: string;
}

const SidebarNav = ({ className }: Props) => {
  const { signOut, user } = useAuth();
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      setIsLoading(true);
      try {
        if (!user?.uid) return;

        const { data, error } = await supabase
          .from("users")
          .select("profile_picture_url, full_name")
          .eq("firebase_uid", user.uid)
          .single();

        if (error) {
          console.error("Error fetching profile picture:", error);
        }

        if (data && data.profile_picture_url) {
          setProfilePictureUrl(data.profile_picture_url);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfilePicture();
  }, [user?.uid]);

  return (
    <div className="flex flex-col h-full px-3 py-4 border-r bg-background">
      <NavLink to="/" className="flex items-center gap-2 space-x-2">
        <Logo className="h-6 w-6" />
        <span className="font-bold">CampusConnect</span>
      </NavLink>
      <div className="flex-1 space-y-1">
        <ul className="pt-6 pb-4 space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.id === "profile" ? "/profile" : item.id === "campus-store" ? "/campus-store" : `/dashboard/${item.id}`}
                className={({ isActive }) =>
                  `flex items-center w-full p-2 text-sm font-medium transition-colors rounded-md hover:bg-secondary/50 ${
                    isActive ? "bg-secondary/50" : "text-muted-foreground"
                  }`
                }
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-full px-2">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 rounded-full mr-2" />
                ) : (
                  <Avatar className="h-8 w-8 rounded-full mr-2">
                    {profilePictureUrl ? (
                      <AvatarImage src={profilePictureUrl} alt="Profile" />
                    ) : (
                      <AvatarFallback>
                        {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                )}
                <span>{user?.displayName || user?.email?.split('@')[0]}</span>
                <Settings className="w-4 h-4 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              <DropdownMenuItem>
                <NavLink to="/profile">Profile</NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default SidebarNav;
