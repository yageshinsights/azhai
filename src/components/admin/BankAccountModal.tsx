import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Building2, 
  Check, 
  Upload, 
  Sparkles, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { type BankAccount } from '@/store/admin';
import BankBadge, { SRI_LANKA_BANKS_PRESETS, type BankPreset } from '@/components/BankBadge';
import { compressToWebP } from '@/lib/image-compressor';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<BankAccount, 'id'>) => void;
  initial?: BankAccount | null;
}

export default function BankAccountModal({
  isOpen,
  onClose,
  onSave,
  initial,
}: BankAccountModalProps) {
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [bankLogo, setBankLogo] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedPresetKey, setSelectedPresetKey] = useState('combank');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setBankName(initial.bankName || '');
      setAccountNumber(initial.accountNumber || '');
      setAccountName(initial.accountName || '');
      setBranchName(initial.branchName || '');
      setSwiftCode(initial.swiftCode || '');
      setBankLogo(initial.bankLogo || '');
      setInstructions(initial.instructions || '');
      setIsActive(initial.isActive !== false);

      const found = SRI_LANKA_BANKS_PRESETS.find(
        (p) => p.key === initial.bankLogo || initial.bankName.toLowerCase().includes(p.shortName.toLowerCase())
      );
      if (found) setSelectedPresetKey(found.key);
      else setSelectedPresetKey('custom');
    } else {
      // Default to Commercial Bank preset
      const preset = SRI_LANKA_BANKS_PRESETS[0];
      setBankName(preset.name);
      setAccountNumber('');
      setAccountName('Azhai Clothing (Pvt) Ltd');
      setBranchName(preset.defaultBranch || 'Colombo Main Branch');
      setSwiftCode(preset.swiftCode || '');
      setBankLogo(preset.key);
      setInstructions('Please quote your Order # in the deposit description or slip reference.');
      setIsActive(true);
      setSelectedPresetKey(preset.key);
    }
    setError(null);
  }, [initial, isOpen]);

  const handleSelectPreset = (preset: BankPreset) => {
    setSelectedPresetKey(preset.key);
    setBankLogo(preset.key);
    if (preset.key !== 'custom') {
      setBankName(preset.name);
      if (preset.swiftCode) setSwiftCode(preset.swiftCode);
      if (preset.defaultBranch && (!branchName || branchName.includes('Branch'))) {
        setBranchName(preset.defaultBranch);
      }
    }
  };

  const handleCustomLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressed = await compressToWebP(file, { maxWidth: 300, maxHeight: 300, quality: 0.85 });

      if (isSupabaseConfigured()) {
        const filePath = `brand/bank-logos/${Date.now()}-${compressed.name}`;
        const { error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(filePath, compressed, { contentType: 'image/webp', upsert: true });

        if (!uploadErr) {
          const { data: publicUrl } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          setBankLogo(publicUrl.publicUrl);
          setIsUploading(false);
          return;
        }
      }

      // Local Base64 fallback
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBankLogo(ev.target?.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.warn('Bank logo upload fallback:', err);
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim()) {
      setError('Please provide the Bank Name.');
      return;
    }
    if (!accountNumber.trim()) {
      setError('Please provide the Account Number.');
      return;
    }
    if (!accountName.trim()) {
      setError('Please provide the Beneficiary / Account Name.');
      return;
    }
    if (!branchName.trim()) {
      setError('Please provide the Branch Name.');
      return;
    }

    onSave({
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim(),
      branchName: branchName.trim(),
      swiftCode: swiftCode.trim() || undefined,
      bankLogo: bankLogo || selectedPresetKey || 'combank',
      instructions: instructions.trim() || undefined,
      isActive,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#C5A059]/40 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-[#FCFBF8] border-b border-[#C5A059]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#701626]/10 text-[#701626] flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-[#110B0E]">
                  {initial ? 'Edit Bank Account' : 'Add Direct Bank Transfer Account'}
                </h2>
                <p className="text-[11px] text-[#6D6268]">
                  Accounts configured here appear dynamically to patrons at checkout.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Bank Presets */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider">
                Select Bank Preset (1-Click Setup)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SRI_LANKA_BANKS_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer text-left ${
                      selectedPresetKey === preset.key
                        ? 'border-[#701626] bg-[#701626]/5 ring-1 ring-[#701626] text-[#701626]'
                        : 'border-[#C5A059]/30 bg-[#FCFBF8] hover:border-[#701626] text-[#110B0E]'
                    }`}
                  >
                    <BankBadge bankName={preset.name} bankLogo={preset.key} size="sm" />
                    <span className="truncate text-[11px]">{preset.shortName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FCFBF8] to-[#F7F4EE] border border-[#C5A059]/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <BankBadge bankName={bankName} bankLogo={bankLogo} size="md" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#110B0E] truncate">
                    {bankName || 'Select / Enter Bank'}
                  </p>
                  <p className="text-[11px] font-mono font-bold text-[#701626] tracking-wider">
                    {accountNumber || 'Account # 0000000000'}
                  </p>
                  <p className="text-[10px] text-[#6D6268] truncate">
                    {accountName || 'Beneficiary Name'} · {branchName || 'Branch'}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {isActive ? 'Active' : 'Disabled'}
              </span>
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider mb-1.5">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Commercial Bank of Ceylon"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FCFBF8] border border-[#C5A059]/40 text-[#110B0E] focus:outline-none focus:border-[#701626]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider mb-1.5">
                  Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="8001234567"
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold rounded-xl bg-[#FCFBF8] border border-[#C5A059]/40 text-[#110B0E] focus:outline-none focus:border-[#701626]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider mb-1.5">
                  Account / Beneficiary Name *
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Azhai Clothing (Pvt) Ltd"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FCFBF8] border border-[#C5A059]/40 text-[#110B0E] focus:outline-none focus:border-[#701626]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider mb-1.5">
                  Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Kollupitiya Branch"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FCFBF8] border border-[#C5A059]/40 text-[#110B0E] focus:outline-none focus:border-[#701626]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider mb-1.5">
                  SWIFT / BIC Code (Optional)
                </label>
                <input
                  type="text"
                  value={swiftCode}
                  onChange={(e) => setSwiftCode(e.target.value)}
                  placeholder="CCEYLKX"
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-[#FCFBF8] border border-[#C5A059]/40 text-[#110B0E] focus:outline-none focus:border-[#701626]"
                />
              </div>

              {/* Custom Logo Upload */}
              <div>
                <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider mb-1.5">
                  Custom Logo Image (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-2 text-xs font-bold rounded-xl bg-white border border-[#C5A059]/40 hover:border-[#701626] text-[#701626] cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading...' : 'Upload Logo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {bankLogo && (bankLogo.startsWith('http') || bankLogo.startsWith('data:')) && (
                    <button
                      type="button"
                      onClick={() => setBankLogo(selectedPresetKey)}
                      className="text-[10px] text-rose-600 hover:underline"
                    >
                      Reset to Preset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions & Note */}
            <div>
              <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider mb-1.5">
                Deposit Instructions / Reference Notes (Shown to Customer)
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Please state your Order # as the deposit remark. You can send the slip via WhatsApp or upload it after checkout."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FCFBF8] border border-[#C5A059]/40 text-[#110B0E] focus:outline-none focus:border-[#701626]"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/30">
              <div>
                <p className="text-xs font-bold text-[#110B0E]">Enable for Customers at Checkout</p>
                <p className="text-[10.5px] text-[#6D6268]">
                  If active, patrons can choose this account during Bank Transfer checkout.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-[#C5A059]/40 text-[#701626] focus:ring-[#701626] cursor-pointer"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-[#DFBF77]" />
                <span>Save Bank Account</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
