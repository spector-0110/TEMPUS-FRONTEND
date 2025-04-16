'use client';

import { useAuth } from '@/context/AuthProvider';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

export function LogoutButton() {
  const { signOut, user, loading, isAuthenticated } = useAuth();

  // Don't render anything while loading or if not authenticated
  if (loading || !isAuthenticated) return null;

  return (
    <Button
      onClick={signOut}
      className="fixed top-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 p-2 shadow-md hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
      aria-label="Logout"
    >
      <ArrowRightOnRectangleIcon className="w-5 h-5" />
    </Button>
  );
}