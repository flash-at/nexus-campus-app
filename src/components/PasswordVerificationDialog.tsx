
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PasswordVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (password: string) => boolean;
  getPasswordFormat?: () => string;
  hasProfile?: boolean;
}

export const PasswordVerificationDialog: React.FC<PasswordVerificationDialogProps> = ({
  isOpen,
  onClose,
  onVerify,
  getPasswordFormat,
  hasProfile = false
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const isCorrect = onVerify(password);
    
    if (isCorrect) {
      toast({
        title: "Verification Successful",
        description: "You can now place orders without verification.",
      });
      setPassword('');
      onClose();
    } else {
      setError('Incorrect password. Please check the format below.');
      toast({
        title: "Incorrect Password",
        description: "Please enter the correct password using the format shown below.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const passwordFormat = getPasswordFormat ? getPasswordFormat() : '@{yourname}{last4digits}';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            CampusConnect Verification
          </DialogTitle>
          <DialogDescription>
            Enter your personal verification password to place orders on the platform.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-password">Password</Label>
            <Input
              id="verification-password"
              type="password"
              placeholder={`Enter password (${passwordFormat})`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className={error ? 'border-red-500 focus:border-red-500' : ''}
              required
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          {hasProfile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Password Format:</p>
                  <p className="text-blue-700">
                    <code className="bg-blue-100 px-1 rounded">{passwordFormat}</code>
                  </p>
                  <p className="text-blue-600 text-xs mt-1">
                    @ + your first name + last 4 digits of hall ticket (all lowercase)
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !password.trim() || !hasProfile}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </form>
        
        <div className="text-xs text-muted-foreground text-center">
          This verification is required once per session for security purposes.
        </div>
      </DialogContent>
    </Dialog>
  );
};
