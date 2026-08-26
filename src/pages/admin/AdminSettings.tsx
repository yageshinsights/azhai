import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Banknote, 
  Truck, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Save, 
  Check, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStore } from '@/store/admin';

export default function AdminSettings() {
  const { settings, updateSettings, toggleCOD } = useAdminStore();

  const [enableCOD, setEnableCOD] = useState(settings.enableCOD);
  const [maxCODAmount, setMaxCODAmount] = useState(settings.maxCODAmount);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings.freeShippingThreshold);
  const [standardShippingFee, setStandardShippingFee] = useState(settings.standardShippingFee);
  const [expressShippingFee, setExpressShippingFee] = useState(settings.expressShippingFee);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [atelierAddress, setAtelierAddress] = useState(settings.atelierAddress);
  const [savedToast, setSavedToast] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      enableCOD,
      maxCODAmount: Number(maxCODAmount),
      freeShippingThreshold: Number(freeShippingThreshold),
      standardShippingFee: Number(standardShippingFee),
      expressShippingFee: Number(expressShippingFee),
      whatsappNumber,
      atelierAddress,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#110B0E]">
              Atelier Store Configurations
            </h1>
            <p className="text-xs text-[#6D6268] font-light">
              Configure payment risk policies, cash on delivery (COD) master toggles, and delivery rates.
            </p>
          </div>

          {savedToast && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Store Settings Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* ── 1. MASTER COD & RISK SETTINGS ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-[#701626]">
              <Banknote className="w-5 h-5" />
              <h3 className="font-display text-xl font-bold text-[#110B0E]">
                Cash on Delivery (COD) Master Policy
              </h3>
            </div>

            {/* Master Toggle */}
            <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-xs text-[#110B0E]">Storewide Cash on Delivery (COD)</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    enableCOD ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                  }`}>
                    {enableCOD ? 'ON (Active in Checkout)' : 'OFF (Hidden in Checkout)'}
                  </span>
                </div>
                <p className="text-[11px] text-[#6D6268] pt-0.5">
                  When turned OFF, the COD payment option is immediately disabled across the customer checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEnableCOD(!enableCOD)}
                className={`w-14 h-7 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ${
                  enableCOD ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    enableCOD ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Maximum COD Order Ceiling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Maximum Allowed Cart Value for COD (LKR)
                </label>
                <input
                  type="number"
                  value={maxCODAmount}
                  onChange={(e) => setMaxCODAmount(Number(e.target.value))}
                  placeholder="45000"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-bold focus:border-[#701626] focus:bg-white focus:outline-none"
                />
                <p className="text-[10px] text-[#6D6268]">
                  Orders above this value must be paid via Online Card or Bank Deposit to protect high-value bridal silk parcels.
                </p>
              </div>
            </div>
          </div>

          {/* ── 2. LOGISTICS & DELIVERY THRESHOLDS ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-[#701626]">
              <Truck className="w-5 h-5" />
              <h3 className="font-display text-xl font-bold text-[#110B0E]">
                Shipping Rates & Free Delivery Threshold
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Free Shipping Minimum (LKR)
                </label>
                <input
                  type="number"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-bold focus:border-[#701626] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Standard Courier Fee (LKR)
                </label>
                <input
                  type="number"
                  value={standardShippingFee}
                  onChange={(e) => setStandardShippingFee(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-bold focus:border-[#701626] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Colombo Express Priority Fee (LKR)
                </label>
                <input
                  type="number"
                  value={expressShippingFee}
                  onChange={(e) => setExpressShippingFee(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-bold focus:border-[#701626] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ── 3. ATELIER CONTACT & CONCIERGE ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-[#701626]">
              <Phone className="w-5 h-5" />
              <h3 className="font-display text-xl font-bold text-[#110B0E]">
                Atelier Concierge & Physical Studio
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  WhatsApp Concierge Phone
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Colombo Atelier Address
                </label>
                <input
                  type="text"
                  value={atelierAddress}
                  onChange={(e) => setAtelierAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-8 py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Store Settings
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
