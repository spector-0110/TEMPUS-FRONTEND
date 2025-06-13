// Subscription pricing and business logic utilities

export const PRICING_CONFIG = {
  BASE_PRICE_PER_DOCTOR: 4999.99,
  YEARLY_DISCOUNT_PERCENTAGE: 12,
  VOLUME_DISCOUNTS: [
    { minDoctors: 10, discount: 10, label: '10+ doctors' },
    { minDoctors: 20, discount: 15, label: '20+ doctors' },
    { minDoctors: 50, discount: 20, label: '50+ doctors' },
  ]
};

export const BILLING_CYCLES = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY'
};

/**
 * Calculate the applicable volume discount
 * @param {number} doctorCount
 * @returns {{ discount: number, label: string }}
 */
export function getVolumeDiscount(doctorCount) {
  const applicableDiscount = PRICING_CONFIG.VOLUME_DISCOUNTS
    .filter(tier => doctorCount >= tier.minDoctors)
    .sort((a, b) => b.discount - a.discount)[0];

  return applicableDiscount || { discount: 0, label: null };
}

/**
 * Calculate subscription pricing with all applicable discounts
 * @param {number} doctorCount
 * @param {string} billingCycle - 'MONTHLY' or 'YEARLY'
 * @returns {Object} - Detailed pricing breakdown
 */
export function calculateSubscriptionPrice(doctorCount, billingCycle) {
  if (!doctorCount || doctorCount < 1) {
    return {
      basePrice: 0,
      subtotal: 0,
      yearlyDiscount: 0,
      volumeDiscount: 0,
      totalDiscount: 0,
      finalPrice: 0,
      pricePerDoctor: 0,
      savings: 0,
      discountDetails: []
    };
  }

  const basePrice = PRICING_CONFIG.BASE_PRICE_PER_DOCTOR;
  const subtotal = basePrice * doctorCount;

  const volumeDiscountInfo = getVolumeDiscount(doctorCount);
  const volumeDiscountAmount = (subtotal * volumeDiscountInfo.discount) / 100;
  const afterVolumeDiscount = subtotal - volumeDiscountAmount;

  let yearlyDiscountAmount = 0;
  let finalPrice = afterVolumeDiscount;

  if (billingCycle === BILLING_CYCLES.YEARLY) {
    yearlyDiscountAmount = (afterVolumeDiscount * PRICING_CONFIG.YEARLY_DISCOUNT_PERCENTAGE) / 100;
    finalPrice = (afterVolumeDiscount - yearlyDiscountAmount) * 12;
  }

  const totalDiscountAmount = volumeDiscountAmount + yearlyDiscountAmount;
  const pricePerDoctor = finalPrice / doctorCount;
  const savings = (subtotal * (billingCycle === BILLING_CYCLES.YEARLY ? 12 : 1)) - finalPrice;

  const discountDetails = [];
  if (volumeDiscountInfo.discount > 0) {
    discountDetails.push({
      type: 'volume',
      label: `Volume discount (${volumeDiscountInfo.label})`,
      percentage: volumeDiscountInfo.discount,
      amount: Math.round(volumeDiscountAmount * 100) / 100
    });
  }
  if (yearlyDiscountAmount > 0) {
    discountDetails.push({
      type: 'yearly',
      label: 'Annual billing discount',
      percentage: PRICING_CONFIG.YEARLY_DISCOUNT_PERCENTAGE,
      amount: Math.round(yearlyDiscountAmount * 12 * 100) / 100
    });
  }

  return {
    basePrice,
    subtotal: Math.round(subtotal * 100) / 100,
    yearlyDiscount: Math.round(yearlyDiscountAmount * 12 * 100) / 100,
    volumeDiscount: Math.round(volumeDiscountAmount * 100) / 100,
    totalDiscount: Math.round(totalDiscountAmount * 12 * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
    pricePerDoctor: Math.round(pricePerDoctor * 100) / 100,
    savings: Math.round(savings * 100) / 100,
    discountDetails,
    volumeDiscountInfo
  };
}
/**
 * Format price to Indian currency format
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted price string
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Get user's IP address for order creation
 * @returns {Promise<string>} - User's IP address
 */
export async function getUserIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Failed to get user IP:', error);
    return '127.0.0.1'; // Fallback IP
  }
}

/**
 * Validate doctor count input
 * @param {number} count - Doctor count to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export function validateDoctorCount(count) {
  if (!count || isNaN(count)) {
    return { isValid: false, error: 'Please enter a valid number of doctors' };
  }
  
  if (count < 1) {
    return { isValid: false, error: 'Minimum 1 doctor required' };
  }
  
  if (count > 1000) {
    return { isValid: false, error: 'Maximum 1000 doctors allowed' };
  }
  
  if (!Number.isInteger(Number(count))) {
    return { isValid: false, error: 'Number of doctors must be a whole number' };
  }
  
  return { isValid: true, error: null };
}
