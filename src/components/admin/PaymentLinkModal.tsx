import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Copy, Check, ExternalLink, MessageCircle, RefreshCw, X, Mail, Send } from 'lucide-react';
import { createPaymentsLkPaymentLink } from '@/lib/payments-lk';
import { sendBrevoEmail, buildConciergePaymentLinkEmailHtml } from '@/lib/brevo';

interface PaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle?: string;
  defaultAmount?: number;
  defaultDescription?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
}

export default function PaymentLinkModal({
  isOpen,
  onClose,
  defaultTitle = 'Bespoke Atelier Tailoring & Fitting',
  defaultAmount = 5000,
  defaultDescription = '',
  customerPhone = '',
  customerEmail = '',
  customerName = 'Valued Patron',
}: PaymentLinkModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [description, setDescription] = useState(defaultDescription);
  const [recipientEmail, setRecipientEmail] = useState(customerEmail);
  const [recipientName, setRecipientName] = useState(customerName);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || amount <= 0) {
      alert('Please provide a title and a valid LKR amount.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const amountCents = Math.round(amount * 100);
      const res = await createPaymentsLkPaymentLink({
        title: title.trim(),
        amountCents,
        description: description.trim() || undefined,
      });

      if (res.success && res.url) {
        setGeneratedUrl(res.url);
      } else {
        setErrorMessage(res.error || 'Failed to generate link. Check Payments.lk connection.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error communicating with Payments.lk');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendLinkEmail = async () => {
    if (!generatedUrl || !recipientEmail.trim()) {
      alert('Please enter a valid recipient email address.');
      return;
    }
    setIsSendingEmail(true);
    try {
      const res = await sendBrevoEmail({
        to: [{ email: recipientEmail.trim(), name: recipientName.trim() || 'Valued Patron' }],
        subject: `💳 Payment Link: ${title} — Azhai Boutique`,
        htmlContent: buildConciergePaymentLinkEmailHtml({
          customerName: recipientName.trim() || 'Valued Patron',
          title: title.trim(),
          amount,
          paymentUrl: generatedUrl,
          description: description.trim() || undefined,
        }),
      });

      if (res.success) {
        setEmailSentSuccess(true);
        setTimeout(() => setEmailSentSuccess(false), 3000);
      } else {
        alert(res.error || 'Failed to dispatch email.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error sending payment link email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const cleanPhone = customerPhone.replace(/[^\d+]/g, '');
  const waPhone = cleanPhone.startsWith('+') ? cleanPhone.replace('+', '') : cleanPhone.startsWith('0') ? `94${cleanPhone.slice(1)}` : cleanPhone;
  const waText = encodeURIComponent(`Vanakkam from Azhai Boutique! Here is your bespoke payment link for "${title}" (LKR ${amount.toLocaleString()}): ${generatedUrl}`);
  const whatsappShareUrl = `https://wa.me/${waPhone || ''}?text=${waText}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl border border-[#C5A059]/40"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/20">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#701626]/10 flex items-center justify-center text-[#701626]">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#110B0E]">
                  Create Payments.lk Link
                </h3>
                <p className="text-[10px] text-[#6D6268]">
                  Shareable 3D Secure link for custom quotes, tailoring & VIP patrons
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form or Result View */}
          {!generatedUrl ? (
            <form onSubmit={handleGenerateLink} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider">
                  Payment Link Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Custom Silk Blouse Stitching - Ananya"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FCFBF8] border border-[#C5A059]/40 focus:outline-none focus:border-[#701626]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider">
                  Amount in LKR *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6D6268]">
                    LKR
                  </span>
                  <input
                    type="number"
                    required
                    min={100}
                    step={50}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-13 pr-4 py-2.5 text-sm font-mono font-bold rounded-xl bg-[#FCFBF8] border border-[#C5A059]/40 focus:outline-none focus:border-[#701626]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider">
                  Description / Order Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Royal Emerald Raw Silk Blouse, Maggam stone work on sleeves..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FCFBF8] border border-[#C5A059]/40 focus:outline-none focus:border-[#701626]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#C5A059]/20">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Generating Link...' : 'Generate Payments.lk Link'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-sm">Payment Link Ready!</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Patron can open this link on their smartphone or laptop to complete payment via Visa, Mastercard, AMEX, or LankaQR.
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-300 font-mono text-[11px] text-[#110B0E] break-all select-all">
                  {generatedUrl}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 px-4 py-2.5 bg-[#F7F4EE] hover:bg-[#DFBF77]/20 border border-[#C5A059]/40 text-[#701626] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                </button>

                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </a>

                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 text-[#110B0E] rounded-xl flex items-center justify-center transition-colors shrink-0"
                  title="Test Link in New Tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Direct Email Dispatch Section */}
              <div className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#DFBF77] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#701626] uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Payment Link via Email</span>
                  </span>
                  {emailSentSuccess && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" /> Dispatched!
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="patron@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-[#C5A059]/40 text-[#110B0E] focus:outline-none focus:border-[#701626]"
                  />
                  <button
                    type="button"
                    disabled={isSendingEmail || !recipientEmail.trim()}
                    onClick={handleSendLinkEmail}
                    className="px-4 py-2 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingEmail ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-[#C5A059]/20">
                <button
                  type="button"
                  onClick={() => {
                    setGeneratedUrl(null);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
