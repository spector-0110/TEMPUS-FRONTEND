'use client';

import { useState, useEffect } from 'react';
import { X, Calculator, CreditCard, Shield, Zap, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  calculateSubscriptionPrice, 
  formatPrice, 
  validateDoctorCount, 
  BILLING_CYCLES,
  PRICING_CONFIG,
} from '@/utils/subscriptionUtils';
import { useSubscription } from '@/hooks/useSubscription';
import { useRazorpay } from '@/hooks/useRazorpay';

/**
 * Subscription Modal Component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onSuccess - Function called on successful subscription
 * @param {number} props.currentDoctorCount - Current number of doctors
 * @param {string} props.hospitalName - Hospital name
 * @param {string} props.hospitalEmail - Hospital email
 */
export function SubscriptionModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  currentDoctorCount = 1,
  hospitalName = '',
  hospitalEmail = ''
}) {
  const [doctorCount, setDoctorCount] = useState(currentDoctorCount);
  const [billingCycle, setBillingCycle] = useState(BILLING_CYCLES.YEARLY);
  const [validationError, setValidationError] = useState(null);
  const [step, setStep] = useState('configure'); // configure, payment, processing
  
  const { createOrder, verifyPayment, isCreatingOrder, isVerifyingPayment, reset } = useSubscription();
  const { openPaymentModal, isScriptLoaded } = useRazorpay();

  // Calculate pricing based on current inputs
  const pricing = calculateSubscriptionPrice(doctorCount, billingCycle);

  // Validate doctor count whenever it changes
  useEffect(() => {
    const validation = validateDoctorCount(doctorCount);
    setValidationError(validation.isValid ? null : validation.error);
  }, [doctorCount]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDoctorCount(currentDoctorCount);
      setBillingCycle(BILLING_CYCLES.YEARLY);
      setStep('configure');
      setValidationError(null);
      reset();
    }
  }, [isOpen, currentDoctorCount, reset]);

  // Handle doctor count input change
  const handleDoctorCountChange = (e) => {
    const value = parseInt(e.target.value) || '';
    setDoctorCount(value);
  };

  // Handle billing cycle change
  const handleBillingCycleChange = (cycle) => {
    setBillingCycle(cycle);
  };

  // Handle subscription confirmation
  const handleConfirmSubscription = async () => {
    // Validate inputs
    const validation = validateDoctorCount(doctorCount);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    if (!isScriptLoaded) {
      setValidationError('Payment gateway is loading. Please wait and try again.');
      return;
    }

    setStep('payment');

    try {
      // Create order
      const order = await createOrder({
        billingCycle,
        updatedDoctorsCount: doctorCount
      });

      // Open Razorpay payment modal
      openPaymentModal({
        order,
        hospitalName,
        hospitalEmail,
        onSuccess: async (paymentData) => {
          setStep('processing');
          
          try {
            // Verify payment
            const verificationResult = await verifyPayment(paymentData);
            
            // Call success callback
            if (onSuccess) {
              onSuccess(verificationResult);
            }
            
            onClose();
          } catch (error) {
            setStep('configure');
          }
        },
        onFailure: (error) => {
          console.error('Payment failed:', error);
          setStep('configure');
        },
        onDismiss: () => {
          setStep('configure');
        }
      });
    } catch (error) {
      setStep('configure');
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={onClose}
              disabled={step === 'processing'}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-3 pr-12">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {step === 'configure' && 'Configure Subscription'}
                  {step === 'payment' && 'Processing Payment'}
                  {step === 'processing' && 'Activating Subscription'}
                </CardTitle>
                <p className="text-gray-400 mt-1">
                  {step === 'configure' && 'Choose your plan and complete payment'}
                  {step === 'payment' && 'Please complete the payment in the popup window'}
                  {step === 'processing' && 'Please wait while we activate your subscription'}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 'configure' && (
              <>
                {/* Configuration Form */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Configuration */}
                  <div className="space-y-6">
                    {/* Doctor Count Input */}
                    <div className="space-y-3">
                      <Label htmlFor="doctorCount" className="text-lg font-semibold">
                        Number of Doctors
                      </Label>
                      <div className="relative">
                        <Input
                          id="doctorCount"
                          type="number"
                          min="1"
                          max="1000"
                          value={doctorCount}
                          onChange={handleDoctorCountChange}
                          className="text-lg h-12 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                          placeholder="Enter number of doctors"
                        />
                        <Calculator className="absolute right-3 top-3 h-6 w-6 text-gray-400" />
                      </div>
                      {validationError && (
                        <Alert className="border-red-600 bg-red-900/20">
                          <AlertCircle className="h-4 w-4 text-red-400" />
                          <AlertDescription className="text-red-400">
                            {validationError}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Billing Cycle Selection */}
                    <div className="space-y-3">
                      <Label className="text-lg font-semibold">Billing Cycle</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant={billingCycle === BILLING_CYCLES.MONTHLY ? "default" : "outline"}
                          className={`h-16 flex-col ${
                            billingCycle === BILLING_CYCLES.MONTHLY 
                              ? 'bg-blue-600 hover:bg-blue-700 border-blue-500' 
                              : 'bg-gray-800 hover:bg-gray-700 border-gray-600 text-gray-300'
                          }`}
                          onClick={() => handleBillingCycleChange(BILLING_CYCLES.MONTHLY)}
                        >
                          <span className="font-semibold">Monthly</span>
                          <span className="text-sm opacity-90">Pay monthly</span>
                        </Button>
                        <Button
                          variant={billingCycle === BILLING_CYCLES.YEARLY ? "default" : "outline"}
                          className={`h-16 flex-col relative ${
                            billingCycle === BILLING_CYCLES.YEARLY 
                              ? 'bg-blue-600 hover:bg-blue-700 border-blue-500' 
                              : 'bg-gray-800 hover:bg-gray-700 border-gray-600 text-gray-300'
                          }`}
                          onClick={() => handleBillingCycleChange(BILLING_CYCLES.YEARLY)}
                        >
                          <Badge className="absolute -top-2 -right-2 bg-green-600 text-white text-xs">
                            {PRICING_CONFIG.YEARLY_DISCOUNT_PERCENTAGE} % OFF
                          </Badge>
                          <span className="font-semibold">Yearly</span>
                          <span className="text-sm opacity-90">Pay annually</span>
                        </Button>
                      </div>
                    </div>

                    {/* Features List */}
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Shield className="h-5 w-5 text-green-400" />
                          <span>What's Included</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          'Unlimited appointment bookings',
                          'Advanced analytics dashboard',
                          'Patient management system',
                          'Doctor schedule management',
                          'SMS & Email notifications',
                          '24/7 customer support'
                        ].map((feature, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                            <span className="text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - Pricing Breakdown */}
                  <div className="space-y-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-xl">Pricing Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Base Price */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">
                            Base price ({doctorCount} doctor{doctorCount > 1 ? 's' : ''})
                          </span>
                          <span className="font-semibold">{formatPrice(pricing.subtotal)}</span>
                        </div>

                        {/* Discounts */}
                        {pricing.discountDetails.map((discount, index) => (
                          <div key={index} className="flex justify-between items-center text-green-400">
                            <span>
                              {discount.label} (-{discount.percentage}%)
                            </span>
                            <span>-{formatPrice(discount.amount)}</span>
                          </div>
                        ))}

                        {pricing.totalDiscount > 0 && <Separator className="bg-gray-700" />}

                        {/* Final Price */}
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span>Total</span>
                          <span className="text-green-400">{formatPrice(pricing.finalPrice)}</span>
                        </div>

                        {/* Price per doctor */}
                        <div className="text-center text-gray-400 text-sm">
                          {formatPrice(pricing.pricePerDoctor)} per doctor per {billingCycle.toLowerCase().slice(0, -2)}
                        </div>

                        {/* Savings highlight */}
                        {pricing.savings > 0 && (
                          <Alert className="border-green-600 bg-green-900/20">
                            <Zap className="h-4 w-4 text-green-400" />
                            <AlertDescription className="text-green-400">
                              You save {formatPrice(pricing.savings)} with this plan!
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>

                    {/* Action Button */}
                    <Button
                      onClick={handleConfirmSubscription}
                      disabled={!doctorCount || validationError || isCreatingOrder || !isScriptLoaded}
                      className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                    >
                      {isCreatingOrder ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Creating Order...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          Proceed to Payment {formatPrice(pricing.finalPrice)}
                        </>
                      )}
                    </Button>

                    {!isScriptLoaded && (
                      <p className="text-center text-gray-400 text-sm">
                        Loading payment gateway...
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {step === 'payment' && (
              <div className="text-center space-y-4 py-8">
                <div className="h-16 w-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Payment Window Opened</h3>
                <p className="text-gray-400">
                  Please complete your payment in the popup window.
                  <br />
                  If the popup didn't open, please check your popup blocker.
                </p>
                <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300">
                  Cancel
                </Button>
              </div>
            )}

            {step === 'processing' && (
              <div className="text-center space-y-4 py-8">
                <div className="h-16 w-16 mx-auto bg-green-600 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
                <h3 className="text-xl font-semibold">Activating Your Subscription</h3>
                <p className="text-gray-400">
                  Please wait while we verify your payment and activate your subscription.
                  <br />
                  This usually takes a few seconds.
                </p>
                {isVerifyingPayment && (
                  <div className="flex items-center justify-center space-x-2 text-blue-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying payment...</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
