import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Camera, 
  Feather, 
  Sun, 
  Crown,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import FabricExplorer from '@/components/FabricExplorer';
import StyleQuiz from '@/components/StyleQuiz';
import { 
  LiyawelDivider 
} from '@/components/CulturalPatterns';
import { PRODUCTS, COLLECTIONS } from '@/lib/data';

const CATEGORY_FILTERS = [
  { label: '✨ All Pieces', value: 'all' },
  { label: '👗 Kurties', value: 'kurties' },
  { label: '🥻 Sarees', value: 'sarees' },
  { label: '🧣 Shawls', value: 'shawls' },
  { label: '🌸 Tops', value: 'tops' },
];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [direction, setDirection] = useState(1);
  const isHovered = useRef(false);

  // Auto-advance slider every 5.5 seconds (paused on hover)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovered.current) {
        setDirection(1);
        setActiveSlide(prev => (prev + 1) % COLLECTIONS.length);
      }
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setDirection(1);
    setActiveSlide(prev => (prev + 1) % COLLECTIONS.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveSlide(prev => (prev - 1 + COLLECTIONS.length) % COLLECTIONS.length);
  };

  const currentCategory = COLLECTIONS[activeSlide];

  const filteredProducts = PRODUCTS.filter(p => {
    if (selectedCategory === 'all') return true;
    return p.categories.some(c => c.slug === selectedCategory);
  });

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#110B0E]">

      {/* ── FIT-TO-SCREEN EDITORIAL CATEGORY HERO ── */}
      <section 
        className="relative w-full h-[100svh] min-h-[580px] sm:min-h-[640px] pt-18 sm:pt-24 flex flex-col justify-between overflow-hidden bg-[#110B0E]"
        onMouseEnter={() => { isHovered.current = true; }}
        onMouseLeave={() => { isHovered.current = false; }}
      >
        
        {/* Background Category Sliding Imagery */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentCategory.id}
            custom={direction}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0 z-0"
          >
            <img
              src={currentCategory.heroImage}
              alt={currentCategory.name}
              className="w-full h-full object-cover object-center"
            />
            {/* Cinematic Luxury Vignette Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#110B0E] via-[#110B0E]/60 to-[#110B0E]/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#110B0E]/85 via-[#110B0E]/30 to-transparent hidden md:block" />
          </motion.div>
        </AnimatePresence>

        {/* ── Content Area: Editorial Narrative & Category Showcase (Naturally filling screen) ── */}
        <div className="relative z-20 px-4 sm:px-8 max-w-7xl mx-auto w-full my-auto py-4 sm:py-6">
          <div className="max-w-2xl text-left space-y-3.5 sm:space-y-4">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCategory.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.45 }}
                className="space-y-3 sm:space-y-3.5"
              >
                {/* Compact Combined Badge */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-[#701626]/90 backdrop-blur-md text-[#F3E8CE] px-3.5 py-1.5 rounded-full text-[9px] sm:text-[10px] uppercase tracking-[0.25em] font-bold shadow-md border border-[#C5A059]/40">
                    <Sparkles className="w-3 h-3 text-[#DFBF77]" />
                    <span>{currentCategory.season} · {currentCategory.count} Pieces</span>
                  </span>
                </div>

                {/* Title and Tagline (Larger on Mobile) */}
                <div className="space-y-1">
                  <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-white leading-tight tracking-tight drop-shadow-md">
                    {currentCategory.name}
                  </h1>
                  <p className="font-script text-3xl sm:text-4xl lg:text-5xl text-[#DFBF77] font-normal leading-tight pt-0.5">
                    {currentCategory.tagline}
                  </p>
                </div>

                {/* Description (Visible on Mobile to fill vertical space beautifully) */}
                <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed max-w-lg pt-1 drop-shadow-sm block">
                  {currentCategory.description}
                </p>

                {/* Single Compact Action Row */}
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to={`/collections/${currentCategory.slug}`}
                    className="px-7 sm:px-8 py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-full transition-all shadow-xl shadow-black/50 border border-[#C5A059]/50 hover:scale-105 flex items-center gap-2"
                  >
                    <span>Explore {currentCategory.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {/* Prev/Next arrows in the same single row */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                      title="Previous Category"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#701626] hover:bg-[#8E1E34] text-white backdrop-blur-xl border border-[#C5A059]/50 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                      title="Next Category"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>

        {/* ── 3. Bottom Minimalist Luxury Text Tabs (01 Kurties · 02 Sarees · 03 Shawls · 04 Tops) ── */}
        <div className="relative z-20 px-4 sm:px-8 pb-10 sm:pb-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between gap-1 sm:gap-2 p-1.5 rounded-full bg-black/45 backdrop-blur-2xl border border-[#C5A059]/35 shadow-2xl">
              {COLLECTIONS.map((col, idx) => {
                const isActive = activeSlide === idx;
                return (
                  <button
                    key={col.id}
                    onClick={() => {
                      setDirection(idx > activeSlide ? 1 : -1);
                      setActiveSlide(idx);
                    }}
                    className={`relative flex-1 py-2 sm:py-2.5 px-2 sm:px-4 rounded-full text-center transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-white/60 hover:text-white/90'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeHeroCategoryTab"
                        className="absolute inset-0 bg-[#701626] rounded-full border border-[#C5A059]/60 shadow-lg shadow-[#701626]/40"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                      <span className={`text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-[#DFBF77]' : 'text-white/40'}`}>
                        0{idx + 1}
                      </span>
                      <span className="font-display text-xs sm:text-base font-bold tracking-wide">
                        {col.name}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </section>

      {/* ── LUXURY VALUE PILLARS ── */}
      <section className="border-y border-[#C5A059]/30 bg-[#F7F4EE]/60 backdrop-blur-md py-8 sm:py-12 px-4 sm:px-8 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {[
            { icon: Sparkles, title: 'Island-wide Express Delivery', desc: 'Free on all orders over LKR 15,000 across Sri Lanka' },
            { icon: Feather, title: 'Cloud-Light Mulberry Silks', desc: 'Zero synthetic blends · Pure handloom drape' },
            { icon: Sun, title: 'Made for Aesthetic Memories', desc: 'Flattering cuts designed for golden hour radiance' },
            { icon: Crown, title: 'Bespoke Craft by Preethi', desc: 'Limited curated runs · Handcrafted with love' },
          ].map((f, i) => (
            <div 
              key={i} 
              className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#C5A059]/35 shadow-[0_8px_25px_rgba(112,22,38,0.03)] hover:shadow-md transition-all duration-300 flex flex-col items-center text-center space-y-2.5 group"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#701626]/8 group-hover:bg-[#701626] text-[#701626] group-hover:text-white flex items-center justify-center shrink-0 border border-[#C5A059]/35 shadow-sm transition-all duration-300">
                <f.icon className="w-5 h-5 transition-colors duration-300" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display sm:font-sans text-xs sm:text-sm font-bold text-[#110B0E] leading-tight">
                  {f.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-[#6D6268] font-light leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SHOP BY CATEGORY (PRODUCT GRID) ── */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative z-10">
        
        <div className="text-center space-y-2 mb-8">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold">
            Curated Catalog
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#110B0E]">
            Shop All Pieces
          </h2>
          <p className="text-xs sm:text-sm text-[#6D6268] max-w-md mx-auto font-light leading-relaxed">
            Thoughtfully designed with simple, graceful silhouettes to make you feel effortless and radiant.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pb-10">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                selectedCategory === cat.value
                  ? 'bg-[#701626] text-white shadow-lg shadow-[#701626]/20 border border-[#C5A059]/50 scale-105'
                  : 'bg-white text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/30 hover:border-[#701626]/40 shadow-sm'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((prod, i) => (
            <ProductCard key={prod.id} product={prod} index={i} />
          ))}
        </div>
      </section>

      {/* Liyawel Cultural Vine Divider */}
      <div className="max-w-4xl mx-auto px-5">
        <LiyawelDivider />
      </div>

      {/* ── THE 4 SIGNATURE COLLECTIONS DIRECTORY ── */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold">Signature Silhouettes</span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#110B0E]">The Collections</h2>
          </div>
          <Link to="/collections" className="text-xs uppercase tracking-[0.2em] text-[#701626] font-bold hover:underline flex items-center gap-1.5">
            <span>View All 4 Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLLECTIONS.map((col) => (
            <Link
              key={col.id}
              to={`/collections/${col.slug}`}
              className="group block relative rounded-[2rem] overflow-hidden aspect-[3/4] bg-white border border-[#C5A059]/30 shadow-md hover:shadow-2xl transition-all duration-500"
            >
              <img
                src={col.heroImage}
                alt={col.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#110B0E]/90 via-[#110B0E]/20 to-transparent" />
              
              <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[8px] text-[#701626] font-bold uppercase tracking-[0.2em] shadow-md border border-[#C5A059]/40">
                {col.season}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1 text-white">
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#DFBF77] font-semibold">{col.count} Pieces</p>
                <h3 className="font-display text-2xl font-bold group-hover:text-[#DFBF77] transition-colors leading-tight">
                  {col.name}
                </h3>
                <p className="text-[11px] text-white/75 font-light line-clamp-2 leading-relaxed">{col.description}</p>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#DFBF77] font-bold pt-1 uppercase tracking-wider">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Liyawel Cultural Vine Divider */}
      <div className="max-w-4xl mx-auto px-5">
        <LiyawelDivider />
      </div>

      {/* ── INTERACTIVE FABRIC & CRAFT SWATCH EXPLORER ── */}
      <FabricExplorer />

      {/* Liyawel Cultural Vine Divider */}
      <div className="max-w-4xl mx-auto px-5">
        <LiyawelDivider />
      </div>

      {/* ── STYLE PERSONALITY QUIZ ── */}
      <StyleQuiz />

      {/* ── SPOTTED ON #AZHAIGIRL (AESTHETIC PHOTO DUMP) ── */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[#C5A059]/30 relative z-10">
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center gap-2 text-[#701626] text-xs font-bold uppercase tracking-[0.25em]">
            <Camera className="w-4 h-4 text-[#C5A059]" />
            <span>#AzhaiGirl Community</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#110B0E]">
            Seen in real life
          </h2>
          <p className="text-xs sm:text-sm text-[#6D6268] font-light">Tag @azhaiclothing on Instagram to be featured in our lookbook</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {[
            { img: '1610030469983-98e550d6193c', tag: 'Sangeet Moments', handle: '@divyadesi' },
            { img: '1583391733956-3750e0ff4e8b', tag: 'Golden Hour Organza', handle: '@ananya.v' },
            { img: '1617627143750-d86bc21e42bb', tag: 'Silk Shawl Drapes', handle: '@pooja_twirls' },
            { img: '1567401893414-76b7b1e5a7a5', tag: 'Festive Campus Edit', handle: '@meera.style' },
          ].map((reel, idx) => (
            <div key={idx} className="group relative rounded-[1.75rem] overflow-hidden aspect-[4/5] bg-white border border-[#C5A059]/30 shadow-md">
              <img
                src={`https://images.unsplash.com/photo-${reel.img}?auto=format&fit=crop&w=600&q=80`}
                alt={reel.tag}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#110B0E]/85 via-transparent to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3 text-white space-y-0.5">
                <p className="text-[10px] text-[#DFBF77] font-bold">{reel.handle}</p>
                <p className="text-xs font-semibold leading-tight">{reel.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE STORY FOOTNOTE ── */}
      <section className="py-20 px-4 sm:px-8 bg-[#F7F4EE] text-center border-t border-[#C5A059]/30 relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <img src="/logo-light.png" alt="Azhai" className="h-12 mx-auto object-contain" />
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#110B0E] leading-tight">
            "Azhai is not just clothing; it is a call to rediscovering the inherent beauty within."
          </h2>
          <p className="font-script text-2xl sm:text-3xl text-[#701626]">— Preethi</p>
          <div className="pt-1">
            <Link
              to="/story"
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs uppercase tracking-[0.22em] font-bold rounded-full transition-all shadow-xl shadow-[#701626]/20 border border-[#C5A059]/30"
            >
              <span>Read Our Full Story</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
