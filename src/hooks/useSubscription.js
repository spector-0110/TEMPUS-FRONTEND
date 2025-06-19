import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createSubscriptionOrder, verifySubscriptionPayment } from '@/lib/api';
import { getUserIP } from '@/utils/subscriptionUtils';

/**
 * Custom hook for handling subscription operations
 */
export function useSubscription() {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  /**
   * Create a subscription order
   * @param {Object} params - Order parameters
   * @param {string} params.billingCycle - MONTHLY or YEARLY
   * @param {number} params.updatedDoctorsCount - Number of doctors
   * @returns {Promise<Object>} - Order details for Razorpay
   */
  const createOrder = useCallback(async ({ billingCycle, updatedDoctorsCount }) => {
    setIsCreatingOrder(true);
    
    try {
      // Get user's IP address
      const clientIp = await getUserIP();
      
      const orderData = {
        billingCycle,
        updatedDoctorsCount,
        clientIp
      };

      console.log('Creating subscription order:', orderData);
      
      const response = await createSubscriptionOrder(orderData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to create order');
      }

      const order = response.data;
      setCurrentOrder(order);
      
      console.log('Order created successfully:', order);
      
      return order;
    } catch (error) {
      console.error('Failed to create subscription order:', error);
      toast.error('Failed to create order', {
        description: error.message || 'Please try again later'
      });
      throw error;
    } finally {
      setIsCreatingOrder(false);
    }
  }, []);

  /**
   * Verify payment after Razorpay success
   * @param {Object} paymentData - Payment verification data
   * @param {string} paymentData.razorpay_payment_id - Payment ID from Razorpay
   * @param {string} paymentData.razorpay_order_id - Order ID from Razorpay
   * @param {string} paymentData.razorpay_signature - Signature from Razorpay
   * @returns {Promise<Object>} - Verification result
   */
  const verifyPayment = useCallback(async (paymentData) => {
    setIsVerifyingPayment(true);
    
    try {
      console.log('Verifying payment:', paymentData);
      
      const response = await verifySubscriptionPayment(paymentData);
      
      if (!response.success) {
        throw new Error(response.message || 'Payment verification failed');
      }

      console.log('Payment verified successfully:', response.data);
      
      toast.success('Subscription activated!', {
        description: 'Your subscription has been successfully activated.'
      });
      
      // Clear current order after successful verification
      setCurrentOrder(null);
      
      return response.data;
    } catch (error) {
      console.error('Payment verification failed:', error);
      toast.error('Payment verification failed', {
        description: error.message || 'Please contact support if your payment was deducted'
      });
      throw error;
    } finally {
      setIsVerifyingPayment(false);
    }
  }, []);

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setCurrentOrder(null);
    setIsCreatingOrder(false);
    setIsVerifyingPayment(false);
  }, []);

  return {
    // State
    isCreatingOrder,
    isVerifyingPayment,
    currentOrder,
    isLoading: isCreatingOrder || isVerifyingPayment,
    
    // Actions
    createOrder,
    verifyPayment,
    reset
  };
}
