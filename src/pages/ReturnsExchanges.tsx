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
        title="14-Day Exchanges & Returns Policy — Azhai Guarantee"
        description="Experience hassle-free sizing exchanges with Azhai. 14-day doorstep courier exchange service across Sri Lanka for unworn festive pieces."
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
            14-Day Doorstep Exchange Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#6D6268] font-light leading-relaxed">
            We want every Azhai handloom silhouette to feel made just for you. If the fit or sizing is not perfect, we offer seamless doorstep exchanges across Sri Lanka.
          </p>
        </div>

        {/* 3-Step Exchange Process */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/35 shadow-sm space-y-6">
          <h2 className="font-display text-2xl font-bold text-[#110B0E]">
            How Doorstep Exchanges Work
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/25 space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#701626] text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="font-display text-base font-bold text-[#110B0E]">Notify Concierge</h3>
              <p className="text-xs text-[#6D6268] font-light leading-relaxed">
                Contact Preethi on WhatsApp with your Order ID and desired replacement size within 14 days of delivery.
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

        {/* Conditions */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-4 text-xs text-[#6D6268] leading-relaxed">
          <h3 className="font-display text-lg font-bold text-[#110B0E]">Eligibility Criteria:</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Garments must be unworn, unwashed, and with all original Azhai boutique brand tags attached.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Exchange requests must be submitted within 14 days from parcel delivery date.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Custom altered or tailored blouses are non-exchangeable unless defective upon arrival.</span>
            </li>
          </ul>
        </div>

        {/* WhatsApp Button */}
        <div className="text-center pt-2">
          <a
            href={`https://wa.me/${activeWhatsAppDigits}?text=${encodeURIComponent('Hi Preethi! I would like to request a 14-day exchange for my order.')}`}
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
