import { useParams, Link, useLocation } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Truck, ArrowRight, Crown, UserPlus, FileText, Mail, 
  Sparkles, AlertCircle, Building2, Copy, Check, Upload, FileCheck, 
  MessageCircle, ExternalLink, RefreshCw 
} from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useAdminStore, cleanWhatsAppDigits } from '@/store/admin';
import SEOHead from '@/components/SEOHead';
import { STORE_PHONE } from '@/lib/constants';
import BankBadge from '@/components/BankBadge';
import { compressToWebP } from '@/lib/image-compressor';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  sendBrevoEmail, 
  buildOrderConfirmationHtml,
  buildAdminOrderAlertHtml,
  createOrUpdateBrevoContact,
  BREVO_LISTS,
  buildBankSlipReceivedCustomerHtml, 
  buildBankSlipAdminAlertHtml 
} from '@/lib/brevo';

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const { lastOrder } = useCartStore();
  const { isAuthenticated, orders: authOrders } = useAuthStore();
  const adminOrders = useAdminStore((s) => s.orders);
  const settings = useAdminStore((s) => s.settings);
  const activeWhatsApp = settings?.whatsappNumber || STORE_PHONE;
  const activeWhatsAppDigits = cleanWhatsAppDigits(activeWhatsApp);

  // Local state for slip upload and copy feedback
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);
  const [slipUploadError, setSlipUploadError] = useState<string | null>(null);
  const [localSlipUrl, setLocalSlipUrl] = useState<string | null>(null);
  const [referenceInput, setReferenceInput] = useState('');
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [dbOrder, setDbOrder] = useState<any>(null);
  const [isFetchingDb, setIsFetchingDb] = useState(false);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // If order is not present in in-memory/localStorage stores (e.g. guest refreshes or opens from SMS/email), fetch from Supabase
  useEffect(() => {
    if (!orderId) return;
    const hasLocal = (lastOrder && lastOrder.orderId === orderId) ||
      authOrders.some((o) => o.orderId === orderId) ||
      adminOrders.some((o) => o.orderId === orderId);

    if (hasLocal) return;

    if (isSupabaseConfigured()) {
      setIsFetchingDb(true);
      (async () => {
        try {
          const { data: ord, error: ordErr } = await supabase
            .from('orders')
            .select(`
              *,
              order_items (*)
            `)
            .eq('order_code', orderId)
            .maybeSingle();

          if (ord && !ordErr) {
            setDbOrder({
              orderId: ord.order_code,
              items: (ord.order_items || []).map((it: any, idx: number) => ({
                id: it.id || idx,
                name: it.product_name || it.name,
                price: it.price,
                image: it.image_url || it.image,
                quantity: it.quantity,
                size: it.size,
                tailoring: it.tailoring,
              })),
              subtotal: Number(ord.subtotal) || 0,
              discount: Number(ord.discount) || 0,
              shipping: Number(ord.shipping) || 0,
              total: Number(ord.total) || 0,
              customer: ord.customer_details || {
                fullName: 'Valued Patron',
                email: 'customer@azhaiclothing.lk',
                phone: '',
                address: '',
                city: '',
                district: 'Colombo',
              },
              deliveryMethod: ord.delivery_method || 'Standard Courier',
              paymentMethod: ord.payment_method || 'Confirmed Order',
              placedAt: ord.created_at
                ? new Date(ord.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                : new Date().toLocaleString(),
              paymentStatus: ord.payment_status,
              bankTransferDetails: ord.bank_transfer_details,
              status: ord.status,
            });
          }
        } catch (err) {
          console.error('[Supabase OrderSuccess DB Fetch Error]:', err);
        } finally {
          setIsFetchingDb(false);
        }
      })();
    }
  }, [orderId, lastOrder, authOrders, adminOrders]);

  // Handle return from Payments.lk 3D Secure Hosted Checkout (?payments_lk=success)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isPaymentSuccess = searchParams.get('payments_lk') === 'success';
    const returnedPaymentId =
      searchParams.get('payment_id') ||
      searchParams.get('paymentId') ||
      searchParams.get('id') ||
      searchParams.get('transaction_id') ||
      searchParams.get('checkout_id') ||
      undefined;

    if (isPaymentSuccess && orderId) {
      // 1. Clear cart upon verified return
      useCartStore.getState().clearCart();

      // Update in-memory lastOrder to paid
      const curLast = useCartStore.getState().lastOrder;
      if (curLast && (!curLast.orderId || curLast.orderId === orderId)) {
        useCartStore.getState().setLastOrder({
          ...curLast,
          paymentStatus: 'paid',
          status: 'pending',
          paymentId: returnedPaymentId || curLast.paymentId,
          paymentsLkPaymentId: returnedPaymentId || curLast.paymentsLkPaymentId,
        });
      }

      // 2. Update status in Supabase if configured (client-side + server fallback)
      if (isSupabaseConfigured()) {
        const updatePayload: Record<string, any> = {
          payment_status: 'paid',
          status: 'pending',
        };
        if (returnedPaymentId) {
          updatePayload.admin_notes = `Paid via Payments.lk 3DS (Payment ID: ${returnedPaymentId})`;
        }

        supabase
          .from('orders')
          .update(updatePayload)
          .eq('order_code', orderId)
          .then(({ error }) => {
            if (error) {
              console.warn('[Payments.lk Return DB Update Warning]:', error);
            }
          });
      }

      // Server endpoint fallback to guarantee database update
      fetch('/api/confirm-card-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentId: returnedPaymentId }),
      }).catch((err) => console.warn('[Confirm Card Order API Notice]:', err));

      // 3. Update payment status in local Admin store if present
      useAdminStore.getState().updateOrderPaymentStatus(orderId, 'paid', returnedPaymentId);
    }
  }, [location.search, orderId]);

  // Multi-tier order lookup: lastOrder -> authOrders -> adminOrders -> dbOrder
  const order = useMemo(() => {
    if (lastOrder && (!orderId || lastOrder.orderId === orderId)) {
      return lastOrder;
    }
    const foundAuth = authOrders.find((o) => o.orderId === orderId);
    if (foundAuth) return foundAuth;

    const foundAdmin = adminOrders.find((o) => o.orderId === orderId);
    if (foundAdmin) {
      return {
        orderId: foundAdmin.orderId,
        items: (foundAdmin.items || []).map((it: any, idx: number) => ({
          id: it.id || idx,
          name: it.name,
          price: it.price,
          image: it.image,
          quantity: it.quantity,
          size: it.size,
          tailoring: it.tailoring,
        })),
        subtotal: foundAdmin.subtotal,
        discount: foundAdmin.discount,
        shipping: foundAdmin.shipping,
        total: foundAdmin.total,
        customer: {
          fullName: foundAdmin.customer?.fullName || 'Valued Patron',
          email: foundAdmin.customer?.email || 'customer@azhaiclothing.lk',
          phone: foundAdmin.customer?.phone || '',
          address: foundAdmin.customer?.address || '',
          city: foundAdmin.customer?.city || '',
          district: foundAdmin.customer?.district || 'Colombo',
          postalCode: foundAdmin.customer?.postalCode || '',
        },
        deliveryMethod: foundAdmin.deliveryMethod || 'Standard Courier',
        paymentMethod: foundAdmin.paymentMethod || 'Confirmed Order',
        placedAt: foundAdmin.placedAt || new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        paymentStatus: foundAdmin.paymentStatus,
        bankTransferDetails: foundAdmin.bankTransferDetails,
      };
    }

    if (dbOrder) {
      return dbOrder;
    }

    // Demo/Audit mode preview for test routes (e.g. /order-success/test)
    if (orderId === 'test' || orderId === 'preview') {
      return {
        orderId: 'AZ-TEST-8840',
        items: [
          {
            id: 901,
            name: 'Lotus Embroidered Anarkali Set — Deep Burgundy',
            price: 'LKR 14,500',
            image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800',
            quantity: 1,
            size: 'M',
          },
          {
            id: 902,
            name: 'Custom Bespoke Kurti — Pure Tussar Silk',
            price: 'LKR 8,200',
            image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800',
            quantity: 1,
            size: 'Custom Fit',
            tailoring: {
              collectionName: 'Kurties',
              dressTypeName: 'A-Line Kurti with Slits',
              fabricName: 'Pure Handloom Silk Scarlet',
              fabricPrice: 4700,
              stitchingFee: 3500,
              sizeLabel: 'Custom',
              leadTime: '4-6 working days',
              measurements: {
                bust: 36,
                waist: 30,
                hip: 38,
                length: 44,
                shoulderWidth: 14.5,
                sleeveLength: 17
              }
            }
          }
        ],
        subtotal: 22700,
        discount: 1000,
        shipping: 0,
        total: 21700,
        customer: {
          fullName: 'Ananya Senanayake',
          email: 'ananya.senanayake@example.lk',
          phone: '077 123 4567',
          address: 'No. 42, Flower Road',
          city: 'Colombo 07',
          district: 'Colombo',
          postalCode: '00700',
        },
        deliveryMethod: 'Sri Lanka Post (Speed Post Courier)',
        paymentMethod: 'Direct Bank Transfer',
        placedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        paymentStatus: 'pending_bank',
        bankTransferDetails: {
          bankName: 'Commercial Bank of Ceylon',
          accountName: 'Azhai Clothing (Pvt) Ltd',
          accountNumber: '8009234567',
          branchName: 'Colombo 07 Boutique Branch',
          bankLogo: undefined,
          swiftCode: 'CCEYLKLY',
          customInstructions: 'Please state Order ID AZ-TEST-8840 as deposit reference.',
        },
        status: 'pending',
      };
    }

    return lastOrder || null;
  }, [orderId, lastOrder, authOrders, adminOrders, dbOrder]);

  // Trigger Brevo receipt and admin alert for verified Payments.lk card returns
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isPaymentSuccess = searchParams.get('payments_lk') === 'success';

    if (!isPaymentSuccess || !orderId || !order || !order.customer?.email) return;

    const dispatchKey = `azhai_card_email_dispatched_${orderId}`;
    if (sessionStorage.getItem(dispatchKey)) return;
    sessionStorage.setItem(dispatchKey, 'true');

    try {
      const emailHtml = buildOrderConfirmationHtml({
        orderId: order.orderId,
        customerName: order.customer.fullName || 'Valued Patron',
        total: order.total,
        items: (order.items || []).map((i: any) => ({
          name: i.name,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
          image: i.image,
          tailoring: i.tailoring,
        })),
        deliveryMethod: order.deliveryMethod || 'Sri Lanka Post',
        paymentMethod: order.paymentMethod || 'Online Card & LankaQR (Payments.lk)',
      });

      createOrUpdateBrevoContact({
        email: order.customer.email,
        name: order.customer.fullName || 'Valued Patron',
        attributes: {
          CITY: order.customer.city || '',
          DISTRICT: order.customer.district || '',
          SMS: order.customer.phone || '',
          LAST_ORDER_ID: order.orderId,
        },
        listIds: [BREVO_LISTS.CUSTOMERS],
      }).catch((err) => console.error('[Brevo Contact Sync Error]:', err));

      sendBrevoEmail({
        to: [{ email: order.customer.email, name: order.customer.fullName || 'Valued Patron' }],
        subject: `✨ Order Received #${order.orderId} — Azhai Boutique by Preethi`,
        htmlContent: emailHtml,
      }).catch((err) => console.error('[Brevo Card Confirmation Email Error]:', err));

      const adminEmail = import.meta.env.VITE_ADMIN_NOTIFICATION_EMAIL || 'orders@azhaiclothing.lk';
      const adminHtml = buildAdminOrderAlertHtml({
        orderId: order.orderId,
        customerName: order.customer.fullName || 'Valued Patron',
        customerEmail: order.customer.email,
        customerPhone: order.customer.phone || '',
        customerAddress: order.customer.address || '',
        city: order.customer.city || '',
        district: order.customer.district || '',
        total: order.total,
        items: (order.items || []).map((i: any) => ({
          name: i.name,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
          image: i.image,
          tailoring: i.tailoring,
        })),
        deliveryMethod: order.deliveryMethod || 'Sri Lanka Post',
        paymentMethod: order.paymentMethod || 'Online Card & LankaQR (Payments.lk)',
      });

      sendBrevoEmail({
        to: [{ email: adminEmail, name: 'Azhai Store Owner' }],
        subject: `🛍️ Paid Card Order Received #${order.orderId} (LKR ${order.total.toLocaleString()})`,
        htmlContent: adminHtml,
      }).catch((err) => console.error('[Brevo Card Admin Alert Error]:', err));

      if (isSupabaseConfigured() && order.customer.email) {
        supabase
          .from('abandoned_carts')
          .delete()
          .eq('customer_email', order.customer.email.toLowerCase().trim())
          .then();
      }
    } catch (err) {
      console.error('[Card Payment Confirmation Email Exception]:', err);
    }
  }, [location.search, orderId, order]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] pt-32 sm:pt-36 xl:pt-40 pb-32 sm:pb-24 text-[#110B0E]">
        <SEOHead title="Order Status" noindex={true} />
        <div className="max-w-xl mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-[#110B0E]">Order Reference #{orderId || 'Not Found'}</h1>
            <p className="text-xs text-[#6D6268] leading-relaxed">
              We could not find active receipt details for this order code in your current browser session. If you placed this order recently, our atelier has already received your order record.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to={isAuthenticated ? "/account?tab=orders" : "/collections"}
              className="px-6 py-3 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl"
            >
              {isAuthenticated ? 'View My Orders' : 'Explore Collections'}
            </Link>
            <a
              href={`https://wa.me/${activeWhatsAppDigits}?text=${encodeURIComponent(`Hi Preethi, I placed an order (#${orderId || ''}) and would like to verify dispatch status.`)}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-white hover:bg-gray-50 border border-[#C5A059]/40 text-[#110B0E] text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center gap-1.5"
            >
              <span>Ask Concierge ({activeWhatsApp})</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-32 sm:pt-36 xl:pt-40 pb-32 sm:pb-24 text-[#110B0E]">
      <SEOHead title="Order Confirmed" noindex={true} />
      <div className="max-w-3xl mx-auto px-4 sm:px-8">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-[2.5rem] bg-white border border-[#C5A059]/40 shadow-2xl p-6 sm:p-12 text-center space-y-8"
        >
          {/* Top Celebration / Status Badge */}
          {(() => {
            const searchParams = new URLSearchParams(location.search);
            const isPaymentSuccess = searchParams.get('payments_lk') === 'success';
            const isPaymentFailed = 
              searchParams.get('payments_lk') === 'failed' || 
              searchParams.get('payments_lk') === 'cancelled' || 
              searchParams.get('status') === 'cancelled';
            const isCardOrder = Boolean(order.paymentMethod && order.paymentMethod.toLowerCase().includes('card'));
            const isCardPending = isCardOrder && order.paymentStatus === 'pending_card' && !isPaymentSuccess;

            if (isPaymentFailed || isCardPending) {
              return (
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
                    <AlertCircle className="w-10 h-10 text-amber-600" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.25em] font-bold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Payment Incomplete / Cancelled</span>
                  </span>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">
                    Payment Was Not Completed
                  </h1>
                  <p className="text-sm text-[#6D6268] max-w-md mx-auto font-light leading-relaxed">
                    Your card payment session for order <strong className="text-[#701626] font-bold">#{order.orderId}</strong> was not completed or was cancelled. Your selected creations are temporarily held. You can complete your order using another method or retry your card.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link
                      to={`/checkout?status=cancelled&order_id=${order.orderId}`}
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Payment at Checkout</span>
                    </Link>
                    <a
                      href={`https://wa.me/${activeWhatsAppDigits}?text=${encodeURIComponent(`Hi Preethi, I tried placing card order #${order.orderId} but the payment was not completed. Could you assist me with completing this order?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Concierge</span>
                    </a>
                  </div>
                </div>
              );
            }

            const isBankTransfer = 
              order.paymentStatus === 'pending_bank' ||
              (order.paymentMethod && order.paymentMethod.toLowerCase().includes('bank')) ||
              Boolean(order.bankTransferDetails);

            const activeSlipUrl = localSlipUrl || order.bankTransferDetails?.slipUrl;

            if (isBankTransfer) {
              return (
                <div className="space-y-3">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm ${
                    activeSlipUrl ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
                  }`}>
                    {activeSlipUrl ? (
                      <FileCheck className="w-10 h-10 text-emerald-600" />
                    ) : (
                      <Building2 className="w-10 h-10 text-[#701626]" />
                    )}
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.25em] font-bold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 ${
                    activeSlipUrl 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-50 text-amber-900 border border-amber-300'
                  }`}>
                    {activeSlipUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Slip Submitted · Verification in Progress</span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Order Reserved · Awaiting Bank Deposit</span>
                      </>
                    )}
                  </span>
                  <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#110B0E]">
                    Thank You, {order.customer.fullName.split(' ')[0]}!
                  </h1>
                  <p className="text-sm text-[#6D6268] max-w-md mx-auto font-light leading-relaxed">
                    Your order <strong className="text-[#701626] font-bold">#{order.orderId}</strong> is reserved.
                    {activeSlipUrl 
                      ? ' We have received your payment slip and our atelier team is verifying your deposit.'
                      : ' Please complete the bank transfer using the account details below and submit your deposit slip.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold bg-[#701626]/8 border border-[#C5A059]/30 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Order Received · Under Atelier Review</span>
                </span>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#110B0E]">
                  Thank You, {order.customer.fullName.split(' ')[0]}!
                </h1>
                <p className="text-sm text-[#6D6268] max-w-md mx-auto font-light leading-relaxed">
                  Your order <strong className="text-[#701626] font-bold">#{order.orderId}</strong> has been received by our Colombo atelier. Our team will verify your details and officially confirm your order shortly.
                </p>
              </div>
            );
          })()}

          {/* Email Confirmation Alert Banner */}
          {(() => {
            const searchParams = new URLSearchParams(location.search);
            const isPaymentSuccess = searchParams.get('payments_lk') === 'success';
            const isPaymentFailed = 
              searchParams.get('payments_lk') === 'failed' || 
              searchParams.get('payments_lk') === 'cancelled' || 
              searchParams.get('status') === 'cancelled';
            const isCardOrder = Boolean(order.paymentMethod && order.paymentMethod.toLowerCase().includes('card'));
            const isCardPending = isCardOrder && order.paymentStatus === 'pending_card' && !isPaymentSuccess;

            if (isPaymentFailed || isCardPending) return null;

            return (
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
                    <span>Order Receipt Dispatched to Email</span>
                    <Sparkles className="w-3 h-3 text-[#C5A059]" />
                  </p>
                  <p className="text-[11px] text-[#6D6268] truncate">
                    We sent your initial receipt and order details to <strong className="text-[#701626]">{order.customer.email}</strong>.
                  </p>
                </div>
              </motion.div>
            );
          })()}

          {/* Dedicated Direct Bank Transfer Deposit Instructions & Slip Upload */}
          {(() => {
            const isBankTransfer = 
              order.paymentStatus === 'pending_bank' ||
              (order.paymentMethod && order.paymentMethod.toLowerCase().includes('bank')) ||
              Boolean(order.bankTransferDetails);

            if (!isBankTransfer) return null;

            const bank: any = order.bankTransferDetails || 
              settings?.bankAccounts?.find(b => b.isActive) || 
              settings?.bankAccounts?.[0] || {
                bankName: 'Commercial Bank of Ceylon',
                accountName: 'Azhai Clothing (Pvt) Ltd',
                accountNumber: '8009234567',
                branchName: 'Colombo 07 Boutique Branch',
                bankLogo: undefined,
                swiftCode: 'CCEYLKLY',
                customInstructions: 'Please state Order ID as the deposit reference.',
              };

            const activeSlipUrl = localSlipUrl || order.bankTransferDetails?.slipUrl;

            const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (!file) return;

              setIsUploadingSlip(true);
              setSlipUploadError(null);

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
                    uploadedUrl = await new Promise<string>((resolve) => {
                      const r = new FileReader();
                      r.onload = () => resolve(r.result as string);
                      r.readAsDataURL(webpFile);
                    });
                  }
                } else if (file.type === 'application/pdf') {
                  if (isSupabaseConfigured()) {
                    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const fileName = `order-slips/${order.orderId}-${Date.now()}-${safeName}`;
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
                    throw new Error('PDF upload requires cloud storage connection. Please send your deposit slip via WhatsApp.');
                  }
                } else {
                  throw new Error('Unsupported file type. Please upload a JPG, PNG, or PDF deposit slip.');
                }

                setLocalSlipUrl(uploadedUrl);
                useAdminStore.getState().uploadOrderBankSlip(order.orderId, uploadedUrl, referenceInput.trim());

                if (dbOrder && dbOrder.orderId === order.orderId) {
                  setDbOrder((prev: any) => ({
                    ...prev,
                    bankTransferDetails: {
                      ...(prev?.bankTransferDetails || {}),
                      slipUrl: uploadedUrl,
                      referenceNumber: referenceInput.trim() || prev?.bankTransferDetails?.referenceNumber,
                      submittedAt: new Date().toISOString(),
                    },
                  }));
                }

                if (lastOrder && lastOrder.orderId === order.orderId) {
                  useCartStore.getState().setLastOrder({
                    ...lastOrder,
                    bankTransferDetails: {
                      ...(lastOrder.bankTransferDetails as any),
                      slipUrl: uploadedUrl,
                      referenceNumber: referenceInput.trim() || lastOrder.bankTransferDetails?.referenceNumber,
                      submittedAt: new Date().toISOString(),
                    },
                  });
                }

                // Disptach Bank Slip Email Notifications (Customer Receipt + Admin Alert)
                const targetCustomerEmail = order.customer?.email;
                const targetCustomerName = order.customer?.fullName || 'Valued Patron';
                const targetBankName = bank?.bankName || order.bankTransferDetails?.bankName || 'Commercial Bank of Ceylon';
                const targetRef = referenceInput.trim() || order.bankTransferDetails?.referenceNumber;

                // 1. Send Customer Receipt
                if (targetCustomerEmail) {
                  sendBrevoEmail({
                    to: [{ email: targetCustomerEmail, name: targetCustomerName }],
                    subject: `🧾 Deposit Slip Received: Order #${order.orderId} — Azhai Boutique`,
                    htmlContent: buildBankSlipReceivedCustomerHtml({
                      orderId: order.orderId,
                      customerName: targetCustomerName,
                      total: order.total,
                      bankName: targetBankName,
                      referenceNumber: targetRef,
                      slipUrl: uploadedUrl,
                    }),
                  }).catch((e) => console.warn('[Brevo Slip Customer Receipt Error]:', e));
                }

                // 2. Send Admin Alert to Atelier Operations
                sendBrevoEmail({
                  to: [{ email: 'orders@azhaiclothing.lk', name: 'Azhai Atelier Operations' }],
                  subject: `🔔 [Action Required] Bank Slip Uploaded: Order #${order.orderId}`,
                  htmlContent: buildBankSlipAdminAlertHtml({
                    orderId: order.orderId,
                    customerName: targetCustomerName,
                    customerEmail: targetCustomerEmail || 'Not provided',
                    customerPhone: order.customer?.phone,
                    total: order.total,
                    bankName: targetBankName,
                    referenceNumber: targetRef,
                    slipUrl: uploadedUrl,
                  }),
                }).catch((e) => console.warn('[Brevo Slip Admin Alert Error]:', e));

              } catch (err: any) {
                console.error('[Slip Upload Error]:', err);
                setSlipUploadError('Failed to process slip image. Please try again or send via WhatsApp.');
              } finally {
                setIsUploadingSlip(false);
              }
            };

            const waMsg = encodeURIComponent(
              `Hello Preethi! I placed Order #${order.orderId} (LKR ${order.total.toLocaleString('en-US')}) via Direct Bank Transfer to ${bank.bankName}. Here is my transfer deposit slip:`
            );

            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="p-5 sm:p-7 rounded-3xl bg-[#FCFBF8] border-2 border-[#DFBF77] text-left space-y-6 shadow-sm"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#C5A059]/20">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                      Payment Instructions
                    </span>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-[#110B0E] flex items-center gap-2 pt-0.5">
                      <Building2 className="w-5 h-5 text-[#701626]" />
                      <span>Direct Bank Deposit Details</span>
                    </h3>
                  </div>

                  <span className="self-start sm:self-auto text-xs px-3 py-1 rounded-full font-bold bg-[#701626]/10 text-[#701626] border border-[#701626]/20">
                    Amount: LKR {order.total.toLocaleString('en-US')}
                  </span>
                </div>

                {/* Bank Coordinates Grid */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#C5A059]/30 space-y-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <BankBadge bankName={bank.bankName} logoUrl={bank.bankLogo} size="md" />
                      <div>
                        <p className="font-display text-sm sm:text-base font-bold text-[#110B0E]">{bank.bankName}</p>
                        {bank.branchName && (
                          <p className="text-[11px] text-[#6D6268]">Branch: {bank.branchName}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-[#C5A059]/20">
                    <div>
                      <span className="text-[10px] text-[#6D6268] uppercase font-bold tracking-wider">Account Holder</span>
                      <p className="font-bold text-[#110B0E] pt-0.5">{bank.accountName}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#6D6268] uppercase font-bold tracking-wider">Account Number</span>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="font-mono text-sm font-bold text-[#701626] tracking-wide">{bank.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(bank.accountNumber, 'acc')}
                          className="px-2 py-0.5 rounded-md bg-[#F7F4EE] hover:bg-[#DFBF77]/30 text-[#701626] text-[10px] font-bold border border-[#C5A059]/30 inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedField === 'acc' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {bank.swiftCode && (
                      <div>
                        <span className="text-[10px] text-[#6D6268] uppercase font-bold tracking-wider">SWIFT Code</span>
                        <p className="font-mono font-bold text-[#110B0E] pt-0.5">{bank.swiftCode}</p>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] text-[#6D6268] uppercase font-bold tracking-wider">Transfer Reference</span>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="font-mono text-sm font-bold text-[#110B0E]">#{order.orderId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.orderId, 'ref')}
                          className="px-2 py-0.5 rounded-md bg-[#F7F4EE] hover:bg-[#DFBF77]/30 text-[#701626] text-[10px] font-bold border border-[#C5A059]/30 inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedField === 'ref' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {(bank.customInstructions || bank.instructions) && (
                    <div className="p-3 rounded-xl bg-[#F7F4EE]/80 border border-[#C5A059]/30 text-[11px] text-[#6D6268] italic">
                      ℹ️ {bank.customInstructions || bank.instructions}
                    </div>
                  )}
                </div>

                {/* Slip Submission Actions */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#110B0E] flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-[#701626]" />
                      <span>Submit Your Bank Deposit Slip</span>
                    </h4>
                    {activeSlipUrl && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Attached
                      </span>
                    )}
                  </div>

                  {activeSlipUrl ? (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative group cursor-pointer" onClick={() => setPreviewModalUrl(activeSlipUrl)}>
                          <img
                            src={activeSlipUrl}
                            alt="Deposit Slip"
                            className="w-16 h-16 object-cover rounded-xl border border-emerald-300 shadow-xs"
                          />
                          <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                            <span>Payment Slip Uploaded</span>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          </p>
                          <p className="text-[11px] text-emerald-700 font-light">
                            Our team is verifying the transaction against bank records.
                          </p>
                          <button
                            type="button"
                            onClick={() => setPreviewModalUrl(activeSlipUrl)}
                            className="text-[11px] font-bold text-[#701626] underline pt-0.5 hover:text-[#8E1E34]"
                          >
                            View Full Slip
                          </button>
                        </div>
                      </div>

                      <label className="px-4 py-2 bg-white hover:bg-gray-50 text-[#110B0E] text-xs font-bold rounded-xl border border-gray-300 cursor-pointer transition-colors shrink-0 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-[#6D6268]" />
                        <span>Replace Slip</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={isUploadingSlip}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-[#6D6268] mb-1">
                            Bank Reference / Transaction ID (Optional)
                          </label>
                          <input
                            type="text"
                            value={referenceInput}
                            onChange={(e) => setReferenceInput(e.target.value)}
                            placeholder="e.g. TXN-948291 / Cheque #"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-[#110B0E] placeholder:text-gray-400 focus:outline-none focus:border-[#701626]"
                          />
                        </div>

                        <div className="flex items-end">
                          <label className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-all flex items-center justify-center gap-2 ${
                            isUploadingSlip
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-[#701626] hover:bg-[#8E1E34] text-white shadow-sm'
                          }`}>
                            <Upload className="w-4 h-4" />
                            <span>{isUploadingSlip ? 'Compressing...' : 'Upload Slip'}</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleFileSelect}
                              disabled={isUploadingSlip}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {slipUploadError && (
                        <p className="text-xs text-rose-600 font-medium">{slipUploadError}</p>
                      )}

                      <p className="text-[11px] text-[#6D6268] italic">
                        Supports photo, screenshot, or PDF receipts (compressed automatically for fast mobile delivery).
                      </p>
                    </div>
                  )}

                  {/* 1-Click WhatsApp Instant Submission */}
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${activeWhatsAppDigits}?text=${waMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send Deposit Slip via WhatsApp ({activeWhatsApp})</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })()}

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
              <span className="text-[10px] uppercase tracking-wider text-[#6D6268] font-bold">Payment Status</span>
              <p className="font-bold text-[#701626]">
                {order.paymentStatus === 'paid' 
                  ? 'Paid in Full' 
                  : order.paymentStatus === 'pending_bank'
                  ? 'Awaiting Bank Transfer Verification'
                  : order.paymentMethod}
              </p>
            </div>
          </div>

          {/* Itemized Order Receipt */}
          <div className="text-left space-y-4 pt-4 border-t border-[#C5A059]/20">
            <h3 className="font-display text-xl font-bold text-[#110B0E]">Order Receipt Details</h3>
            
            {order.items.length > 0 && (
              <div className="divide-y divide-[#C5A059]/20">
                {order.items.map((item: any, idx: number) => (
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

        {/* Slip Full View Modal */}
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
    </div>
  );
}
