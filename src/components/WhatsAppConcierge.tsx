import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Sparkles, Send, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import LotusIcon from '@/components/LotusIcon';
import { useAdminStore, cleanWhatsAppDigits } from '@/store/admin';
import { useCartStore } from '@/store/cart';

export default function WhatsAppConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isCartOpen = useCartStore((s) => s.isOpen);
  const whatsappNumber = useAdminStore((s) => s.settings?.whatsappNumber);

  const isHomePage = location.pathname === '/';
  const [isVisible, setIsVisible] = useState(!isHomePage);

  useEffect(() => {
    if (!isHomePage) {
      setIsVisible(true);
      return;
    }

    const checkScroll = () => {
      // Fade in smoothly once scrolled down past the hero section
      const heroThreshold = Math.min(window.innerHeight * 0.6, 420);
      setIsVisible(window.scrollY > heroThreshold);
    };

    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, [isHomePage]);

  // Hide concierge on admin pages or when cart drawer is open
  if (location.pathname.startsWith('/admin') || isCartOpen) {
    return null;
  }

  const isProductPage = location.pathname.startsWith('/products/');

  const getCustomMessage = (topic?: string) => {
    let msg = `Hi Preethi, I am visiting the Azhai online boutique (${window.location.href}). `;
    if (topic === 'tailoring') {
      msg += 'I would love some advice regarding custom blouse & bespoke kurti tailoring.';
    } else if (topic === 'delivery') {
      msg += 'I would like to inquire about same-day Colombo delivery and island-wide shipping times.';
    } else if (topic === 'bridal') {
      msg += 'I am looking for bridal heirloom silks and would like to schedule a styling consultation.';
    } else {
      msg += 'I would love some personalized styling recommendations for an upcoming occasion.';
    }
    return encodeURIComponent(msg);
  };

  const handleOpenWhatsApp = (topic?: string) => {
    const activeDigits = cleanWhatsAppDigits(whatsappNumber);
    const url = `https://wa.me/${activeDigits}?text=${getCustomMessage(topic)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed ${isProductPage ? 'bottom-36 lg:bottom-8' : 'bottom-20 lg:bottom-6'} right-3.5 sm:right-6 z-50 print:hidden`}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="mb-3 w-[calc(100vw-2rem)] max-w-xs sm:max-w-sm bg-white rounded-3xl p-5 border border-[#DFBF77] shadow-2xl space-y-4 text-left relative overflow-hidden"
              >
            {/* Top Atelier Bar */}
            <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#701626] text-[#DFBF77] flex items-center justify-center border border-[#DFBF77]/40 shadow-sm shrink-0">
                  <LotusIcon size={20} variant="gold" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#110B0E] leading-tight">
                    Preethi's Styling Concierge
                  </h4>
                  <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Atelier Assistance
                  </p>
                  <p className="text-[10px] text-[#701626] font-semibold pt-0.5">
                    WhatsApp: {whatsappNumber || '+94 77 123 4567'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-[#F7F4EE] hover:bg-gray-200 text-[#6D6268] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Inquiries Menu */}
            <div className="space-y-1.5 text-xs">
              <p className="text-[11px] text-[#6D6268] leading-relaxed">
                How may our Colombo atelier assist your wardrobe today?
              </p>

              <button
                onClick={() => handleOpenWhatsApp('tailoring')}
                className="w-full p-2.5 rounded-xl bg-[#FCFBF8] hover:bg-[#701626]/5 border border-[#C5A059]/30 text-left font-semibold text-[#110B0E] hover:text-[#701626] transition-all flex items-center justify-between text-xs cursor-pointer group"
              >
                <span>✂️ Sizing & Bespoke Tailoring</span>
                <Send className="w-3 h-3 text-[#C5A059] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleOpenWhatsApp('bridal')}
                className="w-full p-2.5 rounded-xl bg-[#FCFBF8] hover:bg-[#701626]/5 border border-[#C5A059]/30 text-left font-semibold text-[#110B0E] hover:text-[#701626] transition-all flex items-center justify-between text-xs cursor-pointer group"
              >
                <span>💍 Bridal & Heirloom Silks</span>
                <Send className="w-3 h-3 text-[#C5A059] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleOpenWhatsApp('delivery')}
                className="w-full p-2.5 rounded-xl bg-[#FCFBF8] hover:bg-[#701626]/5 border border-[#C5A059]/30 text-left font-semibold text-[#110B0E] hover:text-[#701626] transition-all flex items-center justify-between text-xs cursor-pointer group"
              >
                <span>🚚 Colombo Same-Day Dispatch</span>
                <Send className="w-3 h-3 text-[#C5A059] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Direct WhatsApp CTA Button */}
            <button
              onClick={() => handleOpenWhatsApp()}
              className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Chat on WhatsApp</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 rounded-full bg-[#701626] text-white border-2 border-[#DFBF77] shadow-2xl flex items-center gap-2.5 cursor-pointer group transition-all"
        title="Chat with Preethi"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 text-[#DFBF77] group-hover:text-white transition-colors" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#701626]"></span>
        </div>
        <span className="text-xs font-bold tracking-wider hidden sm:inline text-[#F3E8CE]">
          Styling Concierge
        </span>
      </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
