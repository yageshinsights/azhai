/**
 * PayHere Payment Gateway Integration for Sri Lanka (Visa / Mastercard / AMEX / Koko)
 */

const PAYHERE_MERCHANT_ID = import.meta.env.VITE_PAYHERE_MERCHANT_ID || '123456';
const IS_SANDBOX = import.meta.env.VITE_PAYHERE_SANDBOX !== 'false';

export interface PayHerePaymentDetails {
  orderId: string;
  itemsName: string;
  amount: number;
  currency?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country?: string;
}

declare global {
  interface Window {
    payhere?: any;
  }
}

/**
 * Initializes and triggers PayHere Payment Modal
 */
export function startPayHerePayment(
  paymentData: PayHerePaymentDetails,
  onSuccess: (orderId: string) => void,
  onDismissed: () => void,
  onError: (error: string) => void
) {
  // Ensure PayHere JS SDK is loaded dynamically
  if (!window.payhere) {
    const script = document.createElement('script');
    script.src = IS_SANDBOX
      ? 'https://www.payhere.lk/lib/payhere.js'
      : 'https://www.payhere.lk/lib/payhere.js';
    script.onload = () => launchPayHereModal(paymentData, onSuccess, onDismissed, onError);
    script.onerror = () => onError('Failed to load PayHere payment SDK');
    document.body.appendChild(script);
  } else {
    launchPayHereModal(paymentData, onSuccess, onDismissed, onError);
  }
}

function launchPayHereModal(
  paymentData: PayHerePaymentDetails,
  onSuccess: (orderId: string) => void,
  onDismissed: () => void,
  onError: (error: string) => void
) {
  if (!window.payhere) {
    onError('PayHere SDK unavailable');
    return;
  }

  window.payhere.onCompleted = function (orderId: string) {
    console.log('[PayHere] Payment completed for order:', orderId);
    onSuccess(orderId);
  };

  window.payhere.onDismissed = function () {
    console.log('[PayHere] Payment dismissed by user');
    onDismissed();
  };

  window.payhere.onError = function (error: string) {
    console.error('[PayHere Error]:', error);
    onError(error);
  };

  const payment = {
    sandbox: IS_SANDBOX,
    merchant_id: PAYHERE_MERCHANT_ID,
    return_url: `${window.location.origin}/order-success/${paymentData.orderId}`,
    cancel_url: `${window.location.origin}/checkout`,
    notify_url: import.meta.env.VITE_PAYHERE_NOTIFY_URL || `${window.location.origin}/api/payhere-notify`,
    order_id: paymentData.orderId,
    items: paymentData.itemsName,
    amount: paymentData.amount.toFixed(2),
    currency: paymentData.currency || 'LKR',
    first_name: paymentData.firstName,
    last_name: paymentData.lastName,
    email: paymentData.email,
    phone: paymentData.phone,
    address: paymentData.address,
    city: paymentData.city,
    country: paymentData.country || 'Sri Lanka',
  };

  window.payhere.startPayment(payment);
}
