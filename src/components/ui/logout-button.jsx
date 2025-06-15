'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Button } from './button';

export function LogoutButton() {
  const { signOut, user, loading, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    if (isLoggingOut) return; // Prevent double clicks
    
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
      // You might want to show a toast notification here
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Don't render anything while loading or if not authenticated
  if (loading || !isAuthenticated) return null;

  return (
    <Button
      onClick={handleSignOut}
      variant="iconPrimary"
      size="icon"
      className="fixed top-5 right-5"
      aria-label="Logout"
      disabled={isLoggingOut}
    >
      <ArrowRightOnRectangleIcon className={`w-5 h-5 ${isLoggingOut ? 'animate-spin' : ''}`} />
    </Button>
  );
}