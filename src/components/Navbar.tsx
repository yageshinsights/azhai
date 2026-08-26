import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Search, 
  MessageCircle,
  User as UserIcon,
  Package,
  Heart,
  LogOut,
  Sparkles,
  Scissors
} from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import SearchModal from '@/components/SearchModal';
import AccountDropdown from '@/components/AccountDropdown';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const { totalItems, toggleCart } = useCartStore();
  const { user, isAuthenticated, logout, wishlist, orders } = useAuthStore();
  const count = totalItems();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAccountDropdownOpen(false);
  }, [location]);

  const handleMobileLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#FCFBF8]/95 backdrop-blur-2xl border-b border-[#C5A059]/35 shadow-[0_10px_35px_rgba(112,22,38,0.06)]'
            : 'bg-[#FCFBF8]/90 backdrop-blur-md border-b border-[#C5A059]/20'
        }`}
        initial={{ y: -90 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 sm:h-24 flex items-center justify-between">
          
          {/* ── Left Side: Elevated Grand Brand Logo ── */}
          <div className="flex items-center gap-10 lg:gap-14">
            <Link to="/" className="flex items-center group shrink-0">
              <motion.div
                className="py-1 transition-all duration-300"
                whileHover={{ scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <img
                  src="/logo-light.png"
                  alt="Azhai Clothing by Preethi"
                  className="h-11 sm:h-16 w-auto object-contain drop-shadow-sm"
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              
              {/* 1. Kurties */}
              <Link
                to="/collections/kurties"
                className={`text-xs font-semibold uppercase tracking-[0.22em] transition-all py-1.5 ${
                  location.pathname === '/collections/kurties' 
                    ? 'text-[#701626] font-bold border-b-2 border-[#701626]' 
                    : 'text-[#110B0E]/80 hover:text-[#701626]'
                }`}
              >
                Kurties
              </Link>

              {/* 2. Sarees */}
              <Link
                to="/collections/sarees"
                className={`text-xs font-semibold uppercase tracking-[0.22em] transition-all py-1.5 ${
                  location.pathname === '/collections/sarees' 
                    ? 'text-[#701626] font-bold border-b-2 border-[#701626]' 
                    : 'text-[#110B0E]/80 hover:text-[#701626]'
                }`}
              >
                Sarees
              </Link>

              {/* 3. Shawls */}
              <Link
                to="/collections/shawls"
                className={`text-xs font-semibold uppercase tracking-[0.22em] transition-all py-1.5 ${
                  location.pathname === '/collections/shawls' 
                    ? 'text-[#701626] font-bold border-b-2 border-[#701626]' 
                    : 'text-[#110B0E]/80 hover:text-[#701626]'
                }`}
              >
                Shawls
              </Link>

              {/* 4. Tops */}
              <Link
                to="/collections/tops"
                className={`text-xs font-semibold uppercase tracking-[0.22em] transition-all py-1.5 ${
                  location.pathname === '/collections/tops' 
                    ? 'text-[#701626] font-bold border-b-2 border-[#701626]' 
                    : 'text-[#110B0E]/80 hover:text-[#701626]'
                }`}
              >
                Tops
              </Link>

              {/* 5. Custom Tailoring */}
              <Link
                to="/tailoring"
                className={`text-xs font-semibold uppercase tracking-[0.22em] transition-all py-1.5 flex items-center gap-1.5 ${
                  location.pathname === '/tailoring' 
                    ? 'text-[#701626] font-bold border-b-2 border-[#701626]' 
                    : 'text-[#701626] hover:text-[#8E1E34]'
                }`}
              >
                <Scissors className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Custom Tailoring</span>
              </Link>

              {/* 6. Our Story */}
              <Link
                to="/story"
                className={`text-xs font-semibold uppercase tracking-[0.22em] transition-all py-1.5 ${
                  location.pathname === '/story' 
                    ? 'text-[#701626] font-bold border-b-2 border-[#701626]' 
                    : 'text-[#110B0E]/80 hover:text-[#701626]'
                }`}
              >
                Our Story
              </Link>

            </nav>
          </div>

          {/* ── Right Navigation Utilities ── */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Search Button Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 text-[#110B0E]/80 hover:text-[#701626] transition-colors rounded-full hover:bg-black/5"
              title="Search Catalog"
            >
              <Search className="w-4 h-4 stroke-[1.8]" />
            </button>

            {/* User Account Button & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className={`p-2.5 transition-all rounded-full flex items-center gap-1.5 ${
                  isAuthenticated
                    ? 'bg-[#701626]/10 text-[#701626] hover:bg-[#701626]/20 border border-[#C5A059]/30'
                    : 'text-[#110B0E]/80 hover:text-[#701626] hover:bg-black/5'
                }`}
                title={isAuthenticated ? `Account: ${user?.fullName}` : 'Sign In / Account'}
              >
                <UserIcon className="w-4 h-4 stroke-[1.8]" />
                {isAuthenticated && user && (
                  <span className="hidden xl:inline text-[11px] font-bold max-w-[90px] truncate">
                    {user.fullName.split(' ')[0]}
                  </span>
                )}
              </button>

              {/* Account Dropdown Popover */}
              <AccountDropdown
                isOpen={accountDropdownOpen}
                onClose={() => setAccountDropdownOpen(false)}
              />
            </div>

            {/* WhatsApp Stylist Help */}
            <a
              href="https://wa.me/?text=Hi%20Preethi%2C%20I%20would%20like%20styling%20advice%20on%20Azhai%20Clothing%20pieces."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#701626] bg-[#701626]/8 border border-[#C5A059]/30 px-4 py-2 rounded-full hover:bg-[#701626]/12 transition-colors shadow-sm"
              title="Speak with Preethi / Sizing Advice"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#701626]" />
              <span>Styling Help</span>
            </a>

            {/* Shopping Bag Button */}
            <motion.button
              onClick={toggleCart}
              className="relative p-2.5 text-[#110B0E]/80 hover:text-[#701626] transition-colors rounded-full hover:bg-black/5"
              whileTap={{ scale: 0.92 }}
              title="View Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
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

            {/* Mobile Menu Hamburger */}
            <button
              className="lg:hidden p-2 text-[#110B0E]/80 hover:text-[#701626] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

      </motion.header>

      {/* ── SEARCH MODAL ── */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ── MOBILE SLIDE-OUT DRAWER ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-[#110B0E]/60 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-out Menu Panel */}
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm bg-[#FCFBF8] shadow-2xl flex flex-col justify-between overflow-y-auto lg:hidden border-r border-[#C5A059]/40"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div className="p-6 space-y-5">
                
                {/* Header with Logo & Close Button */}
                <div className="flex items-center justify-between pb-4 border-b border-[#C5A059]/30">
                  <img src="/logo-light.png" alt="Azhai" className="h-12 w-auto object-contain" />
                  <button onClick={() => setMobileOpen(false)} className="p-2 text-[#110B0E]/70 hover:text-[#701626]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Account Section in Mobile Menu */}
                {isAuthenticated && user ? (
                  <div className="p-3.5 bg-white rounded-2xl border border-[#C5A059]/30 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#701626] text-[#F3E8CE] flex items-center justify-center font-display text-base font-bold">
                        {user.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#110B0E] truncate font-display">
                          {user.fullName}
                        </p>
                        <p className="text-[10px] text-[#6D6268] truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#C5A059]/15">
                      <Link
                        to="/account?tab=orders"
                        onClick={() => setMobileOpen(false)}
                        className="p-2 bg-[#F7F4EE] rounded-xl text-[11px] font-bold text-[#110B0E] flex items-center gap-1.5 justify-center"
                      >
                        <Package className="w-3.5 h-3.5 text-[#701626]" /> Orders ({orders.length})
                      </Link>
                      <Link
                        to="/account?tab=wishlist"
                        onClick={() => setMobileOpen(false)}
                        className="p-2 bg-[#F7F4EE] rounded-xl text-[11px] font-bold text-[#110B0E] flex items-center gap-1.5 justify-center"
                      >
                        <Heart className="w-3.5 h-3.5 text-[#701626]" /> Wishlist ({wishlist.length})
                      </Link>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Link
                        to="/account"
                        onClick={() => setMobileOpen(false)}
                        className="text-xs font-bold text-[#701626] hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Dashboard
                      </Link>
                      <button
                        onClick={handleMobileLogout}
                        className="text-[11px] text-rose-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <LogOut className="w-3 h-3" /> Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-white rounded-2xl border border-[#C5A059]/30 space-y-2">
                    <p className="text-xs font-bold text-[#110B0E]">Welcome to Azhai Atelier</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="py-2 bg-[#701626] text-white text-center text-xs font-bold rounded-xl shadow-sm"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileOpen(false)}
                        className="py-2 bg-[#F7F4EE] border border-[#C5A059]/30 text-[#110B0E] text-center text-xs font-bold rounded-xl"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                )}

                {/* Quick Search Trigger */}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setSearchOpen(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-[#F7F4EE] rounded-xl border border-[#C5A059]/30 text-xs text-[#6D6268] text-left"
                >
                  <Search className="w-4 h-4 text-[#701626]" />
                  <span>Search kurties, sarees, shawls, tops...</span>
                </button>

                {/* Simple Menu List */}
                <div className="space-y-3 divide-y divide-[#C5A059]/20">
                  
                  {/* The 4 Core Categories */}
                  <div className="pt-2 space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">The Collections</p>
                    <Link to="/collections/kurties" className="block text-lg font-display font-bold text-[#110B0E] hover:text-[#701626]">
                      👗 Kurties
                    </Link>
                    <Link to="/collections/sarees" className="block text-lg font-display font-bold text-[#110B0E] hover:text-[#701626]">
                      🥻 Sarees
                    </Link>
                    <Link to="/collections/shawls" className="block text-lg font-display font-bold text-[#110B0E] hover:text-[#701626]">
                      🧣 Shawls
                    </Link>
                    <Link to="/collections/tops" className="block text-lg font-display font-bold text-[#110B0E] hover:text-[#701626]">
                      🌸 Tops
                    </Link>
                  </div>

                  {/* Bespoke Custom Tailoring */}
                  <div className="pt-4">
                    <Link
                      to="/tailoring"
                      onClick={() => setMobileOpen(false)}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-[#701626] to-[#8E1E34] text-white flex items-center justify-between shadow-md"
                    >
                      <div className="flex items-center gap-2.5">
                        <Scissors className="w-4 h-4 text-[#DFBF77]" />
                        <div>
                          <p className="font-display text-sm font-bold">Custom Tailoring</p>
                          <p className="text-[10px] text-white/80">Made-to-Measure Studio</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-white/20 text-[#DFBF77] font-bold px-2 py-0.5 rounded-full uppercase">
                        Bespoke
                      </span>
                    </Link>
                  </div>

                  {/* Our Story */}
                  <div className="pt-4">
                    <Link
                      to="/story"
                      className="block py-2 font-display text-lg font-bold text-[#110B0E] hover:text-[#701626]"
                    >
                      Our Story
                    </Link>
                  </div>

                </div>

              </div>

              {/* Bottom Drawer Footer */}
              <div className="p-6 border-t border-[#C5A059]/30 bg-[#F7F4EE] space-y-3">
                <a
                  href="https://wa.me/?text=Hi%20Preethi%2C%20I%20would%20like%20styling%20advice%20on%20Azhai%20Clothing."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#701626] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-xl flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Stylist</span>
                </a>
                <p className="text-[10px] text-center text-[#6D6268]">Use Code <strong>AZHAI10</strong> for 10% Off</p>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
