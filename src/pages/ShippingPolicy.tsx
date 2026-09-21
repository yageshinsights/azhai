import { Link } from 'react-router-dom';
import { Truck, Clock, ShieldCheck, MapPin, Sparkles, ArrowLeft, PackageCheck } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-32 sm:pt-36 pb-20 text-[#110B0E]">
      <SEOHead
        title="Shipping & Delivery Policy — Express Colombo & Island-wide"
        description="Learn about Azhai Clothing's island-wide courier delivery across Sri Lanka. Express Colombo dispatch, standard postal service, and live SMS tracking."
        canonicalUrl="https://azhaiclothing.lk/shipping-policy"
        url="https://azhaiclothing.lk/shipping-policy"
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
            Island-wide Logistics
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#110B0E]">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#6D6268] font-light leading-relaxed">
            Every Azhai creation is pressed, hand-inspected for quality, and encased in protective heirloom packaging before dispatch.
          </p>
        </div>

        {/* Delivery Rates Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/35 shadow-sm space-y-6">
          <h2 className="font-display text-2xl font-bold text-[#110B0E] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#701626]" /> Island-wide Delivery Timelines & Rates
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-[#C5A059]/25">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#701626] text-[#F3E8CE] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Destination Zone</th>
                  <th className="p-3.5">Service Partner</th>
                  <th className="p-3.5">Delivery SLA</th>
                  <th className="p-3.5">Postage &amp; Pricing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A059]/15">
                <tr className="bg-white">
                  <td className="p-3.5 font-bold text-[#110B0E]">Western Province (Colombo, Gampaha, Kalutara)</td>
                  <td className="p-3.5 text-[#6D6268]">Sri Lanka Post (Speed Post Courier)</td>
                  <td className="p-3.5 text-[#110B0E]">Within 24 Hours</td>
                  <td className="p-3.5 font-bold text-[#701626]">Weight-tiered from LKR 200</td>
                </tr>
                <tr className="bg-[#FCFBF8]">
                  <td className="p-3.5 font-bold text-[#110B0E]">All 25 Island-wide Districts (Outstation)</td>
                  <td className="p-3.5 text-[#6D6268]">Sri Lanka Post (Speed Post Courier)</td>
                  <td className="p-3.5 text-[#110B0E]">Within 48 Hours</td>
                  <td className="p-3.5 font-bold text-[#701626]">Weight-tiered from LKR 200</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-3.5 font-bold text-[#110B0E]">Cash on Delivery (COD) Parcels</td>
                  <td className="p-3.5 text-[#6D6268]">SL Post Speed Post COD Service</td>
                  <td className="p-3.5 text-[#110B0E]">24 – 48 Hours</td>
                  <td className="p-3.5 font-bold text-[#701626]">Postage + MO Comm. + Rs. 50 fee</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Policy Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-2">
            <h3 className="font-display text-lg font-bold text-[#110B0E] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#701626]" /> Order Dispatch Windows
            </h3>
            <p className="text-xs text-[#6D6268] font-light leading-relaxed">
              Orders placed before 2:00 PM Sri Lanka time on business days are dispatched the same day via Sri Lanka Post Speed Post. Orders placed on Sunday or Poya Holidays are dispatched on the immediate following working morning.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-2">
            <h3 className="font-display text-lg font-bold text-[#110B0E] flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-[#701626]" /> Sri Lanka Post Cash on Delivery (COD)
            </h3>
            <p className="text-xs text-[#6D6268] font-light leading-relaxed">
              COD is available island-wide across all 25 districts up to a maximum declared parcel value of LKR 100,000. SL Post Speed Post delivers directly to your doorstep and accepts cash payment, remitting via post office Money Order.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
