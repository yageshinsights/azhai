import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Truck, 
  Package, 
  Check, 
  Printer, 
  Clock, 
  MapPin, 
  CreditCard,
  Sparkles,
  Mail,
  Send,
  Star
} from 'lucide-react';
import { useAdminStore, type AdminOrder, type OrderStatus } from '@/store/admin';
import { 
  sendBrevoEmail,
  buildOrderConfirmationHtml,
  buildOrderProcessingHtml,
  buildOrderShippedHtml,
  buildOrderDeliveredHtml,
  buildOrderCancelledHtml,
  buildPostDeliveryFeedbackEmailHtml
} from '@/lib/brevo';
import PrintablePackingSlip from './PrintablePackingSlip';

interface OrderDetailDrawerProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailDrawer({ order, isOpen, onClose }: OrderDetailDrawerProps) {
  const { updateOrderStatus } = useAdminStore();
  const [courierPartner, setCourierPartner] = useState<AdminOrder['courierPartner']>(order?.courierPartner || 'PromptX');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [adminNotes, setAdminNotes] = useState(order?.adminNotes || '');
  const [cancellationReason, setCancellationReason] = useState('Customer requested order cancellation');
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  if (!isOpen || !order) return null;

  const showToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handleStatusChange = async (status: OrderStatus) => {
    updateOrderStatus(order.orderId, status, courierPartner, trackingNumber, adminNotes);
    showToast(`Status updated to "${status.toUpperCase()}"!`);

    // Automatic Status Email Triggers
    const customerEmail = order.customer.email;
    const customerName = order.customer.fullName;

    if (!customerEmail) return;

    try {
      if (status === 'processing') {
        await sendBrevoEmail({
          to: [{ email: customerEmail, name: customerName }],
          subject: `✂️ Atelier Crafting in Progress #${order.orderId} — Azhai Clothing`,
          htmlContent: buildOrderProcessingHtml({
            orderId: order.orderId,
            customerName,
            items: order.items,
          }),
        });
        showToast('Atelier crafting update email sent to customer!');
      } else if (status === 'shipped') {
        await sendBrevoEmail({
          to: [{ email: customerEmail, name: customerName }],
          subject: `🚚 Your Azhai Parcel is in Transit #${order.orderId}`,
          htmlContent: buildOrderShippedHtml({
            orderId: order.orderId,
            customerName,
            courierName: courierPartner || 'PromptX Express Courier',
            trackingNumber: trackingNumber || 'PRX-PENDING',
            destinationCity: order.customer.city || 'Colombo',
          }),
        });
        showToast('Dispatch & tracking email sent to customer!');
      } else if (status === 'delivered') {
        await sendBrevoEmail({
          to: [{ email: customerEmail, name: customerName }],
          subject: `✨ Delivered: Your Azhai Masterpiece #${order.orderId}`,
          htmlContent: buildOrderDeliveredHtml({
            orderId: order.orderId,
            customerName,
          }),
        });
        showToast('Delivery confirmation email sent to customer!');
      } else if (status === 'cancelled') {
        await sendBrevoEmail({
          to: [{ email: customerEmail, name: customerName }],
          subject: `Notice of Cancellation: Order #${order.orderId} — Azhai Boutique`,
          htmlContent: buildOrderCancelledHtml({
            orderId: order.orderId,
            customerName,
            reason: cancellationReason,
          }),
        });
        showToast('Order cancellation notice sent to customer!');
      }
    } catch (err) {
      console.error('[Admin Order Status Email Error]:', err);
    }
  };

  const handleSaveDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    updateOrderStatus(order.orderId, order.status, courierPartner, trackingNumber, adminNotes);
    showToast('Dispatch & tracking number saved!');

