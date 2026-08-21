import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus, Sparkles, Tag, Gift, Check } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, totalPrice } = useCartStore();
  const rawTotal = totalPrice();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isGiftNoteOpen, setIsGiftNoteOpen] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'AZHAI10') {
      const disc = Math.round(rawTotal * 0.10);
      setDiscountAmount(disc);
      setAppliedCoupon('AZHAI10');
    } else if (clean === 'DESIGIRL') {
      setDiscountAmount(500);
      setAppliedCoupon('DESIGIRL');
    } else {
      alert('Invalid coupon code. Try AZHAI10 or DESIGIRL');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
  };

  const finalTotal = Math.max(0, rawTotal - discountAmount);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-[#1C1318]/40 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            className="fixed inset-y-0 right-0 z-[70] w-full max-w-md flex flex-col bg-[#FAF7F2] shadow-2xl border-l border-[#E8D7B5]/60"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8D7B5]/50 bg-white/70 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-[#7B1C2E]" />
                <span className="font-display text-2xl font-bold text-[#1C1318]">Your Shopping Bag</span>
                <span className="text-xs text-[#7B1C2E] bg-[#7B1C2E]/10 font-semibold px-2.5 py-0.5 rounded-full">
                  {items.reduce((a, b) => a + b.quantity, 0)}
                </span>
              </div>
              <motion.button
                onClick={() => setCartOpen(false)}
                className="p-2 text-[#1C1318]/50 hover:text-[#7B1C2E] transition-colors rounded-full hover:bg-[#7B1C2E]/5"
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Free shipping progress */}
            <div className="px-6 py-3 bg-[#F4EFEA] border-b border-[#E8D7B5]/30 flex items-center justify-between text-[11px] text-[#7A6D74]">
              <span className="flex items-center gap-1.5 font-medium text-[#7B1C2E]">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
                {rawTotal >= 5000 
                  ? "You've unlocked Free Express Shipping!" 
                  : `Add ₹${(5000 - rawTotal).toLocaleString('en-IN')} more for Free Shipping`}
              </span>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#E8D7B5]/50">
                    <ShoppingBag className="w-7 h-7 text-[#7B1C2E]/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-xl font-bold text-[#1C1318]">Your bag is empty</p>
                    <p className="text-xs text-[#7A6D74]">Discover our handcrafted heirloom silks</p>
                  </div>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="text-xs uppercase tracking-widest font-bold text-[#7B1C2E] bg-[#7B1C2E]/10 hover:bg-[#7B1C2E] hover:text-white px-6 py-3 rounded-xl transition-all"
                  >
                    Explore The Edit →
                  </button>
                </div>
              ) : (
                <>
                  <AnimatePresence>
                    {items.map(item => (
                      <motion.div
                        key={`${item.id}-${item.size}`}
                        className="flex gap-4 p-4 rounded-2xl bg-white border border-[#E8D7B5]/40 shadow-sm"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        layout
                      >
                        <div className="w-20 h-24 rounded-xl overflow-hidden bg-[#F4EFEA] shrink-0 border border-[#E8D7B5]/30">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="font-display text-base font-bold text-[#1C1318] leading-tight line-clamp-2">{item.name}</h3>
                          {item.size && (
                            <p className="text-[10px] uppercase tracking-wider text-[#7A6D74] font-medium">Size: {item.size}</p>
                          )}
                          <p className="font-display text-base font-bold text-[#7B1C2E]">{item.price}</p>
                          <div className="flex items-center gap-3 pt-2">
                            <div className="flex items-center gap-2 bg-[#F4EFEA] rounded-full px-2.5 py-0.5 border border-[#E8D7B5]/40">
                              <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="text-[#1C1318]/60 hover:text-[#7B1C2E]"><Minus className="w-3 h-3" /></button>
                              <span className="text-xs font-bold w-4 text-center text-[#1C1318]">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="text-[#1C1318]/60 hover:text-[#7B1C2E]"><Plus className="w-3 h-3" /></button>
                            </div>
                            <button onClick={() => removeItem(item.id, item.size)} className="text-[#7A6D74]/60 hover:text-red-500 transition-colors ml-auto">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Coupon & Gift Note Box */}
                  <div className="pt-2 space-y-3">
                    
                    {/* Coupon Section */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E8D7B5]/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#1C1318] flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-[#7B1C2E]" />
                          <span>Offers & Promo Code</span>
                        </span>
                      </div>

                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                          <span className="font-bold">✨ '{appliedCoupon}' Applied (Saved ₹{discountAmount.toLocaleString('en-IN')})</span>
                          <button onClick={removeCoupon} className="text-emerald-700 hover:underline font-semibold text-[11px]">Remove</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter AZHAI10 or DESIGIRL"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E8D7B5]/80 rounded-xl uppercase font-semibold text-[#1C1318] focus:outline-none focus:border-[#7B1C2E]"
                          />
                          <button
                            onClick={() => applyCoupon(couponCode)}
                            className="px-4 py-1.5 bg-[#7B1C2E] text-white text-xs font-bold rounded-xl hover:bg-[#9B2D42] transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      )}

                      {/* Quick Apply Pills */}
                      {!appliedCoupon && (
                        <div className="flex gap-2 pt-1">
                          <button 
                            onClick={() => applyCoupon('AZHAI10')} 
                            className="text-[10px] bg-[#FAF7F2] hover:bg-[#7B1C2E]/10 text-[#7B1C2E] font-bold px-2.5 py-1 rounded-lg border border-[#E8D7B5]/60 transition-colors"
                          >
                            ⚡ AZHAI10 (10% Off)
                          </button>
                          <button 
                            onClick={() => applyCoupon('DESIGIRL')} 
                            className="text-[10px] bg-[#FAF7F2] hover:bg-[#7B1C2E]/10 text-[#7B1C2E] font-bold px-2.5 py-1 rounded-lg border border-[#E8D7B5]/60 transition-colors"
                          >
                            💖 DESIGIRL (₹500 Off)
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Gift Note Checkbox */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E8D7B5]/50 space-y-2">
                      <button
                        onClick={() => setIsGiftNoteOpen(!isGiftNoteOpen)}
                        className="w-full flex items-center justify-between text-left text-xs font-bold text-[#1C1318]"
                      >
                        <span className="flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-[#7B1C2E]" />
                          <span>Add Complimentary Handwritten Note by Preethi</span>
                        </span>
                        <span className="text-[#7B1C2E] text-[11px]">{isGiftNoteOpen ? 'Hide' : '+ Add'}</span>
                      </button>

                      {isGiftNoteOpen && (
                        <textarea
                          placeholder="Write your custom gift message here..."
                          value={giftNote}
                          onChange={(e) => setGiftNote(e.target.value)}
                          rows={2}
                          className="w-full p-2.5 text-xs bg-[#FAF7F2] border border-[#E8D7B5]/80 rounded-xl text-[#1C1318] focus:outline-none focus:border-[#7B1C2E] resize-none"
                        />
                      )}
                    </div>

                  </div>
                </>
              )}
            </div>

            {/* Footer Calculation */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-[#E8D7B5]/50 bg-white/90 backdrop-blur-md space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#7A6D74]">
                    <span>Bag Subtotal</span>
                    <span>₹{rawTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promo Discount</span>
                      <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#7A6D74]">
                    <span>Shipping</span>
                    <span className="text-[#7B1C2E] font-semibold">{rawTotal >= 5000 ? 'FREE' : '₹150'}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-[#E8D7B5]/40">
                    <span className="text-xs uppercase tracking-wider text-[#1C1318] font-bold">Total to Pay</span>
                    <span className="font-display text-2xl font-bold text-[#7B1C2E]">
                      ₹{finalTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <motion.button
                  className="w-full py-4 bg-[#7B1C2E] hover:bg-[#9B2D42] text-white text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-3 rounded-2xl shadow-lg shadow-[#7B1C2E]/25 transition-all"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
