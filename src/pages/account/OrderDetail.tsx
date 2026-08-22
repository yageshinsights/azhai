import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, MapPin, MessageCircle, CreditCard, Sparkles } from 'lucide-react';
import type { PlacedOrder } from '@/store/cart';

interface OrderDetailProps {
  order: PlacedOrder;
  onBack: () => void;
}

export default function OrderDetail({ order, onBack }: OrderDetailProps) {
  const formattedDate = order.placedAt
    ? new Date(order.placedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  // Tracking steps
  const steps = [
    { title: 'Order Confirmed', time: formattedDate, completed: true, icon: CheckCircle2 },
    { title: 'Artisan Quality Check & Packing', time: 'In Progress at Colombo Atelier', completed: true, icon: Clock },
    { title: 'Handed to Island Courier', time: 'Pending Dispatch (1-2 Days)', completed: false, icon: Truck },
    { title: 'Delivered to Doorstep', time: 'Estimated 2-3 Business Days', completed: false, icon: Package },
  ];

  const waText = encodeURIComponent(
    `Hello Preethi! I have a question regarding my Azhai Order #${order.orderId}.`
  );

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#701626] hover:text-[#C5A059] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Orders
        </button>

        <span className="text-xs text-[#6D6268]">
          Placed on <strong className="text-[#110B0E]">{formattedDate}</strong>
        </span>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C5A059]/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                Boutique Order
              </span>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Confirmed & Queued
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#110B0E]">
              Order #{order.orderId}
            </h2>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[10px] uppercase tracking-wider text-[#6D6268]">Total Paid / Due</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-[#701626]">
              LKR {order.total.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Live Dispatch Stepper */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#110B0E] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#701626]" /> Dispatch & Delivery Tracking
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    step.completed
                      ? 'bg-[#701626]/5 border-[#701626]/30 text-[#701626]'
                      : 'bg-[#F7F4EE]/60 border-[#C5A059]/20 text-[#6D6268]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${step.completed ? 'text-[#701626]' : 'text-[#6D6268]'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Step {idx + 1}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#110B0E] mb-1">{step.title}</p>
                  <p className="text-[10.5px] font-light leading-tight">{step.time}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Items & Shipping Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ordered Pieces (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold text-[#110B0E] flex items-center justify-between">
            <span>Ordered Pieces ({order.items.length})</span>
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
          </h3>

          <div className="divide-y divide-[#C5A059]/15">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-20 object-cover rounded-2xl border border-[#C5A059]/30 shrink-0 bg-[#F7F4EE]"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-sm sm:text-base font-bold text-[#110B0E] truncate">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-[#6D6268] pt-1">
                    {item.size && (
                      <span className="bg-[#F7F4EE] px-2 py-0.5 rounded-md font-medium text-[#110B0E]">
                        Size: {item.size}
                      </span>
                    )}
                    <span>Qty: {item.quantity}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs sm:text-sm font-bold text-[#701626] font-display">
                    {item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Receipt Breakdown */}
          <div className="pt-4 border-t border-[#C5A059]/20 space-y-2 text-xs">
            <div className="flex justify-between text-[#6D6268]">
              <span>Subtotal</span>
              <span>LKR {order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount ({order.coupon || 'Promo'})</span>
                <span>- LKR {order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-[#6D6268]">
              <span>Delivery</span>
              <span>{order.shipping === 0 ? 'FREE' : `LKR ${order.shipping}`}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#110B0E] pt-2 border-t border-[#C5A059]/20 font-display">
              <span>Total Amount</span>
              <span className="text-[#701626]">LKR {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Meta (1 col) */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#110B0E] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#701626]" /> Shipping Destination
            </h4>
            <div className="text-xs space-y-1 text-[#6D6268] leading-relaxed">
              <p className="font-bold text-[#110B0E]">{order.customer.fullName}</p>
              <p>{order.customer.address}</p>
              <p>
                {order.customer.city}, {order.customer.district}
              </p>
              {order.customer.postalCode && <p>Postal Code: {order.customer.postalCode}</p>}
              <p className="pt-1 text-[#110B0E] font-medium">Phone: {order.customer.phone}</p>
            </div>
          </div>

          {/* Payment & Concierge */}
          <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#110B0E] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#701626]" /> Payment Method
              </h4>
              <p className="text-xs text-[#6D6268] font-light">{order.paymentMethod}</p>
            </div>

            <div className="pt-2 border-t border-[#C5A059]/20">
              <a
                href={`https://wa.me/94770000000?text=${waText}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs rounded-2xl border border-[#25D366]/30 flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Concierge WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