    // If already shipped, send tracking update
    if (order.status === 'shipped' && order.customer.email) {
      await sendBrevoEmail({
        to: [{ email: order.customer.email, name: order.customer.fullName }],
        subject: `🚚 Tracking Updated #${order.orderId} — ${courierPartner} ${trackingNumber}`,
        htmlContent: buildOrderShippedHtml({
          orderId: order.orderId,
          customerName: order.customer.fullName,
          courierName: courierPartner || 'PromptX',
          trackingNumber: trackingNumber || 'IN-TRANSIT',
          destinationCity: order.customer.city || 'Colombo',
        }),
      });
      showToast('Updated tracking email sent to customer!');
    }
  };

  // Manual Trigger: Send Post-Delivery Fit Review Email
  const handleSendFeedbackEmail = async () => {
    if (!order.customer.email) return;
    setIsSendingEmail(true);
    await sendBrevoEmail({
      to: [{ email: order.customer.email, name: order.customer.fullName }],
      subject: `⭐ How was your Azhai fit? (Order #${order.orderId})`,
      htmlContent: buildPostDeliveryFeedbackEmailHtml({
        orderId: order.orderId,
        customerName: order.customer.fullName,
      }),
    });
    setIsSendingEmail(false);
    showToast('Craftsmanship & fit review email sent to customer!');
  };

  // Manual Trigger: Resend Order Confirmation Receipt
  const handleResendReceipt = async () => {
    if (!order.customer.email) return;
    setIsSendingEmail(true);
    await sendBrevoEmail({
      to: [{ email: order.customer.email, name: order.customer.fullName }],
      subject: `✨ Order Receipt #${order.orderId} — Azhai Boutique by Preethi`,
      htmlContent: buildOrderConfirmationHtml({
        orderId: order.orderId,
        customerName: order.customer.fullName,
        total: order.total,
        items: order.items,
        deliveryMethod: order.deliveryMethod,
        paymentMethod: order.paymentMethod,
      }),
    });
    setIsSendingEmail(false);
    showToast('Order receipt re-sent to customer email!');
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between border-l border-[#C5A059]/40"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-[#C5A059]/20 flex items-center justify-between bg-[#FCFBF8]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                      Order Management
                    </span>
                    <span className="text-[10px] bg-[#C5A059]/20 text-[#701626] font-bold px-2 py-0.5 rounded-full">
                      #{order.orderId}
                    </span>
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#110B0E] pt-1 truncate max-w-[200px] sm:max-w-xs">
                    {order.customer.fullName}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPrintModalOpen(true)}
                    className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#C5A059]/30 text-[#701626] hover:bg-[#701626] hover:text-white transition-colors cursor-pointer"
                    title="Print Packing Slip"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 sm:p-2.5 rounded-xl bg-gray-100 text-[#110B0E] hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
                {savedToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 text-emerald-600" /> {savedToast}
                  </motion.div>
                )}

                {/* Status Stepper Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Update Order Status & Dispatch Email
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'confirmed', label: 'Confirmed' },
                      { key: 'processing', label: 'Processing (Atelier)' },
                      { key: 'shipped', label: 'Shipped (Transit)' },
                      { key: 'delivered', label: 'Delivered' },
                      { key: 'cancelled', label: 'Cancelled' },
                    ].map((st) => (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => handleStatusChange(st.key as OrderStatus)}
                        className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer truncate ${
                          order.status === st.key
                            ? 'bg-[#701626] text-white shadow-md'
                            : 'bg-[#F7F4EE] text-[#6D6268] border border-[#C5A059]/20 hover:border-[#701626]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sri Lanka Courier Dispatch Assignment */}
                <form onSubmit={handleSaveDispatch} className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/30 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#701626]">
                    <Truck className="w-4 h-4" />
                    <span>Courier & Island-wide Waybill</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#110B0E]">
                        Courier Partner
                      </label>
                      <select
                        value={courierPartner}
                        onChange={(e) => setCourierPartner(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#C5A059]/30 font-semibold"
                      >
                        <option value="PromptX">PromptX Courier</option>
                        <option value="Koombiyo">Koombiyo Delivery</option>
                        <option value="Citypak">Citypak (Hayleys)</option>
                        <option value="Domex">Domex Sri Lanka</option>
                        <option value="Atelier Express">Atelier Priority Rider</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#110B0E]">
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="e.g. PRX-849201LK"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#C5A059]/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#110B0E]">
                      Internal Atelier Notes
                    </label>
                    <input
                      type="text"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="e.g. Added handwritten congratulations card..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#C5A059]/30"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Save & Send Tracking Update Email
                  </button>
                </form>

                {/* 📧 Quick Transactional Email Center */}
                <div className="p-5 rounded-2xl bg-white border border-[#C5A059]/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#701626]">
                    <Mail className="w-4 h-4" />
                    <span>Customer Email Actions</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={isSendingEmail}
                      onClick={handleResendReceipt}
                      className="p-3 bg-[#F7F4EE] hover:bg-[#DFBF77]/20 rounded-xl border border-[#C5A059]/30 text-xs font-bold text-[#110B0E] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-[#701626]" />
                      <span>Resend Order Receipt</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSendingEmail}
                      onClick={handleSendFeedbackEmail}
                      className="p-3 bg-[#F7F4EE] hover:bg-[#DFBF77]/20 rounded-xl border border-[#C5A059]/30 text-xs font-bold text-[#110B0E] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Request Fit Review</span>
                    </button>
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Ordered Pieces ({order.items.length})
                  </h4>
                  <div className="divide-y divide-[#C5A059]/20 border border-[#C5A059]/25 rounded-2xl p-4 bg-white">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt=""
                              className="w-12 h-14 object-cover rounded-lg border border-[#C5A059]/30"
                            />
                            <div>
                              <p className="text-xs font-bold text-[#110B0E]">{item.name}</p>
                              <p className="text-[11px] text-[#6D6268]">
                                Size: <span className="font-bold text-[#701626]">{item.size || 'M'}</span> · Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#701626]">{item.price}</span>
                        </div>

                        {/* Tailoring Specs Matrix */}
                        {item.tailoring && (
                          <div className="p-3 bg-[#FCFBF8] rounded-xl border border-[#DFBF77] text-[11px] space-y-1">
                            <span className="font-bold text-[#701626] uppercase tracking-wider text-[9px]">
                              ✂️ Tailor Cutting Specifications:
                            </span>
                            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
                              {Object.entries(item.tailoring.measurements || {}).map(([k, v]) => (
                                <div key={k} className="bg-white p-1.5 rounded border border-[#C5A059]/30 text-center">
                                  <span className="text-gray-500 uppercase block">{k}</span>
                                  <span className="font-bold text-[#701626]">{v}"</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/30 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#701626] uppercase tracking-wider text-[10px]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Customer & Delivery Details</span>
                  </div>
                  <p><strong>Name:</strong> {order.customer.fullName}</p>
                  <p><strong>Phone:</strong> {order.customer.phone}</p>
                  <p><strong>Email:</strong> {order.customer.email}</p>
                  <p><strong>Address:</strong> {order.customer.address}, {order.customer.city}, {order.customer.district}</p>
                  <p><strong>Payment:</strong> {order.paymentMethod}</p>
                  <p><strong>Total Paid:</strong> LKR {order.total.toLocaleString()}</p>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </AnimatePresence>

      {/* Printable Packing Slip Modal */}
      <PrintablePackingSlip
        isOpen={isPrintModalOpen}
        order={order}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </>
  );
}
