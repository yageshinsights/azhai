import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useSearchParams } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Crown, 
  MessageCircle, 
  Mail, 
  Phone, 
  ShoppingBag, 
  MapPin, 
  Calendar,
  Sparkles,
  Award,
  Inbox,
  CheckCircle2,
  Trash2,
  Clock,
  Edit3,
  X,
  Save,
  RefreshCw,
  FileText,
  ExternalLink,
  Link2
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import PaymentLinkModal from '@/components/admin/PaymentLinkModal';
import { useAdminStore, type CustomerRecord, type AtelierInquiry, type InquiryStatus, cleanWhatsAppDigits } from '@/store/admin';
import { useAuthStore } from '@/store/auth';

export default function AdminCustomers() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialIsInquiries = location.pathname.includes('/inquiries') || searchParams.get('tab') === 'inquiries';

  const { 
    customers, 
    inquiries,
    fetchSupabaseData, 
    fetchInquiries,
    syncCustomerFromAuth, 
    updateCustomerNotesAndTier,
    updateInquiryStatus,
    updateInquiryNotes,
    deleteInquiry
  } = useAdminStore();

  const authAccounts = useAuthStore((s) => s.accounts);
  const currentAuthUser = useAuthStore((s) => s.user);

  // Active top tab: 'patrons' | 'inquiries'
  const [activeTab, setActiveTab] = useState<'patrons' | 'inquiries'>(initialIsInquiries ? 'inquiries' : 'patrons');

  useEffect(() => {
    if (location.pathname.includes('/inquiries') || searchParams.get('tab') === 'inquiries') {
      setActiveTab('inquiries');
    }
  }, [location.pathname, searchParams]);

  // Patrons View Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVipTier, setSelectedVipTier] = useState<string>('all');
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editVipTier, setEditVipTier] = useState<'Gold Patron' | 'Silver Patron' | 'Standard'>('Standard');
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // Inquiries View Filters & State
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Per-inquiry local notes draft state for fast editing
  const [inquiryNotesDrafts, setInquiryNotesDrafts] = useState<Record<string, string>>({});

  // Payments.lk Bespoke Payment Link Modal State
  const [isPaymentLinkModalOpen, setIsPaymentLinkModalOpen] = useState(false);
  const [paymentLinkDefaults, setPaymentLinkDefaults] = useState<{
    title: string;
    amount: number;
    description: string;
    phone: string;
  }>({
    title: 'Bespoke Atelier Tailoring & Fitting',
    amount: 5000,
    description: '',
    phone: '',
  });

  useEffect(() => {
    fetchSupabaseData();
  }, [fetchSupabaseData]);

  // Auto-sync any registered online patron accounts to the Admin CRM Registry
  useEffect(() => {
    if (Array.isArray(authAccounts)) {
      authAccounts.forEach((acc) => {
        if (acc?.user?.email) {
          syncCustomerFromAuth({
            fullName: acc.user.fullName,
            email: acc.user.email,
            phone: acc.user.phone || '',
            district: acc.addresses?.[0]?.district || 'Colombo',
            city: acc.addresses?.[0]?.city || 'Colombo',
            createdAt: acc.user.createdAt,
          });
        }
      });
    }

    if (currentAuthUser?.email) {
      syncCustomerFromAuth({
        fullName: currentAuthUser.fullName,
        email: currentAuthUser.email,
        phone: currentAuthUser.phone || '',
        createdAt: currentAuthUser.createdAt,
      });
    }
  }, [authAccounts, currentAuthUser, syncCustomerFromAuth]);

  const showToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSupabaseData();
    setIsRefreshing(false);
    showToast('CRM Registry & Inquiries refreshed from database!');
  };

  // Open Edit Customer Modal
  const handleOpenEditCustomer = (c: CustomerRecord) => {
    setEditingCustomer(c);
    setEditNotes(c.notes || '');
    setEditVipTier(c.vipTier || 'Standard');
  };

  // Save Customer VIP Notes and Tier to Supabase
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setIsSavingCustomer(true);
    await updateCustomerNotesAndTier(editingCustomer.email, editNotes.trim(), editVipTier);
    setIsSavingCustomer(false);
    setEditingCustomer(null);
    showToast(`VIP profile for ${editingCustomer.fullName} updated!`);
  };

  // Handle Inquiry Status Update
  const handleStatusChange = async (inqId: string, newStatus: InquiryStatus) => {
    await updateInquiryStatus(inqId, newStatus);
    showToast(`Inquiry marked as ${newStatus.toUpperCase()}`);
  };

  // Handle Inquiry Staff Notes Save
  const handleSaveInquiryNotes = async (inqId: string) => {
    const note = inquiryNotesDrafts[inqId] !== undefined 
      ? inquiryNotesDrafts[inqId] 
      : (inquiries.find(i => i.id === inqId)?.adminNotes || '');
    await updateInquiryNotes(inqId, note);
    showToast('Staff note saved to database!');
  };

  // Handle Delete Inquiry
  const handleDeleteInquiry = async (inqId: string) => {
    if (window.confirm('Are you sure you want to delete this customer inquiry from the database?')) {
      await deleteInquiry(inqId);
      showToast('Inquiry deleted from database.');
    }
  };

  // Filter Patrons
  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchTier = selectedVipTier === 'all' || c.vipTier === selectedVipTier;

    return matchSearch && matchTier;
  });

  // Filter Inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const matchSearch =
      inq.name.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.email.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      (inq.phone && inq.phone.includes(inquirySearch)) ||
      inq.topic.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.message.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      (inq.adminNotes && inq.adminNotes.toLowerCase().includes(inquirySearch.toLowerCase()));

    const matchStatus = inquiryStatusFilter === 'all' || inq.status === inquiryStatusFilter;

    return matchSearch && matchStatus;
  });

  const unreadInquiriesCount = inquiries.filter((i) => i.status === 'unread').length;

  const getVipBadge = (tier: CustomerRecord['vipTier']) => {
    if (tier === 'Gold Patron') {
      return (
        <span className="inline-flex items-center gap-1 bg-[#701626] text-[#DFBF77] font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-[#C5A059]/40 shadow-sm whitespace-nowrap">
          <Crown className="w-3 h-3" /> Gold Patron
        </span>
      );
    }
    if (tier === 'Silver Patron') {
      return (
        <span className="inline-flex items-center gap-1 bg-[#F7F4EE] text-[#701626] font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-[#C5A059]/30 whitespace-nowrap">
          <Award className="w-3 h-3 text-[#C5A059]" /> Silver Patron
        </span>
      );
    }
    return <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">Standard</span>;
  };

  const getInquiryStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'unread':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Unread
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            Read
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Title & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                Client Relations & Atelier Concierge
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            </div>
            <h1 className="font-display text-3xl font-bold text-[#110B0E]">
              Patron CRM & Inquiries
            </h1>
            <p className="text-xs text-[#6D6268] font-light">
              Manage client VIP profiles, bespoke consultation inquiries, and personalized concierge chats.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedToast && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {savedToast}
              </span>
            )}

            <button
              onClick={() => {
                setPaymentLinkDefaults({
                  title: 'Bespoke Atelier Tailoring & Fitting',
                  amount: 5000,
                  description: '',
                  phone: '',
                });
                setIsPaymentLinkModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FCFBF8] hover:bg-[#DFBF77]/20 border border-[#C5A059]/40 text-[#701626] text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Link2 className="w-4 h-4 text-[#701626]" />
              <span>Create Payment Link</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Database'}</span>
            </button>
          </div>
        </div>

        {/* ── TOP LEVEL TAB SWITCHER: [PATRONS REGISTRY] | [ATELIER INQUIRIES] ── */}
        <div className="flex items-center gap-3 border-b border-[#C5A059]/20 pb-3">
          <button
            onClick={() => setActiveTab('patrons')}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'patrons'
                ? 'bg-[#701626] text-white shadow-md'
                : 'bg-white text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/25 hover:bg-[#F7F4EE]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Patron VIP Registry</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'patrons' ? 'bg-[#DFBF77] text-[#110B0E]' : 'bg-[#701626]/10 text-[#701626]'
            }`}>
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inquiries'
                ? 'bg-[#701626] text-white shadow-md'
                : 'bg-white text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/25 hover:bg-[#F7F4EE]'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Atelier Inquiries Inbox</span>
            {unreadInquiriesCount > 0 ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-600 text-white animate-pulse">
                {unreadInquiriesCount} new
              </span>
            ) : (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'inquiries' ? 'bg-[#DFBF77] text-[#110B0E]' : 'bg-[#701626]/10 text-[#701626]'
              }`}>
                {inquiries.length}
              </span>
            )}
          </button>
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: PATRON VIP REGISTRY                                       */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'patrons' && (
          <div className="space-y-6">
            {/* Search & VIP Filters */}
            <div className="bg-white rounded-3xl p-5 border border-[#C5A059]/30 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Patron name, phone, email, notes..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs text-[#110B0E] focus:outline-none focus:border-[#701626]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {['all', 'Gold Patron', 'Silver Patron', 'Standard'].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSelectedVipTier(tier)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedVipTier === tier
                          ? 'bg-[#701626] text-white shadow-sm'
                          : 'bg-[#F7F4EE] text-[#6D6268] hover:text-[#110B0E]'
                      }`}
                    >
                      {tier === 'all' ? 'All Patrons' : tier}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-3xl border border-[#C5A059]/30 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[880px]">
                  <thead className="bg-[#701626] text-[#F3E8CE] uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4 whitespace-nowrap min-w-[180px]">Patron Name</th>
                      <th className="p-4 whitespace-nowrap min-w-[150px]">Contact Info</th>
                      <th className="p-4 whitespace-nowrap min-w-[120px]">Location</th>
                      <th className="p-4 whitespace-nowrap min-w-[100px]">Orders</th>
                      <th className="p-4 whitespace-nowrap min-w-[110px]">Lifetime Spend</th>
                      <th className="p-4 whitespace-nowrap min-w-[120px]">VIP Tier</th>
                      <th className="p-4 whitespace-nowrap min-w-[180px]">Atelier Notes</th>
                      <th className="p-4 text-right whitespace-nowrap min-w-[180px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C5A059]/15">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-[#6D6268]">
                          No patrons found matching your search. Registered accounts will appear here automatically.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((c, idx) => {
                        const cleanPhone = cleanWhatsAppDigits(c.phone);
                        const waMsg = encodeURIComponent(
                          `Vanakkam ${c.fullName}! Preethi here from Azhai Boutique. I wanted to share our exclusive new silk drop with you.`
                        );

                        return (
                          <tr
                            key={c.id}
                            className={`hover:bg-[#F7F4EE]/50 transition-colors ${
                              idx % 2 === 0 ? 'bg-white' : 'bg-[#FCFBF8]'
                            }`}
                          >
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#701626]/10 text-[#701626] flex items-center justify-center font-bold font-display text-xs shrink-0">
                                  {c.fullName.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-[#110B0E]">{c.fullName}</p>
                                  <p className="text-[10px] text-[#6D6268]">
                                    Joined {new Date(c.firstJoined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="p-4 space-y-0.5 whitespace-nowrap">
                              <p className="font-medium text-[#110B0E]">{c.phone || 'No phone'}</p>
                              <p className="text-[10.5px] text-[#6D6268]">{c.email}</p>
                            </td>

                            <td className="p-4 text-[#110B0E] whitespace-nowrap">
                              <p className="font-medium">{c.city || 'Colombo'}</p>
                              <p className="text-[10px] text-[#6D6268]">{c.district}</p>
                            </td>

                            <td className="p-4 font-bold text-[#110B0E] whitespace-nowrap">
                              {c.totalOrders} purchases
                            </td>

                            <td className="p-4 font-display text-sm font-bold text-[#701626] whitespace-nowrap">
                              LKR {c.totalSpent.toLocaleString()}
                            </td>

                            <td className="p-4 whitespace-nowrap">
                              {getVipBadge(c.vipTier)}
                            </td>

                            <td className="p-4 max-w-xs">
                              {c.notes ? (
                                <p className="text-[11px] text-[#110B0E] line-clamp-2 italic bg-[#F7F4EE]/80 p-1.5 rounded-lg border border-[#C5A059]/20">
                                  "{c.notes}"
                                </p>
                              ) : (
                                <span className="text-[10px] text-[#6D6268] italic">No notes</span>
                              )}
                            </td>

                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditCustomer(c)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F7F4EE] hover:bg-[#701626] hover:text-white text-[#110B0E] font-bold text-xs transition-colors border border-[#C5A059]/30 cursor-pointer"
                                  title="Edit VIP Notes & Tier"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Notes</span>
                                </button>

                                {c.phone ? (
                                  <a
                                    href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] hover:text-white text-[#128C7E] font-bold text-xs transition-colors whitespace-nowrap"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>WhatsApp VIP</span>
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-[#6D6268] italic">—</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: ATELIER INQUIRIES INBOX (SUPABASE BACKED)                  */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            {/* Search & Status Filters */}
            <div className="bg-white rounded-3xl p-5 border border-[#C5A059]/30 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    placeholder="Search inquiries by patron, topic, text..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs text-[#110B0E] focus:outline-none focus:border-[#701626]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {[
                    { key: 'all', label: `All (${inquiries.length})` },
                    { key: 'unread', label: `Unread (${inquiries.filter(i => i.status === 'unread').length})` },
                    { key: 'in_progress', label: `In Progress (${inquiries.filter(i => i.status === 'in_progress').length})` },
                    { key: 'resolved', label: `Resolved (${inquiries.filter(i => i.status === 'resolved').length})` },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setInquiryStatusFilter(filter.key)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        inquiryStatusFilter === filter.key
                          ? 'bg-[#701626] text-white shadow-sm'
                          : 'bg-[#F7F4EE] text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/20'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inquiries List */}
            {filteredInquiries.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#C5A059]/30 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#F7F4EE] border border-[#C5A059]/30 flex items-center justify-center mx-auto text-[#701626]">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="font-display font-bold text-base text-[#110B0E]">No inquiries in this folder</p>
                <p className="text-xs text-[#6D6268] max-w-sm mx-auto">
                  Customer messages sent via the contact page will automatically appear here with 1-click WhatsApp and email actions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((inq) => {
                  const cleanPhone = cleanWhatsAppDigits(inq.phone);
                  const waReplyMsg = encodeURIComponent(
                    `Vanakkam ${inq.name}! Thank you for reaching out to Azhai Boutique regarding "${inq.topic}". Preethi and our styling team are here to assist you.`
                  );
                  const mailtoSubject = encodeURIComponent(`Regarding your inquiry: ${inq.topic} — Azhai Boutique Colombo`);
                  const mailtoBody = encodeURIComponent(`Dear ${inq.name},\n\nThank you for contacting Azhai Clothing Atelier.\n\nRegarding your inquiry:\n"${inq.message}"\n\nWarm regards,\nPreethi & The Azhai Team`);

                  const draftNote = inquiryNotesDrafts[inq.id] !== undefined ? inquiryNotesDrafts[inq.id] : (inq.adminNotes || '');

                  return (
                    <div
                      key={inq.id}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-[#C5A059]/30 shadow-sm space-y-4 transition-all hover:border-[#C5A059]/60"
                    >
                      {/* Inquiry Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C5A059]/15 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#701626]/10 text-[#701626] font-display font-bold text-sm flex items-center justify-center shrink-0">
                            {inq.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-display text-base font-bold text-[#110B0E]">{inq.name}</h3>
                              {getInquiryStatusBadge(inq.status)}
                            </div>
                            <p className="text-[11px] text-[#6D6268]">
                              {inq.email} {inq.phone && `· ${inq.phone}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="text-[10px] bg-[#F7F4EE] text-[#701626] font-bold px-3 py-1 rounded-full border border-[#C5A059]/25">
                            {inq.topic}
                          </span>
                          <span className="text-[10.5px] text-[#6D6268] flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                            {new Date(inq.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Inquiry Message Box */}
                      <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/20 text-xs text-[#110B0E] leading-relaxed">
                        <p className="font-semibold text-[10px] uppercase tracking-wider text-[#701626] pb-1">
                          Patron Message:
                        </p>
                        <p className="whitespace-pre-line">{inq.message}</p>
                      </div>

                      {/* Staff Notes & Action Toolbar */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1">
                        {/* Staff Notes Textarea (7 cols) */}
                        <div className="md:col-span-7 flex items-center gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={draftNote}
                              onChange={(e) => setInquiryNotesDrafts({ ...inquiryNotesDrafts, [inq.id]: e.target.value })}
                              placeholder="Add staff note (e.g. Called patron, confirmed trial fitting for Saturday)..."
                              className="w-full px-3.5 py-2 rounded-xl bg-[#F7F4EE]/80 border border-[#C5A059]/30 text-xs text-[#110B0E] placeholder:text-[#6D6268] focus:outline-none focus:border-[#701626]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSaveInquiryNotes(inq.id)}
                            className="px-3 py-2 bg-[#F7F4EE] hover:bg-[#701626] hover:text-white rounded-xl text-xs font-bold text-[#110B0E] transition-colors border border-[#C5A059]/30 flex items-center gap-1 cursor-pointer shrink-0"
                            title="Save Staff Note"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                        </div>

                        {/* Status Updater & 1-Click Action Buttons (5 cols) */}
                        <div className="md:col-span-5 flex items-center justify-start md:justify-end gap-2 flex-wrap">
                          {/* Status Dropdown */}
                          <select
                            value={inq.status}
                            onChange={(e) => handleStatusChange(inq.id, e.target.value as InquiryStatus)}
                            className="px-3 py-2 rounded-xl bg-white border border-[#C5A059]/30 text-xs font-bold text-[#110B0E] focus:outline-none focus:border-[#701626] cursor-pointer"
                          >
                            <option value="unread">Mark Unread</option>
                            <option value="read">Mark Read</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>

                          {/* 1-Click WhatsApp Reply */}
                          {inq.phone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${waReplyMsg}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] hover:text-white text-[#128C7E] font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="Reply on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          {/* 1-Click Email Reply */}
                          <a
                            href={`mailto:${inq.email}?subject=${mailtoSubject}&body=${mailtoBody}`}
                            className="px-3 py-2 rounded-xl bg-[#701626]/10 hover:bg-[#701626] hover:text-white text-[#701626] font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            title="Reply via Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email</span>
                          </a>

                          {/* Delete Inquiry Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete Inquiry from Database"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MODAL: EDIT CUSTOMER VIP NOTES & TIER ── */}
        <AnimatePresence>
          {editingCustomer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#C5A059]/40 shadow-2xl space-y-5"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                      Patron CRM Record
                    </span>
                    <h3 className="font-display text-xl font-bold text-[#110B0E]">
                      Edit VIP Profile
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditingCustomer(null)}
                    className="w-8 h-8 rounded-full bg-[#F7F4EE] hover:bg-gray-200 flex items-center justify-center text-[#110B0E]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Customer Summary Chip */}
                <div className="p-3.5 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/20 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#110B0E]">{editingCustomer.fullName}</p>
                    <p className="text-[11px] text-[#6D6268]">{editingCustomer.email} · {editingCustomer.phone || 'No phone'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#701626]">LKR {editingCustomer.totalSpent.toLocaleString()}</p>
                    <p className="text-[10px] text-[#6D6268]">{editingCustomer.totalOrders} orders placed</p>
                  </div>
                </div>

                <form onSubmit={handleSaveCustomer} className="space-y-4">
                  {/* VIP Tier Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Patron VIP Tier
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Standard', 'Silver Patron', 'Gold Patron'] as const).map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setEditVipTier(tier)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            editVipTier === tier
                              ? 'bg-[#701626] text-[#DFBF77] border-[#701626] shadow-sm'
                              : 'bg-[#F7F4EE] text-[#6D6268] border-[#C5A059]/25 hover:bg-gray-100'
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Atelier Staff Notes */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Atelier Staff Notes & Sizing Preferences
                    </label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={4}
                      placeholder="e.g. Prefers maroon and emerald silks. Blouse bust 36 inches, waist 30 inches. Daughter getting married in December."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs text-[#110B0E] focus:border-[#701626] focus:bg-white focus:outline-none leading-relaxed"
                    />
                    <p className="text-[10.5px] text-[#6D6268]">
                      These notes are permanently synchronized to the patron's Supabase database profile.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingCustomer(null)}
                      className="px-4 py-2 text-xs font-bold text-[#6D6268] hover:text-[#110B0E] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingCustomer}
                      className="px-5 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingCustomer ? 'Saving...' : 'Save to Database'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Payments.lk Bespoke Payment Link Modal */}
        <PaymentLinkModal
          isOpen={isPaymentLinkModalOpen}
          onClose={() => setIsPaymentLinkModalOpen(false)}
          defaultTitle={paymentLinkDefaults.title}
          defaultAmount={paymentLinkDefaults.amount}
          defaultDescription={paymentLinkDefaults.description}
          customerPhone={paymentLinkDefaults.phone}
        />
      </div>
    </AdminLayout>
  );
}
