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
            <h2 className="font-display text-lg font-bold text-[#110B0E]">1. Overview & Business Identity</h2>
            <p>
              Azhai Boutique is an artisanal couture atelier based in Colombo, Western Province, Sri Lanka ({STORE_ADDRESS_FULL}). All purchases and tailoring commissions made through our web portal or official concierge are governed under the laws of the Democratic Socialist Republic of Sri Lanka.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">2. Pricing & Currency</h2>
            <p>
              All prices displayed on this website are denominated in Sri Lankan Rupees (LKR). Prices are inclusive of local atelier crafting duties and exclude shipping fees where applicable. Azhai reserves the right to correct accidental typographical price discrepancies prior to order dispatch.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">3. Payment Processing & Security</h2>
            <p>
              We accept online credit and debit card payments via Central Bank of Sri Lanka-certified payment gateways (PayHere), Cash on Delivery (subject to order limits), and verified Direct Bank Deposits. Online transactions are encrypted under 256-bit TLS protocols. We do not store credit card numbers on our servers.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">4. Bespoke & Custom Tailoring Terms</h2>
            <p>
              Garments crafted via our Tailoring Studio (custom blouse designs, bespoke neckline finishing, made-to-measure kurtis) are crafted specifically to the measurements provided by the patron.
            </p>
            <ul className="list-disc pl-5 space-y-1 pt-1">
              <li>Patrons are responsible for submitting accurate measurement profiles.</li>
              <li>Bespoke pieces require a standard crafting lead time of 3 to 7 business days prior to parcel dispatch.</li>
              <li>Because customized items are individually cut to personal dimensions, they are non-refundable once fabric cutting has commenced; however, our atelier offers complimentary alteration adjustments if the fit differs from submitted specifications.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">5. Shipping, Transit & Cash on Delivery (COD)</h2>
            <p>
              Parcels are dispatched island-wide across all 25 districts of Sri Lanka via Sri Lanka Post Speed Post Courier. Official transit SLAs are within 24 hours for Western Province (Zone A) and within 48 hours for outstation destinations (Zone B).
            </p>
            <p>
              Cash on Delivery (COD) orders are accepted up to a maximum declared value of LKR 100,000 per postal regulations. The recipient must provide exact cash upon doorstep delivery to the postal officer. In the event of an uncontactable recipient or repeated refusal, Azhai reserves the right to restrict future COD privileges.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">6. 14-Day Doorstep Exchange Policy</h2>
            <p>
              Standard unworn catalog pieces in original condition with intact atelier tags may be exchanged within 14 calendar days of delivery. Refer to our <Link to="/returns-exchanges" className="text-[#701626] font-bold underline">14-Day Exchanges Policy</Link> for step-by-step instructions.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">7. Intellectual Property</h2>
            <p>
              All visual lookbooks, garment silhouettes, editorial photographs, brand marks, and software customizations on <code className="font-mono text-[#701626]">azhaiclothing.lk</code> are the proprietary intellectual property of Preethi and Azhai Clothing. Unauthorized commercial reproduction or scraping is strictly prohibited.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#110B0E]">8. Inquiries & Concierge Assistance</h2>
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
