import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShoppingBag, 
  Sparkles, 
  Check, 
  Eye, 
  Camera, 
  Feather, 
  Sun,
  ShieldCheck,
  Crown
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import FabricExplorer from '@/components/FabricExplorer';
import StyleQuiz from '@/components/StyleQuiz';
import { 
  LiyawelDivider 
} from '@/components/CulturalPatterns';
import { PRODUCTS, COLLECTIONS } from '@/lib/data';
import { useCartStore } from '@/store/cart';

const HERO_SLIDES = [
  {
    id: 1,
    badge: 'HAUTE COUTURE · CHAPTER 01',
    headline: 'Dressed in Poetry,',
    scriptHeadline: 'Woven in Grace.',
    desc: 'Featherlight organza, fitted corset kurtas & heirloom maroon silks crafted by Preethi for your soft, unforgettable moments.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=90',
    polaroidCaption: 'The Maroon Corset Set · Handloom Kanjivaram',
    productName: 'Maroon Corset Kurta Set',
    price: '₹8,499',
    productSlug: 'maroon-kanjivaram-kurta-set',
    productId: 101,
  },
  {
    id: 2,
    badge: 'PINTEREST DREAM · SIGNATURE EDIT',
    headline: 'Soft as a Cloud,',
    scriptHeadline: 'Pure as a Lotus.',
    desc: 'Parchment-cream organza adorned with hand-painted crimson blooms. Effortless drapes that float with every step.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1400&q=90',
    polaroidCaption: 'Ivory Lotus Organza · 100% Pure Mulberry Silk',
    productName: 'Ivory Lotus Organza Saree',
    price: '₹12,800',
    productSlug: 'ivory-lotus-organza-saree',
    productId: 102,
  },
  {
    id: 3,
    badge: 'SANGEET COUTURE · 32-KALI FLAIR',
    headline: 'Dance in 32 Kalis,',
    scriptHeadline: 'Own the Moment.',
    desc: 'Sweeping raw silk volume with continuous maroon cord-work. Pure drama designed for effortless 360° slow-mo twirls.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1400&q=90',
    polaroidCaption: '32-Kali Raw Silk Anarkali · Heirloom Cordwork',
    productName: '32-Kali Raw Silk Anarkali',
    price: '₹15,500',
    productSlug: 'raw-silk-anarkali',
    productId: 103,
  }
];

