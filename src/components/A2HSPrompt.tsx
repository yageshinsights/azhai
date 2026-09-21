import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Sparkles, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'azhai_a2hs_dismissed_v1';

export default function A2HSPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // If running in standalone mode (already installed), do not show
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone) {
      return;
    }

    // Check if dismissed within last 7 days
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const parsed = parseInt(dismissedAt, 10);
      if (Date.now() - parsed < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Detect iOS device in Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua);
    if (isIosDevice && isSafari) {
      setIsIOS(true);
      // Wait 6 seconds before prompting iOS users
      const timer = setTimeout(() => setShowPrompt(true), 6000);
      return () => clearTimeout(timer);
    }

    // Chromium / Android PWA prompt handler
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 5 seconds of browsing
      setTimeout(() => setShowPrompt(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowPrompt(false);
      }
    } catch (err) {
      console.error('[A2HS prompt error]:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#FCFBF8] border border-[#C5A059]/40 shadow-2xl rounded-2xl p-4 sm:p-5 backdrop-blur-md"
        >
          <button
            onClick={handleDismiss}
            aria-label="Close install prompt"
            className="absolute top-3 right-3 p-1 text-[#6D6268] hover:text-[#110B0E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#701626] flex-shrink-0 flex items-center justify-center shadow-md border border-[#C5A059]/40 overflow-hidden">
              <img
                src="/pwa-192.png"
                alt="Azhai Emblem"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to text icon if logo image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] font-bold text-[#701626]">
                <Sparkles className="w-3 h-3 text-[#C5A059]" />
                <span>Atelier Web App</span>
              </div>
              <h4 className="text-sm font-serif font-bold text-[#110B0E] mt-0.5">
                Install Azhai Boutique
              </h4>
              <p className="text-xs text-[#6D6268] mt-1 leading-relaxed">
                Add to your home screen for quick order tracking, offline browsing, and seamless bespoke shopping.
              </p>

              {isIOS ? (
                <div className="mt-3 bg-[#F7F4EE] border border-[#C5A059]/30 rounded-xl p-2.5 text-[11px] text-[#110B0E] flex items-center gap-2">
                  <Share className="w-4 h-4 text-[#701626] flex-shrink-0" />
                  <span>
                    Tap <strong className="text-[#701626]">Share</strong> then select <strong className="text-[#701626]">'Add to Home Screen'</strong>
                  </span>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install App</span>
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-2 text-xs font-semibold text-[#6D6268] hover:text-[#110B0E] rounded-lg transition-colors"
                  >
                    Not now
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
