
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
import { ArrowLeft, ArrowRight, Users, Info, Shield } from "lucide-react";

const CreateClub = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  // Step 3: Authentication
  const [authDetails, setAuthDetails] = useState({
    authCode: "",
    password: ""
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
    return authDetails.authCode && authDetails.password;
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

      // Create club
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .insert({
          name: clubDetails.name,
          description: clubDetails.description,
          category: clubDetails.category,
          max_members: clubDetails.maxMembers,
          password: authDetails.password,
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
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-primary">
        <Info className="h-5 w-5" />
        <h3 className="font-semibold">Club Details</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Club Name</Label>
        <Input
          id="name"
          value={clubDetails.name}
          onChange={(e) => setClubDetails({...clubDetails, name: e.target.value})}
          placeholder="Enter club name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select 
          value={clubDetails.category} 
          onValueChange={(value) => setClubDetails({...clubDetails, category: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={clubDetails.description}
          onChange={(e) => setClubDetails({...clubDetails, description: e.target.value})}
          placeholder="Describe your club"
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxMembers">Maximum Members</Label>
        <Input
          id="maxMembers"
          type="number"
          value={clubDetails.maxMembers}
          onChange={(e) => setClubDetails({...clubDetails, maxMembers: parseInt(e.target.value)})}
          min="10"
          max="200"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-primary">
        <Users className="h-5 w-5" />
        <h3 className="font-semibold">Committee Details</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Chair Hall Ticket</Label>
          <Input
            value={committeeDetails.chairHallTicket}
            onChange={(e) => setCommitteeDetails({...committeeDetails, chairHallTicket: e.target.value})}
            placeholder="Chair hall ticket"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Chair Name</Label>
          <Input
            value={committeeDetails.chairName}
            onChange={(e) => setCommitteeDetails({...committeeDetails, chairName: e.target.value})}
            placeholder="Chair full name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Vice Chair Hall Ticket</Label>
          <Input
            value={committeeDetails.viceChairHallTicket}
            onChange={(e) => setCommitteeDetails({...committeeDetails, viceChairHallTicket: e.target.value})}
            placeholder="Vice chair hall ticket"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Vice Chair Name</Label>
          <Input
            value={committeeDetails.viceChairName}
            onChange={(e) => setCommitteeDetails({...committeeDetails, viceChairName: e.target.value})}
            placeholder="Vice chair full name"
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Core Members (Optional)</Label>
        {[0, 1, 2].map((index) => (
          <div key={index} className="grid grid-cols-2 gap-4">
            <Input
              value={committeeDetails.coreMemberHallTickets[index]}
              onChange={(e) => {
                const newTickets = [...committeeDetails.coreMemberHallTickets];
                newTickets[index] = e.target.value;
                setCommitteeDetails({...committeeDetails, coreMemberHallTickets: newTickets});
              }}
              placeholder={`Core member ${index + 1} hall ticket`}
            />
            <Input
              value={committeeDetails.coreMemberNames[index]}
              onChange={(e) => {
                const newNames = [...committeeDetails.coreMemberNames];
                newNames[index] = e.target.value;
                setCommitteeDetails({...committeeDetails, coreMemberNames: newNames});
              }}
              placeholder={`Core member ${index + 1} name`}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-primary">
        <Shield className="h-5 w-5" />
        <h3 className="font-semibold">Authentication & Security</h3>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You can get the auth code from CampusConnect team. Contact at: <strong>CampusConnect@mahesh.contact</strong>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="authCode">Auth Code</Label>
        <Input
          id="authCode"
          value={authDetails.authCode}
          onChange={(e) => setAuthDetails({...authDetails, authCode: e.target.value})}
          placeholder="Enter auth code from CampusConnect team"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Club Password</Label>
        <Input
          id="password"
          type="password"
          value={authDetails.password}
          onChange={(e) => setAuthDetails({...authDetails, password: e.target.value})}
          placeholder="Create a secure password for your club"
          required
        />
        <p className="text-sm text-muted-foreground">
          This password will be used by admin members to login to the club management panel.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 left-4"
            onClick={() => navigate('/club-admin-login')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <CardTitle className="text-2xl font-bold">Create New Club</CardTitle>
          <Progress value={(currentStep / 3) * 100} className="w-full" />
          <p className="text-sm text-muted-foreground">Step {currentStep} of 3</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
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
            >
              {loading ? "Creating..." : currentStep === 3 ? "Create Club" : "Next"}
              {currentStep < 3 && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateClub;
