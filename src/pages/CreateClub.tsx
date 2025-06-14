
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ArrowLeft, ArrowRight, Users, Info, Shield, Eye, EyeOff } from "lucide-react";

const CreateClub = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showJoinPassword, setShowJoinPassword] = useState(false);
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  // Step 1: Club Details
  const [clubDetails, setClubDetails] = useState({
    name: "",
    description: "",
    category: "",
    maxMembers: 50
  });

  // Step 2: Committee Details
  const [committeeDetails, setCommitteeDetails] = useState({
    chairHallTicket: "",
    chairName: "",
    viceChairHallTicket: "",
    viceChairName: "",
    coreMemberHallTickets: ["", "", ""],
    coreMemberNames: ["", "", ""]
  });

  // Step 3: Authentication - Updated with separate passwords
  const [authDetails, setAuthDetails] = useState({
    authCode: "",
    adminPassword: "",
    joinPassword: ""
  });

  const categories = [
    "Technical", "Cultural", "Sports", "Literary", "Social Service", 
    "Arts", "Music", "Dance", "Drama", "Photography", "Other"
  ];

  const validateStep1 = () => {
    return clubDetails.name && clubDetails.description && clubDetails.category;
  };

  const validateStep2 = () => {
    return committeeDetails.chairHallTicket && committeeDetails.chairName &&
           committeeDetails.viceChairHallTicket && committeeDetails.viceChairName;
  };

  const validateStep3 = () => {
    return authDetails.authCode && authDetails.adminPassword && authDetails.joinPassword;
  };

  const verifyHallTicket = async (hallTicket) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('hall_ticket', hallTicket)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      return null;
    }
  };

  const handleNext = async () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // Verify auth code (in real implementation, this would check against CampusConnect team)
      if (!authDetails.authCode.startsWith('CC-')) {
        throw new Error('Invalid auth code format. Contact CampusConnect team.');
      }

      // Verify all hall tickets exist
      const chairUser = await verifyHallTicket(committeeDetails.chairHallTicket);
      const viceChairUser = await verifyHallTicket(committeeDetails.viceChairHallTicket);
      
      if (!chairUser) throw new Error('Chair hall ticket not found');
      if (!viceChairUser) throw new Error('Vice Chair hall ticket not found');

      // Create club with separate passwords
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .insert({
          name: clubDetails.name,
          description: clubDetails.description,
          category: clubDetails.category,
          max_members: clubDetails.maxMembers,
          password: authDetails.adminPassword, // Admin password for management
          join_password: authDetails.joinPassword, // Separate password for students to join
          auth_code: authDetails.authCode,
          created_by: profile?.id
        })
        .select()
        .single();

      if (clubError) throw clubError;

      // Add chair role
      await supabase.from('club_roles').insert({
        club_id: clubData.id,
        user_id: chairUser.id,
        role: 'chair'
      });

      // Add vice chair role
      await supabase.from('club_roles').insert({
        club_id: clubData.id,
        user_id: viceChairUser.id,
        role: 'vice_chair'
      });

      // Add core members
      const coreMembers = [];
      for (let i = 0; i < 3; i++) {
        if (committeeDetails.coreMemberHallTickets[i]) {
          const memberUser = await verifyHallTicket(committeeDetails.coreMemberHallTickets[i]);
          if (memberUser) {
            coreMembers.push({
              club_id: clubData.id,
              user_id: memberUser.id,
              role: 'core_member'
            });
          }
        }
      }

      if (coreMembers.length > 0) {
        await supabase.from('club_roles').insert(coreMembers);
      }

      alert('Club created successfully! You can now login to manage your club.');
      navigate('/club-admin-login');
    } catch (error) {
      console.error('Error creating club:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 text-primary">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Info className="h-4 w-4" />
        </div>
        <h3 className="text-lg font-semibold">Club Details</h3>
      </div>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Club Name *</Label>
          <Input
            id="name"
            value={clubDetails.name}
            onChange={(e) => setClubDetails({...clubDetails, name: e.target.value})}
            placeholder="Enter your club name"
            className="h-10"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
          <Select 
            value={clubDetails.category} 
            onValueChange={(value) => setClubDetails({...clubDetails, category: value})}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
          <Textarea
            id="description"
            value={clubDetails.description}
            onChange={(e) => setClubDetails({...clubDetails, description: e.target.value})}
            placeholder="Describe your club's mission and activities"
            rows={4}
            className="resize-none"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxMembers" className="text-sm font-medium">Maximum Members</Label>
          <Input
            id="maxMembers"
            type="number"
            value={clubDetails.maxMembers}
            onChange={(e) => setClubDetails({...clubDetails, maxMembers: parseInt(e.target.value)})}
            min="10"
            max="200"
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">Recommended: 20-100 members</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 text-primary">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Users className="h-4 w-4" />
        </div>
        <h3 className="text-lg font-semibold">Committee Structure</h3>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3 text-primary">Leadership Positions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Chair Hall Ticket *</Label>
              <Input
                value={committeeDetails.chairHallTicket}
                onChange={(e) => setCommitteeDetails({...committeeDetails, chairHallTicket: e.target.value})}
                placeholder="e.g., 21A31A0501"
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Chair Full Name *</Label>
              <Input
                value={committeeDetails.chairName}
                onChange={(e) => setCommitteeDetails({...committeeDetails, chairName: e.target.value})}
                placeholder="Enter full name"
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Vice Chair Hall Ticket *</Label>
              <Input
                value={committeeDetails.viceChairHallTicket}
                onChange={(e) => setCommitteeDetails({...committeeDetails, viceChairHallTicket: e.target.value})}
                placeholder="e.g., 21A31A0502"
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Vice Chair Full Name *</Label>
              <Input
                value={committeeDetails.viceChairName}
                onChange={(e) => setCommitteeDetails({...committeeDetails, viceChairName: e.target.value})}
                placeholder="Enter full name"
                className="h-10"
                required
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3 text-muted-foreground">Core Members (Optional)</h4>
          <div className="space-y-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={committeeDetails.coreMemberHallTickets[index]}
                  onChange={(e) => {
                    const newTickets = [...committeeDetails.coreMemberHallTickets];
                    newTickets[index] = e.target.value;
                    setCommitteeDetails({...committeeDetails, coreMemberHallTickets: newTickets});
                  }}
                  placeholder={`Core member ${index + 1} hall ticket`}
                  className="h-10"
                />
                <Input
                  value={committeeDetails.coreMemberNames[index]}
                  onChange={(e) => {
                    const newNames = [...committeeDetails.coreMemberNames];
                    newNames[index] = e.target.value;
                    setCommitteeDetails({...committeeDetails, coreMemberNames: newNames});
                  }}
                  placeholder={`Core member ${index + 1} name`}
                  className="h-10"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 text-primary">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Shield className="h-4 w-4" />
        </div>
        <h3 className="text-lg font-semibold">Security & Access</h3>
      </div>

      <Alert className="border-blue-200 bg-blue-50/50">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Need an auth code?</strong> Contact CampusConnect team at: <strong>CampusConnect@mahesh.contact</strong>
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="authCode" className="text-sm font-medium">CampusConnect Auth Code *</Label>
          <Input
            id="authCode"
            value={authDetails.authCode}
            onChange={(e) => setAuthDetails({...authDetails, authCode: e.target.value})}
            placeholder="CC-XXXXXXXX"
            className="h-10 font-mono"
            required
          />
          <p className="text-xs text-muted-foreground">Obtained from CampusConnect team</p>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="adminPassword" className="text-sm font-medium">Club Admin Password *</Label>
            <div className="relative">
              <Input
                id="adminPassword"
                type={showAdminPassword ? "text" : "password"}
                value={authDetails.adminPassword}
                onChange={(e) => setAuthDetails({...authDetails, adminPassword: e.target.value})}
                placeholder="Create admin password"
                className="h-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-10 w-10 px-2"
                onClick={() => setShowAdminPassword(!showAdminPassword)}
              >
                {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">For chair, vice chair, and core members to access admin panel</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinPassword" className="text-sm font-medium">Club Join Password *</Label>
            <div className="relative">
              <Input
                id="joinPassword"
                type={showJoinPassword ? "text" : "password"}
                value={authDetails.joinPassword}
                onChange={(e) => setAuthDetails({...authDetails, joinPassword: e.target.value})}
                placeholder="Create join password"
                className="h-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-10 w-10 px-2"
                onClick={() => setShowJoinPassword(!showJoinPassword)}
              >
                {showJoinPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Students will use this password to join your club</p>
          </div>
        </div>

        <Alert className="border-orange-200 bg-orange-50/50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Keep both passwords secure. The admin password is for management access, 
            while the join password is shared with students who want to join your club.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 left-4"
            onClick={() => navigate('/club-admin-login')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create New Club
            </CardTitle>
            <p className="text-muted-foreground">Build your campus community</p>
          </div>
          <div className="space-y-2">
            <Progress value={(currentStep / 3) * 100} className="w-full h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className={currentStep >= 1 ? "text-primary font-medium" : ""}>Details</span>
              <span className={currentStep >= 2 ? "text-primary font-medium" : ""}>Committee</span>
              <span className={currentStep >= 3 ? "text-primary font-medium" : ""}>Security</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8 px-8 pb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={
                loading ||
                (currentStep === 1 && !validateStep1()) ||
                (currentStep === 2 && !validateStep2()) ||
                (currentStep === 3 && !validateStep3())
              }
              className="flex items-center gap-2 min-w-[120px]"
            >
              {loading ? (
                "Creating..."
              ) : currentStep === 3 ? (
                "Create Club"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateClub;
