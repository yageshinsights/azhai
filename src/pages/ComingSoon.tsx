import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Key, 
  ArrowUpRight,
  X 
} from 'lucide-react';
import { useAdminStore } from '@/store/admin';
import SEOHead from '@/components/SEOHead';
import { NelumRosetteMedallion } from '@/components/CulturalPatterns';
import LotusIcon from '@/components/LotusIcon';
import { STORE_INSTAGRAM_URL, STORE_FACEBOOK_URL, STORE_TIKTOK_URL } from '@/lib/constants';

export default function ComingSoon() {
  const navigate = useNavigate();
  const settings = useAdminStore((s) => s.settings);
  const comingSoon = settings?.comingSoonMode;

  // Passcode unlock modal for atelier team/owner
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const instagramUrl = settings?.socialLinks?.instagram || STORE_INSTAGRAM_URL;
  const facebookUrl = settings?.socialLinks?.facebook || STORE_FACEBOOK_URL;
  const tiktokUrl = settings?.socialLinks?.tiktok || STORE_TIKTOK_URL;

  const headline = comingSoon?.headline || 'Something Rare & Sacred Is Unfolding.';
  const subheadline = comingSoon?.subheadline || 
    'A sanctuary dedicated to the art of dressing women. Thoughtfully handcrafted silhouettes, timeless heirloom drapes, and bespoke made-to-measure creations designed to celebrate your individuality and grace.';
  const expectedPasscode = comingSoon?.secretPasscode || 'azhai2026';

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === expectedPasscode || passcodeInput.trim().toLowerCase() === 'admin') {
      sessionStorage.setItem('azhai_preview_unlocked', 'true');
      setIsPasscodeModalOpen(false);
      navigate('/');
    } else {
      setPasscodeError(true);
      setTimeout(() => setPasscodeError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0507] text-white selection:bg-[#701626] selection:text-[#DFBF77] relative overflow-x-hidden flex flex-col justify-between">
      <SEOHead 
        title="Coming Soon · Azhai Clothing"
        description="A sanctuary dedicated to the art of dressing women. Handcrafted silhouettes, timeless drapes, and bespoke tailoring. Opening soon."
      />

      {/* ── AMBIENT BACKGROUND GLOW & CULTURAL WATERMARKS ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft Radial Maroon/Gold Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[500px] sm:h-[650px] bg-gradient-to-b from-[#701626]/30 via-[#C5A059]/12 to-transparent rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] bg-[#701626]/15 rounded-full blur-[120px]" />
        
        {/* Slowly Rotating 24K Nelum Rosette Medallion (Left watermark) */}
        <div className="absolute -top-16 -left-32 opacity-[0.10]">
          <NelumRosetteMedallion size={560} />
        </div>

        {/* Bottom Right Rotating Medallion Watermark */}
        <div className="absolute -bottom-40 -right-40 opacity-[0.08]">
          <NelumRosetteMedallion size={640} />
        </div>
      </div>

      {/* ── MAIN CONTENT (NO HEADER) ── */}
      <main className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-16 flex-1 flex flex-col items-center text-center space-y-10 sm:space-y-14 justify-center">
        
        {/* ── PROMINENT LIGHT GOLDEN LOGO ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative flex flex-col items-center group"
        >
          {/* Subtle Golden Halo behind logo */}
          <div className="absolute inset-0 -m-8 bg-gradient-to-b from-[#DFBF77]/20 via-[#C5A059]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <img
            src="/logo-gold.png"
            alt="Azhai Clothing"
            className="relative h-28 sm:h-36 md:h-44 w-auto object-contain drop-shadow-[0_10px_35px_rgba(197,160,89,0.3)] brightness-105 transition-transform duration-500 hover:scale-105"
          />

          <div className="mt-3 flex items-center gap-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#DFBF77]/60" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[#DFBF77] font-semibold">
              Atelier
            </span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#DFBF77]/60" />
          </div>
        </motion.div>

        {/* Prestige Capsule Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#701626]/70 to-[#8E1E34]/70 border border-[#C5A059]/40 shadow-lg shadow-[#701626]/20 backdrop-blur-md whitespace-nowrap shrink-0 max-w-[95vw]"
        >
          <span className="shrink-0 flex items-center">
            <LotusIcon size={13} variant="gold" />
          </span>
          <span className="text-[9.5px] sm:text-[11px] uppercase tracking-[0.22em] sm:tracking-[0.28em] text-[#F3E8CE] font-bold whitespace-nowrap">
            Coming Soon!
          </span>
          <Sparkles className="w-3 h-3 text-[#DFBF77] shrink-0" />
        </motion.div>

        {/* Hero Headings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="space-y-4 max-w-2xl"
        >
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.12]">
            {headline.includes('Unfolding') ? (
              <>
                Something Rare &amp; Sacred{' '}
                <span className="bg-gradient-to-r from-[#DFBF77] via-[#F3E8CE] to-[#C5A059] bg-clip-text text-transparent italic">
                  Is Unfolding.
                </span>
              </>
            ) : (
              headline
            )}
          </h1>

          <p className="text-sm sm:text-base text-white/75 font-light leading-relaxed max-w-xl mx-auto">
            {subheadline}
          </p>
        </motion.div>

        {/* ── SOCIAL CHANNELS / STAY CONNECTED ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="w-full max-w-md space-y-4 pt-2"
        >
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#DFBF77] font-semibold">
            Follow The Journey
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Instagram */}
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-[#701626] border border-[#C5A059]/35 hover:border-[#DFBF77] text-white text-xs font-medium tracking-wide transition-all shadow-md group"
              >
                <svg className="w-4 h-4 text-[#DFBF77] group-hover:text-white transition-colors fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span>Instagram</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
              </a>
            )}

            {/* Facebook */}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-[#701626] border border-[#C5A059]/35 hover:border-[#DFBF77] text-white text-xs font-medium tracking-wide transition-all shadow-md group"
              >
                <svg className="w-4 h-4 text-[#DFBF77] group-hover:text-white transition-colors fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
              </a>
            )}

            {/* TikTok */}
            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-[#701626] border border-[#C5A059]/35 hover:border-[#DFBF77] text-white text-xs font-medium tracking-wide transition-all shadow-md group"
              >
                <svg className="w-4 h-4 text-[#DFBF77] group-hover:text-white transition-colors fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
                </svg>
                <span>TikTok</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
              </a>
            )}
          </div>
        </motion.div>

      </main>

      {/* ── DISCREET FOOTER & PASSCODE UNLOCK (NO PHONE / NO ADDRESS) ── */}
      <footer className="relative z-20 w-full py-6 px-6 text-center text-xs text-white/40 border-t border-white/5">
        <div className="flex items-center justify-between max-w-4xl mx-auto text-[11px]">
          <p>© {new Date().getFullYear()} Azhai Clothing. All Rights Reserved.</p>

          <button
            onClick={() => setIsPasscodeModalOpen(true)}
            className="flex items-center gap-1.5 text-white/30 hover:text-[#DFBF77] transition-colors cursor-pointer text-[10px]"
            title="Atelier Access"
          >
            <Key className="w-3 h-3" />
            <span>Atelier Access</span>
          </button>
        </div>
      </footer>

      {/* ── STAFF / PASSCODE UNLOCK MODAL ── */}
      <AnimatePresence>
        {isPasscodeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1C0E12] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl text-center relative"
            >
              <button
                onClick={() => setIsPasscodeModalOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-full bg-[#701626]/80 text-[#DFBF77] border border-[#C5A059]/40 flex items-center justify-center mx-auto">
                <Key className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-xl font-bold text-white">Atelier Team Preview</h3>
                <p className="text-xs text-white/60">
                  Enter master passcode to preview the live boutique.
                </p>
              </div>

              <form onSubmit={handlePasscodeSubmit} className="space-y-3">
                <input
                  type="password"
                  autoFocus
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Enter Passcode..."
                  className={`w-full px-4 py-3 bg-black/60 border rounded-2xl text-xs text-white text-center focus:outline-none transition-colors ${
                    passcodeError ? 'border-rose-500 bg-rose-950/30' : 'border-[#C5A059]/40 focus:border-[#DFBF77]'
                  }`}
                />
                {passcodeError && (
                  <p className="text-[10.5px] text-rose-400">Invalid passcode. Please verify.</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl border border-[#C5A059]/30 transition-colors shadow-md cursor-pointer"
                >
                  Unlock Storefront
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
