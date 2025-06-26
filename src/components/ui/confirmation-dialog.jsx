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
        return 'text-destructive';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-info';
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
      <DialogContent className="sm:max-w-md bg-background dark:bg-background border-border dark:border-border transition-colors duration-300">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${getIconColorClass()} transition-colors duration-300`} />
            <DialogTitle className="text-foreground dark:text-foreground transition-colors duration-300">{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription className="mt-2 text-muted-foreground dark:text-muted-foreground transition-colors duration-300">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
            className="border-border dark:border-border hover:bg-accent dark:hover:bg-accent hover:text-accent-foreground dark:hover:text-accent-foreground transition-all duration-300"
          >
            {cancelText}
          </Button>
          <Button 
            variant={getConfirmButtonVariant()}
            onClick={handleConfirm}
            disabled={isLoading}
            className="transition-all duration-300 hover:shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ConfirmationDialog };
