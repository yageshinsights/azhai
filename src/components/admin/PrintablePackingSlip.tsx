import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Sparkles, Truck, Package, ShieldCheck } from 'lucide-react';
import type { AdminOrder } from '@/store/admin';
import { useAdminStore } from '@/store/admin';
import { STORE_ADDRESS_FULL, STORE_PHONE, STORE_SUPPORT_EMAIL } from '@/lib/constants';

interface PrintablePackingSlipProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PrintablePackingSlip({ order, isOpen, onClose }: PrintablePackingSlipProps) {
  const settings = useAdminStore((s) => s.settings);

  if (!isOpen || !order) return null;

  const senderAddress = settings?.atelierAddress || STORE_ADDRESS_FULL;
  const senderPhone = settings?.phoneNumber || STORE_PHONE;
  const senderWhatsApp = settings?.whatsappNumber || STORE_PHONE;
  const senderEmail = settings?.studio?.supportEmail || STORE_SUPPORT_EMAIL;

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
                <p className="text-[11px] text-[#6D6268] pt-1 leading-relaxed">
                  Atelier & Studio: {senderAddress}<br />
                  WhatsApp: {senderWhatsApp} · Phone: {senderPhone} · {senderEmail}
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

            {/* Recipient Coordinates & SL Post Postal Waybill Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/25 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#701626]">
                  <span>From (Sender - Left Side):</span>
                </div>
                <p className="font-bold text-sm text-[#110B0E]">Azhai Clothing Atelier</p>
                <p className="text-[#6D6268] leading-relaxed">{senderAddress}</p>
                <p className="font-bold text-[#110B0E] pt-1">Phone: {senderPhone}</p>
                <p className="text-[10px] text-[#6D6268]">SL Post COD Reg. Merchant: AZH-COL-03</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#701626]">
                  <span>To (Recipient - Right Side):</span>
                </div>
                <p className="font-bold text-sm text-[#110B0E]">{order.customer.fullName}</p>
                <p className="text-[#6D6268] leading-relaxed">{order.customer.address}</p>
                <p className="text-[#6D6268]">
                  {order.customer.city}, {order.customer.district} {order.customer.postalCode ? `· Postal Code: ${order.customer.postalCode}` : ''}
                </p>
                <p className="font-bold text-[#110B0E] pt-1">Phone: {order.customer.phone}</p>
                {order.customer.email && <p className="text-[11px] text-[#6D6268]">{order.customer.email}</p>}
              </div>
            </div>

            {/* SL Post Official Parcel Barcode & Dispatch Badge */}
            <div className="p-4 rounded-2xl bg-[#FCFBF8] border-2 border-dashed border-[#701626]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#701626] text-white font-bold text-[10px] uppercase tracking-wider">
                    {order.courierPartner || 'Sri Lanka Post'}
                  </span>
                  <span className="font-bold text-[#110B0E] text-xs">Speed Post Courier</span>
                  <span className="text-[11px] text-[#6D6268]">
                    ({order.customer.district?.toLowerCase().includes('colombo') || order.customer.district?.toLowerCase().includes('gampaha') || order.customer.district?.toLowerCase().includes('kalutara') ? 'Zone A (Western): 24h SLA' : 'Zone B (Outstation): 48h SLA'})
                  </span>
                </div>
                <p className="text-xs font-mono font-bold tracking-widest text-[#110B0E] pt-1">
                  Tracking #: {order.trackingNumber || `BA${order.orderId.replace(/[^0-9]/g, '').padEnd(9, '0').slice(0, 9)}LK`}
                </p>
                <p className="text-[11px] text-[#6D6268]">
                  Weight: {order.weightGrams ? `${(order.weightGrams / 1000).toFixed(2)} kg (${order.weightGrams}g)` : 'Approx 550g'} (Max allowed 40kg)
                </p>
              </div>

              <div className="text-center sm:text-right">
                {order.paymentStatus === 'paid' ? (
                  <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-center">
                    <p className="text-[10px] uppercase font-bold tracking-wider">Prepaid Article</p>
                    <p className="font-bold text-sm">NO CASH COLLECTION</p>
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-900 text-center shadow-sm">
                    <p className="text-[10px] uppercase font-black tracking-wider text-[#701626]">
                      ★ SL POST CASH ON DELIVERY (COD) ★
                    </p>
                    <p className="font-display font-black text-base text-[#701626]">
                      COLLECT: LKR {order.total.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-[#6D6268] font-medium">Money Order Remittance to Azhai Boutique</p>
                  </div>
                )}
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
                  <span>Postage & Handling</span>
                  <span>{order.shipping === 0 ? 'FREE' : `LKR ${order.shipping}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#110B0E] pt-2 border-t border-[#C5A059]/30 font-display">
                  <span>Total Due</span>
                  <span className="text-[#701626]">LKR {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Courier Fragile Care Note */}
            <div className="p-3.5 rounded-xl border border-dashed border-[#C5A059] bg-[#FCFBF8] text-center space-y-0.5 text-[11px] text-[#6D6268]">
              <p className="font-bold text-[#701626] uppercase tracking-wider">
                🪷 Fragile Artisan Handloom Silks
              </p>
              <p>Handled via Sri Lanka Post Speed Post. Keep dry. Do not bend or crush parcel packaging.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
