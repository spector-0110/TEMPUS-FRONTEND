'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { checkServerStatusWithCache } from '@/lib/serverStatus';
import { Suspense } from 'react';

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Loading...</h1>
          </div>
        </Card>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}

function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || 'Server Unavailable';

  const handleRetry = async () => {
    try {
      // Clear any cached status first to force a fresh check
      localStorage.removeItem('tiqora_server_status');
      
      const result = await checkServerStatusWithCache();
      if (result.isOnline) {
        // If server check succeeds, redirect to dashboard
        window.location.href = '/onboarding';
      } else {
        // If server is still down, refresh the page to show error again
        router.refresh();
      }
    } catch (error) {
      // If server is still down, refresh the page to show error again
      router.refresh();
    }
  };

  // const handleBackHome = () => {
  //   router.push('/');
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-6 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Error</h1>
          <p className="text-muted-foreground">
            {errorMessage}
          </p>
        </div>
        <div className="space-x-4">
          <Button onClick={handleRetry} variant="default">
            Retry Connection
          </Button>
          {/* <Button onClick={handleBackHome} variant="outline">
            Back to Home
          </Button> */}
        </div>
      </Card>
    </div>
  );
}
