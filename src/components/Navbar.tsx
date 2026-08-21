import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, toggleCart } = useCartStore();
  const count = totalItems();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const links = [
    { to: '/collections', label: 'The Collections' },
    { to: '/story', label: 'Our Story' },
  ];

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#FCFBF8]/90 backdrop-blur-2xl border-b border-[#C5A059]/30 shadow-[0_8px_30px_rgba(112,22,38,0.04)]'
            : 'bg-[#FCFBF8]/75 backdrop-blur-md border-b border-[#C5A059]/15'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Left Navigation */}
          <nav className="hidden md:flex items-center gap-9">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-[11px] font-semibold uppercase tracking-[0.25em] transition-all duration-300 relative py-1 ${
                  location.pathname.startsWith(to)
                    ? 'text-[#701626] font-bold'
                    : 'text-[#110B0E]/75 hover:text-[#701626]'
                }`}
              >
                <span>{label}</span>
                {location.pathname.startsWith(to) && (
                  <motion.div layoutId="navIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#701626]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Center Brand Logo with Jewel-like Framing */}
          <Link to="/" className="flex items-center justify-center group absolute left-1/2 -translate-x-1/2">
            <motion.div
              className="py-1 px-3 rounded-2xl transition-all duration-300"
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <img
                src="/logo-light.png"
                alt="Azhai Clothing by Preethi"
                className="h-11 sm:h-12 w-auto object-contain"
              />
            </motion.div>
          </Link>

          {/* Right Navigation & Bag */}
          <div className="flex items-center gap-6">
            <Link
              to="/collections"
              className="hidden lg:inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#701626] bg-[#701626]/8 border border-[#C5A059]/30 px-4 py-1.5 rounded-full hover:bg-[#701626]/12 transition-colors shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-[#C5A059]" />
              <span>Festive '26</span>
            </Link>

            {/* Shopping Bag Button */}
            <motion.button
              onClick={toggleCart}
              className="relative p-2.5 text-[#110B0E]/80 hover:text-[#701626] transition-colors rounded-full hover:bg-black/5"
              whileTap={{ scale: 0.92 }}
              title="View Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.7]" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#701626] text-white text-[9px] font-bold flex items-center justify-center shadow-md border border-[#FCFBF8]"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-[#110B0E]/80 hover:text-[#701626] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-[#FCFBF8]/98 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 pt-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {links.map(({ to, label }, i) => (
              <motion.div
                key={`${to}-${label}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={to}
                  className="font-display text-3xl font-bold text-[#110B0E] hover:text-[#701626] transition-colors"
                >
                  {label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
