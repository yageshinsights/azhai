import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PAYHERE_LONG_BANNER_URL = 'https://www.payhere.lk/downloads/images/payhere_long_banner.png';
export const PAYHERE_SQUARE_BANNER_URL = 'https://www.payhere.lk/downloads/images/payhere_square_banner.png';

interface PaymentMethodBadgesProps {
  variant?: 'checkout' | 'footer';
  className?: string;
}

export default function PaymentMethodBadges({ variant = 'checkout', className = '' }: PaymentMethodBadgesProps) {
  if (variant === 'checkout') {
    return (
      <div className={`pt-1 ${className}`}>
        <div className="rounded-xl bg-white border border-[#C5A059]/30 p-2 shadow-2xs flex items-center justify-center">
          <img
            src={PAYHERE_SQUARE_BANNER_URL}
            alt="Accepted Payment Methods — Visa, Mastercard, American Express, ComBank Q+, FriMi, Genie, iPay, HelaPay, Google Pay"
            loading="lazy"
            className="w-full max-w-[280px] h-auto object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col lg:flex-row items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-2 text-center lg:text-left">
        <ShieldCheck className="w-4 h-4 text-[#701626] shrink-0" />
        <span className="text-[10px] uppercase tracking-[0.22em] text-[#701626] font-bold">
          Secure Online Payments Powered by PayHere (CBSL Approved)
        </span>
      </div>

      <div className="inline-flex items-center justify-center rounded-xl bg-white border border-[#C5A059]/35 px-3 py-1.5 shadow-2xs">
        <img
          src={PAYHERE_LONG_BANNER_URL}
          alt="Accepted Payment Methods — Visa, Mastercard, American Express, ComBank Q+, FriMi, Genie, iPay, HelaPay, Google Pay"
          loading="lazy"
          className="h-8 sm:h-10 w-auto max-w-full object-contain"
        />
      </div>
    </div>
  );
}
