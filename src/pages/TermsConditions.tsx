import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, ArrowLeft, Scale, CheckCircle2 } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { useAdminStore } from '@/store/admin';
import { STORE_EMAIL, STORE_PHONE, STORE_ADDRESS_FULL } from '@/lib/constants';

export default function TermsConditions() {
  const settings = useAdminStore((s) => s.settings);
  const activePhone = settings?.phoneNumber || STORE_PHONE;
  const activeWhatsApp = settings?.whatsappNumber || STORE_PHONE;
  const activeAddress = settings?.atelierAddress || STORE_ADDRESS_FULL;
  const activeEmail = settings?.studio?.supportEmail || STORE_EMAIL;
  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-32 sm:pt-36 pb-20 text-[#110B0E]">
      <SEOHead
        title="Terms & Conditions — Azhai Clothing Atelier"
        description="Official terms of service, payment processing policies, bespoke tailoring contracts, and customer privileges for Azhai Clothing by Preethi in Colombo, Sri Lanka."
        canonicalUrl="https://azhaiclothing.lk/terms"
        url="https://azhaiclothing.lk/terms"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-10">
        
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#6D6268] hover:text-[#701626] text-xs uppercase tracking-widest transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Boutique
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold bg-[#701626]/8 border border-[#C5A059]/30 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Scale className="w-3 h-3 text-[#C5A059]" />
            <span>Legal & Store Policies</span>
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#110B0E]">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-[#6D6268] font-light leading-relaxed">
            Effective Date: September 2026. Welcome to Azhai Clothing by Preethi (<code className="text-[#701626] font-mono">azhaiclothing.lk</code>). By browsing our catalog, commissioning custom tailoring, or placing an order, you agree to the following terms.
          </p>
        </div>

        {/* Policy Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-[#C5A059]/30 shadow-sm space-y-8 text-xs text-[#6D6268] leading-relaxed">
          
          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">1. Overview & Use of the Website</h2>
            <p>
              Welcome to <strong>Azhai Clothing</strong> (<code className="text-[#701626] font-mono">azhaiclothing.lk</code>). These Terms and Conditions govern your use of our website and the purchase of bespoke couture, handloom silks, and readymade apparel from our platform.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must be at least 18 years old or under parental guidance to use our website or place orders.</li>
              <li>You are responsible for maintaining the confidentiality of your customer account credentials.</li>
              <li>You agree to provide true, accurate, and current contact and delivery information during checkout.</li>
              <li>You may not use our website for any unlawful or unauthorized purposes.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">2. Product Information & Pricing</h2>
            <p>
              We strive to provide accurate product descriptions, handloom specifications, measurements, and pricing. All prices displayed on this website are denominated in Sri Lankan Rupees (LKR). Prices are inclusive of local atelier crafting duties and exclude shipping fees where applicable. Azhai reserves the right to correct accidental typographical errors in pricing prior to order confirmation.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">3. Orders & Payment Processing</h2>
            <p>
              By placing an order on our website, you are making an offer to purchase the selected items. We reserve the right to refuse or cancel any order for reasons including fabric availability, pricing errors, or suspected fraudulent activity.
            </p>
            <p>
              We accept online payments via Central Bank of Sri Lanka-certified payment gateways (PayHere Payment Gateway), including Visa, Mastercard, AMEX, and LankaQR. We use trusted third-party payment processors to handle payment information securely; we do not store full credit card numbers or CVV on our servers.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">4. Bespoke & Custom Tailoring Terms</h2>
            <p>
              Garments crafted via our Tailoring Studio are cut and stitched to the measurements submitted by the patron. Standard bespoke lead times are 3 to 7 business days prior to dispatch. Customized items are non-refundable once cutting begins, but qualify for complimentary fit alterations.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">5. Shipping & Delivery</h2>
            <p>
              We make reasonable efforts to ensure timely delivery via registered domestic couriers (including Sri Lanka Post Speed Post). Standard estimated transit is 24 hours for Western Province and 48 hours outstation. Cash on Delivery (COD) is available subject to order verification.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">6. Returns, Refunds & Cancellations</h2>
            <p>
              Our <Link to="/returns-exchanges" className="text-[#701626] font-bold underline">Returns & Refund Policy</Link> governs the process and conditions for returning products and seeking refunds.
            </p>
            <p className="font-medium text-[#110B0E] p-3 rounded-xl bg-[#F7F4EE] border border-[#C5A059]/30">
              <strong>Refund Processing:</strong> In the event of an approved refund, the full refunded amount will be credited back directly to the <strong>payment initiated media itself</strong> (the original debit card, credit card, bank account, or digital payment method used at the time of purchase). Refunds reflect within 5 to 7 business days following merchant approval.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">7. Intellectual Property</h2>
            <p>
              All visual lookbooks, garment silhouettes, editorial photographs, brand marks, and software customizations on <code className="font-mono text-[#701626]">azhaiclothing.lk</code> are the proprietary intellectual property of Preethi and Azhai Clothing.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">8. Limitation of Liability</h2>
            <p>
              In no event shall Azhai Clothing, its proprietors, or artisans be liable for any indirect, incidental, or consequential damages arising out of your use of our website or the purchase and use of our products.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">9. Amendments & Termination</h2>
            <p>
              We reserve the right to modify or update these Terms and Conditions at any time without prior notice. Continued use of our website constitutes acceptance of the modified terms.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#C5A059]/20">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">10. Inquiries & Concierge Assistance</h2>
            <p>
              For legal inquiries, business correspondence, or order adjustments, please contact our Colombo atelier:
            </p>
            <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/30 space-y-1 font-mono text-[11px] text-[#110B0E]">
              <p>Email: {activeEmail}</p>
              <p>Hotline: {activePhone}</p>
              <p>WhatsApp Concierge: {activeWhatsApp}</p>
              <p>Showroom Address: {activeAddress}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