const MOOD_FILTERS = [
  { label: '✨ All Curations', value: 'all' },
  { label: '🌸 Golden Hour Organza', value: 'organza' },
  { label: '💃 Twirl Sangeet Moments', value: 'twirl' },
  { label: '🪷 Sacred Pooja & Temple', value: 'pooja' },
  { label: '🎓 College & Casual Chic', value: 'casual' },
];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedMood, setSelectedMood] = useState('all');
  const [quickAdded, setQuickAdded] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[activeSlide];

  const handleQuickAdd = () => {
    addItem({
      id: slide.productId,
      name: slide.productName,
      price: slide.price,
      image: slide.image,
      quantity: 1,
      size: 'M',
    });
    setQuickAdded(true);
    setTimeout(() => setQuickAdded(false), 2000);
  };

  const filteredProducts = PRODUCTS.filter(p => {
    if (selectedMood === 'all') return true;
    if (selectedMood === 'organza') return p.categories.some(c => c.slug === 'lotus-in-bloom');
    if (selectedMood === 'twirl') return p.name.includes('Anarkali') || p.occasion?.includes('Sangeet');
    if (selectedMood === 'pooja') return p.categories.some(c => c.slug === 'sacred-thread');
    if (selectedMood === 'casual') return p.name.includes('Chanderi') || p.occasion?.includes('College');
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#110B0E]">

      {/* ── TOP HAUTE COUTURE PROMO TICKER ── */}
      <div className="bg-[#701626] text-[#F3E8CE] text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase py-2.5 px-4 text-center border-b border-[#C5A059]/40 relative z-10">
        <div className="flex items-center justify-center gap-4 sm:gap-8 whitespace-nowrap">
          <span className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-[#DFBF77]" /> HAUTE COUTURE FESTIVE '26 DROP</span>
          <span className="hidden md:inline text-[#C5A059]/60">✦</span>
          <span className="hidden md:inline">COMPLIMENTARY WHITE-GLOVE SHIPPING OVER ₹5,000</span>
          <span className="hidden sm:inline text-[#C5A059]/60">✦</span>
          <span className="hidden sm:inline">USE CODE <strong>AZHAI10</strong> FOR 10% PRIVILEGE DISCOUNT</span>
        </div>
      </div>

      {/* ── HAUTE COUTURE EDITORIAL HERO ── */}
      <section className="relative pt-12 pb-24 px-5 sm:px-8 max-w-7xl mx-auto overflow-hidden">
        
        {/* Soft Organic Ambient Radiance */}
        <div className="absolute top-10 left-10 w-[450px] h-[450px] bg-[#F3D9D5]/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#F3E8CE]/25 rounded-full blur-[140px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center relative z-10 pt-4">

          {/* ── Left: Romantic Editorial Narrative ── */}
          <div className="lg:col-span-6 space-y-7 text-left">
            
            {/* Season Badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.badge}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="inline-flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#C5A059]/40 text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{slide.badge}</span>
              </motion.div>
            </AnimatePresence>

            {/* Main Romantic Typography */}
            <div className="space-y-1">
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-[#110B0E] leading-[1.03] tracking-tight">
                {slide.headline} <br />
                <span className="font-script font-normal text-[#701626] text-6xl sm:text-8xl lg:text-9xl block pt-1.5">
                  {slide.scriptHeadline}
                </span>
              </h1>
              <p className="text-base sm:text-lg text-[#6D6268] font-light max-w-lg leading-relaxed pt-3">
                {slide.desc}
              </p>
            </div>

            {/* Direct Luxury CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/collections"
                className="px-9 py-4 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs uppercase tracking-[0.25em] font-bold flex items-center gap-3 rounded-full shadow-xl shadow-[#701626]/20 transition-all hover:scale-[1.02] border border-[#C5A059]/30"
              >
                <span>Explore The New Drop</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/collections/lotus-in-bloom"
                className="px-8 py-4 bg-white/90 hover:bg-[#F7F4EE] text-[#110B0E] text-xs uppercase tracking-[0.25em] font-bold border border-[#C5A059]/50 rounded-full transition-all shadow-sm"
              >
                🌸 Dreamy Organza
              </Link>
            </div>

            {/* Founder Handwritten Quote with Emblem */}
            <div className="pt-5 border-t border-[#C5A059]/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-light.png"
                  alt="Azhai"
                  className="h-8 w-auto object-contain opacity-90"
                />
                <p className="font-script text-2xl sm:text-3xl text-[#701626]">
                  "Made to celebrate the grace you already hold." — Preethi
                </p>
              </div>
            </div>

            {/* Haute Couture Proof Points */}
            <div className="flex items-center gap-6 text-xs text-[#6D6268] pt-1 uppercase tracking-wider text-[11px] font-medium">
              <span className="flex items-center gap-1.5">
                <Feather className="w-3.5 h-3.5 text-[#C5A059]" /> Cloud-Light Mulberry Silk
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-[#C5A059]" /> Golden Hour Drapes
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" /> 100% Handloom Certified
              </span>
            </div>

          </div>

          {/* ── Right: Luxury Lookbook Showcase ── */}
          <div className="lg:col-span-6 relative">
            
            {/* Main Couture Frame with Beveled Gold Trim */}
            <div className="relative mx-auto max-w-md bg-white p-5 sm:p-6 rounded-[2rem] shadow-[0_25px_60px_rgba(35,15,22,0.08)] border border-[#C5A059]/40">
              
              {/* Top Look Switcher Tabs */}
              <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-[#C5A059]/20">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                  Atelier Look {activeSlide + 1} of {HERO_SLIDES.length}
                </span>
                <div className="flex gap-1.5">
                  {HERO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeSlide === i ? 'w-7 bg-[#701626]' : 'w-2 bg-[#C5A059]/40 hover:bg-[#C5A059]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Photo */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#F7F4EE] border border-[#C5A059]/20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full h-full"
                  >
                    <img
                      src={slide.image}
                      alt={slide.productName}
                      className="w-full h-full object-cover"
                    />

                    {/* Floating Frosted Pearl Glass Tag */}
                    <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/95 backdrop-blur-2xl rounded-2xl border border-[#C5A059]/40 shadow-xl space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] text-[#6D6268] font-bold">Limited Atelier Piece</p>
                          <h4 className="font-display text-xl font-bold text-[#110B0E] leading-tight">
                            {slide.productName}
                          </h4>
                        </div>
                        <span className="font-display text-xl font-bold text-[#701626]">
                          {slide.price}
                        </span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleQuickAdd}
                          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${
                            quickAdded 
                              ? 'bg-emerald-700 text-white' 
                              : 'bg-[#701626] hover:bg-[#8E1E34] text-white'
                          }`}
                        >
                          {quickAdded ? (
                            <>
                              <Check className="w-4 h-4" /> Added to Shopping Bag!
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" /> Quick Add ({slide.price})
                            </>
                          )}
                        </button>
                        <Link
                          to={`/products/${slide.productSlug}`}
                          className="p-2.5 bg-[#F7F4EE] hover:bg-[#C5A059]/20 text-[#110B0E] rounded-xl flex items-center justify-center transition-colors border border-[#C5A059]/30"
                          title="View Piece Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Polaroid Handwritten Caption */}
              <div className="pt-4 text-center">
                <p className="font-script text-2xl sm:text-3xl text-[#701626]">
                  {slide.polaroidCaption}
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── LUXURY VALUE PILLARS ── */}
      <div className="border-y border-[#C5A059]/30 bg-white/85 backdrop-blur-md py-7 px-5 sm:px-8 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          {[
            { icon: Sparkles, title: 'Complimentary Express Delivery', desc: 'On all orders over ₹5,000 across India' },
            { icon: Feather, title: 'Cloud-Light Mulberry Silks', desc: 'Zero synthetic blends · Pure handloom drape' },
            { icon: Sun, title: 'Made for Aesthetic Memories', desc: 'Flattering cuts designed for golden hour radiance' },
            { icon: Crown, title: 'Bespoke Craft by Preethi', desc: 'Limited edition runs · Handcrafted in Tamil Nadu' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3.5 justify-center sm:justify-start">
              <div className="w-11 h-11 rounded-2xl bg-[#701626]/8 flex items-center justify-center shrink-0 border border-[#C5A059]/35 shadow-sm">
                <f.icon className="w-4 h-4 text-[#701626]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#110B0E] leading-tight">{f.title}</p>
                <p className="text-[10px] text-[#6D6268] font-light leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SHOP BY MOOD / OCCASION ── */}
      <section className="py-24 px-5 sm:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-2.5 mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold">
            Curated by Occasion
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#110B0E]">
            Find your festive aesthetic
          </h2>
          <p className="text-sm text-[#6D6268] max-w-md mx-auto font-light leading-relaxed">
            Every piece is thoughtfully designed to make you feel effortless, graceful, and radiant.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pb-12">
          {MOOD_FILTERS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                selectedMood === mood.value
                  ? 'bg-[#701626] text-white shadow-lg shadow-[#701626]/20 border border-[#C5A059]/50 scale-105'
                  : 'bg-white text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/30 hover:border-[#701626]/40 shadow-sm'
              }`}
            >
              {mood.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {filteredProducts.map((prod, i) => (
            <ProductCard key={prod.id} product={prod} index={i} />
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

      {/* ── CURATED CHAPTERS (COLLECTIONS) ── */}
      <section className="py-24 px-5 sm:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold">Signature Edits</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#110B0E]">The Collections</h2>
          </div>
          <Link to="/collections" className="text-xs uppercase tracking-[0.2em] text-[#701626] font-bold hover:underline flex items-center gap-1.5">
            <span>View All Chapters</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {COLLECTIONS.map((col) => (
            <Link
              key={col.id}
              to={`/collections/${col.slug}`}
              className="group block relative rounded-[2rem] overflow-hidden h-[480px] bg-white border border-[#C5A059]/30 shadow-md hover:shadow-2xl transition-all duration-500"
            >
              <img
                src={col.heroImage}
                alt={col.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#110B0E]/90 via-[#110B0E]/20 to-transparent" />
              
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] text-[#701626] font-bold uppercase tracking-[0.2em] shadow-md border border-[#C5A059]/40">
                {col.season}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-7 space-y-1.5 text-white">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#DFBF77] font-semibold">{col.tagline}</p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold group-hover:text-[#DFBF77] transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-white/75 font-light line-clamp-2 leading-relaxed">{col.description}</p>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#DFBF77] font-bold pt-2 uppercase tracking-wider">
                  Discover Chapter →
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

      {/* ── STYLE PERSONALITY QUIZ ── */}
      <StyleQuiz />

      {/* ── SPOTTED ON #AZHAIGIRL (AESTHETIC PHOTO DUMP) ── */}
      <section className="py-24 px-5 sm:px-8 max-w-7xl mx-auto border-t border-[#C5A059]/30 relative z-10">
        <div className="text-center space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 text-[#701626] text-xs font-bold uppercase tracking-[0.25em]">
            <Camera className="w-4 h-4 text-[#C5A059]" />
            <span>#AzhaiGirl Community</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#110B0E]">
            Seen in real life
          </h2>
          <p className="text-sm text-[#6D6268] font-light">Tag @azhaiclothing on Instagram to be featured in our lookbook</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { img: '1610030469983-98e550d6193c', tag: 'Sangeet Choreography', handle: '@divyadesi' },
            { img: '1583391733956-3750e0ff4e8b', tag: 'Golden Hour Organza', handle: '@ananya.v' },
            { img: '1617627143750-d86bc21e42bb', tag: '32-Kali Twirl Moments', handle: '@pooja_twirls' },
            { img: '1567401893414-76b7b1e5a7a5', tag: 'Festive Campus Edit', handle: '@meera.style' },
          ].map((reel, idx) => (
            <div key={idx} className="group relative rounded-[1.75rem] overflow-hidden aspect-[4/5] bg-white border border-[#C5A059]/30 shadow-md">
              <img
                src={`https://images.unsplash.com/photo-${reel.img}?auto=format&fit=crop&w=600&q=80`}
                alt={reel.tag}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#110B0E]/85 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-0.5">
                <p className="text-[10px] text-[#DFBF77] font-bold">{reel.handle}</p>
                <p className="text-xs font-semibold leading-tight">{reel.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE STORY FOOTNOTE (WARM & POETIC) ── */}
      <section className="py-24 px-5 sm:px-8 bg-[#F7F4EE] text-center border-t border-[#C5A059]/30 relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <img src="/logo-light.png" alt="Azhai" className="h-14 mx-auto object-contain" />
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#110B0E] leading-tight">
            "Azhai is not just clothing; it is a call to rediscovering the inherent beauty within."
          </h2>
          <p className="font-script text-3xl sm:text-4xl text-[#701626]">— Preethi</p>
          <div className="pt-2">
            <Link
              to="/story"
              className="inline-flex items-center gap-3 px-9 py-4 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs uppercase tracking-[0.25em] font-bold rounded-full transition-all shadow-xl shadow-[#701626]/20 border border-[#C5A059]/30"
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
