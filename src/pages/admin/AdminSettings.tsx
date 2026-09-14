import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Banknote, 
  Truck, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Save, 
  Check, 
  AlertCircle,
  KeyRound,
  MessageCircle,
  PhoneCall,
  Clock,
  Mail,
  Share2,
  ExternalLink,
  Building2,
  Plus,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStore, cleanWhatsAppDigits, type BankAccount } from '@/store/admin';
import BankBadge from '@/components/BankBadge';
import BankAccountModal from '@/components/admin/BankAccountModal';
import { STORE_ADDRESS_FULL, STORE_PHONE, STORE_SUPPORT_EMAIL, STORE_EMAIL, STORE_INSTAGRAM_URL, STORE_FACEBOOK_URL, STORE_TIKTOK_URL } from '@/lib/constants';

export default function AdminSettings() {
  const { 
    settings, 
    updateSettings, 
    toggleCOD,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    toggleBankAccountActive
  } = useAdminStore();

  const [enableCOD, setEnableCOD] = useState(settings.enableCOD);
  const [maxCODAmount, setMaxCODAmount] = useState(settings.maxCODAmount);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings.freeShippingThreshold);
  const [standardShippingFee, setStandardShippingFee] = useState(settings.standardShippingFee);
  const [expressShippingFee, setExpressShippingFee] = useState(settings.expressShippingFee);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || STORE_PHONE);
  const [phoneNumber, setPhoneNumber] = useState(settings.phoneNumber || STORE_PHONE);
  const [atelierAddress, setAtelierAddress] = useState(settings.atelierAddress || STORE_ADDRESS_FULL);
  const [supportEmail, setSupportEmail] = useState(settings.studio?.supportEmail || STORE_SUPPORT_EMAIL);
  const [ordersEmail, setOrdersEmail] = useState(settings.studio?.email || STORE_EMAIL);
  const [openingHours, setOpeningHours] = useState(settings.studio?.openingHours || 'Mon – Sat: 10:00 AM – 7:00 PM (Closed on Poya)');
  const [instagramUrl, setInstagramUrl] = useState(settings.socialLinks?.instagram || STORE_INSTAGRAM_URL);
  const [facebookUrl, setFacebookUrl] = useState(settings.socialLinks?.facebook || STORE_FACEBOOK_URL);
  const [tiktokUrl, setTiktokUrl] = useState(settings.socialLinks?.tiktok || STORE_TIKTOK_URL);
  const [savedToast, setSavedToast] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | null>(null);
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setEnableCOD(settings.enableCOD);
      setMaxCODAmount(settings.maxCODAmount);
      setFreeShippingThreshold(settings.freeShippingThreshold);
      setStandardShippingFee(settings.standardShippingFee);
      setExpressShippingFee(settings.expressShippingFee);
      if (settings.whatsappNumber) setWhatsappNumber(settings.whatsappNumber);
      if (settings.phoneNumber) setPhoneNumber(settings.phoneNumber);
      if (settings.atelierAddress) setAtelierAddress(settings.atelierAddress);
      if (settings.studio?.supportEmail) setSupportEmail(settings.studio.supportEmail);
      if (settings.studio?.email) setOrdersEmail(settings.studio.email);
      if (settings.studio?.openingHours) setOpeningHours(settings.studio.openingHours);
      if (settings.socialLinks?.instagram) setInstagramUrl(settings.socialLinks.instagram);
      if (settings.socialLinks?.facebook) setFacebookUrl(settings.socialLinks.facebook);
      if (settings.socialLinks?.tiktok) setTiktokUrl(settings.socialLinks.tiktok);
    }
  }, [settings]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      enableCOD,
      maxCODAmount: Number(maxCODAmount),
      freeShippingThreshold: Number(freeShippingThreshold),
      standardShippingFee: Number(standardShippingFee),
      expressShippingFee: Number(expressShippingFee),
      whatsappNumber,
      phoneNumber,
      atelierAddress,
      studio: {
        email: ordersEmail,
        supportEmail,
        openingHours,
        googleMapsUrl: settings.studio?.googleMapsUrl,
      },
      socialLinks: {
        instagram: instagramUrl,
        facebook: facebookUrl,
        tiktok: tiktokUrl,
      },
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleOpenAddBankModal = () => {
    setEditingBankAccount(null);
    setIsBankModalOpen(true);
  };

  const handleOpenEditBankModal = (account: BankAccount) => {
    setEditingBankAccount(account);
    setIsBankModalOpen(true);
  };

  const handleSaveBankAccount = (accountData: Omit<BankAccount, 'id'>) => {
    if (editingBankAccount) {
      updateBankAccount(editingBankAccount.id, accountData);
    } else {
      addBankAccount(accountData);
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleDeleteBankAccount = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove the bank account for "${name}"? Customers will no longer see this option at checkout.`)) {
      deleteBankAccount(id);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    }
  };

  const handleCopyAccount = (id: string, accNum: string) => {
    navigator.clipboard.writeText(accNum);
    setCopiedBankId(id);
    setTimeout(() => setCopiedBankId(null), 2000);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#110B0E]">
              Atelier Store Configurations
            </h1>
            <p className="text-xs text-[#6D6268] font-light">
              Configure payment risk policies, cash on delivery (COD) master toggles, and delivery rates.
            </p>
          </div>

          {savedToast && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Store Settings Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* ── 1. MASTER COD & RISK SETTINGS ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-[#701626]">
              <Banknote className="w-5 h-5" />
              <h3 className="font-display text-xl font-bold text-[#110B0E]">
                Cash on Delivery (COD) Master Policy
              </h3>
            </div>

            {/* Master Toggle */}
            <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-xs text-[#110B0E]">Storewide Cash on Delivery (COD)</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    enableCOD ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                  }`}>
                    {enableCOD ? 'ON (Active in Checkout)' : 'OFF (Hidden in Checkout)'}
                  </span>
                </div>
                <p className="text-[11px] text-[#6D6268] pt-0.5">
                  When turned OFF, the COD payment option is immediately disabled across the customer checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEnableCOD(!enableCOD)}
                className={`w-14 h-7 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ${
                  enableCOD ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    enableCOD ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Maximum COD Order Ceiling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Maximum Allowed Cart Value for COD (LKR)
                </label>
                <input
                  type="number"
                  value={maxCODAmount}
                  onChange={(e) => setMaxCODAmount(Number(e.target.value))}
                  placeholder="45000"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-bold focus:border-[#701626] focus:bg-white focus:outline-none"
                />
                <p className="text-[10px] text-[#6D6268]">
                  Orders above this value must be paid via Online Card or Bank Deposit to protect high-value bridal silk parcels.
                </p>
              </div>
            </div>
          </div>

          {/* ── 2. DIRECT BANK TRANSFER ACCOUNTS (SRI LANKA BANKS) ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C5A059]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#701626]/10 text-[#701626] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-[#110B0E]">
                    Direct Bank Transfer Accounts (Sri Lanka Banks)
                  </h3>
                  <p className="text-xs text-[#6D6268]">
                    Configure the bank accounts shown to patrons when selecting "Bank Transfer" at checkout. Add or remove accounts anytime.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAddBankModal}
                className="px-4 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#DFBF77]" />
                <span>Add Bank Account</span>
              </button>
            </div>

            {/* Bank Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings.bankAccounts && settings.bankAccounts.length > 0 ? (
                settings.bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                      account.isActive !== false
                        ? 'bg-[#FCFBF8] border-[#C5A059]/40 shadow-xs'
                        : 'bg-gray-50/80 border-dashed border-gray-300 opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <BankBadge bankName={account.bankName} bankLogo={account.bankLogo} size="md" />
                          <div className="min-w-0">
                            <h4 className="font-display text-base font-bold text-[#110B0E] truncate">
                              {account.bankName}
                            </h4>
                            <p className="text-[11px] text-[#6D6268] truncate">
                              {account.branchName}
                            </p>
                          </div>
                        </div>

                        {/* Active Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleBankAccountActive(account.id)}
                          className={`text-[10px] font-bold px-3 py-1 rounded-full cursor-pointer transition-colors shrink-0 ${
                            account.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {account.isActive !== false ? 'Active at Checkout' : 'Disabled'}
                        </button>
                      </div>

                      {/* Account Number & Beneficiary */}
                      <div className="p-3.5 rounded-xl bg-white border border-[#C5A059]/25 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-[#6D6268]">
                            Account Number
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyAccount(account.id, account.accountNumber)}
                            className="text-[10px] font-bold text-[#701626] hover:text-[#C5A059] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {copiedBankId === account.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="font-mono text-sm font-bold text-[#110B0E] tracking-wider">
                          {account.accountNumber}
                        </p>
                        <p className="text-[11px] text-[#6D6268]">
                          Beneficiary: <strong className="text-[#110B0E]">{account.accountName}</strong>
                        </p>
                        {account.swiftCode && (
                          <p className="text-[10px] font-mono text-gray-500">
                            SWIFT / BIC: {account.swiftCode}
                          </p>
                        )}
                      </div>

                      {account.instructions && (
                        <p className="text-[10.5px] italic text-[#6D6268] bg-[#F7F4EE] p-2.5 rounded-lg border border-[#C5A059]/20">
                          "{account.instructions}"
                        </p>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#C5A059]/20">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBankModal(account)}
                        className="p-2 rounded-xl text-gray-600 hover:text-[#701626] hover:bg-white border border-transparent hover:border-[#C5A059]/30 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBankAccount(account.id, account.bankName)}
                        className="p-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-8 text-center bg-[#FCFBF8] border border-dashed border-[#C5A059]/40 rounded-2xl space-y-3">
                  <Building2 className="w-8 h-8 text-[#C5A059] mx-auto opacity-70" />
                  <p className="text-xs font-bold text-[#110B0E]">No Bank Accounts Configured</p>
                  <p className="text-[11px] text-[#6D6268] max-w-sm mx-auto">
                    Add your Commercial Bank, HNB, Sampath, or BOC account so patrons can complete direct deposits.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddBankModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#701626] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#8E1E34] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Bank Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── 3. LOGISTICS & DELIVERY THRESHOLDS ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-[#701626]">
              <Truck className="w-5 h-5" />
              <h3 className="font-display text-xl font-bold text-[#110B0E]">
                Shipping Rates & Free Delivery Threshold
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Free Shipping Minimum (LKR)
                </label>
                <input
                  type="number"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-bold focus:border-[#701626] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Standard Courier Fee (LKR)
                </label>
                <input
                  type="number"
                  value={standardShippingFee}
                  onChange={(e) => setStandardShippingFee(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-bold focus:border-[#701626] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Colombo Express Priority Fee (LKR)
                </label>
                <input
                  type="number"
                  value={expressShippingFee}
                  onChange={(e) => setExpressShippingFee(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-bold focus:border-[#701626] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ── 3. ATELIER CONTACT, PHONES & CONCIERGE ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#701626]">
                <PhoneCall className="w-5 h-5" />
                <h3 className="font-display text-xl font-bold text-[#110B0E]">
                  Studio Phone Numbers & Concierge
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] bg-[#F7F4EE] px-2.5 py-1 rounded-full border border-[#C5A059]/25">
                Live Storefront Contact
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* WhatsApp Concierge Number */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/30">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>WhatsApp Concierge Number</span>
                  </label>
                  <a
                    href={`https://wa.me/${cleanWhatsAppDigits(whatsappNumber)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-[#128C7E] hover:underline flex items-center gap-1"
                  >
                    <span>Test: wa.me/{cleanWhatsAppDigits(whatsappNumber)}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A059]/30 text-xs font-medium text-[#110B0E] focus:border-[#701626] focus:outline-none"
                />
                <p className="text-[10.5px] text-[#6D6268]">
                  Powers the floating styling concierge button, customer order inquiries, and footer quick chat.
                </p>
              </div>

              {/* Studio Voice Phone Number */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/30">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#701626]" />
                    <span>Studio Voice Phone Number</span>
                  </label>
                  <a
                    href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`}
                    className="text-[10px] font-bold text-[#701626] hover:underline flex items-center gap-1"
                  >
                    <span>Call: {phoneNumber}</span>
                  </a>
                </div>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+94 11 234 5678 or +94 77 123 4567"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A059]/30 text-xs font-medium text-[#110B0E] focus:border-[#701626] focus:outline-none"
                />
                <p className="text-[10.5px] text-[#6D6268]">
                  Displayed on the Contact page, printable packing slips, and order receipts for direct phone calls.
                </p>
              </div>
            </div>

            {/* Address, Hours & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#701626]" />
                  <span>Atelier Studio Address</span>
                </label>
                <input
                  type="text"
                  value={atelierAddress}
                  onChange={(e) => setAtelierAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#701626]" />
                  <span>Showroom Opening Hours</span>
                </label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="Mon – Sat: 10:00 AM – 7:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#701626]" />
                  <span>Support Email Address</span>
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="hello@azhaiclothing.lk"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ── 4. OFFICIAL LOOKBOOK & SOCIAL MEDIA CHANNELS ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-[#701626]">
              <Share2 className="w-5 h-5" />
              <h3 className="font-display text-xl font-bold text-[#110B0E]">
                Official Lookbook &amp; Social Channels
              </h3>
            </div>
            <p className="text-xs text-[#6D6268] font-light leading-relaxed">
              Configure the social media destination links rendered across the boutique footer and customer communications.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Instagram Lookbook URL
                </label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/azhaiclothing"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://www.facebook.com/azhaiclothing"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  TikTok Official Profile
                </label>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@azhaiclothing"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-8 py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Store Settings
            </button>
          </div>
        </form>

        {/* Bank Account Add/Edit Modal */}
        <BankAccountModal
          isOpen={isBankModalOpen}
          onClose={() => setIsBankModalOpen(false)}
          onSave={handleSaveBankAccount}
          initial={editingBankAccount}
        />
      </div>
    </AdminLayout>
  );
}
