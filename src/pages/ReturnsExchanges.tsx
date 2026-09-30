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

        {/* Main Policy Card matching PayHere Sample Structure */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#C5A059]/35 shadow-sm space-y-8 text-xs text-[#6D6268] leading-relaxed">
          
          <p className="text-sm text-[#110B0E]">
            Thank you for shopping at <strong>Azhai Clothing</strong> (azhaiclothing.lk). We value your satisfaction and strive to provide you with the best boutique shopping experience possible. If, for any reason, you are not completely satisfied with your purchase, we are here to help.
          </p>

          {/* 1. Returns */}
          <div className="space-y-2">
            <h3 className="font-display text-lg font-bold text-[#110B0E] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#701626]" /> 1. Returns
            </h3>
            <p>
              We accept returns within <strong>7 days</strong> from the date of purchase or receipt of delivery. To be eligible for a return, your item must be unused, unworn, unwashed, and in the same pristine condition that you received it. It must also be in the original packaging with all Azhai brand and care tags securely attached.
            </p>
          </div>

          {/* 2. Refunds */}
          <div className="space-y-2 p-5 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/35">
            <h3 className="font-display text-lg font-bold text-[#701626]">
              2. Refunds (Payment-Initiated Media Processing)
            </h3>
            <p className="text-[12px] text-[#110B0E] font-medium leading-relaxed">
              Once we receive your return and inspect the item, we will notify you of the status of your refund. If your return is approved, <strong>we will initiate a refund directly to your original method of payment / the payment initiated media itself</strong> (e.g., the original Visa/Mastercard credit or debit card, bank account, or electronic payment method used during checkout). Under no circumstances will refunds be issued to third-party bank accounts or as unverified cash vouchers.
            </p>
            <p className="text-[11px] text-[#6D6268]">
              Please note that the refund amount will exclude any express delivery shipping charges incurred during the initial purchase unless the return is due to our error.
            </p>
          </div>

          {/* 3. Exchanges */}
          <div className="space-y-2">
            <h3 className="font-display text-lg font-bold text-[#110B0E]">
              3. Exchanges
            </h3>
            <p>
              If you would like to exchange your item for a different size, color, or style, please contact our customer concierge team within <strong>7 days</strong> of receiving your order. We will provide you with seamless courier exchange service across Sri Lanka where our courier rider delivers the new piece to your doorstep and collects the original item.
            </p>
          </div>

          {/* 4. Non-Returnable Items */}
          <div className="space-y-2">
            <h3 className="font-display text-lg font-bold text-[#110B0E]">
              4. Non-Returnable Items
            </h3>
            <p>Certain items are non-returnable and non-refundable. These include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Personalized or custom-made items (including bespoke tailored kurtis, made-to-measure blouses, or pre-stitched sarees customized to individual measurements).</li>
              <li>Gift vouchers or electronic promo certificates.</li>
              <li>Garments returned with missing tags, perfume scent, makeup marks, or signs of wear.</li>
            </ul>
          </div>

          {/* 5. Damaged or Defective Items */}
          <div className="space-y-2">
            <h3 className="font-display text-lg font-bold text-[#110B0E]">
              5. Damaged or Defective Items
            </h3>
            <p>
              In the unfortunate event that your item arrives damaged, flawed, or defective, please contact us immediately upon parcel arrival. We will promptly arrange for a complimentary replacement or issue a 100% full refund to the original payment media, depending on your preference and product availability.
            </p>
          </div>

          {/* 6. Return Shipping */}
          <div className="space-y-2">
            <h3 className="font-display text-lg font-bold text-[#110B0E]">
              6. Return Shipping
            </h3>
            <p>
              You will be responsible for paying the shipping costs for returning your item unless the return is due to our error (e.g., wrong item or defective product dispatched). In such cases, Azhai will cover the entire courier pickup fee.
            </p>
          </div>

          {/* 7. Processing Time */}
          <div className="space-y-2">
            <h3 className="font-display text-lg font-bold text-[#110B0E]">
              7. Processing Time
            </h3>
            <p>
              Refunds and exchanges will be processed within <strong>2 to 5 business days</strong> after we receive and inspect your returned item at our Colombo atelier. Please note that it may take an additional <strong>5 to 7 business days</strong> for the refunded credit to appear on your bank or credit card statement, depending on your payment provider and issuing bank's settlement cycle.
            </p>
          </div>

          {/* 8. Contact Us */}
          <div className="space-y-2 pt-2 border-t border-[#C5A059]/20">
            <h3 className="font-display text-lg font-bold text-[#110B0E]">
              8. Contact Us
            </h3>
            <p>
              If you have any questions or concerns regarding our refund policy, please contact our customer support team:
            </p>
            <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/30 space-y-1 font-mono text-[11px] text-[#110B0E]">
              <p>Email: {settings?.studio?.supportEmail || 'orders@azhaiclothing.lk'}</p>
              <p>Hotline: {settings?.phoneNumber || STORE_PHONE}</p>
              <p>WhatsApp Concierge: {activeWhatsApp}</p>
              <p>Atelier Showroom: {settings?.atelierAddress || 'Colombo, Sri Lanka'}</p>
            </div>
          </div>

        </div>

        {/* WhatsApp Button */}
        <div className="text-center pt-2">
          <a
            href={`https://wa.me/${activeWhatsAppDigits}?text=${encodeURIComponent('Hi Preethi! I would like to request an exchange/refund for my order.')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-lg transition-all"
          >
            <MessageCircle className="w-4 h-4" /> Start Exchange or Refund on WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}
