/**
 * PayHere.lk Payment Gateway Integration
 * Central Bank of Sri Lanka (CBSL) Compliant Payment Gateway
 * Supports: Visa, MasterCard, AMEX, LankaQR, eZ Cash, mCash, Genie, FriMi
 */

export function getPayHereSandboxMode(): boolean {
  return import.meta.env.VITE_PAYHERE_SANDBOX !== 'false';
}

export interface PayHereCustomer {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface PayHerePaymentDetails {
  orderId: string;
  itemsName?: string;
  description?: string;
  amount: number;
  amountCents?: number;
  currency?: string;
  customer: PayHereCustomer;
  autoRedirect?: boolean;
}

export interface PayHereCheckoutResult {
  success: boolean;
  orderId: string;
  paymentId?: string;
  checkoutUrl?: string;
  error?: string;
  dismissed?: boolean;
}

// ── Pure JavaScript MD5 Implementation (RFC 1321) ─────────────
function md5cycle(x: number[], k: number[]) {
  let a = x[0], b = x[1], c = x[2], d = x[3];
  a = ff(a, b, c, d, k[0], 7, -680876936);
  d = ff(d, a, b, c, k[1], 12, -389564586);
  c = ff(c, d, a, b, k[2], 17, 606105819);
  b = ff(b, c, d, a, k[3], 22, -1044525330);
  a = ff(a, b, c, d, k[4], 7, -176418897);
  d = ff(d, a, b, c, k[5], 12, 1200080426);
  c = ff(c, d, a, b, k[6], 17, -1473231341);
  b = ff(b, c, d, a, k[7], 22, -45705983);
  a = ff(a, b, c, d, k[8], 7, 1770035416);
  d = ff(d, a, b, c, k[9], 12, -1958414417);
  c = ff(c, d, a, b, k[10], 17, -42063);
  b = ff(b, c, d, a, k[11], 22, -1990404162);
  a = ff(a, b, c, d, k[12], 7, 1804603682);
  d = ff(d, a, b, c, k[13], 12, -40341101);
  c = ff(c, d, a, b, k[14], 17, -1502002290);
  b = ff(b, c, d, a, k[15], 22, 1236535329);
  a = gg(a, b, c, d, k[1], 5, -165796510);
  d = gg(d, a, b, c, k[6], 9, -1069501632);
  c = gg(c, d, a, b, k[11], 14, 643717713);
  b = gg(b, c, d, a, k[0], 20, -373897302);
  a = gg(a, b, c, d, k[5], 5, -701558691);
  d = gg(d, a, b, c, k[10], 9, 38016083);
  c = gg(c, d, a, b, k[15], 14, -660478335);
  b = gg(b, c, d, a, k[4], 20, -405537848);
  a = gg(a, b, c, d, k[9], 5, 568446438);
  d = gg(d, a, b, c, k[14], 9, -1019803690);
  c = gg(c, d, a, b, k[3], 14, -187363961);
  b = gg(b, c, d, a, k[8], 20, 1163531501);
  a = gg(a, b, c, d, k[13], 5, -1444681467);
  d = gg(d, a, b, c, k[2], 9, -51403784);
  c = gg(c, d, a, b, k[7], 14, 1735328473);
  b = gg(b, c, d, a, k[12], 20, -1926607734);
  a = hh(a, b, c, d, k[5], 4, -378558);
  d = hh(d, a, b, c, k[8], 11, -2022574463);
  c = hh(c, d, a, b, k[11], 16, 1839030562);
  b = hh(b, c, d, a, k[14], 23, -35309556);
  a = hh(a, b, c, d, k[1], 4, -1530992060);
  d = hh(d, a, b, c, k[4], 11, 1272893353);
  c = hh(c, d, a, b, k[7], 16, -155497632);
  b = hh(b, c, d, a, k[10], 23, -1094730640);
  a = hh(a, b, c, d, k[13], 4, 681279174);
  d = hh(d, a, b, c, k[0], 11, -358537222);
  c = hh(c, d, a, b, k[3], 16, -722521979);
  b = hh(b, c, d, a, k[6], 23, 76029189);
  a = hh(a, b, c, d, k[9], 4, -640364487);
  d = hh(d, a, b, c, k[12], 11, -421815835);
  c = hh(c, d, a, b, k[15], 16, 530742520);
  b = hh(b, c, d, a, k[2], 23, -995338651);
  a = ii(a, b, c, d, k[0], 6, -198630844);
  d = ii(d, a, b, c, k[7], 10, 1126891415);
  c = ii(c, d, a, b, k[14], 15, -1416354905);
  b = ii(b, c, d, a, k[5], 21, -57434055);
  a = ii(a, b, c, d, k[12], 6, 1700485571);
  d = ii(d, a, b, c, k[3], 10, -1894986606);
  c = ii(c, d, a, b, k[10], 15, -1051523);
  b = ii(b, c, d, a, k[1], 21, -2054922799);
  a = ii(a, b, c, d, k[8], 6, 1873313359);
  d = ii(d, a, b, c, k[15], 10, -30611744);
  c = ii(c, d, a, b, k[6], 15, -1560198380);
  b = ii(b, c, d, a, k[13], 21, 1309151649);
  a = ii(a, b, c, d, k[4], 6, -145523070);
  d = ii(d, a, b, c, k[11], 10, -1120210379);
  c = ii(c, d, a, b, k[2], 15, 718787259);
  b = ii(b, c, d, a, k[9], 21, -343485551);
  x[0] = add32(a, x[0]);
  x[1] = add32(b, x[1]);
  x[2] = add32(c, x[2]);
  x[3] = add32(d, x[3]);
}
function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
  a = add32(add32(a, q), add32(x, t));
  return add32((a << s) | (a >>> (32 - s)), b);
}
function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, s, t); }
function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
function add32(a: number, b: number) { return (a + b) & 0xFFFFFFFF; }
function md5(s: string): string {
  const n = s.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i: number;
  for (i = 64; i <= n; i += 64) {
    md5cycle(state, md5blk(s.substring(i - 64, i)));
  }
  s = s.substring(i - 64);
  const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (i = 0; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
  tail[i >> 2] |= 0x80 << ((i % 4) << 3);
  if (i > 55) {
    md5cycle(state, tail);
    for (i = 0; i < 16; i++) tail[i] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);
  const hex = '0123456789abcdef';
  let res = '';
  for (i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const b = (state[i] >>> (j * 8)) & 0xFF;
      res += hex.charAt((b >> 4) & 0x0F) + hex.charAt(b & 0x0F);
    }
  }
  return res;
}
function md5blk(s: string) {
  const md5blks: number[] = [];
  for (let i = 0; i < 64; i += 4) {
    md5blks[i >> 2] =
      s.charCodeAt(i) +
      (s.charCodeAt(i + 1) << 8) +
      (s.charCodeAt(i + 2) << 16) +
      (s.charCodeAt(i + 3) << 24);
  }
  return md5blks;
}

