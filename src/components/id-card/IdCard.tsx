
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RotateCcw, Download, Share2, QrCode, Sparkles, Shield, Zap } from 'lucide-react';
import Logo from "@/components/Logo";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";

interface IdCardProps {
  className?: string;
}

export const IdCard: React.FC<IdCardProps> = ({ className = "" }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const handleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setIsFlipped(!isFlipped);
    
    setTimeout(() => {
      setIsFlipping(false);
    }, 600);
  };

  const generateQRCodeUrl = () => {
    const studentData = {
      id: profile?.hall_ticket || 'CS21B0001',
      name: profile?.full_name || 'Student',
      department: profile?.department || 'Computer Science',
      year: profile?.academic_year || '2021-2025',
      points: profile?.engagement?.activity_points || 0
    };
    
    const qrData = encodeURIComponent(JSON.stringify(studentData));
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}&bgcolor=ffffff&color=1f2937&margin=20`;
  };

  const handleDownload = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 800;
      canvas.height = 500;
      
      if (!ctx) return;
      
      // Create front card
      const frontCanvas = document.createElement('canvas');
      const frontCtx = frontCanvas.getContext('2d');
      frontCanvas.width = 400;
      frontCanvas.height = 250;
      
      if (frontCtx) {
        const gradient = frontCtx.createLinearGradient(0, 0, 400, 250);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f093fb');
        frontCtx.fillStyle = gradient;
        frontCtx.fillRect(0, 0, 400, 250);
        
        frontCtx.fillStyle = 'white';
        frontCtx.font = 'bold 18px Inter';
        frontCtx.fillText('CampusConnect', 20, 35);
        frontCtx.font = 'bold 16px Inter';
        frontCtx.fillText(profile?.full_name || 'Student Name', 20, 90);
        frontCtx.font = '14px Inter';
        frontCtx.fillText(profile?.hall_ticket || 'CS21B0001', 20, 115);
        frontCtx.fillText(profile?.department || 'Computer Science', 20, 140);
        frontCtx.fillText(`Academic Year: ${profile?.academic_year || '2021-2025'}`, 20, 170);
        frontCtx.fillText(`Activity Points: ${profile?.engagement?.activity_points || 0}`, 20, 195);
      }
      
      ctx.drawImage(frontCanvas, 0, 0);
      
      // Create back card
      const backCanvas = document.createElement('canvas');
      const backCtx = backCanvas.getContext('2d');
      backCanvas.width = 400;
      backCanvas.height = 250;
      
      if (backCtx) {
        const backGradient = backCtx.createLinearGradient(0, 0, 400, 250);
        backGradient.addColorStop(0, '#f8fafc');
        backGradient.addColorStop(1, '#e2e8f0');
        backCtx.fillStyle = backGradient;
        backCtx.fillRect(0, 0, 400, 250);
        
        backCtx.fillStyle = '#1e293b';
        backCtx.font = 'bold 16px Inter';
        backCtx.fillText('CampusConnect ID', 20, 30);
        backCtx.font = '12px Inter';
        backCtx.fillText('🚀 Your Digital Campus Passport', 20, 60);
        
        // QR placeholder
        backCtx.fillStyle = 'white';
        backCtx.fillRect(130, 80, 120, 120);
        backCtx.strokeStyle = '#64748b';
        backCtx.strokeRect(130, 80, 120, 120);
        backCtx.fillStyle = '#64748b';
        backCtx.fillText('QR CODE', 165, 145);
        
        backCtx.fillStyle = '#64748b';
        backCtx.font = '10px Inter';
        backCtx.fillText('✨ Smart Access • 💳 Digital Wallet • 📊 Activity Hub', 20, 220);
      }
      
      ctx.drawImage(backCanvas, 400, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${profile?.full_name || 'Student'}_CampusConnect_ID.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast({
            title: "🎉 ID Card Downloaded!",
            description: "Your digital ID card has been saved successfully.",
          });
        }
      }, 'image/png');
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download your ID card. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      const studentData = {
        name: profile?.full_name || 'Student',
        id: profile?.hall_ticket || 'CS21B0001',
        department: profile?.department || 'Computer Science',
        year: profile?.academic_year || '2021-2025',
        points: profile?.engagement?.activity_points || 0
      };
      
      const shareData = {
        title: '🎓 CampusConnect Digital ID',
        text: `Check out ${studentData.name}'s digital student ID!\n\n📚 ${studentData.department}\n🎯 ${studentData.year}\n⭐ ${studentData.points} Activity Points`,
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "🚀 Shared Successfully!",
          description: "Your digital ID has been shared.",
        });
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
        );
        toast({
          title: "📋 Copied to Clipboard!",
          description: "Your ID details are ready to share.",
        });
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Unable to share your ID card. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      {/* Card Container */}
      <div className="relative w-full h-80 perspective-1000 mb-8">
        <div 
          className={`
            relative w-full h-full transition-all duration-700 ease-in-out transform-style-preserve-3d cursor-pointer
            ${isFlipped ? 'rotate-y-180' : ''}
            ${isFlipping ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
          `}
          onClick={handleFlip}
        >
          {/* Front Side - Redesigned */}
          <Card className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 text-white shadow-2xl border-0 overflow-hidden rounded-3xl">
            <CardContent className="p-0 h-full relative">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full animate-spin-slow"></div>
              </div>
              
              {/* Header */}
              <div className="relative z-10 p-6 pb-0">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Logo className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-lg font-bold">CampusConnect</span>
                      <p className="text-xs text-white/80">Digital Campus ID</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black border-0 font-semibold">
                    <Sparkles className="h-3 w-3 mr-1" />
                    ACTIVE
                  </Badge>
                </div>

                {/* Student Profile */}
                <div className="flex items-start space-x-4 mb-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-4 border-white/30 shadow-xl">
                      <AvatarImage src={profile?.profile_picture_url || undefined} />
                      <AvatarFallback className="bg-white/20 text-white text-lg font-bold backdrop-blur-sm">
                        {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'ST'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                      <Shield className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-xl mb-1 truncate">
                      {profile?.full_name || 'Student Name'}
                    </h2>
                    <p className="text-white/90 font-semibold text-sm mb-1">
                      ID: {profile?.hall_ticket || 'CS21B0001'}
                    </p>
                    <p className="text-white/80 text-xs truncate">
                      {profile?.department || 'Computer Science & Engineering'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="relative z-10 px-6 space-y-3">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">Academic Year</span>
                    <span className="text-white font-semibold">{profile?.academic_year || '2021-2025'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm flex items-center">
                      <Zap className="h-4 w-4 mr-1" />
                      Activity Points
                    </span>
                    <span className="text-yellow-300 font-bold text-lg">
                      {profile?.engagement?.activity_points || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-xs text-white/60">
                <span>Valid: 2024-2025</span>
                <span className="flex items-center">
                  <QrCode className="h-3 w-3 mr-1" />
                  Tap to flip
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Back Side - Redesigned */}
          <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-slate-50 to-blue-50 shadow-2xl border border-blue-200 overflow-hidden rounded-3xl">
            <CardContent className="p-6 h-full relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Logo className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-blue-800">CampusConnect</span>
                    <p className="text-xs text-blue-600">Digital Campus Passport</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-blue-600 text-blue-600">
                  <QrCode className="h-3 w-3 mr-1" />
                  Smart ID
                </Badge>
              </div>

              {/* Main Message */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-3">
                  <Sparkles className="h-4 w-4" />
                  <span>Your Campus Super Weapon!</span>
                </div>
                <p className="text-sm text-gray-600">
                  This QR code is your gateway to the entire campus ecosystem. One scan, unlimited access!
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-3xl shadow-xl border-2 border-blue-200 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <img 
                    src={generateQRCodeUrl()} 
                    alt="Campus Access QR Code" 
                    className="w-32 h-32 rounded-2xl"
                  />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-2xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="font-bold text-blue-800 text-sm">Smart Campus Access</p>
                      <p className="text-blue-600 text-xs">Library • Labs • Events • Buildings</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-2xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <p className="font-bold text-green-800 text-sm">Digital Wallet</p>
                      <p className="text-green-600 text-xs">Cafeteria • Printing • Campus Store</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-3 rounded-2xl border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="font-bold text-purple-800 text-sm">Activity Tracker</p>
                      <p className="text-purple-600 text-xs">Points • Events • Achievements</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-4 left-6 right-6 text-center">
                <p className="text-xs text-gray-500">
                  Emergency: campus-help@university.edu
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons - Redesigned */}
      <div className="flex justify-center space-x-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleFlip}
          disabled={isFlipping}
          className="flex items-center space-x-2 bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:border-blue-400 transition-all duration-300"
        >
          <RotateCcw className={`h-4 w-4 ${isFlipping ? 'animate-spin' : ''}`} />
          <span>Flip Card</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="flex items-center space-x-2 bg-white hover:bg-green-50 border-green-300 text-green-700 hover:border-green-400 transition-all duration-300"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="flex items-center space-x-2 bg-white hover:bg-purple-50 border-purple-300 text-purple-700 hover:border-purple-400 transition-all duration-300"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>
    </div>
  );
};
