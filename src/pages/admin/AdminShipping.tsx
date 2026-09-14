import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Shield, 
  ExternalLink, 
  Sparkles, 
  Calculator, 
  Scale, 
  Banknote, 
  Phone, 
  Info,
  Barcode
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStore } from '@/store/admin';
import { 
  calculateSLPostShipping, 
  generateSLPostTrackingNumber, 
  getSLPostTrackingUrl,
  SL_POST_MAX_COD_VALUE_LKR,
  SL_POST_MAX_WEIGHT_GRAMS
} from '@/lib/slpost-calculator';

export default function AdminShipping() {
  const { orders } = useAdminStore();

  // Sri Lanka 25 Districts distribution count
  const districtCounts = orders.reduce((acc, o) => {
    const dist = o.customer.district || 'Colombo';
    acc[dist] = (acc[dist] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Interactive SL Post Calculator State
  const [calcWeight, setCalcWeight] = useState<number>(850);
  const [calcOrderValue, setCalcOrderValue] = useState<number>(14500);
  const [calcIsCOD, setCalcIsCOD] = useState<boolean>(true);
  const [calcIsWithinZone, setCalcIsWithinZone] = useState<boolean>(false);
  const [testTrackingNo, setTestTrackingNo] = useState<string>(generateSLPostTrackingNumber());

  const calcResult = calculateSLPostShipping({
    weightGrams: calcWeight,
    orderValueLKR: calcOrderValue,
    isCOD: calcIsCOD,
    isWithinZone: calcIsWithinZone,
  });

  const GARMENT_PRESETS = [
    { label: 'Kurti Set', weight: 450, value: 14500 },
    { label: 'Mulberry Silk Saree', weight: 850, value: 24500 },
    { label: 'Bridal Silk Lehenga', weight: 2200, value: 48000 },
    { label: 'Tailored Blouse', weight: 250, value: 6500 },
    { label: 'Festive Box (3 Pcs)', weight: 1800, value: 36000 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#110B0E]">
              Sri Lanka Post Logistics &amp; COD Operations
            </h1>
            <p className="text-xs text-[#6D6268] font-light">
              Official Speed Post Courier rate calculation, Money Order Commission formulas, and island-wide dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#701626] bg-[#701626]/10 px-3.5 py-1.5 rounded-full border border-[#C5A059]/30">
              Primary Courier: Sri Lanka Post
            </span>
          </div>
        </div>

        {/* ── Official Sri Lanka Post Service Card ── */}
        <div className="bg-gradient-to-br from-[#701626] to-[#4A0E19] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#DFBF77]/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_center,rgba(223,191,119,0.15),transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="bg-[#DFBF77] text-[#110B0E] text-[10px] uppercase font-bold tracking-widest px-3 py-0.5 rounded-full">
                  Official National Partner
                </span>
                <span className="text-xs text-[#DFBF77] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Department of Posts, Sri Lanka
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F4EE]">
                SL Post Speed Post &amp; Cash On Delivery (COD)
              </h2>
              <p className="text-xs text-white/80 leading-relaxed font-light">
                All Azhai customer orders are fulfilled through Sri Lanka Post Speed Post Courier. Parcels are collected 
                doorstep-to-doorstep or handed over at any Post Office / Sub Post Office across all 25 Districts. 
                Recipients receive a pre-delivery phone call prior to parcel handover.
              </p>
              
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-white/90">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#DFBF77]" />
                  <span>24h (Own Zone) / 48h (Outstation)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#DFBF77]" />
                  <span>Max Weight: 40 kg</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-[#DFBF77]" />
                  <span>Max COD: LKR 100,000</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
              <a
                href="http://www.slpmail.slpost.gov.lk/track/"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-2xl bg-[#DFBF77] hover:bg-[#C5A059] text-[#110B0E] font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>SL Post Tracking Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://bepost.lk/m/care"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>bePost Care Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Interactive SL Post Speed Post & COD Rate Calculator ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/35 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#C5A059]/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#701626]/10 text-[#701626] flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-[#110B0E]">
                  Official SL Post Postage &amp; COD Calculator
                </h3>
                <p className="text-xs text-[#6D6268]">
                  Calculate exact post office postage, money order commission, and net cash remittance.
                </p>
              </div>
            </div>

            {/* Quick Garment Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-[#6D6268] uppercase font-bold tracking-wider mr-1">Presets:</span>
              {GARMENT_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setCalcWeight(p.weight);
                    setCalcOrderValue(p.value);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold border transition-all cursor-pointer ${
                    calcWeight === p.weight && calcOrderValue === p.value
                      ? 'bg-[#701626] text-white border-[#701626]'
                      : 'bg-[#FCFBF8] hover:bg-[#701626]/5 border-[#C5A059]/30 text-[#110B0E]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Controls: Inputs (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Weight Input & Slider */}
              <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#110B0E] flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#701626]" />
                    Parcel Weight: <strong className="text-[#701626] font-mono text-sm">{calcWeight} grams</strong> ({(calcWeight / 1000).toFixed(2)} kg)
                  </span>
                  <span className="text-[10.5px] text-[#6D6268]">Max: 40,000 g</span>
                </div>
                
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Number(e.target.value))}
                  className="w-full accent-[#701626] cursor-pointer"
                />

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min="50"
                    max="40000"
                    step="50"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Math.min(SL_POST_MAX_WEIGHT_GRAMS, Math.max(50, Number(e.target.value) || 0)))}
                    className="w-36 px-3 py-1.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs font-bold text-[#110B0E] focus:outline-none focus:border-[#701626]"
                  />
                  <span className="text-xs text-[#6D6268]">grams (including packaging)</span>
                </div>
              </div>

              {/* Order Declared Value */}
              <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#110B0E] flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-[#701626]" />
                    Declared Order Value: <strong className="text-[#701626] font-mono text-sm">LKR {calcOrderValue.toLocaleString()}</strong>
                  </span>
                  <span className="text-[10.5px] text-[#6D6268]">Max COD: LKR 100,000</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="500"
                    max="100000"
                    step="500"
                    value={calcOrderValue}
                    onChange={(e) => setCalcOrderValue(Math.min(SL_POST_MAX_COD_VALUE_LKR, Math.max(0, Number(e.target.value) || 0)))}
                    className="w-48 px-3 py-1.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs font-bold text-[#110B0E] focus:outline-none focus:border-[#701626]"
                  />
                  <span className="text-xs text-[#6D6268]">LKR (Cash collected at doorstep)</span>
                </div>
              </div>

              {/* Toggles: COD vs Prepaid & Destination Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/30 space-y-2">
                  <label className="block text-xs font-bold text-[#110B0E]">Payment Arrangement</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCalcIsCOD(true)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        calcIsCOD ? 'bg-[#701626] text-white border-[#701626]' : 'bg-white text-[#110B0E] border-[#C5A059]/30'
                      }`}
                    >
                      Cash On Delivery
                    </button>
                    <button
                      onClick={() => setCalcIsCOD(false)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        !calcIsCOD ? 'bg-[#701626] text-white border-[#701626]' : 'bg-white text-[#110B0E] border-[#C5A059]/30'
                      }`}
                    >
                      Pre-paid (Card/Bank)
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/30 space-y-2">
                  <label className="block text-xs font-bold text-[#110B0E]">Delivery Zone</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCalcIsWithinZone(true)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        calcIsWithinZone ? 'bg-[#701626] text-white border-[#701626]' : 'bg-white text-[#110B0E] border-[#C5A059]/30'
                      }`}
                    >
                      Western (24h)
                    </button>
                    <button
                      onClick={() => setCalcIsWithinZone(false)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        !calcIsWithinZone ? 'bg-[#701626] text-white border-[#701626]' : 'bg-white text-[#110B0E] border-[#C5A059]/30'
                      }`}
                    >
                      Island-wide (48h)
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Card: Cost Breakdown & Remittance (5 cols) */}
            <div className="lg:col-span-5 bg-[#F7F4EE]/70 rounded-3xl p-5 border border-[#C5A059]/40 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/30">
                  <span className="text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    {calcIsCOD ? 'COD Total Breakdown' : 'Standard Postage Breakdown'}
                  </span>
                  <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {calcResult.deliveryTimeline.includes('24') ? '24 Hours' : '48 Hours'} SLA
                  </span>
                </div>

                <div className="space-y-2.5 pt-3 text-xs">
                  <div className="flex justify-between text-[#6D6268]">
                    <span>SL Post Courier Postage ({calcResult.totalWeightGrams}g):</span>
                    <strong className="text-[#110B0E] font-mono">LKR {calcResult.postageFee.toLocaleString()}</strong>
                  </div>

                  {calcIsCOD ? (
                    <>
                      <div className="flex justify-between text-[#6D6268]">
                        <span>Money Order Commission (LKR {calcOrderValue.toLocaleString()}):</span>
                        <strong className="text-[#110B0E] font-mono">LKR {calcResult.moneyOrderCommission.toLocaleString()}</strong>
                      </div>

                      <div className="flex justify-between text-[#6D6268]">
                        <span>Fixed COD Service Charge:</span>
                        <strong className="text-[#110B0E] font-mono">LKR {calcResult.serviceCharge}</strong>
                      </div>

                      <div className="pt-2 border-t border-[#C5A059]/30 flex justify-between items-baseline">
                        <span className="font-bold text-[#110B0E]">Total Post Office Charges:</span>
                        <span className="font-display text-lg font-bold text-[#701626]">
                          LKR {calcResult.totalShippingFee.toLocaleString()}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1 mt-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
                          Net Cash Settled to Azhai Atelier
                        </span>
                        <div className="flex justify-between items-baseline">
                          <span className="text-[11px] text-emerald-900">Order Value - MO Commission &amp; Fee:</span>
                          <span className="font-display text-xl font-bold text-emerald-800">
                            LKR {calcResult.netSellerRemittance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="pt-2 border-t border-[#C5A059]/30 flex justify-between items-baseline">
                      <span className="font-bold text-[#110B0E]">Total Postage to Pay:</span>
                      <span className="font-display text-lg font-bold text-[#701626]">
                        LKR {calcResult.totalShippingFee.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking Test Tool */}
              <div className="pt-3 border-t border-[#C5A059]/20 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-mono font-bold text-[#701626]">
                  <Barcode className="w-4 h-4 text-[#C5A059]" />
                  <span>{testTrackingNo}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTestTrackingNo(generateSLPostTrackingNumber())}
                    className="px-2 py-1 rounded-lg bg-white border border-[#C5A059]/30 text-[10px] font-bold text-[#110B0E] hover:bg-gray-100 cursor-pointer"
                    title="Generate New Tracking Code"
                  >
                    Generate
                  </button>
                  <a
                    href={getSLPostTrackingUrl(testTrackingNo)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#701626] text-white text-[10px] font-bold flex items-center gap-1 hover:bg-[#8E1E34]"
                  >
                    <span>Track</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ── District Dispatch Heatmap (25 Districts) ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-[#110B0E]">
                District Demand &amp; SL Post Dispatch Distribution
              </h3>
              <p className="text-xs text-[#6D6268] font-light">
                Breakdown of customer orders across Sri Lanka's 25 administrative districts.
              </p>
            </div>
            <span className="text-xs font-bold text-[#701626]">{orders.length} Active Orders</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 
              'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna', 
              'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 
              'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura', 
              'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'
            ].map((district) => {
              const count = districtCounts[district] || 0;
              const isWestern = district === 'Colombo' || district === 'Gampaha' || district === 'Kalutara';

              return (
                <div
                  key={district}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                    count > 0 ? 'bg-[#FCFBF8] border-[#701626]/40' : 'bg-gray-50/50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#110B0E]">{district}</span>
                    <MapPin className="w-3.5 h-3.5 text-[#701626]" />
                  </div>
                  <p className="text-base font-bold font-display text-[#701626]">{count} orders</p>
                  <p className="text-[9.5px] text-[#6D6268]">
                    {isWestern ? '24h Delivery Zone' : '48h Island-wide Route'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
