'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  getOTPforHospitalDetailsUpdate, 
  verifyOTPforHospitalDeatailsUpdate,
  updateHospitalDetailsAPI 
} from '@/lib/api';

function HospitalOtpDialog({ 
  isOpen, 
  onClose, 
  pendingUpdateData,
  onSuccess,
  hospitalDetails,
  updateHospitalDetails
}) {
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  // Request OTP for hospital details update
  const requestOTP = async (dataToUpdate) => {
    try {
      await getOTPforHospitalDetailsUpdate(dataToUpdate);
      toast.success('OTP sent to your registered email/phone');
      setOtpError('');
      return true;
    } catch (error) {
      setOtpError(error?.message || 'Failed to send OTP');
      toast.error(error?.message || 'Failed to send OTP');
      console.error('Request OTP error:', error);
      return false;
    }
  };

  // Verify OTP and submit the form if verification is successful
  const verifyOTPAndSubmit = async () => {
    if (!otpValue || otpValue.length < 4) {
      setOtpError('Please enter a valid OTP');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      
      // Call verify OTP API with the OTP and pending update data
      const verificationData = {
        otp: otpValue,
        ...pendingUpdateData
      };
      
      await verifyOTPforHospitalDeatailsUpdate(verificationData);
      
      // After successful verification, update hospital details
      const response = await updateHospitalDetailsAPI(pendingUpdateData);
      
      // Update the context
      updateHospitalDetails({
        ...hospitalDetails,
        ...pendingUpdateData
      });
      
      // Reset states
      setOtpValue('');
      setOtpError('');
      
      toast.success('Hospital details updated successfully');
      
      // Call onSuccess callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
      
      // Close the dialog
      onClose();
      
    } catch (error) {
      setOtpError(error?.message || 'OTP verification failed');
      toast.error(error?.message || 'OTP verification failed');
      console.error('OTP verification error:', error);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verify OTP</DialogTitle>
          <DialogDescription>
            Please enter the OTP sent to your registered email/phone to verify this update.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-right">
              OTP
            </Label>
            <Input
              id="otp"
              type="text"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              placeholder="Enter OTP"
              className={otpError ? 'border-destructive' : ''}
            />
            {otpError && <p className="text-sm text-red-500">{otpError}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button 
            onClick={verifyOTPAndSubmit} 
            disabled={isVerifyingOtp || !otpValue}
            className={isVerifyingOtp ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isVerifyingOtp ? 'Verifying...' : 'Verify & Submit'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              if (!isVerifyingOtp && pendingUpdateData) {
                setIsRequestingOtp(true);
                requestOTP(pendingUpdateData)
                  .finally(() => setIsRequestingOtp(false));
              }
            }}
            disabled={isVerifyingOtp || isRequestingOtp}
            className={isRequestingOtp ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isRequestingOtp ? 'Sending...' : 'Resend OTP'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { HospitalOtpDialog };
