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
