
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RotateCcw, Download, Share2, QrCode } from 'lucide-react';
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
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}&bgcolor=ffffff&color=1f2937&margin=10`;
  };

  const handleDownload = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 800;
      canvas.height = 500;
      
      if (!ctx) return;
      
      const frontCanvas = document.createElement('canvas');
      const frontCtx = frontCanvas.getContext('2d');
      frontCanvas.width = 400;
      frontCanvas.height = 250;
      
      if (frontCtx) {
        const gradient = frontCtx.createLinearGradient(0, 0, 400, 250);
        gradient.addColorStop(0, '#2563eb');
        gradient.addColorStop(0.5, '#7c3aed');
        gradient.addColorStop(1, '#1e40af');
        frontCtx.fillStyle = gradient;
        frontCtx.fillRect(0, 0, 400, 250);
        
        frontCtx.fillStyle = 'white';
        frontCtx.font = 'bold 16px Inter';
        frontCtx.fillText('CampusConnect', 20, 30);
        frontCtx.font = 'bold 14px Inter';
        frontCtx.fillText(profile?.full_name || 'Student Name', 20, 80);
        frontCtx.font = '12px Inter';
        frontCtx.fillText(profile?.hall_ticket || 'CS21B0001', 20, 100);
        frontCtx.fillText(profile?.department || 'Computer Science', 20, 120);
        frontCtx.fillText(`Year: ${profile?.academic_year || '2021-2025'}`, 20, 160);
        frontCtx.fillText(`Points: ${profile?.engagement?.activity_points || 0}`, 20, 180);
      }
      
      ctx.drawImage(frontCanvas, 0, 0);
      
      const backCanvas = document.createElement('canvas');
      const backCtx = backCanvas.getContext('2d');
      backCanvas.width = 400;
      backCanvas.height = 250;
      
      if (backCtx) {
        backCtx.fillStyle = '#f8fafc';
        backCtx.fillRect(0, 0, 400, 250);
        
        backCtx.fillStyle = '#1f2937';
        backCtx.font = 'bold 12px Inter';
        backCtx.fillText('CampusConnect', 20, 30);
        backCtx.fillText('Smart Campus Access', 20, 60);
        
        backCtx.fillStyle = 'white';
        backCtx.fillRect(150, 80, 100, 100);
        backCtx.strokeStyle = '#1f2937';
        backCtx.strokeRect(150, 80, 100, 100);
        backCtx.fillStyle = '#1f2937';
        backCtx.fillText('QR CODE', 170, 135);
        
        backCtx.font = '10px Inter';
        backCtx.fillText('🎯 Smart Access', 20, 200);
        backCtx.fillText('💳 Digital Wallet', 20, 215);
        backCtx.fillText('📊 Activity Tracking', 20, 230);
      }
      
      ctx.drawImage(backCanvas, 400, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${profile?.full_name || 'Student'}_ID_Card.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast({
            title: "ID Card Downloaded",
            description: "Your digital ID card has been saved to your device.",
          });
        }
      }, 'image/png');
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading your ID card. Please try again.",
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
        year: profile?.academic_year || '2021-2025'
      };
      
      const shareData = {
        title: 'CampusConnect Digital ID Card',
        text: `${studentData.name} (${studentData.id}) - ${studentData.department}, ${studentData.year}`,
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Shared Successfully",
          description: "Your ID card details have been shared.",
        });
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        toast({
          title: "Copied to Clipboard",
          description: "Your ID card details have been copied to clipboard.",
        });
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "There was an error sharing your ID card. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Card Container */}
      <div className="relative w-full h-72 perspective-1000 mb-6">
        <div 
          className={`
            relative w-full h-full transition-all duration-700 ease-in-out transform-style-preserve-3d cursor-pointer
            ${isFlipped ? 'rotate-y-180' : ''}
            ${isFlipping ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
          `}
          onClick={handleFlip}
        >
          {/* Front Side */}
          <Card className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-6 h-full relative">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-8 translate-x-8 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-6 -translate-x-6 animate-pulse"></div>
              </div>
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center space-x-2">
                  <Logo className="h-6 w-6 text-white" />
                  <span className="text-sm font-bold">CampusConnect</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                  Student ID
                </Badge>
              </div>

              {/* Student Info */}
              <div className="flex items-center space-x-4 mb-6 relative z-10">
                <Avatar className="h-16 w-16 border-2 border-white/30 shadow-lg">
                  <AvatarImage src={profile?.profile_picture_url || undefined} />
                  <AvatarFallback className="bg-white/20 text-white text-sm font-semibold">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'ST'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate mb-1">
                    {profile?.full_name || 'Student Name'}
                  </h3>
                  <p className="text-white/90 text-sm font-medium">
                    {profile?.hall_ticket || 'CS21B0001'}
                  </p>
                  <p className="text-white/80 text-sm truncate">
                    {profile?.department || 'Computer Science'}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Academic Year:</span>
                  <span className="text-white font-medium">{profile?.academic_year || '2021-2025'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Activity Points:</span>
                  <span className="text-yellow-300 font-bold">
                    {profile?.engagement?.activity_points || 0}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-xs text-white/70">
                <span>Valid: 2024-2025</span>
                <span>Digital ID</span>
              </div>
            </CardContent>
          </Card>

          {/* Back Side - Enhanced Design */}
          <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-slate-50 to-blue-50 shadow-2xl border border-blue-200 overflow-hidden">
            <CardContent className="p-4 sm:p-6 h-full relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Logo className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-bold text-blue-800">CampusConnect</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-600">
                  <QrCode className="h-4 w-4" />
                  <span className="text-xs font-medium">Smart ID</span>
                </div>
              </div>

              {/* QR Code Section - Mobile Optimized */}
              <div className="flex flex-col items-center mb-4">
                <div className="bg-white p-3 rounded-2xl shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <img 
                    src={generateQRCodeUrl()} 
                    alt="Student QR Code" 
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg"
                  />
                </div>
                <div className="text-center mt-3">
                  <p className="text-xs sm:text-sm font-semibold text-blue-800 mb-1">
                    Your Campus Super Weapon 🚀
                  </p>
                  <p className="text-xs text-blue-600">
                    Scan for instant campus access & services
                  </p>
                </div>
              </div>

              {/* Features Grid - Mobile Friendly */}
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">🎯</span>
                    <p className="font-bold text-blue-800">Smart Access</p>
                  </div>
                  <p className="text-blue-600 text-xs leading-relaxed">
                    Library • Labs • Events • Buildings
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">💳</span>
                    <p className="font-bold text-green-800">Digital Wallet</p>
                  </div>
                  <p className="text-green-600 text-xs leading-relaxed">
                    Cafeteria • Printing • Campus Store
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-3 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-violet-100 transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">📊</span>
                    <p className="font-bold text-purple-800">Activity Hub</p>
                  </div>
                  <p className="text-purple-600 text-xs leading-relaxed">
                    Points • Events • Achievements
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-2 left-4 right-4 text-center">
                <p className="text-xs text-gray-500 font-medium">
                  Emergency: campus-help@university.edu
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-2 sm:space-x-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleFlip}
          disabled={isFlipping}
          className="flex items-center space-x-1 sm:space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-all text-xs sm:text-sm px-2 sm:px-3"
        >
          <RotateCcw className={`h-3 w-3 sm:h-4 sm:w-4 ${isFlipping ? 'animate-spin' : ''}`} />
          <span>Flip</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="flex items-center space-x-1 sm:space-x-2 hover:bg-green-50 hover:border-green-300 transition-all text-xs sm:text-sm px-2 sm:px-3"
        >
          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Save</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="flex items-center space-x-1 sm:space-x-2 hover:bg-purple-50 hover:border-purple-300 transition-all text-xs sm:text-sm px-2 sm:px-3"
        >
          <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Share</span>
        </Button>
      </div>
    </div>
  );
};
