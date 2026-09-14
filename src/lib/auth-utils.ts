// Validation & Security Helpers for Azhai Boutique

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '-azhai-couture-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function validatePhone(phone: string): boolean {
  // Supports Sri Lanka formats: +94 7X XXX XXXX, 07X XXX XXXX, 7XXXXXXXX
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(\+94|0)?7[0-9]{8}$/.test(cleaned);
}

export function getPasswordStrength(password: string): {
  score: number; // 0 to 3
  label: 'Weak' | 'Medium' | 'Strong';
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
} {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUppercase) score++;
  if (hasNumber) score++;

  let label: 'Weak' | 'Medium' | 'Strong' = 'Weak';
  if (score === 2) label = 'Medium';
  if (score === 3) label = 'Strong';

  return { score, label, hasMinLength, hasUppercase, hasNumber };
}

export function generateSessionToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return 'azh_ses_' + crypto.randomUUID().replace(/-/g, '');
  }
  return 'azh_ses_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function generateResetToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return 'azh_rst_' + crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  }
  return 'azh_rst_' + Math.random().toString(36).substring(2, 12);
}
