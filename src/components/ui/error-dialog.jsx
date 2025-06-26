'use client';

import * as React from "react";
import { AlertCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Enhanced ErrorDialog component for displaying API and validation errors
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open or not
 * @param {function} props.onClose - Function to call when the dialog should be closed
 * @param {string} props.title - Title of the error dialog (optional)
 * @param {string} props.message - Error message to display
 * @param {Array<string|Object>} props.details - Optional array of error details to display as a list
 * @param {string} props.errorType - Type of error: 'api', 'validation', or 'general' (default)
 * @param {number} props.statusCode - HTTP status code for API errors (optional)
 * @param {Object} props.errorData - Raw error data object for debugging (optional)
 */
const ErrorDialog = ({ 
  isOpen, 
  onClose, 
  title = "Error", 
  message, 
  details = [],
  errorType = "general",
  statusCode,
  errorData
}) => {
  const [showRawData, setShowRawData] = React.useState(false);

  // Determine the icon based on error type
  const ErrorIcon = React.useMemo(() => {
    switch (errorType) {
      case 'api':
        return XCircle;
      case 'validation':
        return AlertTriangle;
      default:
        return AlertCircle;
    }
  }, [errorType]);

  // Get the appropriate color scheme based on error type
  const getErrorColorClass = () => {
    switch (errorType) {
      case 'api':
        return 'text-destructive';
      case 'validation':
        return 'text-warning';
      default:
        return 'text-destructive';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${getErrorColorClass()}`}>
              <ErrorIcon className="h-5 w-5" />
              <DialogTitle>{title}</DialogTitle>
            </div>
            
            {statusCode && (
              <Badge variant="outline" className="font-mono">
                Status: {statusCode}
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <div className="py-3">
          <p className="text-sm text-foreground">{message}</p>
          
          {details && details.length > 0 && (
            <div className="mt-3 max-h-60 overflow-auto border rounded-md p-3 bg-muted">
              <ul className="list-disc pl-5 text-sm space-y-2">
                {details.map((detail, index) => {
                  // Handle different detail formats
                  if (typeof detail === 'string') {
                    // For simple string errors
                    return <li key={index} className="text-muted-foreground">{detail}</li>;
                  } else if (typeof detail === 'object' && detail !== null) {
                    // For field-specific validation errors
                    const fieldName = detail.field || 'Unknown field';
                    const errorMessage = detail.message || 'Invalid value';
                    
                    return (
                      <li key={index} className="text-foreground">
                        <span className="font-medium">{fieldName}:</span> {errorMessage}
                      </li>
                    );
                  }
                  return <li key={index}>Unknown error</li>;
                })}
              </ul>
            </div>
          )}
          
          {errorData && (
            <div className="mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowRawData(!showRawData)}
                className="flex items-center gap-1 text-xs"
              >
                <Info className="h-3 w-3" />
                {showRawData ? 'Hide' : 'Show'} technical details
              </Button>
              
              {showRawData && (
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40 font-mono">
                  {JSON.stringify(errorData, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            onClick={onClose} 
            variant="default"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ErrorDialog };
