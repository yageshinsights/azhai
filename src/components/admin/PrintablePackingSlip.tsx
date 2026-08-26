import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Sparkles, Truck, Package, ShieldCheck } from 'lucide-react';
import type { AdminOrder } from '@/store/admin';

interface PrintablePackingSlipProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PrintablePackingSlip({ order, isOpen, onClose }: PrintablePackingSlipProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-6 sm:p-10 max-w-2xl w-full border border-[#C5A059]/40 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto print:p-0 print:border-none print:shadow-none print:max-w-none"
        >
          {/* Top Actions (Hidden on Print) */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 print:hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-[#701626]">
              Azhai Boutique Packing Slip & Waybill
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-[#701626] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-[#8E1E34] transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Packing Slip
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Invoice & Packing Slip Content */}
          <div className="space-y-6 text-[#110B0E]">
            {/* Header with Logo */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-[#C5A059]/30 pb-5">
              <div>
                <img src="/logo-light.png" alt="Azhai Clothing" className="h-10 sm:h-12 w-auto object-contain" />
                <p className="text-[11px] text-[#6D6268] pt-1">
                  Atelier & Studio: 42/A Temple Road, Kollupitiya, Colombo 03<br />
                  WhatsApp Concierge: +94 77 123 4567 · hello@azhai.lk
                </p>
              </div>

              <div className="text-left sm:text-right space-y-0.5">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                  Boutique Waybill
                </span>
                <p className="font-display text-xl sm:text-2xl font-bold">#{order.orderId}</p>
                <p className="text-[11px] text-[#6D6268]">
                  Date: {new Date(order.placedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </p>
              </div>
            </div>

            {/* Recipient Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/25 text-xs">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#701626]">
                  Deliver To (Patron):
                </p>
                <p className="font-bold text-sm text-[#110B0E]">{order.customer.fullName}</p>
                <p className="text-[#6D6268] leading-relaxed">{order.customer.address}</p>
                <p className="text-[#6D6268]">
                  {order.customer.city}, {order.customer.district} {order.customer.postalCode && `(${order.customer.postalCode})`}
                </p>
                <p className="font-bold text-[#110B0E] pt-1">Phone: {order.customer.phone}</p>
              </div>

              <div className="space-y-1 text-left sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#701626]">
                  Courier & Payment:
                </p>
                <p className="font-bold text-[#110B0E]">{order.courierPartner || 'PromptX Courier'}</p>
                {order.trackingNumber && (
                  <p className="text-[#6D6268]">Tracking #: {order.trackingNumber}</p>
                )}
                <div className="pt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    order.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Paid in Full' : `Collect COD: LKR ${order.total.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#C5A059]/30">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#701626] text-[#F3E8CE] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Size</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5A059]/15">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FCFBF8]'}>
                      <td className="p-3 font-bold text-[#110B0E]">{item.name}</td>
                      <td className="p-3 text-[#6D6268]">{item.size || 'Standard'}</td>
                      <td className="p-3 text-center font-bold text-[#110B0E]">{item.quantity}</td>
                      <td className="p-3 text-right text-[#6D6268]">{item.price}</td>
                      <td className="p-3 text-right font-bold text-[#701626]">
                        LKR {(parseInt(item.price.replace(/[^0-9]/g, ''), 10) * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end text-xs">
              <div className="w-full sm:w-64 space-y-1.5 pt-2 border-t border-[#C5A059]/25">
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
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'FREE' : `LKR ${order.shipping}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#110B0E] pt-2 border-t border-[#C5A059]/30 font-display">
                  <span>Total Amount</span>
                  <span className="text-[#701626]">LKR {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Courier Fragile Care Note */}
            <div className="p-3.5 rounded-xl border border-dashed border-[#C5A059] bg-[#FCFBF8] text-center space-y-0.5 text-[11px] text-[#6D6268]">
              <p className="font-bold text-[#701626] uppercase tracking-wider">
                🪷 Fragile Artisan Handloom Silks
              </p>
              <p>Keep dry. Do not bend or crush parcel packaging. 14-day doorstep exchange permitted.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
