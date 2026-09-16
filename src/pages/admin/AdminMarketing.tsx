import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, 
  Plus, 
  Sparkles, 
  Megaphone, 
  Percent, 
  Check, 
  Trash2, 
  Calendar, 
  Save, 
  ShoppingCart,
  Mail,
  Send,
  Eye,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStore, type Coupon } from '@/store/admin';
import CouponModal from '@/components/admin/CouponModal';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  sendBrevoEmail, 
  buildAbandonedCartEmailHtml,
  buildWelcomeEmailHtml,
  buildOrderConfirmationHtml,
  buildOrderShippedHtml,
  buildOrderDeliveredHtml,
  buildPostDeliveryFeedbackEmailHtml,
  buildBankPaymentVerifiedHtml,
  buildTailoringReadyEmailHtml,
  buildConciergePaymentLinkEmailHtml,
  buildBankSlipReceivedCustomerHtml,
  buildCustomerInquiryConfirmationHtml,
} from '@/lib/brevo';

interface AbandonedCart {
  id: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; size: string; price: string; image: string }[];
  totalValue: number;
  abandonedAt: string;
  emailSent: boolean;
}

const SAMPLE_ABANDONED_CARTS: AbandonedCart[] = [
  {
    id: 'cart-1',
    customerName: 'Ananya S.',
    customerEmail: 'ananya.desilva@gmail.com',
    items: [
      { name: 'Sacred Crimson Kanjivaram Silk Saree', size: 'Standard (6.25m)', price: 'LKR 48,500', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80' },
      { name: 'Gold Bullion Latkan Tassels Add-on', size: 'Pair', price: 'LKR 2,400', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80' },
    ],
    totalValue: 50900,
    abandonedAt: '2 hours ago',
    emailSent: false,
  },
  {
    id: 'cart-2',
    customerName: 'Dilhani P.',
    customerEmail: 'dilhani.perera@yahoo.com',
    items: [
      { name: 'Ivory Lotus Handloom Kurta & Shawl Set', size: 'M', price: 'LKR 32,000', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80' },
    ],
    totalValue: 32000,
    abandonedAt: '6 hours ago',
    emailSent: true,
  },
  {
    id: 'cart-3',
    customerName: 'Menaka J.',
    customerEmail: 'menaka.j@outlook.com',
    items: [
      { name: 'Peacock Emerald Banarasi Brocade Saree', size: 'Standard (6.25m)', price: 'LKR 54,000', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80' },
    ],
    totalValue: 54000,
    abandonedAt: '1 day ago',
    emailSent: false,
  }
];

export default function AdminMarketing() {
  const { coupons, addCoupon, toggleCoupon, deleteCoupon, settings, updateSettings } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'coupons' | 'abandoned' | 'templates'>('coupons');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [tickerText, setTickerText] = useState(settings.announcementTicker.text);
  const [tickerEnabled, setTickerEnabled] = useState(settings.announcementTicker.enabled);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Abandoned Carts State
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>(SAMPLE_ABANDONED_CARTS);
  const [sendingCartId, setSendingCartId] = useState<string | null>(null);

  // Test Email State
  const [testEmailAddress, setTestEmailAddress] = useState('yagesh.xtreme@gmail.com');
  const [sendingTestType, setSendingTestType] = useState<string | null>(null);

  // Sync live abandoned carts from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let isMounted = true;

    async function fetchAbandoned() {
      try {
        const { data, error } = await supabase
          .from('abandoned_carts')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) {
          console.warn('[Supabase Abandoned Carts Warning]:', error.message);
          return;
        }

        if (isMounted && data && data.length > 0) {
          const mapped: AbandonedCart[] = data.map((d: any) => ({
            id: d.id,
            customerName: d.customer_name || 'Valued Patron',
            customerEmail: d.customer_email,
            items: (d.items || []).map((i: any) => ({
              name: i.name || 'Bespoke Garment',
              size: i.size || (i.tailoring ? 'Tailored' : 'Standard'),
              price: typeof i.price === 'number' ? `LKR ${i.price.toLocaleString('en-LK')}` : i.price,
              image: i.image || '',
            })),
            totalValue: Number(d.total_value) || 0,
            abandonedAt: d.updated_at
              ? new Date(d.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recently',
            emailSent: !!d.email_sent,
          }));
          setAbandonedCarts(mapped);
        }
      } catch (e) {
        console.warn('[Supabase Fetch Abandoned Carts Exception]:', e);
      }
    }

    fetchAbandoned();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handleSaveTicker = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      announcementTicker: {
        enabled: tickerEnabled,
        text: tickerText,
        link: settings.announcementTicker.link,
      },
    });
    showToast('Announcement banner saved & live!');
  };

  const handleSaveNewCoupon = (couponData: any) => {
    addCoupon(couponData);
    showToast('New coupon created successfully!');
  };

  // 1-Click Send Abandoned Cart Recovery Email
  const handleSendRecoveryEmail = async (cart: AbandonedCart) => {
    setSendingCartId(cart.id);
    await sendBrevoEmail({
      to: [{ email: cart.customerEmail, name: cart.customerName }],
      subject: `✨ Your Azhai bag is waiting for you (Enjoy 5% privilege)`,
      htmlContent: buildAbandonedCartEmailHtml({
        customerName: cart.customerName,
        items: cart.items,
        couponCode: 'ATELIER5',
      }),
    });
    
    setAbandonedCarts(prev => prev.map(c => c.id === cart.id ? { ...c, emailSent: true } : c));

    if (isSupabaseConfigured() && cart.id.length > 30) {
      supabase.from('abandoned_carts').update({ email_sent: true }).eq('id', cart.id).then();
    }

    setSendingCartId(null);
    showToast(`Recovery email dispatched to ${cart.customerEmail}!`);
  };

  // Send Test Email Template to Admin
  const handleSendTestEmail = async (type: string) => {
    if (!testEmailAddress) return;
    setSendingTestType(type);

    let html = '';
    let subject = '';

    if (type === 'welcome') {
      subject = '✨ [TEST] Welcome to Azhai Atelier';
      html = buildWelcomeEmailHtml({ customerName: 'Preethi', email: testEmailAddress });
    } else if (type === 'order') {
      subject = '✨ [TEST] Order Confirmed #AZH-84920';
      html = buildOrderConfirmationHtml({
        customerName: 'Preethi',
        orderId: 'AZH-84920',
        items: [
          { name: 'Maroon Corset Handloom Kurti Set', price: 'LKR 14,500', size: 'M', quantity: 1, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' }
        ],
        total: 14500,
        deliveryMethod: 'Sri Lanka Post Speed Post (Zone A)',
        paymentMethod: 'Payments.lk (Online Card & LankaQR)',
      });
    } else if (type === 'abandoned') {
      subject = '✨ [TEST] Your Azhai bag is waiting for you (Enjoy 5% privilege)';
      html = buildAbandonedCartEmailHtml({
        customerName: 'Preethi',
        items: [
          { name: 'Kanchipuram Silk Bridal Saree (Crimson & Gold)', price: 'LKR 48,000', size: 'Free Size', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' }
        ],
        couponCode: 'ATELIER5',
      });
    } else if (type === 'shipped') {
      subject = '🚚 [TEST] Your Azhai Ensemble is on the Way (#AZH-84920)';
      html = buildOrderShippedHtml({
        customerName: 'Preethi',
        orderId: 'AZH-84920',
        courierName: 'Sri Lanka Post Speed Post',
        trackingNumber: 'BA849201991LK',
        destinationCity: 'Colombo 07',
      });
    } else if (type === 'delivered') {
      subject = '✨ [TEST] Delivered: Azhai Atelier Order #AZH-84920';
      html = buildOrderDeliveredHtml({
        customerName: 'Preethi',
        orderId: 'AZH-84920',
      });
    } else if (type === 'feedback') {
      subject = '🌸 [TEST] How does your Azhai drape feel?';
      html = buildPostDeliveryFeedbackEmailHtml({
        customerName: 'Preethi',
        orderId: 'AZH-84920',
      });
    } else if (type === 'bank-slip') {
      subject = '🧾 [TEST] Deposit Slip Received: Order #AZH-84920';
      html = buildBankSlipReceivedCustomerHtml({
        orderId: 'AZH-84920',
        customerName: 'Preethi',
        total: 14500,
        bankName: 'Commercial Bank of Ceylon',
        referenceNumber: 'REF-COM-883910',
      });
    } else if (type === 'bank-cleared') {
      subject = '✨ [TEST] Payment Cleared: Order #AZH-84920';
      html = buildBankPaymentVerifiedHtml({
        orderId: 'AZH-84920',
        customerName: 'Preethi',
        total: 14500,
        items: [
          { name: 'Maroon Corset Handloom Kurti Set', price: 'LKR 14,500', size: 'M', quantity: 1 }
        ],
        deliveryMethod: 'Sri Lanka Post Speed Post',
        adminNotes: 'Verified via Commercial Bank Online Deposit Batch #441.',
      });
    } else if (type === 'tailoring-ready') {
      subject = '✂️ [TEST] Your Tailored Garment is Complete #AZH-84920';
      html = buildTailoringReadyEmailHtml({
        orderId: 'AZH-84920',
        customerName: 'Preethi',
        dressTypeName: 'Royal Anarkali Gown',
        fabricName: 'Pure Mulberry Raw Silk',
        sizeLabel: 'Custom Bespoke Fit',
        measurements: { Bust: 36, Waist: 30, Length: 52, Sleeve: 18 },
      });
    } else if (type === 'inquiry') {
      subject = '💌 [TEST] Inquiry Received: Bridal Silk Consultation';
      html = buildCustomerInquiryConfirmationHtml({
        customerName: 'Preethi',
        topic: 'Custom Bridal Saree & Sizing Consultation',
        messageSnippet: 'Inquiring about handloom weaving timelines for our November wedding ceremony in Jaffna.',
      });
    } else if (type === 'payment-link') {
      subject = '💳 [TEST] Invoice: Bespoke Atelier Tailoring Deposit';
      html = buildConciergePaymentLinkEmailHtml({
        customerName: 'Preethi',
        title: 'Bespoke Atelier Tailoring Deposit (Order #AZH-84920)',
        amount: 5000,
        paymentUrl: 'https://payments.lk/pay/azhai-sample-link',
        description: 'Advance deposit for custom handloom weaving and artisan tailoring.',
      });
    }

    await sendBrevoEmail({
      to: [{ email: testEmailAddress, name: 'Atelier Admin' }],
      subject,
      htmlContent: html,
    });

    setSendingTestType(null);
    showToast(`Test ${type} email sent to ${testEmailAddress}!`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                Marketing & Growth Automation
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#110B0E] pt-1">
              Promotions, Emails & Recovery
            </h1>
          </div>

          <div className="w-full sm:w-auto">
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="w-full sm:w-auto justify-center px-5 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Promo Coupon
            </button>
          </div>
        </div>

        {/* Global Toast */}
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-600" /> {savedToast}
          </motion.div>
        )}

        {/* ── 3 MARKETING TABS (HORIZONTALLY SCROLLABLE ON MOBILE) ── */}
        <div className="flex items-center gap-2 border-b border-[#C5A059]/30 pb-3 overflow-x-auto scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'bg-[#701626] text-white shadow-md'
                : 'bg-white text-[#6D6268] border border-[#C5A059]/20 hover:border-[#701626]'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Promo Coupons & Announcement ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('abandoned')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
              activeTab === 'abandoned'
                ? 'bg-[#701626] text-white shadow-md'
                : 'bg-white text-[#6D6268] border border-[#C5A059]/20 hover:border-[#701626]'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-[#C5A059]" />
            <span>Abandoned Carts ({abandonedCarts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
              activeTab === 'templates'
                ? 'bg-[#701626] text-white shadow-md'
                : 'bg-white text-[#6D6268] border border-[#C5A059]/20 hover:border-[#701626]'
            }`}
          >
            <Mail className="w-4 h-4 text-[#701626]" />
            <span>Email Templates Studio (11 Flows)</span>
          </button>
        </div>

        {/* TAB 1: COUPONS & BANNER */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            {/* ── LIVE STOREFRONT ANNOUNCEMENT TICKER MANAGER ── */}
            <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#701626]">
                  <Megaphone className="w-5 h-5" />
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#110B0E]">
                    Header Announcement Banner
                  </h3>
                </div>
              </div>
              <p className="text-xs text-[#6D6268] font-light">
                Controls the top promotional marquee message displayed across all storefront pages:
              </p>

              <form onSubmit={handleSaveTicker} className="space-y-4 pt-2">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-xs font-bold text-[#110B0E]">Banner Status:</label>
                  <button
                    type="button"
                    onClick={() => setTickerEnabled(!tickerEnabled)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tickerEnabled ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {tickerEnabled ? 'Active (Visible on Store)' : 'Disabled (Hidden)'}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Announcement Message
                  </label>
                  <input
                    type="text"
                    value={tickerText}
                    onChange={(e) => setTickerText(e.target.value)}
                    placeholder="✨ Festive Drop Live: Complimentary Island-wide Delivery on Orders over LKR 15,000..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Live Preview Box (Wraps Cleanly on Mobile) */}
                <div className="p-3.5 rounded-xl bg-[#701626] text-[#F3E8CE] text-xs font-medium border border-[#C5A059]/40 break-words leading-relaxed text-left sm:text-center">
                  <span className="text-[10px] uppercase tracking-wider text-[#DFBF77] font-bold block sm:inline sm:pr-2 mb-1 sm:mb-0">
                    Live Preview:
                  </span>
                  {tickerText}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="w-full sm:w-auto justify-center px-6 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Banner Updates
                  </button>
                </div>
              </form>
            </div>

            {/* ── PROMOTIONAL COUPONS TABLE ── */}
            <div className="bg-white rounded-3xl border border-[#C5A059]/30 shadow-sm overflow-hidden p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg sm:text-xl font-bold text-[#110B0E]">
                  Active Discount Coupons ({coupons.length})
                </h3>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#C5A059]/25 -mx-2 sm:mx-0">
                <table className="w-full text-xs text-left min-w-[650px]">
                  <thead className="bg-[#701626] text-[#F3E8CE] uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5 whitespace-nowrap min-w-[120px]">Coupon Code</th>
                      <th className="p-3.5 whitespace-nowrap min-w-[140px]">Discount Benefit</th>
                      <th className="p-3.5 whitespace-nowrap min-w-[100px]">Min Spend</th>
                      <th className="p-3.5 whitespace-nowrap min-w-[100px]">Usage Count</th>
                      <th className="p-3.5 whitespace-nowrap min-w-[100px]">Expiry Date</th>
                      <th className="p-3.5 whitespace-nowrap min-w-[90px]">Status</th>
                      <th className="p-3.5 text-right whitespace-nowrap min-w-[80px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C5A059]/15">
                    {coupons.map((c, idx) => (
                      <tr key={c.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FCFBF8]'}>
                        <td className="p-3.5 font-bold text-[#701626] font-mono text-sm tracking-wider whitespace-nowrap">
                          {c.code}
                        </td>
                        <td className="p-3.5 font-bold text-[#110B0E] whitespace-nowrap">
                          {c.discountType === 'percentage' ? `${c.value}% Off Cart` : `LKR ${c.value.toLocaleString()} Flat Off`}
                        </td>
                        <td className="p-3.5 text-[#6D6268] whitespace-nowrap">
                          {c.minSpend ? `LKR ${c.minSpend.toLocaleString()}` : 'No Minimum'}
                        </td>
                        <td className="p-3.5 font-bold text-[#110B0E] whitespace-nowrap">
                          {c.usageCount} redemptions
                        </td>
                        <td className="p-3.5 text-[#6D6268] whitespace-nowrap">
                          {c.expiresAt || 'Never'}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <button
                            onClick={() => toggleCoupon(c.id)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap inline-block cursor-pointer transition-colors ${
                              c.isActive
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            {c.isActive ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => deleteCoupon(c.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ABANDONED CART RECOVERY */}
        {activeTab === 'abandoned' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#110B0E] flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#701626]" />
                    <span>Unrecovered Bags & Direct Outreach ({abandonedCarts.length})</span>
                  </h3>
                  <p className="text-xs text-[#6D6268] font-light">
                    Shoppers who left handcrafted items in their bag without completing payment.
                  </p>
                </div>
                <div className="text-xs bg-[#701626]/10 text-[#701626] font-bold px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  Total Value: LKR {abandonedCarts.reduce((acc, c) => acc + c.totalValue, 0).toLocaleString()}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {abandonedCarts.map((cart) => (
                  <div
                    key={cart.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#FCFBF8] border border-[#DFBF77] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[#110B0E]">{cart.customerName}</span>
                        <span className="text-xs text-[#6D6268] break-all">({cart.customerEmail})</span>
                        <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {cart.abandonedAt}
                        </span>
                      </div>

                      {/* Items Preview */}
                      <div className="flex flex-wrap items-center gap-2">
                        {cart.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-[#C5A059]/30 text-xs">
                            <img src={it.image} alt="" className="w-6 h-6 object-cover rounded-md shrink-0" />
                            <span className="font-medium text-[#110B0E] truncate max-w-[150px] sm:max-w-[220px]">{it.name}</span>
                            <span className="text-[#701626] font-bold shrink-0">{it.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t border-[#C5A059]/20 lg:border-t-0 shrink-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] uppercase text-[#6D6268] font-bold">Cart Total</p>
                        <p className="font-display text-base font-bold text-[#701626]">
                          LKR {cart.totalValue.toLocaleString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={sendingCartId === cart.id || cart.emailSent}
                        onClick={() => handleSendRecoveryEmail(cart)}
                        className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          cart.emailSent
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                            : 'bg-[#701626] hover:bg-[#8E1E34] text-white shadow-sm'
                        }`}
                      >
                        {sendingCartId === cart.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : cart.emailSent ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Email Dispatched</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Recovery Email (5% Off)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EMAIL TEMPLATES & TEST-SEND STUDIO */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-6">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-[#110B0E] flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#701626]" />
                  <span>Transactional & Lifecycle Email Templates (11 Active Flows)</span>
                </h3>
                <p className="text-xs text-[#6D6268] font-light">
                  Preview and test-send all handcrafted luxury HTML templates directly to your inbox.
                </p>
              </div>

              {/* Brevo API Key Status Banner */}
              {!(typeof import.meta !== 'undefined' && import.meta.env?.VITE_BREVO_API_KEY) ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <span>⚠️ Brevo Email API Key Not Configured (Simulation Mode)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800/90">
                    Emails are currently simulated in the browser console. To deliver live emails to real Gmail/Yahoo inboxes, add your Brevo API key to your <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[10px]">.env</code> file:
                  </p>
                  <pre className="p-2.5 bg-amber-900/10 rounded-xl font-mono text-[10px] text-amber-950 overflow-x-auto">
                    VITE_BREVO_API_KEY=xkeysib-your_brevo_v3_api_key<br/>
                    VITE_SENDER_EMAIL=orders@azhaiclothing.lk
                  </pre>
                  <p className="text-[10px] text-amber-700">
                    💡 Get a free API key at <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener noreferrer" className="underline font-bold">Brevo.com &rarr; SMTP & API Keys</a>.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-bold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Brevo Email Engine Connected & Live ({import.meta.env.VITE_SENDER_EMAIL || 'orders@azhaiclothing.lk'})</span>
                </div>
              )}

              {/* Test Sender Bar */}
              <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#DFBF77] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 w-full sm:w-auto">
                  <span className="text-[10px] font-bold text-[#701626] uppercase tracking-wider block">Test Recipient Address:</span>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="admin@azhai.lk"
                    className="w-full sm:w-72 px-3 py-2 text-xs bg-white rounded-xl border border-[#C5A059]/40 font-semibold text-[#110B0E]"
                  />
                </div>
                <p className="text-[11px] text-[#6D6268]">
                  Click any "Test Send" button below to dispatch a live sample to this email.
                </p>
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    type: 'order',
                    title: '1. Order Confirmation & Invoice',
                    desc: 'Sent upon checkout with full itemized table, custom tailoring specs, and courier estimate.',
                    tag: 'Purchase',
                    previewUrl: '/email-previews/order-confirmation.html'
                  },
                  {
                    type: 'abandoned',
                    title: '2. Abandoned Bag Recovery',
                    desc: 'Reminds shoppers of left items with a 1-click cart restore & 5% coupon (ATELIER5).',
                    tag: 'Conversion',
                    previewUrl: '/email-previews/abandoned-cart.html'
                  },
                  {
                    type: 'shipped',
                    title: '3. Dispatched & In Transit',
                    desc: 'Sent when admin inputs Sri Lanka Post Speed Post tracking number (BAxxxxxxxxxLK).',
                    tag: 'Fulfillment',
                    previewUrl: '/email-previews/order-shipped.html'
                  },
                  {
                    type: 'welcome',
                    title: '4. Welcome to Azhai Atelier',
                    desc: 'Sent immediately upon account creation. Welcomes customer with heritage privileges.',
                    tag: 'Onboarding',
                    previewUrl: '/email-previews/welcome-atelier.html'
                  },
                  {
                    type: 'feedback',
                    title: '5. Fit & Craftsmanship Review',
                    desc: 'Requests 5-star rating and custom fit feedback after package arrival.',
                    tag: 'Retention',
                    previewUrl: '/email-previews/fit-review.html'
                  },
                  {
                    type: 'bank-slip',
                    title: '6. Bank Slip Upload Receipt',
                    desc: 'Sent immediately to patron when they submit a bank transfer receipt or deposit slip.',
                    tag: 'Payment',
                    previewUrl: '#'
                  },
                  {
                    type: 'bank-cleared',
                    title: '7. Bank Payment Cleared Receipt',
                    desc: 'Dispatched when admin verifies the bank deposit and marks the order confirmed/paid.',
                    tag: 'Finance',
                    previewUrl: '#'
                  },
                  {
                    type: 'tailoring-ready',
                    title: '8. Bespoke Tailoring Ready Notice',
                    desc: 'Sent when artisan tailor finishes stitching, pressing, and measuring inspection.',
                    tag: 'Atelier',
                    previewUrl: '#'
                  },
                  {
                    type: 'inquiry',
                    title: '9. Customer Inquiry Auto-Responder',
                    desc: 'Instant reassurance email confirming their concierge inquiry was received.',
                    tag: 'Support',
                    previewUrl: '#'
                  },
                  {
                    type: 'payment-link',
                    title: '10. Direct 3DS Payment Link Invoice',
                    desc: 'Dispatched to customer email with title, amount, and 1-click Payments.lk checkout link.',
                    tag: 'Invoice',
                    previewUrl: '#'
                  }
                ].map((tmpl) => (
                  <div
                    key={tmpl.type}
                    className="p-4 sm:p-5 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/30 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-sm font-bold text-[#110B0E]">{tmpl.title}</h4>
                        <span className="text-[9px] uppercase font-bold text-[#701626] bg-[#701626]/8 px-2 py-0.5 rounded-full border border-[#C5A059]/30">
                          {tmpl.tag}
                        </span>
                      </div>
                      <p className="text-xs text-[#6D6268] leading-relaxed font-light">{tmpl.desc}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-[#C5A059]/20">
                      <a
                        href={tmpl.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#701626] font-bold hover:underline flex items-center gap-1 justify-center sm:justify-start"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Preview ↗</span>
                      </a>

                      <button
                        type="button"
                        disabled={sendingTestType === tmpl.type}
                        onClick={() => handleSendTestEmail(tmpl.type)}
                        className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-[#701626] hover:bg-[#8E1E34] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        {sendingTestType === tmpl.type ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Send Test Sample</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Coupon Modal */}
      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        onSave={handleSaveNewCoupon}
      />
    </AdminLayout>
  );
}
