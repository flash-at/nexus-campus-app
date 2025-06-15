
import { useState, useEffect } from 'react';

const VERIFICATION_KEY = 'campusconnect_verified';
const CORRECT_PASSWORD = 'campusconnect2024'; // You can change this password

export const usePasswordVerification = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  useEffect(() => {
    // Check if user is already verified
    const verified = localStorage.getItem(VERIFICATION_KEY) === 'true';
    setIsVerified(verified);
  }, []);

  const verifyPassword = (password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      setIsVerified(true);
      localStorage.setItem(VERIFICATION_KEY, 'true');
      setShowPasswordDialog(false);
      return true;
    }
    return false;
  };

  const requestVerification = () => {
    setShowPasswordDialog(true);
  };

  const clearVerification = () => {
    setIsVerified(false);
    localStorage.removeItem(VERIFICATION_KEY);
  };

  return {
    isVerified,
    showPasswordDialog,
    setShowPasswordDialog,
    verifyPassword,
    requestVerification,
    clearVerification
  };
};
