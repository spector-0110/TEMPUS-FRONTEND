'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { checkServerStatus } from '@/lib/api';

export default function ServerErrorPage() {
  const router = useRouter();

  const handleRetry = async () => {
    try {
      await checkServerStatus();
      // If server check succeeds, redirect to dashboard
      router.replace('/dashboard');
    } catch (error) {
      // If server is still down, refresh the page to show error again
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-6 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Server Unavailable</h1>
          <p className="text-muted-foreground">
            We're unable to connect to our servers at the moment. This might be due to maintenance or temporary issues.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please try again in a few moments.
          </p>
          <Button 
            onClick={handleRetry}
            className="w-full"
          >
            Retry Connection
          </Button>
          {/* <Button 
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="w-full"
          >
            Return to Home
          </Button> */}
        </div>
      </Card>
    </div>
  );
}
