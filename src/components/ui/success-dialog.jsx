'use client';

import * as React from "react";
import { CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * SuccessDialog component for displaying success messages
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open or not
 * @param {function} props.onClose - Function to call when the dialog should be closed
 * @param {string} props.title - Title of the success dialog (optional)
 * @param {string} props.message - Success message to display
 * @param {Array<string>} props.details - Optional array of additional details to display
 */
const SuccessDialog = ({ 
  isOpen, 
  onClose, 
  title = "Success", 
  message,
  details = []
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="py-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
          
          {details && details.length > 0 && (
            <div className="mt-3 max-h-60 overflow-auto border rounded-md p-3 bg-gray-50 dark:bg-gray-900">
              <ul className="list-disc pl-5 text-sm space-y-2">
                {details.map((detail, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            onClick={onClose} 
            variant="default"
            className="bg-green-600 hover:bg-green-700"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { SuccessDialog };