export function generatePayHereHash(
  merchantId: string,
  orderId: string,
  amount: number,
  currency: string,
  merchantSecret: string
): string {
  const formattedAmount = amount.toFixed(2);
  const hashedSecret = md5(merchantSecret || '').toUpperCase();
  const dataToHash = `${merchantId}${orderId}${formattedAmount}${currency}${hashedSecret}`;
  return md5(dataToHash).toUpperCase();
}

declare global {
  interface Window {
    payhere?: any;
  }
}

/**
 * Ensures PayHere JS SDK script is loaded
 */
export function loadPayHereSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.payhere) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src*="payhere.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load PayHere SDK')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.payhere.lk/lib/payhere.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load PayHere SDK script'));
    document.body.appendChild(script);
  });
}

/**
 * Initiates PayHere Checkout (Onsite Popup Modal with fallback)
 */
export async function initiatePayHereCheckout(
  params: PayHerePaymentDetails
): Promise<PayHereCheckoutResult> {
  try {
    const finalAmount = params.amount || (params.amountCents ? params.amountCents / 100 : 0);

    // 1. Request secure checkout payload with server-calculated MD5 hash
    const response = await fetch('/api/payhere-initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: params.orderId,
        amount: finalAmount,
        currency: params.currency || 'LKR',
        items: params.itemsName || params.description || `Azhai Order #${params.orderId}`,
        customer: params.customer,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: 'Failed to initiate payment session' }));
      throw new Error(errData.error || `HTTP ${response.status} from payment initiator`);
    }

    const session = await response.json();

    // 2. Load PayHere JavaScript SDK
    await loadPayHereSdk();

    if (!window.payhere) {
      throw new Error('PayHere SDK is unavailable in window');
    }

    // 3. Launch PayHere Popup Modal
    return new Promise<PayHereCheckoutResult>((resolve) => {
      window.payhere.onCompleted = function (completedOrderId: string) {
        console.log('[PayHere] Payment completed for order:', completedOrderId);
        resolve({
          success: true,
          orderId: completedOrderId,
          checkoutUrl: session.return_url,
        });
      };

      window.payhere.onDismissed = function () {
        console.log('[PayHere] Customer closed checkout modal');
        resolve({
          success: false,
          dismissed: true,
          orderId: params.orderId,
          error: 'Payment was dismissed. Your cart items are preserved.',
        });
      };

      window.payhere.onError = function (error: string) {
        console.error('[PayHere SDK Error]:', error);
        resolve({
          success: false,
          orderId: params.orderId,
          error: error || 'Payment failed. Please try again.',
        });
      };

      window.payhere.startPayment({
        sandbox: session.sandbox,
        merchant_id: session.merchant_id,
        return_url: session.return_url,
        cancel_url: session.cancel_url,
        notify_url: session.notify_url,
        order_id: session.order_id,
        items: session.items,
        amount: session.amount,
        currency: session.currency,
        hash: session.hash,
        first_name: session.first_name,
        last_name: session.last_name,
        email: session.email,
        phone: session.phone,
        address: session.address,
        city: session.city,
        country: session.country,
        delivery_address: session.delivery_address,
        delivery_city: session.delivery_city,
        delivery_country: session.delivery_country,
      });
    });
  } catch (err: any) {
    console.error('[PayHere Checkout Initiation Error]:', err);
    return {
      success: false,
      orderId: params.orderId,
      error: err?.message || 'Could not connect to payment gateway.',
    };
  }
}

