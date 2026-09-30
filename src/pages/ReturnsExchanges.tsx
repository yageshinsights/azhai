import { Link } from 'react-router-dom';
import { RotateCcw, CheckCircle2, AlertCircle, ArrowLeft, MessageCircle, Truck } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { useAdminStore, cleanWhatsAppDigits } from '@/store/admin';
import { STORE_PHONE } from '@/lib/constants';

export default function ReturnsExchanges() {
  const settings = useAdminStore((s) => s.settings);
  const activeWhatsApp = settings?.whatsappNumber || STORE_PHONE;
  const activeWhatsAppDigits = cleanWhatsAppDigits(activeWhatsApp);
  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-32 sm:pt-36 pb-20 text-[#110B0E]">
      <SEOHead
        title="Returns & Exchanges Policy — Azhai Guarantee"
        description="Experience personalized sizing support with Azhai. Seamless courier exchange service across Sri Lanka for unworn festive pieces."
        canonicalUrl="https://azhaiclothing.lk/returns-exchanges"
        url="https://azhaiclothing.lk/returns-exchanges"
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
            Patron Guarantee
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#110B0E]">
            Atelier Exchange & Returns Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#6D6268] font-light leading-relaxed">
            We want every Azhai handloom silhouette to feel made just for you. If the fit or sizing is not perfect, we offer seamless exchange assistance across Sri Lanka.
          </p>
        </div>

        {/* 3-Step Exchange Process */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/35 shadow-sm space-y-6">
          <h2 className="font-display text-2xl font-bold text-[#110B0E]">
            How Atelier Exchanges Work
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/25 space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#701626] text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="font-display text-base font-bold text-[#110B0E]">Notify Concierge</h3>
              <p className="text-xs text-[#6D6268] font-light leading-relaxed">
                Contact Preethi on WhatsApp with your Order ID and desired replacement size.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/25 space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#701626] text-white text-xs font-bold flex items-center justify-center">2</span>
              <h3 className="font-display text-base font-bold text-[#110B0E]">Courier Pickup</h3>
              <p className="text-xs text-[#6D6268] font-light leading-relaxed">
                Our courier rider will arrive at your address to hand over the new replacement and collect the original item.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/25 space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#701626] text-white text-xs font-bold flex items-center justify-center">3</span>
              <h3 className="font-display text-base font-bold text-[#110B0E]">Flawless Fit</h3>
              <p className="text-xs text-[#6D6268] font-light leading-relaxed">
                Enjoy your customized drape for your celebration with zero hassle or post-office trips.
              </p>
            </div>
          </div>
        </div>

        {/* Refund Policy (PayHere Bank Compliance) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/35 shadow-sm space-y-4 text-xs text-[#6D6268] leading-relaxed">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#701626]" />
            <h2 className="font-display text-xl font-bold text-[#110B0E]">
              Refund Policy & Payment Processing
            </h2>
          </div>
          <p>
            At Azhai, we take immense pride in the craftsmanship of our handcrafted sarees, silk kurti sets, and bespoke tailoring. In the rare circumstance where an exchange cannot be fulfilled, or if an item arrives damaged or defective, an approved refund will be issued.
          </p>
          <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/30 space-y-2">
            <h4 className="font-display text-sm font-bold text-[#701626]">
              Refund Method & Processing Timeline:
            </h4>
            <p className="text-[12px] text-[#110B0E] font-medium leading-relaxed">
              <strong>All approved refunds will be credited back directly to the original payment method / payment initiated media</strong> from which the initial transaction was placed (e.g., the original Visa/Mastercard credit or debit card, bank account, or electronic payment method). No cash or alternative account substitutions are permitted.
            </p>
            <p className="text-[11px] text-[#6D6268]">
              Once an inspection and approval are completed, the refund is initiated within <strong>2 business days</strong>. Funds typically appear on your statement within <strong>5 to 7 business days</strong>, depending on your card-issuing bank's standard processing cycles.
            </p>
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-4 text-xs text-[#6D6268] leading-relaxed">
          <h3 className="font-display text-lg font-bold text-[#110B0E]">Eligibility & Cancellation Criteria:</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Garments must be unworn, unwashed, odor-free, and in their original packaging with all Azhai atelier tags intact.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Return or exchange notifications must be submitted within 7 days of parcel receipt.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Custom altered or bespoke tailored garments (made to specific personal dimensions) are non-refundable once cutting begins, but qualify for complimentary atelier fit alterations.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Order cancellations prior to dispatch are processed immediately, with 100% of the funds returned to the payment initiated media.</span>
            </li>
          </ul>
        </div>

        {/* WhatsApp Button */}
        <div className="text-center pt-2">
          <a
            href={`https://wa.me/${activeWhatsAppDigits}?text=${encodeURIComponent('Hi Preethi! I would like to request an exchange for my order.')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-lg transition-all"
          >
            <MessageCircle className="w-4 h-4" /> Start Exchange on WhatsApp ({activeWhatsApp})
          </a>
        </div>

      </div>
    </div>
  );
}
