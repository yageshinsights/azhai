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
  Star,
  Barcode,
  ExternalLink,
  Scale,
  Banknote,
  Building2,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Upload,
  RefreshCw,
  Copy
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
import PrintablePackingSlip from '@/components/admin/PrintablePackingSlip';
import BankBadge from '@/components/BankBadge';
import { compressToWebP } from '@/lib/image-compressor';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  calculateSLPostShipping, 
  estimateCartWeight, 
  generateSLPostTrackingNumber, 
  getSLPostTrackingUrl 
} from '@/lib/slpost-calculator';

interface OrderDetailDrawerProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailDrawer({ order, isOpen, onClose }: OrderDetailDrawerProps) {
  const { updateOrderStatus, verifyBankTransferPayment, uploadOrderBankSlip, products } = useAdminStore();
  const [courierPartner, setCourierPartner] = useState<AdminOrder['courierPartner']>(order?.courierPartner || 'Sri Lanka Post');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [adminNotes, setAdminNotes] = useState(order?.adminNotes || '');
  const [cancellationReason, setCancellationReason] = useState('Customer requested order cancellation');
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [adminBankNotes, setAdminBankNotes] = useState('');
  const [isUploadingAdminSlip, setIsUploadingAdminSlip] = useState(false);
  const [slipModalUrl, setSlipModalUrl] = useState<string | null>(null);

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
            courierName: courierPartner || 'Sri Lanka Post Speed Post',
            trackingNumber: trackingNumber || 'BA-PENDING-LK',
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
          courierName: courierPartner || 'Sri Lanka Post Speed Post',
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
        bankTransferDetails: order.bankTransferDetails,
      }),
    });
    setIsSendingEmail(false);
    showToast('Order receipt re-sent to customer email!');
  };

  // Manual Trigger: Verify Direct Bank Transfer Payment
  const handleVerifyBankPayment = async () => {
    setIsVerifyingPayment(true);
    try {
      await verifyBankTransferPayment(order.orderId, adminBankNotes || 'Verified by Admin Preethi');
      showToast('Payment verified & marked PAID! Status confirmed.');

      if (order.customer.email) {
        await sendBrevoEmail({
          to: [{ email: order.customer.email, name: order.customer.fullName }],
          subject: `✨ Payment Confirmed & Order Cleared #${order.orderId} — Azhai Boutique`,
          htmlContent: buildOrderConfirmationHtml({
            orderId: order.orderId,
            customerName: order.customer.fullName,
            total: order.total,
            items: order.items,
            deliveryMethod: order.deliveryMethod,
            paymentMethod: 'Direct Bank Transfer (Payment Verified)',
            bankTransferDetails: order.bankTransferDetails,
          }),
        });
        showToast('Payment verification confirmation email sent to patron!');
      }
    } catch (err) {
      console.error('[Verify Bank Error]:', err);
      showToast('Error verifying bank payment.');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // Manual Trigger: Admin upload/attach bank slip (e.g. from WhatsApp)
  const handleAdminSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAdminSlip(true);
    try {
      let uploadedUrl = '';
      if (file.type.startsWith('image/')) {
        const webpFile = await compressToWebP(file, { maxWidth: 1400, maxHeight: 1400 });
        if (isSupabaseConfigured()) {
          const fileName = `order-slips/${order.orderId}-${Date.now()}-${webpFile.name}`;
          const { error } = await supabase.storage.from('product-images').upload(fileName, webpFile);
          if (!error) {
            const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
            uploadedUrl = data.publicUrl;
          }
        }
        if (!uploadedUrl) {
          uploadedUrl = await new Promise<string>((res) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.readAsDataURL(webpFile);
          });
        }
      } else {
        uploadedUrl = await new Promise<string>((res) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.readAsDataURL(file);
        });
      }

      uploadOrderBankSlip(order.orderId, uploadedUrl, 'Attached by Store Admin');
      showToast('Deposit slip attached to order successfully!');
    } catch (err) {
      console.error('[Admin Slip Upload Error]:', err);
      showToast('Failed to attach deposit slip.');
    } finally {
      setIsUploadingAdminSlip(false);
    }
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

                {/* 🏦 Bank Transfer & Deposit Slip Verification Card */}
                {(() => {
                  const isBankTransfer = 
                    order.paymentStatus === 'pending_bank' ||
                    Boolean(order.bankTransferDetails) ||
                    (order.paymentMethod && order.paymentMethod.toLowerCase().includes('bank'));

                  if (!isBankTransfer) return null;

                  const bank = order.bankTransferDetails;
                  const isPaid = order.paymentStatus === 'paid';
                  const hasSlip = Boolean(bank?.slipUrl);

                  return (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FCFBF8] border-2 border-[#DFBF77] space-y-3.5 shadow-xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-[#701626]" />
                          <h3 className="font-display text-sm sm:text-base font-bold text-[#110B0E]">
                            Bank Deposit Verification
                          </h3>
                        </div>

                        {isPaid ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Payment Verified
                          </span>
                        ) : hasSlip ? (
                          <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-300 flex items-center gap-1">
                            <FileCheck className="w-3.5 h-3.5 text-blue-600" /> Slip Attached · Review Needed
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Awaiting Customer Slip
                          </span>
                        )}
                      </div>

                      {/* Selected Bank Account Information */}
                      {bank && (
                        <div className="p-3 bg-white rounded-xl border border-[#C5A059]/25 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BankBadge bankName={bank.bankName} logoUrl={bank.bankLogo} size="sm" />
                              <span className="font-bold text-[#110B0E]">{bank.bankName}</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-[#701626]">
                              LKR {order.total.toLocaleString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#6D6268] pt-1.5 border-t border-[#C5A059]/15">
                            <div>
                              <span>Account Name: </span>
                              <strong className="text-[#110B0E]">{bank.accountName}</strong>
                            </div>
                            <div>
                              <span>Account Number: </span>
                              <strong className="font-mono text-[#701626]">{bank.accountNumber}</strong>
                            </div>
                            {bank.branchName && (
                              <div>
                                <span>Branch: </span>
                                <strong className="text-[#110B0E]">{bank.branchName}</strong>
                              </div>
                            )}
                            {bank.referenceNumber && (
                              <div>
                                <span>Customer Reference: </span>
                                <strong className="font-mono text-[#110B0E]">{bank.referenceNumber}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Slip Attachment Viewer & Upload */}
                      <div className="space-y-2">
                        {hasSlip ? (
                          <div className="p-3 rounded-xl bg-white border border-emerald-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={bank!.slipUrl}
                                alt="Deposit Slip"
                                onClick={() => setSlipModalUrl(bank!.slipUrl!)}
                                className="w-14 h-14 object-cover rounded-lg border border-emerald-300 shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                              />
                              <div>
                                <p className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                                  <span>Deposit Slip Attached</span>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                </p>
                                {bank!.submittedAt && (
                                  <p className="text-[10px] text-gray-500">
                                    Submitted: {new Date(bank!.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setSlipModalUrl(bank!.slipUrl!)}
                                  className="text-[10.5px] font-bold text-[#701626] underline hover:text-[#8E1E34] cursor-pointer"
                                >
                                  Inspect Full Slip
                                </button>
                              </div>
                            </div>

                            <label className="text-[10.5px] px-2.5 py-1.5 bg-[#F7F4EE] hover:bg-gray-100 rounded-lg font-bold border border-gray-300 cursor-pointer transition-colors shrink-0">
                              <span>Replace</span>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleAdminSlipUpload}
                                disabled={isUploadingAdminSlip}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-white border border-dashed border-[#C5A059]/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                            <span className="text-[#6D6268]">No slip attached yet by customer.</span>
                            <label className="px-3 py-1.5 bg-[#F7F4EE] hover:bg-[#DFBF77]/20 border border-[#C5A059]/40 rounded-lg text-xs font-bold text-[#701626] cursor-pointer flex items-center gap-1.5 transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingAdminSlip ? 'Attaching...' : 'Attach Slip (from WhatsApp)'}</span>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleAdminSlipUpload}
                                disabled={isUploadingAdminSlip}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Admin Verification Action */}
                      {!isPaid ? (
                        <div className="pt-2 border-t border-[#C5A059]/20 space-y-2">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={adminBankNotes}
                              onChange={(e) => setAdminBankNotes(e.target.value)}
                              placeholder="Optional verification note (e.g. Cleared via bank app)..."
                              className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-[#C5A059]/30 text-[#110B0E] placeholder:text-gray-400 focus:outline-none focus:border-[#701626]"
                            />
                            <button
                              type="button"
                              disabled={isVerifyingPayment}
                              onClick={handleVerifyBankPayment}
                              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>{isVerifyingPayment ? 'Verifying...' : 'Verify & Mark Paid'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Payment Confirmed &amp; Cleared
                          </span>
                          {bank?.verifiedBy && (
                            <span className="text-[10px] text-emerald-700 font-medium">
                              Verified by {bank.verifiedBy}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

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
                  {(() => {
                    const orderWeightGrams = order.weightGrams || estimateCartWeight(
                      order.items.map((i) => {
                        const p = products?.find((prod) => prod.name === i.name);
                        return {
                          name: i.name,
                          quantity: i.quantity,
                          weightGrams: p?.weightGrams,
                        };
                      })
                    );
                    const isOrderCOD = order.paymentMethod?.toLowerCase().includes('cash') || order.paymentStatus === 'pending_cod';
                    const isWithinZone = order.customer.district === 'Colombo' || order.customer.district === 'Gampaha' || order.customer.district === 'Kalutara';
                    const slCalc = calculateSLPostShipping({
                      weightGrams: orderWeightGrams,
                      orderValueLKR: order.total,
                      isCOD: isOrderCOD,
                      isWithinZone,
                    });

                    return (
                      <form onSubmit={handleSaveDispatch} className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#701626]">
                            <Truck className="w-4 h-4" />
                            <span>Courier &amp; Island-wide Waybill</span>
                          </div>
                          <span className="text-[10.5px] font-bold text-[#701626] bg-[#701626]/10 px-2.5 py-0.5 rounded-full border border-[#C5A059]/30">
                            SL Post Speed Post
                          </span>
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
                              <option value="Sri Lanka Post">Sri Lanka Post (Speed Post &amp; COD — Exclusive)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="block text-[11px] font-bold text-[#110B0E]">
                                Waybill / Tracking Number
                              </label>
                              <button
                                type="button"
                                onClick={() => setTrackingNumber(generateSLPostTrackingNumber())}
                                className="text-[10px] text-[#701626] font-bold hover:underline"
                              >
                                + Auto Generate
                              </button>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="e.g. BA849201948LK"
                                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-white border border-[#C5A059]/30"
                              />
                              {trackingNumber && (
                                <a
                                  href={getSLPostTrackingUrl(trackingNumber)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="absolute right-2 top-2 text-[10.5px] text-[#701626] hover:underline flex items-center gap-0.5"
                                  title="View on SL Post Portal"
                                >
                                  <span>Track</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* SL Post Live Calculation Card */}
                        <div className="p-3.5 rounded-xl bg-white border border-[#C5A059]/30 text-xs space-y-2">
                          <div className="flex justify-between items-center text-[11px] font-bold text-[#110B0E] border-b border-[#C5A059]/15 pb-1.5">
                            <span className="flex items-center gap-1.5">
                              <Scale className="w-3.5 h-3.5 text-[#701626]" />
                              Parcel Weight: {orderWeightGrams} g ({(orderWeightGrams / 1000).toFixed(2)} kg)
                            </span>
                            <span className="text-[10px] text-[#701626] uppercase">
                              {isWithinZone ? '24h Zone' : '48h Island-wide'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#6D6268]">
                            <div>
                              <span>Speed Post Postage: </span>
                              <strong className="text-[#110B0E] font-mono">LKR {slCalc.postageFee.toLocaleString()}</strong>
                            </div>
                            {isOrderCOD && (
                              <div>
                                <span>MO Comm. &amp; Fee: </span>
                                <strong className="text-[#110B0E] font-mono">LKR {(slCalc.moneyOrderCommission + slCalc.serviceCharge).toLocaleString()}</strong>
                              </div>
                            )}
                          </div>

                          {isOrderCOD && (
                            <div className="pt-1.5 border-t border-emerald-100 flex justify-between items-baseline text-xs text-emerald-800 font-bold">
                              <span>Net Remittance to Collect at Post Office:</span>
                              <span className="font-mono text-sm">LKR {slCalc.netSellerRemittance.toLocaleString()}</span>
                            </div>
                          )}
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
                          Save &amp; Send Tracking Update Email
                        </button>
                      </form>
                    );
                  })()}

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

      {/* Slip Full View Modal for Admin */}
      <AnimatePresence>
        {slipModalUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl w-full bg-white rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl border border-[#C5A059]/40"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#C5A059]/20">
                <h4 className="font-display text-base font-bold text-[#110B0E]">
                  Customer Deposit Slip — #{order.orderId}
                </h4>
                <button
                  type="button"
                  onClick={() => setSlipModalUrl(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="max-h-[70vh] overflow-auto rounded-xl flex items-center justify-center bg-[#F7F4EE]">
                <img
                  src={slipModalUrl}
                  alt="Deposit Slip Full"
                  className="max-h-[65vh] w-auto object-contain rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#6D6268]">
                  Amount: <strong className="text-[#701626]">LKR {order.total.toLocaleString()}</strong>
                </span>
                <a
                  href={slipModalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#701626] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <span>Open in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
