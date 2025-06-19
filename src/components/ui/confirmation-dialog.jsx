'use client';

import * as React from "react";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * ConfirmationDialog component for displaying confirmation prompts
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open or not
 * @param {function} props.onClose - Function to call when the dialog should be closed
 * @param {function} props.onConfirm - Function to call when user confirms the action
 * @param {string} props.title - Title of the confirmation dialog
 * @param {string} props.description - Description text to display
 * @param {string} props.confirmText - Text for the confirm button (default: "Confirm")
 * @param {string} props.cancelText - Text for the cancel button (default: "Cancel")
 * @param {string} props.variant - Variant style: 'default', 'destructive', 'warning' (default: 'default')
 * @param {boolean} props.isLoading - Whether the confirmation action is loading
 */
const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Confirm Action",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false
}) => {
  // Determine the icon based on variant
  const Icon = React.useMemo(() => {
    switch (variant) {
      case 'destructive':
        return AlertTriangle;
      case 'warning':
        return AlertCircle;
      default:
        return CheckCircle;
    }
  }, [variant]);

  // Get the appropriate color scheme based on variant
  const getIconColorClass = () => {
    switch (variant) {
      case 'destructive':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'destructive':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${getIconColorClass()}`} />
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription className="mt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={getConfirmButtonVariant()}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ConfirmationDialog };
