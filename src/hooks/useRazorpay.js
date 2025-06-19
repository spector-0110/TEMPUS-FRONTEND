import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook for Razorpay integration
 */
export function useRazorpay() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      setIsScriptLoaded(true);
      return;
    }

    if (isScriptLoading) return;

    setIsScriptLoading(true);
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      setIsScriptLoaded(true);
      setIsScriptLoading(false);
    };
    
    script.onerror = () => {
      setIsScriptLoading(false);
      toast.error('Failed to load payment gateway', {
        description: 'Please check your internet connection and try again'
      });
    };
    
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isScriptLoading]);

  /**
   * Open Razorpay payment modal
   * @param {Object} options - Razorpay options
   * @param {Object} options.order - Order details from backend
   * @param {string} options.hospitalName - Hospital name for display
   * @param {string} options.hospitalEmail - Hospital email
   * @param {Function} options.onSuccess - Success callback
   * @param {Function} options.onFailure - Failure callback
   * @param {Function} options.onDismiss - Modal dismiss callback
   */
  const openPaymentModal = useCallback((options) => {
    if (!isScriptLoaded) {
      toast.error('Payment gateway not ready', {
        description: 'Please wait a moment and try again'
      });
      return;
    }

    if (!window.Razorpay) {
      toast.error('Payment gateway unavailable', {
        description: 'Please refresh the page and try again'
      });
      return;
    }

    const { order, hospitalName, hospitalEmail, onSuccess, onFailure, onDismiss } = options;

    const razorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'Tiqora Healthcare',
      description: `Subscription for ${hospitalName}`,
      image: '/tiqoraLogo1.png',
      order_id: order.id,
      prefill: {
        name: hospitalName,
        email: hospitalEmail,
      },
      theme: {
        color: '#2563eb' // Primary blue color for dark mode
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed by user');
          if (onDismiss) onDismiss();
        }
      },
      handler: (response) => {
        console.log('Payment successful:', response);
        if (onSuccess) {
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
        }
      },
      error: (error) => {
        console.error('Payment failed:', error);
        if (onFailure) {
          onFailure(error);
        } else {
          toast.error('Payment failed', {
            description: error.description || 'Please try again'
          });
        }
      }
    };

    try {
      const rzp = new window.Razorpay(razorpayOptions);
      rzp.open();
    } catch (error) {
      console.error('Failed to open Razorpay modal:', error);
      toast.error('Failed to open payment gateway', {
        description: 'Please try again'
      });
    }
  }, [isScriptLoaded]);

  return {
    isScriptLoaded,
    isScriptLoading,
    openPaymentModal
  };
}
