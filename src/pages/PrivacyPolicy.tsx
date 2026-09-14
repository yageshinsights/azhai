import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-24 pb-20 text-[#110B0E]">
      <SEOHead
        title="Privacy & Data Protection Policy — Azhai Atelier"
        description="Learn how Azhai protects your personal data, payment coordinates, and tailoring measurements in compliance with Sri Lankan privacy standards."
        canonicalUrl="https://azhaiclothing.lk/privacy-policy"
        url="https://azhaiclothing.lk/privacy-policy"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-10">
        
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#6D6268] hover:text-[#701626] text-xs uppercase tracking-widest transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold bg-[#701626]/8 border border-[#C5A059]/30 px-3.5 py-1 rounded-full">
            Security & Trust
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#110B0E]">
            Privacy & Data Protection Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#6D6268] font-light leading-relaxed">
            Last updated: August 2026. Azhai Boutique is committed to safeguarding your personal privacy and confidential transaction data.
          </p>
        </div>

        {/* Policy Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-[#C5A059]/30 shadow-sm space-y-6 text-xs text-[#6D6268] leading-relaxed">
          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">1. Information We Collect</h2>
            <p>
              When you purchase or register an account at Azhai, we collect your name, delivery address, phone number, and email address solely for fulfilling courier dispatch and providing order updates.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">2. Payment Security</h2>
            <p>
              We never store your credit or debit card numbers on our servers. All card transactions are processed securely through Central Bank of Sri Lanka-certified payment gateways (PayHere) using 256-bit TLS bank-grade encryption.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">3. Courier Data Sharing</h2>
            <p>
              Your contact details (name, delivery address, phone number) are shared strictly with our verified delivery partner (Sri Lanka Post Speed Post Courier) solely for delivering your parcel and dispatch status verification.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">4. Your Privacy Rights</h2>
            <p>
              You have the right to request a copy of your personal data or permanently delete your Azhai account at any time through your Account Settings panel.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
