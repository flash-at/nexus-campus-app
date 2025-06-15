
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PasswordVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (password: string) => boolean;
}

export const PasswordVerificationDialog: React.FC<PasswordVerificationDialogProps> = ({
  isOpen,
  onClose,
  onVerify
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
      setError('Incorrect password. Please try again.');
      toast({
        title: "Incorrect Password",
        description: "Please enter the correct CampusConnect password.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            CampusConnect Verification
          </DialogTitle>
          <DialogDescription>
            Please enter the CampusConnect password to place orders on the platform.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-password">Password</Label>
            <Input
              id="verification-password"
              type="password"
              placeholder="Enter CampusConnect password"
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
              disabled={isLoading || !password.trim()}
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
