import { Link } from 'react-router-dom';
import { Truck, Clock, ShieldCheck, MapPin, Sparkles, ArrowLeft, PackageCheck } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-24 pb-20 text-[#110B0E]">
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
                  <th className="p-3.5">Destination</th>
                  <th className="p-3.5">Courier Partner</th>
                  <th className="p-3.5">Estimated Time</th>
                  <th className="p-3.5">Shipping Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A059]/15">
                <tr className="bg-white">
                  <td className="p-3.5 font-bold text-[#110B0E]">Colombo 01 – 15</td>
                  <td className="p-3.5 text-[#6D6268]">Atelier Express Courier</td>
                  <td className="p-3.5 text-[#110B0E]">Same-Day / Next Day</td>
                  <td className="p-3.5 font-bold text-[#701626]">LKR 450 (FREE over 15k)</td>
                </tr>
                <tr className="bg-[#FCFBF8]">
                  <td className="p-3.5 font-bold text-[#110B0E]">Greater Colombo & Gampaha</td>
                  <td className="p-3.5 text-[#6D6268]">PromptX / Koombiyo</td>
                  <td className="p-3.5 text-[#110B0E]">1 – 2 Business Days</td>
                  <td className="p-3.5 font-bold text-[#701626]">LKR 450 (FREE over 15k)</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-3.5 font-bold text-[#110B0E]">Outstation & All 25 Districts</td>
                  <td className="p-3.5 text-[#6D6268]">Island-wide Registered Courier</td>
                  <td className="p-3.5 text-[#110B0E]">2 – 3 Business Days</td>
                  <td className="p-3.5 font-bold text-[#701626]">LKR 450 (FREE over 15k)</td>
                </tr>
                <tr className="bg-[#FCFBF8]">
                  <td className="p-3.5 font-bold text-[#110B0E]">Urgent Colombo Express</td>
                  <td className="p-3.5 text-[#6D6268]">Priority Rider</td>
                  <td className="p-3.5 text-[#110B0E]">Within 4–6 Hours</td>
                  <td className="p-3.5 font-bold text-[#701626]">LKR 850 Flat Rate</td>
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
              Orders placed before 2:00 PM Sri Lanka time on business days are dispatched the same day. Orders placed on Sunday or Poya Holidays are dispatched on the immediate following working morning.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-2">
            <h3 className="font-display text-lg font-bold text-[#110B0E] flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-[#701626]" /> Cash on Delivery (COD)
            </h3>
            <p className="text-xs text-[#6D6268] font-light leading-relaxed">
              COD is available across all 25 Sri Lankan districts. Our courier partner will accept cash at your doorstep upon parcel handover. Please keep exact change ready.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
