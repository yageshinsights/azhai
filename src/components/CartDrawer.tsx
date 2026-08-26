import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus, Sparkles, Tag, Gift, Heart, User } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';

export default function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, totalPrice } = useCartStore();
  const { user, isAuthenticated, wishlist } = useAuthStore();
  const navigate = useNavigate();
  const rawTotal = totalPrice();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isGiftNoteOpen, setIsGiftNoteOpen] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  const FREE_SHIPPING_THRESHOLD = 15000;

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'AZHAI10') {
      const disc = Math.round(rawTotal * 0.10);
      setDiscountAmount(disc);
      setAppliedCoupon('AZHAI10');
    } else if (clean === 'CEYLON1000') {
      setDiscountAmount(1000);
      setAppliedCoupon('CEYLON1000');
    } else {
      alert('Invalid coupon code. Try AZHAI10 or CEYLON1000');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
  };

  const handleProceedToCheckout = () => {
    setCartOpen(false);
    navigate('/checkout', {
      state: {
        appliedCoupon,
        discountAmount,
        giftNote: isGiftNoteOpen ? giftNote : ''
      }
    });
  };

  const shippingCost = rawTotal >= FREE_SHIPPING_THRESHOLD ? 0 : (rawTotal > 0 ? 450 : 0);
  const finalTotal = Math.max(0, rawTotal - discountAmount + shippingCost);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-[#110B0E]/60 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            className="fixed inset-y-0 right-0 z-[70] w-full sm:max-w-md flex flex-col bg-[#FCFBF8] shadow-2xl border-l border-[#C5A059]/40"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#C5A059]/30 bg-white/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-[#701626]" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl font-bold text-[#110B0E]">Your Shopping Bag</span>
                    <span className="text-xs text-[#701626] bg-[#701626]/10 font-bold px-2 py-0.2 rounded-full">
                      {items.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                  </div>
                  {isAuthenticated && user && (
                    <p className="text-[10px] text-[#6D6268]">
                      Patron: <strong className="text-[#701626]">{user.fullName.split(' ')[0]}</strong>
                    </p>
                  )}
                </div>
              </div>
              <motion.button
                onClick={() => setCartOpen(false)}
                className="p-2 text-[#110B0E]/50 hover:text-[#701626] transition-colors rounded-full hover:bg-black/5"
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Free shipping progress (Sri Lanka LKR 15,000 threshold) */}
            <div className="px-5 sm:px-6 py-2.5 bg-[#F7F4EE] border-b border-[#C5A059]/30 flex items-center justify-between text-[11px] text-[#6D6268]">
              <span className="flex items-center gap-1.5 font-medium text-[#701626]">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                {rawTotal >= FREE_SHIPPING_THRESHOLD 
                  ? "You've unlocked Free Island-wide Delivery!" 
                  : `Add LKR ${(FREE_SHIPPING_THRESHOLD - rawTotal).toLocaleString('en-US')} more for Free Delivery`}
              </span>
              {wishlist.length > 0 && (
                <button
                  onClick={() => {
                    setCartOpen(false);
                    navigate('/account?tab=wishlist');
                  }}
                  className="text-[10px] text-[#701626] font-bold hover:underline flex items-center gap-1 shrink-0"
                >
                  <Heart className="w-3 h-3 fill-[#701626]" /> {wishlist.length} Saved
                </button>
              )}
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#C5A059]/40">
                    <ShoppingBag className="w-7 h-7 text-[#701626]/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-xl font-bold text-[#110B0E]">Your bag is empty</p>
                    <p className="text-xs text-[#6D6268]">Discover our handcrafted heirloom silks</p>
                  </div>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="text-xs uppercase tracking-widest font-bold text-[#701626] bg-[#701626]/10 hover:bg-[#701626] hover:text-white px-6 py-3 rounded-xl transition-all"
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
                        className="flex gap-4 p-4 rounded-2xl bg-white border border-[#C5A059]/30 shadow-sm"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        layout
                      >
                        <div className="w-20 h-24 rounded-xl overflow-hidden bg-[#F7F4EE] shrink-0 border border-[#C5A059]/30">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          {item.tailoring && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#701626] bg-[#701626]/10 px-2 py-0.5 rounded-full">
                              ✂️ Custom Tailored
                            </span>
                          )}
                          <h3 className="font-display text-base font-bold text-[#110B0E] leading-tight line-clamp-2">{item.name}</h3>
                          
                          {item.tailoring ? (
                            <div className="space-y-0.5 pt-0.5">
                              <p className="text-[10px] text-[#6D6268]">
                                Fabric: <strong className="text-[#110B0E]">{item.tailoring.fabricName}</strong>
                              </p>
                              <p className="text-[10px] text-[#6D6268]">
                                Size: <strong className="text-[#110B0E]">{item.tailoring.sizeLabel}</strong>
                                {item.tailoring.sizeLabel === 'Custom' && item.tailoring.measurements && (
                                  <span className="text-[9px] text-[#701626] ml-1 font-mono">
                                    ({Object.entries(item.tailoring.measurements).slice(0, 3).map(([k, v]) => `${k}:${v}"`).join(', ')})
                                  </span>
                                )}
                              </p>
                              <p className="text-[9px] text-[#C5A059] font-medium">⏱ {item.tailoring.leadTime}</p>
                            </div>
                          ) : (
                            item.size && (
                              <p className="text-[10px] uppercase tracking-wider text-[#6D6268] font-medium">Size: {item.size}</p>
                            )
                          )}

                          <p className="font-display text-base font-bold text-[#701626]">{item.price}</p>
                          <div className="flex items-center gap-3 pt-2">
                            <div className="flex items-center gap-2 bg-[#F7F4EE] rounded-full px-2.5 py-0.5 border border-[#C5A059]/40">
                              <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="text-[#110B0E]/60 hover:text-[#701626]"><Minus className="w-3 h-3" /></button>
                              <span className="text-xs font-bold w-4 text-center text-[#110B0E]">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="text-[#110B0E]/60 hover:text-[#701626]"><Plus className="w-3 h-3" /></button>
                            </div>
                            <button onClick={() => removeItem(item.id, item.size)} className="text-[#6D6268]/60 hover:text-rose-600 transition-colors ml-auto">
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
                    <div className="p-3.5 rounded-2xl bg-white border border-[#C5A059]/35 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#110B0E] flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-[#701626]" />
                          <span>Offers & Promo Code</span>
                        </span>
                      </div>

                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                          <span className="font-bold">✨ '{appliedCoupon}' Applied (Saved LKR {discountAmount.toLocaleString('en-US')})</span>
                          <button onClick={removeCoupon} className="text-emerald-700 hover:underline font-semibold text-[11px]">Remove</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter AZHAI10 or CEYLON1000"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs bg-[#FCFBF8] border border-[#C5A059]/50 rounded-xl uppercase font-semibold text-[#110B0E] focus:outline-none focus:border-[#701626]"
                          />
                          <button
                            onClick={() => applyCoupon(couponCode)}
                            className="px-4 py-1.5 bg-[#701626] text-white text-xs font-bold rounded-xl hover:bg-[#8E1E34] transition-colors"
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
                            className="text-[10px] bg-[#F7F4EE] hover:bg-[#701626]/10 text-[#701626] font-bold px-2.5 py-1 rounded-lg border border-[#C5A059]/40 transition-colors"
                          >
                            ⚡ AZHAI10 (10% Off)
                          </button>
                          <button 
                            onClick={() => applyCoupon('CEYLON1000')} 
                            className="text-[10px] bg-[#F7F4EE] hover:bg-[#701626]/10 text-[#701626] font-bold px-2.5 py-1 rounded-lg border border-[#C5A059]/40 transition-colors"
                          >
                            💖 CEYLON1000 (LKR 1,000 Off)
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Gift Note Checkbox */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#C5A059]/35 space-y-2">
                      <button
                        onClick={() => setIsGiftNoteOpen(!isGiftNoteOpen)}
                        className="w-full flex items-center justify-between text-left text-xs font-bold text-[#110B0E]"
                      >
                        <span className="flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-[#701626]" />
                          <span>Add Complimentary Handwritten Note by Preethi</span>
                        </span>
                        <span className="text-[#701626] text-[11px]">{isGiftNoteOpen ? 'Hide' : '+ Add'}</span>
                      </button>

                      {isGiftNoteOpen && (
                        <textarea
                          placeholder="Write your custom gift message here..."
                          value={giftNote}
                          onChange={(e) => setGiftNote(e.target.value)}
                          rows={2}
                          className="w-full p-2.5 text-xs bg-[#FCFBF8] border border-[#C5A059]/50 rounded-xl text-[#110B0E] focus:outline-none focus:border-[#701626] resize-none"
                        />
                      )}
                    </div>

                  </div>
                </>
              )}
            </div>

            {/* Footer Calculation */}
            {items.length > 0 && (
              <div className="px-5 sm:px-6 py-5 border-t border-[#C5A059]/30 bg-white/95 backdrop-blur-md space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#6D6268]">
                    <span>Bag Subtotal</span>
                    <span>LKR {rawTotal.toLocaleString('en-US')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promo Discount</span>
                      <span>- LKR {discountAmount.toLocaleString('en-US')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#6D6268]">
                    <span>Island-wide Delivery</span>
                    <span className="text-[#701626] font-semibold">
                      {shippingCost === 0 ? 'FREE' : `LKR ${shippingCost}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-[#C5A059]/30">
                    <span className="text-xs uppercase tracking-wider text-[#110B0E] font-bold">Total to Pay</span>
                    <span className="font-display text-2xl font-bold text-[#701626]">
                      LKR {finalTotal.toLocaleString('en-US')}
                    </span>
                  </div>
                </div>

                <motion.button
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-3 rounded-2xl shadow-xl shadow-[#701626]/20 transition-all border border-[#C5A059]/30"
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
