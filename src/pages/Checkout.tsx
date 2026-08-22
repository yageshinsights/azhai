import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Banknote, 
  Sparkles, 
  Crown, 
  Tag, 
  Lock,
  Building2,
  Calendar
} from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';

const SRI_LANKA_DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle'
];

export default function Checkout() {
  const { items, totalPrice, clearCart, setLastOrder } = useCartStore();
  const { user, isAuthenticated, addresses, addOrder, addAddress } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state as { appliedCoupon?: string; discountAmount?: number; giftNote?: string } | null) || {};
  const rawTotal = totalPrice();

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

  // Form State initialized with user profile or default address if available
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || defaultAddr?.phone || '');
  const [fullName, setFullName] = useState(user?.fullName || defaultAddr?.fullName || '');
  const [address, setAddress] = useState(defaultAddr?.address || '');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [district, setDistrict] = useState(defaultAddr?.district || 'Colombo');
  const [postalCode, setPostalCode] = useState(defaultAddr?.postalCode || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(false);
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(defaultAddr?.id || null);

  const handleSelectSavedAddress = (addr: typeof addresses[0]) => {
    setSelectedAddrId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddress(addr.address);
    setCity(addr.city);
    setDistrict(addr.district);
    setPostalCode(addr.postalCode || '');
  };

  // Shipping & Payment Method
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'koko' | 'bank'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pricing calculations
  const discount = state.discountAmount || 0;
  const isFreeStandard = rawTotal >= 15000;
  const shippingFee = deliveryMethod === 'express' ? 850 : (isFreeStandard ? 0 : 450);
  const finalTotal = Math.max(0, rawTotal - discount + shippingFee);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] pt-28 pb-20 px-5 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#F7F4EE] flex items-center justify-center border border-[#C5A059]/40 mb-4">
          <ShoppingBag className="w-8 h-8 text-[#701626]/50" />
        </div>
        <h1 className="font-display text-3xl font-bold text-[#110B0E] mb-2">Your Shopping Bag is Empty</h1>
        <p className="text-sm text-[#6D6268] max-w-sm mb-6 font-light">Add our handcrafted heirloom silks to proceed with checkout.</p>
        <Link
          to="/collections"
          className="px-8 py-3.5 bg-[#701626] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-full shadow-lg"
        >
          Explore Collections →
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone || !address || !city) {
      alert('Please fill in your name, phone number, address, and city.');
      return;
    }

    setIsSubmitting(true);

    const generatedOrderId = `AZH-${Math.floor(10000 + Math.random() * 90000)}`;

    const orderData = {
      orderId: generatedOrderId,
      items: [...items],
      subtotal: rawTotal,
      discount,
      shipping: shippingFee,
      total: finalTotal,
      coupon: state.appliedCoupon,
      giftNote: state.giftNote,
      customer: {
        fullName,
        email,
        phone,
        address,
        city,
        district,
        postalCode
      },
      deliveryMethod: deliveryMethod === 'express' ? 'Express Colombo Same-Day' : 'Island-wide Standard Courier (1-3 Days)',
      paymentMethod: 
        paymentMethod === 'cod' ? 'Cash on Delivery (COD)' :
        paymentMethod === 'card' ? 'Credit / Debit Card (Visa/Mastercard)' :
        paymentMethod === 'koko' ? 'Koko / Mintpay (3x Installments)' : 'Direct Bank Deposit',
      placedAt: new Date().toISOString()
    };

    // Optionally save new address to account if checked
    if (isAuthenticated && saveAddressToAccount && !selectedAddrId) {
      addAddress({
        label: 'Home',
        fullName,
        phone,
        address,
        city,
        district,
        postalCode,
        isDefault: addresses.length === 0
      });
    }

    // Save order to both cart store and user's auth order history
    addOrder(orderData);

    setTimeout(() => {
      setLastOrder(orderData);
      clearCart();
      setIsSubmitting(false);
      navigate(`/order-success/${generatedOrderId}`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-24 pb-20 text-[#110B0E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-[#C5A059]/30">
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#6D6268] hover:text-[#701626] font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Boutique</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-[#701626] bg-[#701626]/8 border border-[#C5A059]/30 px-3.5 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>256-bit Encrypted Checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* ── Left Column: Checkout Form (7 cols) ── */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handlePlaceOrder} className="space-y-8">
              
              {/* 1. Contact Info */}
              <div className="p-6 sm:p-7 rounded-[2rem] bg-white border border-[#C5A059]/35 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#701626] text-white text-xs font-bold flex items-center justify-center">1</span>
                  <h2 className="font-display text-2xl font-bold text-[#110B0E]">Contact Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#6D6268] font-bold mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 text-xs bg-[#FCFBF8] border border-[#C5A059]/50 rounded-xl text-[#110B0E] focus:outline-none focus:border-[#701626]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#6D6268] font-bold mb-1.5">
                      Phone Number (for Courier SMS) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="077 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 text-xs bg-[#FCFBF8] border border-[#C5A059]/50 rounded-xl text-[#110B0E] focus:outline-none focus:border-[#701626]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Sri Lanka Delivery Address */}
              <div className="p-6 sm:p-7 rounded-[2rem] bg-white border border-[#C5A059]/35 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#701626] text-white text-xs font-bold flex items-center justify-center">2</span>
                    <h2 className="font-display text-2xl font-bold text-[#110B0E]">Sri Lanka Delivery Address</h2>
                  </div>
                  {isAuthenticated && addresses.length > 0 && (
                    <span className="text-[10.5px] text-[#701626] font-bold">
                      {addresses.length} Saved Addresses
                    </span>
                  )}
                </div>

                {/* Saved Address Quick Selector Pills */}
                {isAuthenticated && addresses.length > 0 && (
                  <div className="space-y-2 pb-2">
                    <p className="text-[11px] font-bold text-[#110B0E] uppercase tracking-wider">
                      Select Delivery Address:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddrId === addr.id;
                        return (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`p-3 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? 'bg-[#701626]/5 border-[#701626] shadow-sm'
                                : 'bg-[#FCFBF8] border-[#C5A059]/30 hover:border-[#701626]/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#110B0E] font-display">
                                {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[9px] bg-[#701626] text-[#F3E8CE] font-bold px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#6D6268] truncate pt-0.5">{addr.address}</p>
                            <p className="text-[10px] text-[#6D6268]">{addr.city}, {addr.district}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#6D6268] font-bold mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Senanayake"
                      value={fullName}
                      onChange={(e) => {
                        setSelectedAddrId(null);
                        setFullName(e.target.value);
                      }}
                      className="w-full px-4 py-3 text-xs bg-[#FCFBF8] border border-[#C5A059]/50 rounded-xl text-[#110B0E] focus:outline-none focus:border-[#701626]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#6D6268] font-bold mb-1.5">
                      Street Address & Apartment / House No. *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="No. 42, Flower Road, Colombo 07"
                      value={address}
                      onChange={(e) => {
                        setSelectedAddrId(null);
                        setAddress(e.target.value);
                      }}
                      className="w-full px-4 py-3 text-xs bg-[#FCFBF8] border border-[#C5A059]/50 rounded-xl text-[#110B0E] focus:outline-none focus:border-[#701626]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#6D6268] font-bold mb-1.5">
                        City / Town *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Colombo 07"
                        value={city}
                        onChange={(e) => {
                          setSelectedAddrId(null);
                          setCity(e.target.value);
                        }}
                        className="w-full px-4 py-3 text-xs bg-[#FCFBF8] border border-[#C5A059]/50 rounded-xl text-[#110B0E] focus:outline-none focus:border-[#701626]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#6D6268] font-bold mb-1.5">
                        District *
                      </label>
                      <select
                        value={district}
                        onChange={(e) => {
                          setSelectedAddrId(null);
                          setDistrict(e.target.value);
                        }}
                        className="w-full px-4 py-3 text-xs bg-[#FCFBF8] border border-[#C5A059]/50 rounded-xl text-[#110B0E] focus:outline-none focus:border-[#701626]"
                      >
                        {SRI_LANKA_DISTRICTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#6D6268] font-bold mb-1.5">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        placeholder="00700"
                        value={postalCode}
                        onChange={(e) => {
                          setSelectedAddrId(null);
                          setPostalCode(e.target.value);
                        }}
                        className="w-full px-4 py-3 text-xs bg-[#FCFBF8] border border-[#C5A059]/50 rounded-xl text-[#110B0E] focus:outline-none focus:border-[#701626]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#6D6268] font-bold mb-1.5">
                      Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Call before delivery, leave with security..."
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full px-4 py-3 text-xs bg-[#FCFBF8] border border-[#C5A059]/50 rounded-xl text-[#110B0E] focus:outline-none focus:border-[#701626]"
                    />
                  </div>

                  {/* Save address to account checkbox */}
                  {isAuthenticated && !selectedAddrId && (
                    <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAddressToAccount}
                        onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                        className="rounded border-[#C5A059]/40 text-[#701626] focus:ring-[#701626]"
                      />
                      <span className="text-xs text-[#110B0E] font-medium">
                        Save this address to my Azhai account for future orders
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* 3. Shipping Method */}
              <div className="p-6 sm:p-7 rounded-[2rem] bg-white border border-[#C5A059]/35 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#701626] text-white text-xs font-bold flex items-center justify-center">3</span>
                  <h2 className="font-display text-2xl font-bold text-[#110B0E]">Delivery Method</h2>
                </div>

                <div className="space-y-3">
                  <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    deliveryMethod === 'standard'
                      ? 'border-[#701626] bg-[#701626]/5 ring-1 ring-[#701626]'
                      : 'border-[#C5A059]/30 bg-[#FCFBF8] hover:border-[#C5A059]'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <input
                        type="radio"
                        name="shipping"
                        checked={deliveryMethod === 'standard'}
                        onChange={() => setDeliveryMethod('standard')}
                        className="text-[#701626] focus:ring-[#701626]"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#110B0E]">Island-wide Standard Courier (PromptX / Koombiyo)</p>
                        <p className="text-[11px] text-[#6D6268]">Delivered in 1–3 business days across Sri Lanka</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#701626]">
                      {isFreeStandard ? 'FREE' : 'LKR 450'}
                    </span>
                  </label>

                  <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    deliveryMethod === 'express'
                      ? 'border-[#701626] bg-[#701626]/5 ring-1 ring-[#701626]'
                      : 'border-[#C5A059]/30 bg-[#FCFBF8] hover:border-[#C5A059]'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <input
                        type="radio"
                        name="shipping"
                        checked={deliveryMethod === 'express'}
                        onChange={() => setDeliveryMethod('express')}
                        className="text-[#701626] focus:ring-[#701626]"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#110B0E]">Express Colombo Priority Dispatch</p>
                        <p className="text-[11px] text-[#6D6268]">Same-day or next morning delivery for Colombo 01-15</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#701626]">LKR 850</span>
                  </label>
                </div>
              </div>

              {/* 4. Payment Method */}
              <div className="p-6 sm:p-7 rounded-[2rem] bg-white border border-[#C5A059]/35 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#701626] text-white text-xs font-bold flex items-center justify-center">4</span>
                  <h2 className="font-display text-2xl font-bold text-[#110B0E]">Payment Method</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* COD */}
                  <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                    paymentMethod === 'cod'
                      ? 'border-[#701626] bg-[#701626]/5 ring-1 ring-[#701626]'
                      : 'border-[#C5A059]/30 bg-[#FCFBF8] hover:border-[#C5A059]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-[#701626]" />
                        <span className="text-xs font-bold text-[#110B0E]">Cash on Delivery</span>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-[#701626]"
                      />
                    </div>
                    <p className="text-[11px] text-[#6D6268]">Pay with cash to courier upon doorstep parcel handover.</p>
                  </label>

                  {/* Online Card */}
                  <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                    paymentMethod === 'card'
                      ? 'border-[#701626] bg-[#701626]/5 ring-1 ring-[#701626]'
                      : 'border-[#C5A059]/30 bg-[#FCFBF8] hover:border-[#C5A059]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#701626]" />
                        <span className="text-xs font-bold text-[#110B0E]">Visa / Mastercard</span>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="text-[#701626]"
                      />
                    </div>
                    <p className="text-[11px] text-[#6D6268]">Secure PayHere gateway for all Sri Lankan & international cards.</p>
                  </label>

                  {/* Koko / MintPay */}
                  <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                    paymentMethod === 'koko'
                      ? 'border-[#701626] bg-[#701626]/5 ring-1 ring-[#701626]'
                      : 'border-[#C5A059]/30 bg-[#FCFBF8] hover:border-[#C5A059]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#C5A059]" />
                        <span className="text-xs font-bold text-[#110B0E]">Koko (Pay in 3x)</span>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'koko'}
                        onChange={() => setPaymentMethod('koko')}
                        className="text-[#701626]"
                      />
                    </div>
                    <p className="text-[11px] text-[#6D6268]">
                      Pay <strong>3x LKR {Math.round(finalTotal / 3).toLocaleString('en-US')}</strong> interest-free with Koko.
                    </p>
                  </label>

                  {/* Direct Bank Deposit */}
                  <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                    paymentMethod === 'bank'
                      ? 'border-[#701626] bg-[#701626]/5 ring-1 ring-[#701626]'
                      : 'border-[#C5A059]/30 bg-[#FCFBF8] hover:border-[#C5A059]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#701626]" />
                        <span className="text-xs font-bold text-[#110B0E]">Bank Transfer</span>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'bank'}
                        onChange={() => setPaymentMethod('bank')}
                        className="text-[#701626]"
                      />
                    </div>
                    <p className="text-[11px] text-[#6D6268]">Commercial Bank of Ceylon / HNB online deposit.</p>
                  </label>

                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs uppercase tracking-[0.25em] font-bold rounded-2xl shadow-xl shadow-[#701626]/20 transition-all border border-[#C5A059]/40 flex items-center justify-center gap-3 disabled:opacity-60"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin text-[#C5A059]" />
                    <span>Processing Your Order...</span>
                  </span>
                ) : (
                  <span>Place Order · LKR {finalTotal.toLocaleString('en-US')}</span>
                )}
              </motion.button>

            </form>
          </div>

          {/* ── Right Column: Order Summary (5 cols) ── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-28 p-6 sm:p-7 rounded-[2rem] bg-white border border-[#C5A059]/35 shadow-lg space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#C5A059]/20">
                <h3 className="font-display text-2xl font-bold text-[#110B0E]">Order Summary</h3>
                <span className="text-xs text-[#701626] font-bold bg-[#701626]/10 px-3 py-1 rounded-full">
                  {items.reduce((a, b) => a + b.quantity, 0)} Pieces
                </span>
              </div>

              {/* Item List */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4 items-center">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#F7F4EE] shrink-0 border border-[#C5A059]/30">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h4 className="font-display text-base font-bold text-[#110B0E] leading-tight line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-[#6D6268] uppercase tracking-wider">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                      <p className="font-display text-sm font-bold text-[#701626]">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gift Note Alert if entered */}
              {state.giftNote && (
                <div className="p-3.5 rounded-xl bg-[#F7F4EE] border border-[#C5A059]/30 text-xs space-y-1">
                  <span className="font-bold text-[#701626] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Complimentary Note Included:</span>
                  </span>
                  <p className="italic text-[#6D6268] text-[11px]">"{state.giftNote}"</p>
                </div>
              )}

              {/* Breakdown */}
              <div className="pt-4 border-t border-[#C5A059]/20 space-y-2 text-xs">
                <div className="flex justify-between text-[#6D6268]">
                  <span>Subtotal</span>
                  <span>LKR {rawTotal.toLocaleString('en-US')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({state.appliedCoupon})</span>
                    <span>- LKR {discount.toLocaleString('en-US')}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#6D6268]">
                  <span>Delivery ({deliveryMethod === 'express' ? 'Colombo Express' : 'Island-wide'})</span>
                  <span className="text-[#701626] font-semibold">
                    {shippingFee === 0 ? 'FREE' : `LKR ${shippingFee}`}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t border-[#C5A059]/30">
                  <span className="text-xs uppercase tracking-wider text-[#110B0E] font-bold">Total to Pay</span>
                  <span className="font-display text-2xl font-bold text-[#701626]">
                    LKR {finalTotal.toLocaleString('en-US')}
                  </span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-[#C5A059]/20 grid grid-cols-2 gap-3 text-center text-[10px] text-[#6D6268]">
                <div className="p-2.5 rounded-xl bg-[#F7F4EE]">
                  <Truck className="w-4 h-4 text-[#701626] mx-auto mb-1" />
                  <span>Island-wide Dispatch</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7F4EE]">
                  <ShieldCheck className="w-4 h-4 text-[#701626] mx-auto mb-1" />
                  <span>14-Day Exchanges</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
