import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Truck, ArrowRight, Crown, UserPlus, FileText, Mail, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const { lastOrder } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const order = lastOrder || {
    orderId: orderId || 'AZH-84291',
    items: [],
    subtotal: 14500,
    discount: 0,
    shipping: 0,
    total: 14500,
    customer: {
      fullName: 'Valued Customer',
      email: 'customer@example.com',
      phone: '077 123 4567',
      address: 'Colombo, Sri Lanka',
      city: 'Colombo',
      district: 'Colombo',
      postalCode: '00700'
    },
    deliveryMethod: 'Island-wide Standard Courier (1-3 Days)',
    paymentMethod: 'Cash on Delivery (COD)',
    placedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-24 pb-20 text-[#110B0E]">
      <div className="max-w-3xl mx-auto px-4 sm:px-8">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-[2.5rem] bg-white border border-[#C5A059]/40 shadow-2xl p-6 sm:p-12 text-center space-y-8"
        >
          {/* Top Celebration Badge */}
          <div className="space-y-3">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold bg-[#701626]/8 border border-[#C5A059]/30 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Order Confirmed & Placed</span>
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#110B0E]">
              Thank You, {order.customer.fullName.split(' ')[0]}!
            </h1>
            <p className="text-sm text-[#6D6268] max-w-md mx-auto font-light leading-relaxed">
              Your order <strong className="text-[#701626] font-bold">#{order.orderId}</strong> has been received and is being prepared with dedication by our Colombo atelier.
            </p>
          </div>

          {/* Email Confirmation Alert Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 sm:p-5 rounded-2xl bg-[#FCFBF8] border border-[#DFBF77] flex items-center gap-3.5 text-left shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#701626]/10 text-[#701626] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#110B0E] flex items-center gap-1.5">
                <span>Confirmation Dispatched to Email</span>
                <Sparkles className="w-3 h-3 text-[#C5A059]" />
              </p>
              <p className="text-[11px] text-[#6D6268] truncate">
                We sent your receipt, tailoring breakdown & tracking updates to <strong className="text-[#701626]">{order.customer.email}</strong>.
              </p>
            </div>
          </motion.div>

          {/* Quick Tracking Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left p-5 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/30 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#6D6268] font-bold">Estimated Dispatch</span>
              <p className="font-bold text-[#110B0E] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#701626]" />
                <span>1–3 Business Days (Island-wide)</span>
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#6D6268] font-bold">Payment Method</span>
              <p className="font-bold text-[#701626]">{order.paymentMethod}</p>
            </div>
          </div>

          {/* Itemized Order Receipt */}
          <div className="text-left space-y-4 pt-4 border-t border-[#C5A059]/20">
            <h3 className="font-display text-xl font-bold text-[#110B0E]">Order Receipt Details</h3>
            
            {order.items.length > 0 && (
              <div className="divide-y divide-[#C5A059]/20">
                {order.items.map((item, idx) => (
                  <div key={`${item.id}-${item.size}-${idx}`} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 rounded-lg bg-[#F7F4EE] overflow-hidden shrink-0 border border-[#C5A059]/30">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-display text-sm font-bold text-[#110B0E]">{item.name}</h4>
                        <p className="text-[10px] text-[#6D6268]">Size: {item.size} · Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-display text-sm font-bold text-[#701626]">{item.price}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-2 pt-4 border-t border-[#C5A059]/20 text-xs text-[#6D6268]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#110B0E]">LKR {order.subtotal.toLocaleString('en-US')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Privilege Savings</span>
                  <span>- LKR {order.discount.toLocaleString('en-US')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Courier Delivery</span>
                <span>{order.shipping === 0 ? 'FREE Complimentary' : `LKR ${order.shipping.toLocaleString('en-US')}`}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#C5A059]/30 text-sm font-bold text-[#110B0E]">
                <span>Total Amount</span>
                <span className="font-display text-xl text-[#701626]">
                  LKR {order.total.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="pt-4 border-t border-[#C5A059]/20 space-y-1 text-xs text-[#6D6268]">
              <p className="font-bold text-[#110B0E]">Delivering to:</p>
              <p>{order.customer.fullName}</p>
              <p>{order.customer.address}, {order.customer.city}, {order.customer.district}</p>
              <p>Phone: {order.customer.phone}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-[#C5A059]/30 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isAuthenticated ? (
                <Link
                  to={`/account?tab=orders&order=${order.orderId}`}
                  className="px-7 py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>View in My Orders</span>
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="px-7 py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account to Track</span>
                </Link>
              )}

              <Link
                to="/collections"
                className="px-6 py-3.5 bg-white hover:bg-gray-50 text-[#110B0E] text-xs uppercase tracking-[0.2em] font-bold rounded-2xl flex items-center justify-center gap-2 border border-[#C5A059]/40 transition-colors"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </motion.div>

      </div>
    </div>
  );
}
