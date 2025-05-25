'use client';

import { useAuth } from '@/context/AuthProvider';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Button } from './button';

export function LogoutButton() {
  const { signOut, user, loading, isAuthenticated } = useAuth();

  // Don't render anything while loading or if not authenticated
  if (loading || !isAuthenticated) return null;

  return (
    <Button
      onClick={signOut}
      variant="iconPrimary"
      size="icon"
      className="fixed top-5 right-5"
      aria-label="Logout"
    >
      <ArrowRightOnRectangleIcon className="w-5 h-5" />
    </Button>
  );
}