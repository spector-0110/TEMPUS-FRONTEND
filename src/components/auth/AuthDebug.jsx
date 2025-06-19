"use client";

import { useAuth } from '@/context/AuthProvider';
import { Badge } from '@/components/ui/badge';

/**
 * Debug component to show current auth state
 * Only use this during development/testing
 */
export function AuthDebug() {
  const { user, session, loading, isAuthenticated } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-background/80 backdrop-blur border rounded-lg shadow-lg text-xs max-w-xs">
      <div className="font-medium mb-2">Auth Debug</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span>Status:</span>
          <Badge variant={isAuthenticated ? "success" : "destructive"}>
            {isAuthenticated ? "Authenticated" : "Not authenticated"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span>Loading:</span>
          <Badge variant={loading ? "secondary" : "outline"}>
            {loading ? "Yes" : "No"}
          </Badge>
        </div>
        {user && (
          <div>
            <span>User ID:</span> {user.id?.slice(0, 8)}...
          </div>
        )}
        {user?.email && (
          <div>
            <span>Email:</span> {user.email}
          </div>
        )}
        {session && (
          <div>
            <span>Session:</span> Active
          </div>
        )}
      </div>
    </div>
  );
}
