
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
    
    // Reset flipping state after animation completes
    setTimeout(() => {
      setIsFlipping(false);
    }, 800);
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
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}&bgcolor=ffffff&color=2563eb`;
  };

  const handleDownload = async () => {
    try {
      // Create a canvas to combine both sides of the card
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size (width for both cards side by side)
      canvas.width = 800;
      canvas.height = 500;
      
      if (!ctx) return;
      
      // Create front side
      const frontCanvas = document.createElement('canvas');
      const frontCtx = frontCanvas.getContext('2d');
      frontCanvas.width = 400;
      frontCanvas.height = 250;
      
      if (frontCtx) {
        // Draw front side background
        const gradient = frontCtx.createLinearGradient(0, 0, 400, 250);
        gradient.addColorStop(0, '#2563eb');
        gradient.addColorStop(0.5, '#7c3aed');
        gradient.addColorStop(1, '#1e40af');
        frontCtx.fillStyle = gradient;
        frontCtx.fillRect(0, 0, 400, 250);
        
        // Add text content
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
      
      // Draw front side on main canvas
      ctx.drawImage(frontCanvas, 0, 0);
      
      // Add back side
      const backCanvas = document.createElement('canvas');
      const backCtx = backCanvas.getContext('2d');
      backCanvas.width = 400;
      backCanvas.height = 250;
      
      if (backCtx) {
        // Draw back side background
        backCtx.fillStyle = '#f3f4f6';
        backCtx.fillRect(0, 0, 400, 250);
        
        // Add QR code (simulated)
        backCtx.fillStyle = '#1f2937';
        backCtx.font = 'bold 12px Inter';
        backCtx.fillText('CampusConnect', 20, 30);
        backCtx.fillText('QR Code for Campus Access', 20, 60);
        
        // Draw QR code placeholder
        backCtx.fillStyle = 'white';
        backCtx.fillRect(150, 80, 100, 100);
        backCtx.strokeStyle = '#1f2937';
        backCtx.strokeRect(150, 80, 100, 100);
        backCtx.fillStyle = '#1f2937';
        backCtx.fillText('QR CODE', 170, 135);
        
        // Add features
        backCtx.font = '10px Inter';
        backCtx.fillText('🎯 Smart Access', 20, 200);
        backCtx.fillText('💳 Digital Wallet', 20, 215);
        backCtx.fillText('📊 Activity Tracking', 20, 230);
      }
      
      // Draw back side on main canvas
      ctx.drawImage(backCanvas, 400, 0);
      
      // Convert to blob and download
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
        // Fallback for browsers that don't support Web Share API
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
      {/* Card Container with improved 3D perspective */}
      <div className="relative w-full h-64 perspective-[1000px] mb-6">
        <div 
          className={`
            relative w-full h-full transition-all duration-[800ms] ease-in-out transform-style-preserve-3d cursor-pointer
            ${isFlipped ? 'rotate-y-180' : ''}
            ${isFlipping ? 'scale-105' : 'hover:scale-102'}
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
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center space-x-2">
                  <Logo className="h-6 w-6 text-white" />
                  <span className="text-sm font-bold">CampusConnect</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                  Student ID
                </Badge>
              </div>

              {/* Student Info */}
              <div className="flex items-center space-x-4 mb-4 relative z-10">
                <Avatar className="h-14 w-14 border-2 border-white/30 shadow-lg">
                  <AvatarImage src={profile?.profile_picture_url || undefined} />
                  <AvatarFallback className="bg-white/20 text-white text-sm">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'ST'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">
                    {profile?.full_name || 'Student Name'}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {profile?.hall_ticket || 'CS21B0001'}
                  </p>
                  <p className="text-white/80 text-sm truncate">
                    {profile?.department || 'Computer Science'}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2 relative z-10">
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

          {/* Back Side */}
          <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl border border-gray-200">
            <CardContent className="p-6 h-full relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Logo className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-bold text-gray-800">CampusConnect</span>
                </div>
                <QrCode className="h-5 w-5 text-blue-600" />
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center mb-4">
                <div className="bg-white p-3 rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-shadow">
                  <img 
                    src={generateQRCodeUrl()} 
                    alt="Student QR Code" 
                    className="w-28 h-28 rounded-lg"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-3 text-center font-medium">
                  Scan for student verification & campus access
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2 text-xs">
                <div className="bg-blue-50 p-2 rounded-lg border-l-3 border-blue-500 hover:bg-blue-100 transition-colors">
                  <p className="font-semibold text-blue-800">🎯 Smart Access</p>
                  <p className="text-blue-600">Library, labs, events entry</p>
                </div>
                <div className="bg-green-50 p-2 rounded-lg border-l-3 border-green-500 hover:bg-green-100 transition-colors">
                  <p className="font-semibold text-green-800">💳 Digital Wallet</p>
                  <p className="text-green-600">Cafeteria payments & purchases</p>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg border-l-3 border-purple-500 hover:bg-purple-100 transition-colors">
                  <p className="font-semibold text-purple-800">📊 Activity Tracking</p>
                  <p className="text-purple-600">Points, events, achievements</p>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="absolute bottom-3 left-6 right-6 text-xs text-gray-500">
                <p className="font-medium">Emergency: campus-security@university.edu</p>
                <p>Help: support@campusconnect.edu</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="flex justify-center space-x-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleFlip}
          disabled={isFlipping}
          className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
        >
          <RotateCcw className={`h-4 w-4 ${isFlipping ? 'animate-spin' : ''}`} />
          <span>Flip Card</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="flex items-center space-x-2 hover:bg-green-50 hover:border-green-300 transition-all"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="flex items-center space-x-2 hover:bg-purple-50 hover:border-purple-300 transition-all"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>
    </div>
  );
};
