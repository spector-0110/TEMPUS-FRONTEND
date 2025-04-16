'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSubscriptionPlans, submitFormWithSubscription } from '@/lib/api';
import { useAuth } from '@/context/AuthProvider';
import { Check } from 'lucide-react'; // Add import for check icon

export default function Subscription() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const getSubscriptionPlans = async () => {
      try {
        setLoading(true);
        const data = await fetchSubscriptionPlans();
        setPlans(data.plans || []);
        
        // Auto-select the first plan as default
        if (data.plans && data.plans.length > 0) {
          setSelectedPlan(data.plans[0]);
        }
      } catch (err) {
        setError('Failed to load subscription plans. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getSubscriptionPlans();
  }, []);

  const handleSubmit = async () => {
    if (!selectedPlan) {
      alert('Please select a plan to continue');
      return;
    }

    try {
      setSubmitting(true);
      
      // Get form data from session storage
      const formDataString = sessionStorage.getItem('formData');
      if (!formDataString) {
        throw new Error('Form data not found. Please complete the form first.');
      }
      
      const formData = JSON.parse(formDataString);
      
      // Submit form data with selected subscription plan
      await submitFormWithSubscription(formData, selectedPlan.id);
      
      // Clear form data from session storage
      sessionStorage.removeItem('formData');
      
      // Redirect to success or dashboard page
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to submit subscription. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to get features based on plan type
  const getPlanFeatures = (planType) => {
    const baseFeatures = [
      'Personal health dashboard',
      'Appointment scheduling',
      'Medication reminders'
    ];
    
    const standardFeatures = [
      ...baseFeatures,
      'Priority booking',
      'Health records storage',
      'Chat with doctors'
    ];
    
    const premiumFeatures = [
      ...standardFeatures,
      'Specialist consultations',
      '24/7 support access',
      'Family account management',
      'Premium health content'
    ];
    
    switch(planType.toLowerCase()) {
      case 'basic':
        return baseFeatures;
      case 'standard':
        return standardFeatures;
      case 'premium':
        return premiumFeatures;
      default:
        return baseFeatures;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Plan</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the plan that best fits your needs. All plans include core features with different levels of service.
        </p>
      </div>
      
      {error && (
        <div className="max-w-xl mx-auto p-4 mb-8 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}
      
      {plans.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No subscription plans are available at this time. Please contact support.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => {
              const features = getPlanFeatures(plan.name);
              
              // Determine card styling based on plan type
              let cardStyles = '';
              let priceStyles = '';
              let buttonStyles = '';
              
              if (plan.name.toLowerCase() === 'basic') {
                cardStyles = 'border border-gray-200 bg-white';
                priceStyles = 'text-gray-800';
                buttonStyles = 'bg-gray-100 hover:bg-gray-200 text-gray-800';
              } else if (plan.name.toLowerCase() === 'standard') {
                cardStyles = 'border border-blue-200 bg-gradient-to-b from-blue-50 to-white';
                priceStyles = 'text-blue-600';
                buttonStyles = 'bg-blue-600 hover:bg-blue-700 text-white';
              } else if (plan.name.toLowerCase() === 'premium') {
                cardStyles = 'border-0 bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-lg';
                priceStyles = 'text-white';
                buttonStyles = 'bg-white hover:bg-gray-100 text-primary-600';
              }
              
              // Apply premium selected effect
              if (selectedPlan?.id === plan.id) {
                if (plan.name.toLowerCase() === 'premium') {
                  cardStyles += ' ring-2 ring-yellow-300 shadow-xl';
                } else {
                  cardStyles += ' ring-2 ring-primary-500 shadow-lg';
                }
              } else {
                cardStyles += ' hover:shadow-md';
              }
              
              return (
                <div 
                  key={plan.id}
                  className={`relative rounded-xl overflow-hidden transition-all duration-300 transform ${
                    selectedPlan?.id === plan.id ? 'scale-105' : 'hover:scale-102'
                  } ${cardStyles}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="w-32 h-32 transform rotate-45 translate-x-12 -translate-y-16 bg-gradient-to-r from-yellow-400 to-yellow-300"></div>
                      <span className="absolute top-7 right-5 text-xs font-bold text-primary-900 transform rotate-45">MOST POPULAR</span>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <h3 className={`text-xl font-bold mb-2 ${plan.name.toLowerCase() === 'premium' ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    
                    <div className="mb-6">
                      <span className={`text-4xl font-bold ${priceStyles}`}>${plan.price}</span>
                      <span className={`text-sm ml-1 ${plan.name.toLowerCase() === 'premium' ? 'text-white/80' : 'text-gray-500'}`}>
                        /month
                      </span>
                    </div>
                    
                    <button
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 mb-6 ${buttonStyles}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(plan);
                      }}
                    >
                      {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                    </button>
                    
                    <div className={plan.name.toLowerCase() === 'premium' ? 'border-t border-white/20' : 'border-t border-gray-100'}>
                      <p className={`text-sm font-medium pt-6 pb-3 ${plan.name.toLowerCase() === 'premium' ? 'text-white' : 'text-gray-700'}`}>
                        What's included:
                      </p>
                      <ul className="space-y-3">
                        {features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className={`mr-2 mt-1 ${plan.name.toLowerCase() === 'premium' ? 'text-yellow-300' : 'text-primary-500'}`}>
                              <Check size={16} />
                            </span>
                            <span className={`text-sm ${plan.name.toLowerCase() === 'premium' ? 'text-white/90' : 'text-gray-600'}`}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center mt-12">
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedPlan}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 text-white 
                ${!selectedPlan 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg'
                }
                ${submitting ? 'opacity-70 cursor-wait' : ''}
              `}
            >
              {submitting ? (
                <>
                  <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                  Processing...
                </>
              ) : (
                'Continue with Selected Plan'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}