
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RotateCcw, Download, Share2, IdCard, QrCode } from 'lucide-react';
import Logo from "@/components/Logo";
import { useUserProfile } from "@/hooks/useUserProfile";

interface IdCardProps {
  className?: string;
}

export const IdCard: React.FC<IdCardProps> = ({ className = "" }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { profile } = useUserProfile();

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const generateQRCodeUrl = () => {
    const studentData = {
      id: profile?.hall_ticket || 'CS21B0001',
      name: profile?.full_name || 'Student',
      department: profile?.department || 'Computer Science',
      year: profile?.academic_year || '2021-2025',
      points: profile?.engagement?.activity_points || 0
    };
    
    // Generate QR code URL with student data
    const qrData = encodeURIComponent(JSON.stringify(studentData));
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}&bgcolor=ffffff&color=2563eb`;
  };

  const handleDownload = () => {
    // This would implement ID card download functionality
    console.log('Downloading ID card...');
  };

  const handleShare = () => {
    // This would implement sharing functionality
    console.log('Sharing ID card...');
  };

  return (
    <div className={`perspective-1000 ${className}`}>
      <div 
        className={`relative w-full h-56 transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front Side */}
        <Card className={`absolute inset-0 w-full h-full backface-hidden ${isFlipped ? 'rotate-y-180' : ''} bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white shadow-2xl border-0 overflow-hidden`}>
          <CardContent className="p-4 h-full relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-8 translate-x-8"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-6 -translate-x-6"></div>
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center space-x-2">
                <Logo className="h-6 w-6 text-white" />
                <span className="text-sm font-bold">CampusConnect</span>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                Student ID
              </Badge>
            </div>

            {/* Student Info */}
            <div className="flex items-center space-x-3 mb-3 relative z-10">
              <Avatar className="h-12 w-12 border-2 border-white/30">
                <AvatarImage src={profile?.profile_picture_url || undefined} />
                <AvatarFallback className="bg-white/20 text-white text-sm">
                  {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'ST'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate">
                  {profile?.full_name || 'Student Name'}
                </h3>
                <p className="text-white/80 text-xs">
                  {profile?.hall_ticket || 'CS21B0001'}
                </p>
                <p className="text-white/70 text-xs truncate">
                  {profile?.department || 'Computer Science'}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-1 relative z-10">
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Academic Year:</span>
                <span className="text-white">{profile?.academic_year || '2021-2025'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Activity Points:</span>
                <span className="text-yellow-300 font-semibold">
                  {profile?.engagement?.activity_points || 0}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-xs text-white/60">
              <span>Valid: 2024-2025</span>
              <span>Digital ID</span>
            </div>
          </CardContent>
        </Card>

        {/* Back Side */}
        <Card className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 ${isFlipped ? '' : 'rotate-y-180'} bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl border border-gray-300`}>
          <CardContent className="p-4 h-full relative">
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
              <div className="bg-white p-2 rounded-lg shadow-inner border">
                <img 
                  src={generateQRCodeUrl()} 
                  alt="Student QR Code" 
                  className="w-24 h-24"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Scan for student verification & campus access
              </p>
            </div>

            {/* Features */}
            <div className="space-y-2 text-xs">
              <div className="bg-blue-50 p-2 rounded border-l-2 border-blue-600">
                <p className="font-semibold text-blue-800">🎯 Smart Access</p>
                <p className="text-blue-600">Library, labs, events entry</p>
              </div>
              <div className="bg-green-50 p-2 rounded border-l-2 border-green-600">
                <p className="font-semibold text-green-800">💳 Digital Wallet</p>
                <p className="text-green-600">Cafeteria payments & purchases</p>
              </div>
              <div className="bg-purple-50 p-2 rounded border-l-2 border-purple-600">
                <p className="font-semibold text-purple-800">📊 Activity Tracking</p>
                <p className="text-purple-600">Points, events, achievements</p>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="absolute bottom-2 left-4 right-4 text-xs text-gray-500">
              <p>Emergency: campus-security@university.edu</p>
              <p>Help: support@campusconnect.edu</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-2 mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleFlip}
          className="flex items-center space-x-1"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Flip Card</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="flex items-center space-x-1"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="flex items-center space-x-1"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>
    </div>
  );
};
