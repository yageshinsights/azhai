import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Sparkles, 
  Search, 
  ChevronDown, 
  ArrowRight, 
  Feather, 
  Crown, 
  MessageCircle
} from 'lucide-react';
import { useCartStore } from '@/store/cart';
import SearchModal from '@/components/SearchModal';
import { COLLECTIONS } from '@/lib/data';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<'edit' | 'collections' | 'atelier' | null>(null);
  
  // Mobile accordion states
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  const { totalItems, toggleCart } = useCartStore();
  const count = totalItems();
  const location = useLocation();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveMegaMenu(null);
  }, [location]);

  const handleMouseEnter = (menu: 'edit' | 'collections' | 'atelier') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMegaMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 180);
  };

  const toggleMobileSection = (name: string) => {
    setMobileAccordion(mobileAccordion === name ? null : name);
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#FCFBF8]/95 backdrop-blur-2xl border-b border-[#C5A059]/30 shadow-[0_8px_30px_rgba(112,22,38,0.04)]'
            : 'bg-[#FCFBF8]/85 backdrop-blur-md border-b border-[#C5A059]/15'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        onMouseLeave={handleMouseLeave}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          
          {/* ── Left Side: Brand Logo + Desktop Nav ── */}
          <div className="flex items-center gap-10">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center group shrink-0">
              <motion.div
                className="py-1 rounded-2xl transition-all duration-300"
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

            {/* Desktop Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-8">
              
              {/* 1. THE EDIT (Mega-Menu) */}
              <div 
                className="relative py-7"
                onMouseEnter={() => handleMouseEnter('edit')}
              >
                <button className={`text-[11px] font-semibold uppercase tracking-[0.25em] transition-all flex items-center gap-1.5 ${
                  activeMegaMenu === 'edit' ? 'text-[#701626] font-bold' : 'text-[#110B0E]/80 hover:text-[#701626]'
                }`}>
                  <span>The Edit</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeMegaMenu === 'edit' ? 'rotate-180 text-[#701626]' : ''}`} />
                </button>
              </div>

              {/* 2. THE COLLECTIONS (Mega-Menu) */}
              <div 
                className="relative py-7"
                onMouseEnter={() => handleMouseEnter('collections')}
              >
                <button className={`text-[11px] font-semibold uppercase tracking-[0.25em] transition-all flex items-center gap-1.5 ${
                  activeMegaMenu === 'collections' || location.pathname.startsWith('/collections') ? 'text-[#701626] font-bold' : 'text-[#110B0E]/80 hover:text-[#701626]'
                }`}>
                  <span>Collections</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeMegaMenu === 'collections' ? 'rotate-180 text-[#701626]' : ''}`} />
                </button>
              </div>

              {/* 3. THE ATELIER (Dropdown) */}
              <div 
                className="relative py-7"
                onMouseEnter={() => handleMouseEnter('atelier')}
              >
                <button className={`text-[11px] font-semibold uppercase tracking-[0.25em] transition-all flex items-center gap-1.5 ${
                  activeMegaMenu === 'atelier' ? 'text-[#701626] font-bold' : 'text-[#110B0E]/80 hover:text-[#701626]'
                }`}>
                  <span>The Atelier</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeMegaMenu === 'atelier' ? 'rotate-180 text-[#701626]' : ''}`} />
                </button>
              </div>

              {/* 4. OUR STORY (Direct Link) */}
              <Link
                to="/story"
                className={`text-[11px] font-semibold uppercase tracking-[0.25em] transition-all py-1 ${
                  location.pathname === '/story' ? 'text-[#701626] font-bold' : 'text-[#110B0E]/80 hover:text-[#701626]'
                }`}
              >
                Our Story
              </Link>

            </nav>
          </div>

          {/* ── Right Navigation Utilities ── */}
          <div className="flex items-center gap-4 sm:gap-5">
            
            {/* Search Button Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 text-[#110B0E]/80 hover:text-[#701626] transition-colors rounded-full hover:bg-black/5"
              title="Search Catalog"
            >
              <Search className="w-4 h-4 stroke-[1.8]" />
            </button>

            {/* WhatsApp Stylist Help */}
            <a
              href="https://wa.me/?text=Hi%20Preethi%2C%20I%20would%20like%20styling%20advice%20on%20Azhai%20Clothing%20pieces."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#701626] bg-[#701626]/8 border border-[#C5A059]/30 px-3.5 py-1.5 rounded-full hover:bg-[#701626]/12 transition-colors shadow-sm"
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

        {/* ── DESKTOP MEGA-MENU DROPDOWNS ── */}
        <AnimatePresence>
          {activeMegaMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="hidden lg:block absolute top-full left-0 right-0 bg-[#FCFBF8] border-b border-[#C5A059]/30 shadow-2xl z-40 py-10 px-8"
              onMouseEnter={() => handleMouseEnter(activeMegaMenu)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="max-w-7xl mx-auto">
                
                {/* ── MEGA MENU: THE EDIT ── */}
                {activeMegaMenu === 'edit' && (
                  <div className="grid grid-cols-12 gap-10 items-start">
                    
                    {/* Column 1: By Collection Silhouette */}
                    <div className="col-span-4 space-y-4">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[#701626] font-bold border-b border-[#C5A059]/20 pb-2">
                        Shop By Collection
                      </p>
                      <ul className="space-y-2.5 text-xs text-[#110B0E]">
                        <li>
                          <Link to="/collections" className="hover:text-[#701626] hover:translate-x-1 transition-all inline-block font-semibold">
                            ✦ All 5 Collections
                          </Link>
                        </li>
                        <li>
                          <Link to="/collections/kurtis" className="hover:text-[#701626] hover:translate-x-1 transition-all inline-block">
                            Kurtis & Sets
                          </Link>
                        </li>
                        <li>
                          <Link to="/collections/shalwars" className="hover:text-[#701626] hover:translate-x-1 transition-all inline-block">
                            Shalwar Kameez Suits
                          </Link>
                        </li>
                        <li>
                          <Link to="/collections/tops" className="hover:text-[#701626] hover:translate-x-1 transition-all inline-block">
                            Tops & Bustiers
                          </Link>
                        </li>
                        <li>
                          <Link to="/collections/bottoms" className="hover:text-[#701626] hover:translate-x-1 transition-all inline-block">
                            Bottoms, Trousers & Palazzos
                          </Link>
                        </li>
                        <li>
                          <Link to="/collections/accessories" className="hover:text-[#701626] hover:translate-x-1 transition-all inline-block">
                            Jewelry & Potli Accessories
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 2: By Occasion */}
                    <div className="col-span-4 space-y-4">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[#701626] font-bold border-b border-[#C5A059]/20 pb-2">
                        Shop By Occasion & Mood
                      </p>
                      <ul className="space-y-2.5 text-xs text-[#110B0E]">
                        <li>
                          <Link to="/collections" className="hover:text-[#701626] hover:translate-x-1 transition-all inline-flex items-center gap-2">
                            <span>🌸 Golden Hour Sundowners</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/collections" className="hover:text-[#701626] hover:translate-x-1 transition-all inline-flex items-center gap-2">
                            <span>💃 Sangeet & Cocktail Twirl</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/collections" className="hover:text-[#701626] hover:translate-x-1 transition-all inline-flex items-center gap-2">
                            <span>🪷 Intimate Temple Pooja & Haldi</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/collections" className="hover:text-[#701626] hover:translate-x-1 transition-all inline-flex items-center gap-2">
                            <span>✨ Best Friend’s Day Wedding</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/collections" className="hover:text-[#701626] hover:translate-x-1 transition-all inline-flex items-center gap-2">
                            <span>🎓 College Festivities & Casual Chic</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 3: Featured Lookbook Card */}
                    <div className="col-span-4 bg-[#F7F4EE] rounded-2xl p-4 border border-[#C5A059]/30 flex gap-4 items-center">
                      <div className="w-24 h-32 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm">
                        <img 
                          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80" 
                          alt="Maroon Corset Kurta" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-[#701626] font-bold bg-[#701626]/10 px-2.5 py-0.5 rounded-full">
                          Trending on Reels
                        </span>
                        <h4 className="font-display text-base font-bold text-[#110B0E] leading-snug">
                          The Maroon Corset Set
                        </h4>
                        <p className="text-[11px] text-[#6D6268]">Pure Handloom Kanjivaram</p>
                        <Link 
                          to="/products/maroon-corset-kurti-set" 
                          className="text-xs text-[#701626] font-bold inline-flex items-center gap-1 hover:underline pt-1"
                        >
                          <span>Shop The Look</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                  </div>
                )}

                {/* ── MEGA MENU: THE COLLECTIONS (5 COLLECTIONS) ── */}
                {activeMegaMenu === 'collections' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-3">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[#701626] font-bold">
                        The 5 Signature Collections · 2026
                      </p>
                      <Link to="/collections" className="text-xs text-[#701626] font-bold hover:underline flex items-center gap-1">
                        <span>View All Collections</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                      {COLLECTIONS.map(col => (
                        <Link
                          key={col.id}
                          to={`/collections/${col.slug}`}
                          className="group block relative rounded-2xl overflow-hidden aspect-[4/5] bg-white border border-[#C5A059]/30 shadow-sm hover:shadow-xl transition-all"
                        >
                          <img src={col.heroImage} alt={col.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#110B0E]/90 via-[#110B0E]/20 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 text-white space-y-0.5">
                            <span className="text-[8px] uppercase tracking-wider text-[#DFBF77] font-semibold">{col.season}</span>
                            <h4 className="font-display text-base font-bold group-hover:text-[#DFBF77] transition-colors leading-tight">{col.name}</h4>
                            <p className="text-[10px] text-white/70">{col.count} Pieces</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── MEGA MENU: THE ATELIER ── */}
                {activeMegaMenu === 'atelier' && (
                  <div className="grid grid-cols-3 gap-8">
                    
                    <Link to="/#craft" className="p-5 rounded-2xl bg-[#F7F4EE] hover:bg-white border border-[#C5A059]/30 hover:border-[#701626]/40 transition-all space-y-2 group shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-[#701626]/10 flex items-center justify-center text-[#701626]">
                        <Feather className="w-5 h-5" />
                      </div>
                      <h4 className="font-display text-lg font-bold text-[#110B0E] group-hover:text-[#701626] transition-colors">
                        Tactile Fabric Explorer
                      </h4>
                      <p className="text-xs text-[#6D6268] leading-relaxed">
                        Discover Mulberry Silk, Sheer Organza, and 32-Kali Raw Silk weave GSMs & drape textures.
                      </p>
                    </Link>

                    <Link to="/#quiz" className="p-5 rounded-2xl bg-[#F7F4EE] hover:bg-white border border-[#C5A059]/30 hover:border-[#701626]/40 transition-all space-y-2 group shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-[#701626]/10 flex items-center justify-center text-[#701626]">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h4 className="font-display text-lg font-bold text-[#110B0E] group-hover:text-[#701626] transition-colors">
                        Find Your Festive Era
                      </h4>
                      <p className="text-xs text-[#6D6268] leading-relaxed">
                        Take our 30-second aesthetic match quiz to discover the silhouette tailored to your celebration.
                      </p>
                    </Link>

                    <a 
                      href="https://wa.me/?text=Hi%20Preethi%2C%20I%20would%20like%20to%20inquire%20about%20bespoke%20sizing%20and%20custom%20orders."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-5 rounded-2xl bg-[#F7F4EE] hover:bg-white border border-[#C5A059]/30 hover:border-[#701626]/40 transition-all space-y-2 group shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#701626]/10 flex items-center justify-center text-[#701626]">
                        <Crown className="w-5 h-5" />
                      </div>
                      <h4 className="font-display text-lg font-bold text-[#110B0E] group-hover:text-[#701626] transition-colors">
                        Bespoke Atelier Concierge
                      </h4>
                      <p className="text-xs text-[#6D6268] leading-relaxed">
                        Custom blouse stitching, personalized measurements, and direct consultation with Preethi.
                      </p>
                    </a>

                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <div className="p-6 space-y-6">
                
                {/* Header with Logo & Close Button */}
                <div className="flex items-center justify-between pb-4 border-b border-[#C5A059]/30">
                  <img src="/logo-light.png" alt="Azhai" className="h-10 w-auto object-contain" />
                  <button onClick={() => setMobileOpen(false)} className="p-2 text-[#110B0E]/70 hover:text-[#701626]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Search Trigger */}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setSearchOpen(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-[#F7F4EE] rounded-xl border border-[#C5A059]/30 text-xs text-[#6D6268] text-left"
                >
                  <Search className="w-4 h-4 text-[#701626]" />
                  <span>Search kurtis, shalwars, tops, bottoms...</span>
                </button>

                {/* Accordion Menu List */}
                <div className="space-y-3 divide-y divide-[#C5A059]/20">
                  
                  {/* 1. The Edit */}
                  <div className="pt-2">
                    <button
                      onClick={() => toggleMobileSection('edit')}
                      className="w-full flex items-center justify-between py-2 text-left font-display text-xl font-bold text-[#110B0E]"
                    >
                      <span>The Edit</span>
                      <ChevronDown className={`w-4 h-4 text-[#701626] transition-transform ${mobileAccordion === 'edit' ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileAccordion === 'edit' && (
                      <div className="pl-3 py-2 space-y-2.5 text-xs text-[#6D6268]">
                        <Link to="/collections" className="block hover:text-[#701626]">✦ View All 5 Collections</Link>
                        <Link to="/collections/kurtis" className="block hover:text-[#701626]">Kurtis</Link>
                        <Link to="/collections/shalwars" className="block hover:text-[#701626]">Shalwars</Link>
                        <Link to="/collections/tops" className="block hover:text-[#701626]">Tops</Link>
                        <Link to="/collections/bottoms" className="block hover:text-[#701626]">Bottoms</Link>
                        <Link to="/collections/accessories" className="block hover:text-[#701626]">Accessories</Link>
                      </div>
                    )}
                  </div>

                  {/* 2. The Collections */}
                  <div className="pt-2">
                    <button
                      onClick={() => toggleMobileSection('collections')}
                      className="w-full flex items-center justify-between py-2 text-left font-display text-xl font-bold text-[#110B0E]"
                    >
                      <span>The Collections</span>
                      <ChevronDown className={`w-4 h-4 text-[#701626] transition-transform ${mobileAccordion === 'collections' ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileAccordion === 'collections' && (
                      <div className="pl-3 py-2 space-y-2.5 text-xs text-[#6D6268]">
                        <Link to="/collections/kurtis" className="block hover:text-[#701626]">Kurtis</Link>
                        <Link to="/collections/shalwars" className="block hover:text-[#701626]">Shalwars</Link>
                        <Link to="/collections/tops" className="block hover:text-[#701626]">Tops</Link>
                        <Link to="/collections/bottoms" className="block hover:text-[#701626]">Bottoms</Link>
                        <Link to="/collections/accessories" className="block hover:text-[#701626]">Accessories</Link>
                      </div>
                    )}
                  </div>

                  {/* 3. The Atelier */}
                  <div className="pt-2">
                    <button
                      onClick={() => toggleMobileSection('atelier')}
                      className="w-full flex items-center justify-between py-2 text-left font-display text-xl font-bold text-[#110B0E]"
                    >
                      <span>The Atelier</span>
                      <ChevronDown className={`w-4 h-4 text-[#701626] transition-transform ${mobileAccordion === 'atelier' ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileAccordion === 'atelier' && (
                      <div className="pl-3 py-2 space-y-2.5 text-xs text-[#6D6268]">
                        <Link to="/#craft" className="block hover:text-[#701626]">Tactile Fabric Explorer</Link>
                        <Link to="/#quiz" className="block hover:text-[#701626]">Style Personality Quiz</Link>
                      </div>
                    )}
                  </div>

                  {/* 4. Our Story */}
                  <div className="pt-2">
                    <Link
                      to="/story"
                      className="block py-2 font-display text-xl font-bold text-[#110B0E] hover:text-[#701626]"
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
