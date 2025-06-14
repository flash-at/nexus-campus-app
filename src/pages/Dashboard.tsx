
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bell, Search, TrendingUp, Calendar, BookOpen, Users, Trophy, User, Package, ShoppingBag, CreditCard, FileText, Store, MessageSquare, Target, Newspaper, MessageCircle, Bot, Briefcase, Shield, IdCard, UserCog } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { NewProfilePage } from '@/components/profile/NewProfilePage';
import { LeaderboardPage } from '@/components/dashboard/LeaderboardPage';
import { EventsAndClubsPage } from '@/components/events/EventsAndClubsPage';
import { IdCardPage } from '@/components/id-card/IdCardPage';
import { CampusStorePage } from '@/components/store/CampusStorePage';
import { SidebarNav } from '@/components/dashboard/SidebarNav';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading state while profile is being fetched
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show new profile form if profile is incomplete
  if (!profile) {
    return <NewProfilePage />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfilePage />;
      case 'id-card':
        return <IdCardPage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'events':
        return <EventsAndClubsPage />;
      case 'store':
        return <CampusStorePage />;
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.full_name?.split(' ')[0]}!</h1>
              <p className="text-muted-foreground">
                Here's what's happening in your campus today.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activity Points</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.engagement?.activity_points || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +20% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 this week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7 days</div>
                  <p className="text-xs text-muted-foreground">
                    Keep it up!
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rank</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">#42</div>
                  <p className="text-xs text-muted-foreground">
                    Top 15% in your batch
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Completed Data Structures Assignment
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Earned 50 activity points
                        </p>
                      </div>
                      <div className="ml-auto font-medium">+50</div>
                    </div>
                    <div className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Attended Tech Talk
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Machine Learning Fundamentals
                        </p>
                      </div>
                      <div className="ml-auto font-medium">+25</div>
                    </div>
                    <div className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Joined Study Group
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Database Management Systems
                        </p>
                      </div>
                      <div className="ml-auto font-medium">+15</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <Badge variant="outline">Tomorrow</Badge>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Coding Contest
                        </p>
                        <p className="text-sm text-muted-foreground">
                          10:00 AM - Computer Lab
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Badge variant="outline">Friday</Badge>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Career Fair
                        </p>
                        <p className="text-sm text-muted-foreground">
                          2:00 PM - Main Auditorium
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <h3 className="text-lg font-semibold mb-2">This section is coming soon!</h3>
            <p className="text-muted-foreground">We're working hard to bring you amazing features.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex flex-col flex-grow pt-5 bg-card border-r border-border overflow-y-hidden">
            <div className="flex items-center flex-shrink-0 px-4 mb-6">
              <h2 className="text-lg font-semibold">Campus Connect</h2>
            </div>
            <div className="flex-grow flex flex-col">
              <SidebarNav 
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                handleSignOut={handleSignOut}
              />
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sheet>
          <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
            <h1 className="text-lg font-semibold">Campus Connect</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
            </div>
          </div>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full pt-5">
              <div className="flex items-center flex-shrink-0 px-4 mb-6">
                <h2 className="text-lg font-semibold">Campus Connect</h2>
              </div>
              <div className="flex-grow flex flex-col">
                <SidebarNav 
                  activeSection={activeSection}
                  setActiveSection={setActiveSection}
                  handleSignOut={handleSignOut}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex flex-col flex-1 md:pl-64">
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
