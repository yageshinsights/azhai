import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Percent, DollarSign, Calendar, Sparkles } from 'lucide-react';
import type { Coupon } from '@/store/admin';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (couponData: Omit<Coupon, 'id' | 'usageCount'>) => void;
}

export default function CouponModal({ isOpen, onClose, onSave }: CouponModalProps) {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(10);
  const [minSpend, setMinSpend] = useState(15000);
  const [expiresAt, setExpiresAt] = useState('2026-12-31');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    onSave({
      code: code.trim().toUpperCase(),
      discountType,
      value: Number(value),
      minSpend: Number(minSpend) || 0,
      isActive: true,
      expiresAt,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#C5A059]/40 shadow-2xl space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-3">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                Promotion Engine
              </span>
              <h3 className="font-display text-xl font-bold text-[#110B0E]">
                Create Promo Coupon
              </h3>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F7F4EE] hover:bg-gray-200 flex items-center justify-center text-[#110B0E]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Promo Code Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                Coupon Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. FESTIVE15"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-bold uppercase tracking-widest text-[#701626] focus:border-[#701626] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Discount Type Toggle */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                Discount Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountType('percentage')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    discountType === 'percentage'
                      ? 'bg-[#701626] text-white border-[#701626]'
                      : 'bg-[#F7F4EE] text-[#6D6268] border-[#C5A059]/25'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" /> Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    discountType === 'fixed'
                      ? 'bg-[#701626] text-white border-[#701626]'
                      : 'bg-[#F7F4EE] text-[#6D6268] border-[#C5A059]/25'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Fixed LKR Off
                </button>
              </div>
            </div>

            {/* Discount Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  {discountType === 'percentage' ? 'Percentage Off (%)' : 'Amount Off (LKR)'} *
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  placeholder={discountType === 'percentage' ? '15' : '1500'}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-bold focus:border-[#701626] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Min Cart Spend (LKR)
                </label>
                <input
                  type="number"
                  value={minSpend}
                  onChange={(e) => setMinSpend(Number(e.target.value))}
                  placeholder="15000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-bold focus:border-[#701626] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Expiration Date */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                Expiration Date
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C5A059]/20">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#6D6268]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all"
              >
                Create Coupon
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
