/**
 * Payments.lk Gateway Integration (Powered by Payable - CBSL Licensed)
 * 
 * Supports:
 * - 3D Secure Hosted Checkout (Visa, Mastercard, AMEX, LankaQR)
 * - 1-Click Card Refunds (Full & Partial)
 * - Bespoke Concierge Payment Links (Tailoring, WhatsApp orders)
 */

export interface PaymentsLkCustomer {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface PaymentsLkCheckoutParams {
  orderId: string;
  amount: number; // in LKR (e.g. 14500)
  description?: string;
  customer: PaymentsLkCustomer;
  successUrl?: string;
  cancelUrl?: string;
  autoRedirect?: boolean;
}

export interface PaymentsLkCheckoutResult {
  success: boolean;
  checkoutId?: string;
  checkoutUrl?: string;
  paymentId?: string;
  error?: string;
}

export interface PaymentsLkRefundParams {
  paymentId?: string;
  orderId?: string;
  reference?: string;
  adminNotes?: string;
  amountCents: number; // e.g. 1450000 for LKR 14,500
  reason?: string;
}

export interface PaymentsLkPaymentLinkParams {
  title: string;
  amountCents: number; // in cents
  description?: string;
}

export interface PaymentsLkPaymentLinkResult {
  success: boolean;
  id?: string;
  url?: string;
  error?: string;
}

/**
 * Returns whether Payments.lk is running in sandbox or live mode
 */
export function getPaymentsLkMode(): 'sandbox' | 'live' {
  return (import.meta.env.VITE_PAYMENTS_LK_MODE as 'sandbox' | 'live') || 'sandbox';
}

/**
 * Initiates a Payments.lk 3D Secure Hosted Checkout session and redirects the patron
 */
export async function initiatePaymentsLkCheckout(
  params: PaymentsLkCheckoutParams
): Promise<PaymentsLkCheckoutResult> {
  try {
    const origin = window.location.origin;
    const amountCents = Math.round(params.amount * 100);

    const payload = {
      orderId: params.orderId,
      amountCents,
      description: params.description || `Azhai Boutique Order #${params.orderId}`,
      reference: params.orderId,
      customer: params.customer,
      successUrl: params.successUrl || `${origin}/order-success/${params.orderId}?payments_lk=success`,
      cancelUrl: params.cancelUrl || `${origin}/checkout?status=cancelled&order_id=${params.orderId}`,
    };

    const response = await fetch('/api/create-payments-lk-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Payments.lk Gateway Error Response]:', errorData);
      const errorMsg = errorData.error || errorData.message || `Checkout creation failed (HTTP ${response.status})`;
      return { success: false, error: errorMsg };
    }

    const data = await response.json();

    if (!data.url) {
      return { success: false, error: 'No checkout redirect URL received from Payments.lk gateway' };
    }

    // Direct patron to Payments.lk hosted 3D Secure payment page if autoRedirect !== false
    if (params.autoRedirect !== false) {
      window.location.href = data.url;
    }

    return {
      success: true,
      checkoutId: data.id,
      checkoutUrl: data.url,
      paymentId: data.paymentId,
    };
  } catch (err: any) {
    console.error('[Payments.lk Client Error]:', err);
    return {
      success: false,
      error: err?.message || 'Network error while contacting Payments.lk gateway',
    };
  }
}

/**
 * Issues a full or partial refund for a completed Payments.lk card payment
 */
export async function requestPaymentsLkRefund(
  params: PaymentsLkRefundParams
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch('/api/refund-payments-lk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Refund failed (HTTP ${response.status})`,
      };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('[Payments.lk Refund Error]:', err);
    return {
      success: false,
      error: err?.message || 'Network error while processing card refund',
    };
  }
}

/**
 * Creates a bespoke shareable payment link for custom tailoring, bridal fitting, or WhatsApp concierge
 */
export async function createPaymentsLkPaymentLink(
  params: PaymentsLkPaymentLinkParams
): Promise<PaymentsLkPaymentLinkResult> {
  try {
    const response = await fetch('/api/create-payments-lk-payment-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Link creation failed (HTTP ${response.status})`,
      };
    }

    return {
      success: true,
      id: data.id,
      url: data.url,
    };
  } catch (err: any) {
    console.error('[Payments.lk Link Error]:', err);
    return {
      success: false,
      error: err?.message || 'Network error creating payment link',
    };
  }
}
