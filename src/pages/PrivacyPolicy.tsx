import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { useAdminStore } from '@/store/admin';
import { STORE_EMAIL, STORE_PHONE, STORE_ADDRESS_FULL, formatPhoneNumber } from '@/lib/constants';

export default function PrivacyPolicy() {
  const settings = useAdminStore((s) => s.settings);
  const activePhone = settings?.phoneNumber || STORE_PHONE;
  const activeEmail = settings?.studio?.supportEmail || STORE_EMAIL;
  const activeAddress = settings?.atelierAddress || STORE_ADDRESS_FULL;
  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-32 sm:pt-36 pb-20 text-[#110B0E]">
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
          <p className="text-sm text-[#110B0E]">
            At <strong>Azhai Clothing</strong> (azhaiclothing.lk), we are committed to protecting the privacy and security of our customers' personal information. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit or make a purchase on our website. By using our website, you consent to the practices described in this policy.
          </p>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">1. Information We Collect</h2>
            <p>When you visit our website, we may collect certain information about you, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Personal Identification Information:</strong> Such as your name, email address, delivery address, and phone number provided voluntarily by you during account registration, bespoke tailoring inquiry, or checkout.</li>
              <li><strong>Payment and Billing Information:</strong> Necessary to process your orders, which are securely handled by trusted third-party payment processors (PayHere Payment Gateway). We do not store or have access to your full credit/debit card numbers or CVV.</li>
              <li><strong>Browsing Information:</strong> Such as your IP address, browser type, and device information, collected automatically using cookies and similar web analytics technologies.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">2. Use of Information</h2>
            <p>We use the collected information for the following business purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process and fulfill your orders, including dispatch, delivery tracking, and bespoke tailoring fitting confirmations.</li>
              <li>To communicate with you regarding your purchases, provide customer concierge support, and respond to WhatsApp/email inquiries.</li>
              <li>To improve our boutique website, garment collections, and tailoring services based on patron feedback.</li>
              <li>To detect and prevent fraudulent transactions, unauthorized access, and abuse of our platform.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">3. Information Sharing</h2>
            <p>
              We respect your privacy and do not sell, trade, or rent your personal information to third parties. We share information only under strict circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Trusted Service Providers:</strong> We share delivery coordinates with registered domestic courier partners (such as Sri Lanka Post Speed Post) solely to deliver your orders, and payment data with certified payment gateway processors (PayHere). These providers are contractually obligated to handle your data securely.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required to do so by applicable Sri Lankan laws or valid court orders.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">4. Data Security</h2>
            <p>
              We implement industry-standard 256-bit TLS encryption and bank-grade security protocols to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Online payment processing adheres to 3D Secure bank authorization standards.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">5. Cookies and Tracking Technologies</h2>
            <p>
              We use functional cookies to remember your shopping cart items, preserve your customer account session, and analyze general site traffic. You may disable cookies through your browser settings, though certain personalized shopping features may be affected.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">6. Changes to This Privacy Policy</h2>
            <p>
              We reserve the right to update this Privacy Policy periodically. Any updates will be published directly on this page with a revised effective date.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#C5A059]/20">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">7. Contact Us</h2>
            <p>
              If you have any questions, requests to access or delete your stored data, please contact our Colombo atelier:
            </p>
            <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/30 space-y-1 font-mono text-[11px] text-[#110B0E]">
              <p>Email: {activeEmail}</p>
              <p>Hotline: {formatPhoneNumber(activePhone)}</p>
              <p>Atelier Showroom: {activeAddress}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
