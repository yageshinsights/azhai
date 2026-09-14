import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Package, Truck, CheckCircle2, Clock, MapPin, MessageCircle, 
  CreditCard, Sparkles, AlertCircle, Building2, Copy, Check, Upload, 
  FileCheck, ExternalLink, RefreshCw 
} from 'lucide-react';
import type { PlacedOrder } from '@/store/cart';
import { useAdminStore, cleanWhatsAppDigits } from '@/store/admin';
import { useCartStore } from '@/store/cart';
import { STORE_WHATSAPP_NUMBER } from '@/lib/constants';
import BankBadge from '@/components/BankBadge';
import { compressToWebP } from '@/lib/image-compressor';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface OrderDetailProps {
  order: PlacedOrder;
  onBack: () => void;
}

export default function OrderDetail({ order, onBack }: OrderDetailProps) {
  const adminOrders = useAdminStore((s) => s.orders);
  const settings = useAdminStore((s) => s.settings);
  const activeWhatsAppDigits = cleanWhatsAppDigits(settings?.whatsappNumber) || STORE_WHATSAPP_NUMBER;

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);
  const [slipUploadError, setSlipUploadError] = useState<string | null>(null);
  const [localSlipUrl, setLocalSlipUrl] = useState<string | null>(null);
  const [referenceInput, setReferenceInput] = useState('');
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Merge latest live status and tracking from admin store
  const liveOrder = useMemo(() => {
    const adminMatch = adminOrders.find((ao) => ao.orderId === order.orderId);
    return adminMatch || order;
  }, [adminOrders, order]);

  const formattedDate = liveOrder.placedAt
    ? new Date(liveOrder.placedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  const currentStatus = liveOrder.status || 'confirmed';
  const courier = liveOrder.courierPartner || 'Sri Lanka Post Speed Post';
  const trackingNumber = liveOrder.trackingNumber;

  // Dynamic status badges
  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'processing':
        return (
          <span className="bg-amber-50 text-amber-900 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-200">
            Atelier Quality Check & Stitching
          </span>
        );
      case 'shipped':
        return (
          <span className="bg-blue-50 text-blue-900 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-200">
            In Transit / Dispatched
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-purple-50 text-purple-900 text-[10px] font-bold px-3 py-1 rounded-full border border-purple-200">
            Delivered to Doorstep
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-rose-50 text-rose-900 text-[10px] font-bold px-3 py-1 rounded-full border border-rose-200">
            Order Cancelled
          </span>
        );
      case 'confirmed':
      default:
        return (
          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-200">
            Confirmed & Queued
          </span>
        );
    }
  };

  // Dynamic 4-step tracking timeline
  const isConfirmed = currentStatus !== 'cancelled';
  const isProcessing = ['processing', 'shipped', 'delivered'].includes(currentStatus);
  const isShipped = ['shipped', 'delivered'].includes(currentStatus);
  const isDelivered = currentStatus === 'delivered';

  const steps = [
    {
      title: 'Order Confirmed',
      time: formattedDate,
      completed: isConfirmed,
      icon: CheckCircle2,
    },
    {
      title: 'Atelier Quality Check & Packing',
      time: isProcessing ? 'Completed at Colombo atelier' : 'In Progress / Queued',
      completed: isProcessing,
      icon: Clock,
    },
    {
      title: 'Handed to Island Courier',
      time: isShipped
        ? `${courier}${trackingNumber ? ` (Waybill: ${trackingNumber})` : ''}`
        : 'Pending Courier Pickup',
      completed: isShipped,
      icon: Truck,
    },
    {
      title: 'Delivered to Doorstep',
      time: isDelivered ? 'Successfully Delivered' : 'Estimated 1-3 Business Days',
      completed: isDelivered,
      icon: Package,
    },
  ];

  const waText = encodeURIComponent(
    `Hello Preethi! I have a question regarding my Azhai Order #${liveOrder.orderId}.`
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                  Boutique Order
                </span>
                {getStatusBadge()}
                {liveOrder.paymentStatus === 'pending_bank' && (
                  <span className="bg-amber-50 text-amber-900 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-300 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" /> Awaiting Bank Slip
                  </span>
                )}
                {liveOrder.paymentStatus === 'paid' && (
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-300 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
                  </span>
                )}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#110B0E]">
                Order #{liveOrder.orderId}
              </h2>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase tracking-wider text-[#6D6268]">Total Paid / Due</p>
              <p className="font-display text-2xl sm:text-3xl font-bold text-[#701626]">
                LKR {liveOrder.total.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Cancellation Notice if cancelled */}
          {currentStatus === 'cancelled' && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-900 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <div>
                <p className="font-bold">This order has been cancelled.</p>
                <p className="text-[11px] text-rose-700">If you have questions or wish to re-order, please contact our Colombo concierge.</p>
              </div>
            </div>
          )}

          {/* Live Dispatch Stepper */}
          {currentStatus !== 'cancelled' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#110B0E] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#701626]" /> Dispatch &amp; Delivery Tracking
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
          )}
        </div>

        {/* Items & Shipping Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ordered Pieces (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-4">
            <h3 className="font-display text-lg font-bold text-[#110B0E] flex items-center justify-between">
              <span>Ordered Pieces ({liveOrder.items.length})</span>
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
            </h3>

            <div className="divide-y divide-[#C5A059]/15">
              {liveOrder.items.map((item, idx) => (
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

            {/* Pricing Totals */}
            <div className="pt-4 border-t border-[#C5A059]/20 space-y-2 text-xs">
              <div className="flex justify-between text-[#6D6268]">
                <span>Subtotal</span>
                <span className="text-[#110B0E] font-medium">LKR {liveOrder.subtotal.toLocaleString()}</span>
              </div>
              {liveOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Privilege Discount ({liveOrder.coupon || 'PROMO'})</span>
                  <span>- LKR {liveOrder.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6D6268]">
                <span>Island Courier Shipping</span>
                <span className="text-[#110B0E] font-medium">
                  {liveOrder.shipping === 0 ? 'FREE' : `LKR ${liveOrder.shipping.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-[#110B0E] pt-2 border-t border-[#C5A059]/20">
                <span>Total Amount</span>
                <span className="text-[#701626] font-display">LKR {liveOrder.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment & Concierge (1 col) */}
          <div className="space-y-6">
            {/* Destination Address */}
            <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-4">
              <h3 className="font-display text-lg font-bold text-[#110B0E] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#701626]" /> Delivery Destination
              </h3>
              <div className="space-y-1.5 text-xs text-[#6D6268]">
                <p className="font-bold text-[#110B0E]">{liveOrder.customer.fullName}</p>
                <p>{liveOrder.customer.address}</p>
                <p>{liveOrder.customer.city}, {liveOrder.customer.district}</p>
                <p className="pt-1 text-[#110B0E] font-medium">{liveOrder.customer.phone}</p>
              </div>
            </div>

            {/* Payment Method & Bank Transfer Card */}
            {(() => {
              const isBankTransfer = 
                liveOrder.paymentStatus === 'pending_bank' ||
                (liveOrder.paymentMethod && liveOrder.paymentMethod.toLowerCase().includes('bank')) ||
                Boolean(liveOrder.bankTransferDetails);

              const activeSlip = localSlipUrl || liveOrder.bankTransferDetails?.slipUrl;
              const bank = liveOrder.bankTransferDetails || settings?.bankAccounts?.find(b => b.isActive) || settings?.bankAccounts?.[0];

              const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setIsUploadingSlip(true);
                setSlipUploadError(null);

                try {
                  let uploadedUrl = '';
                  if (file.type.startsWith('image/')) {
                    const webpFile = await compressToWebP(file, { maxWidth: 1400, maxHeight: 1400 });
                    if (isSupabaseConfigured()) {
                      const fileName = `order-slips/${liveOrder.orderId}-${Date.now()}-${webpFile.name}`;
                      const { error } = await supabase.storage.from('product-images').upload(fileName, webpFile);
                      if (!error) {
                        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                        uploadedUrl = data.publicUrl;
                      }
                    }
                    if (!uploadedUrl) {
                      uploadedUrl = await new Promise<string>((resolve) => {
                        const r = new FileReader();
                        r.onload = () => resolve(r.result as string);
                        r.readAsDataURL(webpFile);
                      });
                    }
                  } else if (file.type === 'application/pdf') {
                    if (isSupabaseConfigured()) {
                      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                      const fileName = `order-slips/${liveOrder.orderId}-${Date.now()}-${safeName}`;
                      const { error } = await supabase.storage.from('product-images').upload(fileName, file, {
                        contentType: 'application/pdf',
                        upsert: true,
                      });
                      if (!error) {
                        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                        uploadedUrl = data.publicUrl;
                      }
                    }
                    if (!uploadedUrl) {
                      throw new Error('PDF upload requires cloud storage. Please send your deposit slip via WhatsApp.');
                    }
                  } else {
                    throw new Error('Unsupported file format. Please upload JPG, PNG, or PDF.');
                  }

                  setLocalSlipUrl(uploadedUrl);
                  useAdminStore.getState().uploadOrderBankSlip(liveOrder.orderId, uploadedUrl, referenceInput.trim());

                  // Sync into cart last order if matching
                  const { lastOrder, setLastOrder } = useCartStore.getState();
                  if (lastOrder && lastOrder.orderId === liveOrder.orderId) {
                    setLastOrder({
                      ...lastOrder,
                      bankTransferDetails: {
                        ...(lastOrder.bankTransferDetails as any),
                        slipUrl: uploadedUrl,
                        referenceNumber: referenceInput.trim() || lastOrder.bankTransferDetails?.referenceNumber,
                        submittedAt: new Date().toISOString(),
                      },
                    });
                  }
                } catch (err: any) {
                  console.error('[Account Slip Upload Error]:', err);
                  setSlipUploadError('Upload failed. Please try again or send via WhatsApp.');
                } finally {
                  setIsUploadingSlip(false);
                }
              };

              return (
                <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-4">
                  <h3 className="font-display text-lg font-bold text-[#110B0E] flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#701626]" /> Payment Information
                    </span>
                    {liveOrder.paymentStatus === 'paid' ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Paid
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {isBankTransfer ? 'Bank Transfer' : 'COD Due'}
                      </span>
                    )}
                  </h3>

                  <div className="space-y-1.5 text-xs text-[#6D6268]">
                    <p className="font-medium text-[#110B0E]">{liveOrder.paymentMethod}</p>
                    <p>Delivery: {liveOrder.deliveryMethod}</p>
                    {liveOrder.giftNote && (
                      <div className="pt-2 border-t border-[#C5A059]/15">
                        <p className="text-[10px] uppercase font-bold text-[#701626]">Gift Card Note:</p>
                        <p className="italic text-[#110B0E]">"{liveOrder.giftNote}"</p>
                      </div>
                    )}
                  </div>

                  {/* Direct Bank Transfer Extra Block */}
                  {isBankTransfer && (
                    <div className="pt-3 border-t border-[#C5A059]/20 space-y-3">
                      {bank && (
                        <div className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#DFBF77] space-y-2 text-xs">
                          <div className="flex items-center gap-2 pb-1.5 border-b border-[#C5A059]/20">
                            <BankBadge bankName={bank.bankName} logoUrl={bank.bankLogo} size="sm" />
                            <span className="font-bold text-[#110B0E] truncate">{bank.bankName}</span>
                          </div>

                          <div className="space-y-1 text-[11px]">
                            <p className="text-[#6D6268]">Account Holder: <strong className="text-[#110B0E]">{bank.accountName}</strong></p>
                            <div className="flex items-center justify-between">
                              <span className="text-[#6D6268]">Account #: <strong className="font-mono text-[#701626]">{bank.accountNumber}</strong></span>
                              <button
                                type="button"
                                onClick={() => handleCopy(bank.accountNumber, 'acc')}
                                className="text-[10px] text-[#701626] font-bold underline cursor-pointer hover:text-[#8E1E34]"
                              >
                                {copiedField === 'acc' ? 'Copied!' : 'Copy #'}
                              </button>
                            </div>
                            {bank.branchName && (
                              <p className="text-[#6D6268]">Branch: <span className="text-[#110B0E]">{bank.branchName}</span></p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Deposit Slip Status & Upload */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#110B0E] uppercase tracking-wider text-[10px]">
                            Deposit Slip
                          </span>
                          {activeSlip ? (
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Slip Attached
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Awaiting Slip
                            </span>
                          )}
                        </div>

                        {activeSlip ? (
                          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={activeSlip}
                                alt="Slip Thumbnail"
                                onClick={() => setPreviewModalUrl(activeSlip)}
                                className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shadow-xs cursor-pointer"
                              />
                              <div>
                                <p className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                                  <span>Slip Submitted</span>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setPreviewModalUrl(activeSlip)}
                                  className="text-[10px] text-[#701626] font-bold underline hover:text-[#8E1E34]"
                                >
                                  View Slip Image
                                </button>
                              </div>
                            </div>

                            <label className="text-[10.5px] px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl font-bold cursor-pointer transition-colors shrink-0">
                              <span>Replace</span>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleSlipUpload}
                                disabled={isUploadingSlip}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={referenceInput}
                              onChange={(e) => setReferenceInput(e.target.value)}
                              placeholder="Transaction / Reference # (Optional)"
                              className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F4EE]/60 border border-[#C5A059]/30 text-[#110B0E] placeholder:text-gray-400 focus:outline-none focus:border-[#701626]"
                            />
                            <label className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-all flex items-center justify-center gap-2 ${
                              isUploadingSlip
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-[#701626] hover:bg-[#8E1E34] text-white shadow-xs'
                            }`}>
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingSlip ? 'Uploading...' : 'Upload Deposit Slip'}</span>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleSlipUpload}
                                disabled={isUploadingSlip}
                                className="hidden"
                              />
                            </label>
                            {slipUploadError && (
                              <p className="text-[11px] text-rose-600 font-medium">{slipUploadError}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* WhatsApp Direct Help */}
            <a
              href={`https://wa.me/${activeWhatsAppDigits}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Message Preethi on WhatsApp
            </a>
          </div>
        </div>

        {/* Lightbox / Slip Modal */}
        <AnimatePresence>
          {previewModalUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-2xl w-full bg-white rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl border border-[#C5A059]/40"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#C5A059]/20">
                  <h4 className="font-display text-base font-bold text-[#110B0E]">
                    Bank Deposit Slip Preview
                  </h4>
                  <button
                    type="button"
                    onClick={() => setPreviewModalUrl(null)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-auto rounded-xl flex items-center justify-center bg-[#F7F4EE]">
                  <img
                    src={previewModalUrl}
                    alt="Deposit Slip Full"
                    className="max-h-[65vh] w-auto object-contain rounded-lg"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <a
                    href={previewModalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#701626] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <span>Open in New Window</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }
