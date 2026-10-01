/**
 * Centralized Store Constants for Azhai Boutique by Preethi
 * Official Domain: azhaiclothing.lk
 * Colombo Atelier, Sri Lanka
 */

export const STORE_PHONE = '+94 77 123 4567';
export const STORE_WHATSAPP_NUMBER = '94771234567'; // Sri Lankan international format without '+'
export const STORE_EMAIL = 'orders@azhaiclothing.lk';
export const STORE_SUPPORT_EMAIL = 'hello@azhaiclothing.lk';
export const STORE_INSTAGRAM_URL = 'https://www.instagram.com/azhaiclothing';
export const STORE_FACEBOOK_URL = 'https://www.facebook.com/azhaiclothing';
export const STORE_TIKTOK_URL = 'https://www.tiktok.com/@azhaiclothing';
export const STORE_ADDRESS_LINE1 = '42/A Temple Road, Kollupitiya';
export const STORE_ADDRESS_CITY = 'Colombo 03';
export const STORE_ADDRESS_POSTAL = '00300';
export const STORE_ADDRESS_FULL = '42/A Temple Road, Kollupitiya, Colombo 03, Sri Lanka';

/**
 * Formats raw phone strings (e.g. "+94763560644", "0763560644", "94763560644")
 * into clean, readable boutique formats: "+94 76 356 0644".
 */
export function formatPhoneNumber(phone?: string): string {
  if (!phone) return '+94 77 123 4567';
  const trimmed = phone.trim();
  const digits = trimmed.replace(/[^0-9]/g, '');

  // Sri Lanka format: 9 digits after 94
  if (digits.startsWith('94') && digits.length === 11) {
    return `+94 ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  // Sri Lanka local format starting with 0: e.g. 0763560644 (10 digits)
  if (digits.startsWith('0') && digits.length === 10) {
    return `+94 ${digits.slice(1, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  // 9 digits (local without leading 0): e.g. 763560644
  if (digits.length === 9) {
    return `+94 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }

  // Already formatted with spaces and has multiple groups
  if (trimmed.includes(' ') && trimmed.split(' ').length >= 3) {
    return trimmed;
  }

  // Generic 10-12 digit international with '+'
  if (trimmed.startsWith('+') && digits.length >= 10) {
    const ccLen = digits.length - 9;
    return `+${digits.slice(0, ccLen)} ${digits.slice(ccLen, ccLen + 2)} ${digits.slice(ccLen + 2, ccLen + 5)} ${digits.slice(ccLen + 5)}`;
  }

  return trimmed;
}

/**
 * Returns a properly formatted WhatsApp deep-link with prefilled text and merchant phone number.
 * Automatically resolves updated admin settings if saved in localStorage.
 */
export function getWhatsAppUrl(
  prefilledText: string = 'Hello Preethi! I would like to inquire about Azhai Clothing.',
  customDigits?: string
): string {
  let digits = customDigits;
  if (!digits && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('azhai-admin-store-v3') || localStorage.getItem('azhai-admin-store');
      if (stored) {
        const parsed = JSON.parse(stored);
        const raw = parsed?.state?.settings?.whatsappNumber;
        if (raw) {
          const cleaned = raw.replace(/[^0-9]/g, '');
          if (cleaned.startsWith('0') && cleaned.length === 10) {
            digits = '94' + cleaned.slice(1);
          } else if (cleaned) {
            digits = cleaned;
          }
        }
      }
    } catch {
      // fallback to default constant
    }
  }
  return `https://wa.me/${digits || STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(prefilledText)}`;
}
