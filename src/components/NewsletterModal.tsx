import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Mail, ArrowRight } from 'lucide-react';
import { sendBrevoEmail, buildNewsletterWelcomeHtml } from '@/lib/brevo';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

const STORAGE_KEY = 'azhai_newsletter_dismissed';

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // If user is already logged in or previously dismissed / subscribed, skip
    if (isAuthenticated) return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    // Show after 10 seconds of browsing or on slight delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim() || 'Valued Patron';

      // 1. Sync to Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('newsletter_subscribers').upsert(
            {
              email: cleanEmail,
              name: cleanName,
              source: 'vip_popup',
              subscribed_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          );
        } catch {
          // graceful fallback
        }
      }

      // 2. Dispatch Welcome Email with ATELIER5 promo code via Brevo
      await sendBrevoEmail({
        to: [{ email: cleanEmail, name: cleanName }],
        subject: `✨ Welcome to the Azhai Circle — Enjoy 5% Privilege (Code: ATELIER5)`,
        htmlContent: buildNewsletterWelcomeHtml({
          customerName: cleanName,
          couponCode: 'ATELIER5',
        }),
      });

      setIsSuccess(true);
      localStorage.setItem(STORAGE_KEY, 'true');
      setTimeout(() => {
        setIsOpen(false);
      }, 4000);
    } catch (err) {
      console.warn('[Newsletter Subscribe Exception]:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative max-w-lg w-full bg-[#FCFBF8] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#DFBF77]"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#110B0E] flex items-center justify-center shadow-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Luxury Banner Image */}
          <div className="relative h-44 sm:h-48 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85"
              alt="Azhai Couture"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FCFBF8] via-[#FCFBF8]/30 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-[#701626] text-[#DFBF77] text-[9.5px] font-bold uppercase tracking-[0.2em] shadow-md border border-[#DFBF77]/40">
                Atelier Privilege
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 sm:p-8 pt-2 space-y-4 text-center">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3 py-4"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#110B0E]">
                  Welcome to the Circle!
                </h3>
                <p className="text-xs text-[#6D6268] max-w-sm mx-auto">
                  Your 5% privilege voucher has been sent to <strong>{email}</strong>. Use code{' '}
                  <span className="font-mono font-bold text-[#701626] text-sm">ATELIER5</span> at checkout.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                    Private Salon Invitation
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#110B0E]">
                    Receive 5% Off Your First Handloom Drape
                  </h3>
                  <p className="text-xs text-[#6D6268] leading-relaxed max-w-sm mx-auto">
                    Subscribe to receive private salon preview drops, master artisan releases, and bespoke styling advice by Preethi.
                  </p>
                </div>

                <form onSubmit={handleSubscribe} className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Your Full Name (optional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-[#110B0E] placeholder:text-[#6D6268]/50 focus:outline-none focus:border-[#701626]"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Your Email Address *"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-[#110B0E] placeholder:text-[#6D6268]/50 focus:outline-none focus:border-[#701626]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 bg-gradient-to-r from-[#701626] to-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-[#701626]/20 transition-all hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Unlocking Privilege...' : 'Unlock 5% Privilege Code'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#DFBF77]" />
                  </button>
                </form>

                <p className="text-[10px] text-[#6D6268]/80 pt-1">
                  Zero spam. Only genuine silk drops and invitations. Unsubscribe anytime.
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
