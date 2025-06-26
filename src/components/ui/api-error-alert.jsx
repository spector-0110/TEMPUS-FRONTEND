'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function ApiErrorAlert({ error, onDismiss }) {
  if (!error) return null;
  
  return (
    <Card className="p-4 bg-destructive/10 border border-destructive/20">
      <div className="flex items-start">
        <div className="flex-shrink-0 text-destructive">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-destructive">Error from server</h3>
          <div className="mt-1 text-destructive/80">{error}</div>
          <div className="mt-3">
            <Button 
              type="button" 
              className="bg-destructive/10 hover:bg-destructive/20 text-destructive px-2 py-1 text-xs rounded"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export { ApiErrorAlert };