/**
 * 1-Click Partial/Full Card Refund via PayHere API
 */
export async function requestPayHereRefund(params: {
  orderId?: string;
  reference?: string;
  paymentId?: string;
  amount?: number;
  amountCents?: number;
  reason?: string;
  adminNotes?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch('/api/payhere-refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      return { success: false, error: data.error || 'Failed to process refund at PayHere.' };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error reaching PayHere refund API' };
  }
}

/**
 * Generate Shareable Hosted Payment Link for Bespoke Couture / Custom Tailoring
 */
export async function createPayHerePaymentLink(params: {
  title: string;
  amount?: number;
  amountCents?: number;
  orderId?: string;
  description?: string;
  customer?: PayHereCustomer;
}): Promise<{ success: boolean; id?: string; url?: string; error?: string }> {
  try {
    const res = await fetch('/api/payhere-payment-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      return { success: false, error: data.error || 'Failed to generate payment link' };
    }

    return { success: true, id: data.id || data.orderId, url: data.url };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error communicating with PayHere' };
  }
}

// ── Backward Compatibility Aliases ──────────────────────────
export const initiatePaymentsLkCheckout = initiatePayHereCheckout;
export const requestPaymentsLkRefund = requestPayHereRefund;
export const createPaymentsLkPaymentLink = createPayHerePaymentLink;
export const getPaymentsLkMode = () => (getPayHereSandboxMode() ? 'sandbox' : 'live');
