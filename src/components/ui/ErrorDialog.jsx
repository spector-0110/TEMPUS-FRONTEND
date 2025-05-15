'use client';

import * as React from "react";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";

/**
 * ErrorDialog component for displaying errors in a modal dialog
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open or not
 * @param {function} props.onClose - Function to call when the dialog should be closed
 * @param {string} props.title - Title of the error dialog (optional)
 * @param {string} props.message - Error message to display
 * @param {Array<string>} props.details - Optional array of error details to display as a list
 */
const ErrorDialog = ({ 
  isOpen, 
  onClose, 
  title = "Error", 
  message, 
  details = [] 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle />
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="py-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
          
          {details.length > 0 && (
            <div className="mt-3 max-h-60 overflow-auto">
              <ul className="list-disc pl-5 text-sm space-y-1 text-gray-600 dark:text-gray-400">
                {details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
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

export default ErrorDialog;
