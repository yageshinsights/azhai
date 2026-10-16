import { useState, useEffect, useRef, useMemo } from 'react';
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
  Layers,
  ChevronDown,
  HelpCircle
} from 'lucide-react';

const HOME_FAQS = [
  {
    q: "What defines Azhai's designer ethnic wear and handloom silks?",
    a: "Azhai Clothing by Preethi brings bespoke luxury and breathable comfort together. Every piece is handcrafted from pure mulberry silks, handloom weaves, and tissue organzas tailored specifically for tropical climates and celebratory elegance in Sri Lanka.",
  },
  {
    q: "Do you offer bespoke custom tailoring and made-to-measure sizing?",
    a: "Yes. In our Colombo atelier, you can order standard boutique sizing (XS to XXL) or commission custom bespoke measurements. Our interactive 2D blouse studio allows you to configure personalized neckline depths, sleeve lengths, and bust fit with a generous 1.5-inch alteration margin.",
  },
  {
    q: "How does island-wide delivery and courier shipping work across Sri Lanka?",
    a: "We offer express 1–2 day dispatch within Colombo and 2–4 working days island-wide via registered courier service with real-time SMS tracking. We accept secure online payments via PayHere, bank deposits, and Cash on Delivery (COD) for ready-to-wear pieces.",
  },
  {
    q: "Can I consult with Preethi or the atelier team for wedding guest or bridal styling?",
    a: "Absolutely. Our atelier concierge provides personalized styling guidance via WhatsApp. Whether coordinating bridesmaid ensembles, festive Diwali or wedding guest couture, or custom sizing advice, our team is delighted to assist you.",
  },
  {
    q: "Does Azhai have a physical showroom, or can I order online?",
    a: "Azhai Clothing is an exclusive online boutique and design atelier based in Colombo, Sri Lanka. We operate entirely online with express island-wide delivery across Sri Lanka. While we do not operate a walk-in physical showroom, our atelier team and Preethi provide one-on-one styling guidance, fabric previews, and bespoke sizing assistance directly via our WhatsApp concierge.",
  },
];
import ProductCard from '@/components/ProductCard';
import TailoringStudio from '@/components/TailoringStudio';
import StyleQuiz from '@/components/StyleQuiz';
import AnimatedLogo from '@/components/AnimatedLogo';
import SEOHead from '@/components/SEOHead';
import { LiyawelDivider } from '@/components/CulturalPatterns';
import RecentlyViewed from '@/components/RecentlyViewed';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { PRODUCTS, COLLECTIONS, type Collection } from '@/lib/data';
import { useAdminStore } from '@/store/admin';
import { 
  normalizeCategorySlug, 
  STORE_INSTAGRAM_URL, 
  STORE_FACEBOOK_URL, 
  STORE_TIKTOK_URL, 
  STORE_PHONE, 
  STORE_ADDRESS_FULL 
} from '@/lib/constants';

export default function Home() {
  const storeProducts = useAdminStore((s) => s.products);
  const storeCategories = useAdminStore((s) => s.categories);
  const settings = useAdminStore((s) => s.settings);
  const recentlyViewed = useRecentlyViewed();

  const allProducts = Array.isArray(storeProducts) ? storeProducts : PRODUCTS;
  const allCategories = Array.isArray(storeCategories) && storeCategories.length > 0 ? storeCategories : COLLECTIONS;

  // Filter collections featured in the Hero Carousel (fallback to brand card if none are featured or exist)
  const heroCategories = useMemo(() => {
    if (!allCategories || allCategories.length === 0) {
      return [
        {
          id: 0,
          name: 'Handcrafted Silk Couture',
          slug: 'all',
          description: 'Timeless handloom silhouettes, artisanal embroidery, and bespoke bridal tailoring crafted in our Colombo atelier.',
          heroImage: '/og-azhai.jpg',
          count: 0,
          season: 'Colombo Atelier',
          tagline: 'Artisanal Festive Creations',
          isFeatured: true,
        },
      ];
    }
    const featured = allCategories.filter((c) => Boolean(c.isFeatured));
    return featured.length > 0 ? featured : allCategories.slice(0, 1);
  }, [allCategories]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [direction, setDirection] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const isHovered = useRef(false);
  const touchStartX = useRef<number | null>(null);

  // Reset activeSlide if heroCategories length changes
  useEffect(() => {
    if (activeSlide >= heroCategories.length) {
      setActiveSlide(0);
    }
  }, [heroCategories.length, activeSlide]);

  // Auto-advance slider every 5.5 seconds (paused on hover)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovered.current && heroCategories.length > 0) {
        setDirection(1);
        setActiveSlide((prev) => (prev + 1) % heroCategories.length);
      }
    }, 5500);
    return () => clearInterval(timer);
  }, [heroCategories.length]);

  const handleNext = () => {
    setDirection(1);
    setActiveSlide((prev) => (prev + 1) % heroCategories.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveSlide((prev) => (prev - 1 + heroCategories.length) % heroCategories.length);
  };

  const currentCategory = heroCategories[activeSlide] || heroCategories[0];

  // Dynamic product count calculated from live products assigned to this collection
  const currentCategoryCount = useMemo(() => {
    if (!currentCategory) return 0;
    const count = allProducts.filter((p) =>
      p.categories?.some((c) => c.slug === currentCategory.slug || c.id === currentCategory.id)
    ).length;
    return count > 0 ? count : (currentCategory.count || 8);
  }, [allProducts, currentCategory]);

  const heroBadgeLabel = currentCategory?.season || 'Signature Drapes';
  const heroSubtitle = currentCategory?.tagline || currentCategory?.description;

  const filteredProducts = allProducts.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.categories.some((c) => c.slug === selectedCategory);
  });

  const homeSchemas = useMemo(() => {
    const instagramUrl = settings?.socialLinks?.instagram || STORE_INSTAGRAM_URL;
    const facebookUrl = settings?.socialLinks?.facebook || STORE_FACEBOOK_URL;
    const tiktokUrl = settings?.socialLinks?.tiktok || STORE_TIKTOK_URL;
    const activePhone = settings?.phoneNumber || STORE_PHONE;
    const activeAddress = settings?.atelierAddress || STORE_ADDRESS_FULL;

    const socialUrls = [instagramUrl, facebookUrl, tiktokUrl].filter(Boolean);

    return [
      {
        '@context': 'https://schema.org',
        '@type': 'ClothingStore',
        name: 'Azhai Clothing by Preethi',
        url: 'https://azhaiclothing.lk',
        logo: 'https://azhaiclothing.lk/logo-light.png',
        image: 'https://azhaiclothing.lk/og-azhai.jpg',
        description: 'Bespoke handloom kurti sets, lotus organza sarees, and tailored festive couture. Colombo, Sri Lanka.',
        telephone: activePhone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: activeAddress,
          addressLocality: 'Colombo',
          addressRegion: 'Western Province',
          addressCountry: 'LK',
        },
        priceRange: 'LKR 8,500 - 32,000',
        sameAs: socialUrls,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Azhai Clothing',
        url: 'https://azhaiclothing.lk',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://azhaiclothing.lk/collections?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: HOME_FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
    ];
  }, [settings]);

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#110B0E]">
      <SEOHead
        title="Designer Ethnic Wear & Festive Couture Sri Lanka"
        description="Explore Azhai by Preethi: Colombo’s premier luxury boutique for designer ethnic wear, handcrafted festive silk couture, organza sarees, and bespoke tailoring."
        canonicalUrl="https://azhaiclothing.lk"
        schema={homeSchemas}
      />
      
      {/* Permanent Brand Semantic H1 for SEO Crawlers */}
      <h1 className="sr-only">
        Azhai Clothing Colombo — Designer Ethnic Wear, Handcrafted Festive Silk Couture &amp; Bespoke Tailoring by Preethi
      </h1>
      
      {/* ── FIT-TO-SCREEN EDITORIAL CATEGORY HERO ── */}
      <section 
        className="relative w-full h-[100svh] min-h-[600px] pt-20 sm:pt-24 pb-24 sm:pb-8 flex flex-col justify-between overflow-hidden bg-[#0D0709]"
        onMouseEnter={() => { isHovered.current = true; }}
        onMouseLeave={() => { isHovered.current = false; }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const deltaX = e.changedTouches[0].clientX - touchStartX.current;
          if (deltaX > 45) {
            handlePrev();
          } else if (deltaX < -45) {
            handleNext();
          }
          touchStartX.current = null;
        }}
      >
        
        {/* Background Category Sliding Imagery */}
        <AnimatePresence initial={false} custom={direction}>
          {currentCategory && (
            <motion.div
              key={currentCategory.id || currentCategory.slug}
              custom={direction}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0 z-0"
            >
              <img
                src={currentCategory.heroImage}
                alt={currentCategory.name}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
              {/* Warm Couture Lighting Gradients: Bottom contrast + subtle amber/burgundy glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0709] via-[#0D0709]/55 via-45% to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0D0709]/85 via-[#701626]/20 to-transparent" />
              <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-[#DFBF77]/10 rounded-full blur-3xl pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="relative z-20 px-4 sm:px-8 max-w-7xl mx-auto w-full my-auto py-2 sm:py-6">
          <div className="max-w-3xl text-left space-y-4 sm:space-y-5">
            
            {/* Dynamic Collection Title & Storyline */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCategory?.id || currentCategory?.slug}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3.5 sm:space-y-4"
              >
                <h2 className="font-display text-4xl sm:text-7xl md:text-8xl lg:text-[6rem] xl:text-[7rem] font-bold text-white tracking-tight leading-[0.98] sm:leading-[1.0] text-balance drop-shadow-xl">
                  {currentCategory?.name}
                </h2>
                {heroSubtitle && (
                  <p className="text-sm sm:text-xl md:text-2xl text-[#FCFBF8]/95 font-light max-w-xl leading-relaxed border-l-2 border-[#DFBF77]/70 pl-3 sm:pl-4 italic font-serif">
                    "{heroSubtitle}"
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 w-full sm:w-auto">
              <Link
                to={`/collections/${currentCategory?.slug}`}
                className="px-7 py-3.5 sm:py-4 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs uppercase tracking-[0.22em] font-bold rounded-full transition-all shadow-xl shadow-[#701626]/30 border border-[#DFBF77]/70 flex items-center justify-center gap-2.5 group cursor-pointer hover:shadow-[0_0_25px_rgba(223,191,119,0.35)]"
              >
                <span>Explore {currentCategory?.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#DFBF77] group-hover:translate-x-1.5 transition-transform" />
              </Link>
              
              <Link
                to="/collections"
                className="px-6 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs uppercase tracking-[0.18em] font-semibold rounded-full transition-all border border-[#DFBF77]/35 hover:border-[#DFBF77] flex items-center justify-center text-center"
              >
                View All Collections
              </Link>
            </div>

          </div>
        </div>

        {/* Bottom Interactive Navigation */}
        <div className="relative z-20 w-full px-4 sm:px-8 pb-2 sm:pb-4 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-white/15">
            
            {/* Left side: Arrows and Slide Counter */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrev}
                  className="w-9 h-9 rounded-full bg-black/40 hover:bg-[#701626] border border-[#DFBF77]/40 text-[#DFBF77] hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                  title="Previous Category"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleNext}
                  className="w-9 h-9 rounded-full bg-black/40 hover:bg-[#701626] border border-[#DFBF77]/40 text-[#DFBF77] hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                  title="Next Category"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] font-serif text-[#DFBF77] font-semibold tracking-wider px-2">
                0{activeSlide + 1} <span className="text-white/40">/</span> 0{heroCategories.length}
              </div>
            </div>

            {/* Right side: Category Pills Strip (Horizontal scrolling on mobile, no-scrollbar, snap-x) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto py-1 pr-14 sm:pr-0 snap-x scroll-smooth">
              {heroCategories.map((col: Collection, idx: number) => {
                const isActive = activeSlide === idx;
                return (
                  <button
                    key={col.id || col.slug}
                    onClick={() => {
                      setDirection(idx > activeSlide ? 1 : -1);
                      setActiveSlide(idx);
                    }}
                    className={`relative shrink-0 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all cursor-pointer overflow-hidden snap-start ${
                      isActive 
                        ? 'bg-[#701626] text-white border border-[#DFBF77] shadow-lg shadow-[#701626]/40' 
                        : 'bg-black/35 hover:bg-black/60 text-white/75 border border-white/10'
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-2 text-left">
                      <span className={`text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-[#DFBF77]' : 'text-white/40'}`}>
                        0{idx + 1}
                      </span>
                      <span className="font-display text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap">
                        {col.name}
                      </span>
                    </span>

                    {/* Live Golden Slide Countdown Bar on Active Pill */}
                    {isActive && (
                      <motion.div
                        key={`progress-${activeSlide}`}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 5.5, ease: 'linear' }}
                        className="absolute bottom-0 left-0 h-[2.5px] bg-gradient-to-r from-[#C5A059] via-[#DFBF77] to-[#C5A059] shadow-[0_0_8px_#DFBF77]"
                      />
                    )}
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
            { icon: Sparkles, title: 'Island-wide Express Delivery', desc: 'Island-wide postal dispatch with tracking across all 25 districts' },
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
            Curated Colombo Atelier
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#110B0E]">
            Designer Ethnic Wear &amp; Silks
          </h2>
          <p className="text-xs sm:text-sm text-[#6D6268] max-w-lg mx-auto font-light leading-relaxed">
            Thoughtfully handcrafted with pure mulberry silks, handloom weaves, and tailored cuts — designed for effortless celebratory radiance across Sri Lanka.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-8 justify-start sm:justify-center px-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`whitespace-nowrap shrink-0 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#701626] text-white shadow-lg shadow-[#701626]/20 border border-[#C5A059]/50 scale-105'
                : 'bg-white text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/30 hover:border-[#701626]/40 shadow-sm'
            }`}
          >
            ✨ All Pieces
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`whitespace-nowrap shrink-0 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-[#701626] text-white shadow-lg shadow-[#701626]/20 border border-[#C5A059]/50 scale-105'
                  : 'bg-white text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/30 hover:border-[#701626]/40 shadow-sm'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((prod, i) => (
              <ProductCard key={prod.id} product={prod} index={i} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl p-8 border border-[#C5A059]/30 max-w-lg mx-auto">
            <p className="font-display text-xl font-bold text-[#110B0E]">No Pieces Currently Available</p>
            <p className="text-xs text-[#6D6268]">
              All items in this edit are currently being handcrafted in our atelier. New releases dropping soon.
            </p>
          </div>
        )}
      </section>

      {/* Liyawel Cultural Vine Divider */}
      <div className="max-w-4xl mx-auto px-5">
        <LiyawelDivider />
      </div>

      {/* ── THE SIGNATURE COLLECTIONS DIRECTORY (LANDSCAPE EDITORIAL LOOKBOOK) ── */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold">
              Signature Silhouettes &amp; Handlooms
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#110B0E]">
              Festive Silk Collections
            </h2>
          </div>
          <Link
            to="/collections"
            className="text-xs uppercase tracking-[0.2em] text-[#701626] font-bold hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-Column Wide Landscape Grid */}
        {allCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {allCategories.map((col) => {
              const count = allProducts.filter((p) =>
                p.categories.some((c) => c.slug === col.slug || c.id === col.id || normalizeCategorySlug(c.slug) === normalizeCategorySlug(col.slug))
              ).length;

              return (
                <Link
                  key={col.id || col.slug}
                  to={`/collections/${col.slug}`}
                  className="group block relative rounded-[2rem] overflow-hidden aspect-[4/3] xs:aspect-[16/10] sm:aspect-[16/9] bg-[#110B0E] border border-[#C5A059]/30 shadow-lg hover:shadow-2xl hover:border-[#C5A059] transition-all duration-500"
                >
                  {/* Landscape Hero Image */}
                  <img
                    src={col.heroImage}
                    alt={col.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-95 group-hover:opacity-100"
                  />

                  {/* Atmospheric Bottom Gradient Scrim - Keeps upper 70% unobstructed */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#110B0E]/90 via-[#110B0E]/40 to-transparent pointer-events-none" />

                  {/* Top Season Badge */}
                  {col.season && (
                    <div className="absolute top-4 right-4 pointer-events-none z-10">
                      <span className="bg-[#110B0E]/60 backdrop-blur-md px-3.5 py-1 rounded-full text-[9px] text-[#DFBF77] font-medium uppercase tracking-[0.2em] border border-[#C5A059]/30 shadow-sm">
                        {col.season}
                      </span>
                    </div>
                  )}

                  {/* Bottom Content Area */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 space-y-2 text-white z-10">
                    {count > 0 && (
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#DFBF77] font-medium">
                        {count} Silhouettes Handcrafted
                      </p>
                    )}

                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold group-hover:text-[#DFBF77] transition-colors leading-tight">
                      {col.name}
                    </h3>

                    {col.description && (
                      <p className="text-xs sm:text-sm text-white/80 font-light line-clamp-1 sm:line-clamp-2 max-w-lg leading-relaxed">
                        {col.description}
                      </p>
                    )}

                    <div className="pt-2 flex items-center">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#DFBF77] uppercase tracking-[0.18em] group-hover:text-white transition-colors">
                        <span className="border-b border-[#C5A059]/50 group-hover:border-white pb-0.5 transition-colors">
                          Explore Lookbook
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl p-8 border border-[#C5A059]/30 max-w-lg mx-auto shadow-sm">
            <Sparkles className="w-8 h-8 text-[#C5A059] mx-auto" />
            <p className="font-display text-xl font-bold text-[#110B0E]">New Curations Unveiling Soon</p>
            <p className="text-xs text-[#6D6268] leading-relaxed">
              Our artisanal silk drops, handcrafted sarees, and festive silhouettes are being prepared in our Colombo atelier.
            </p>
          </div>
        )}
      </section>

      {/* Liyawel Cultural Vine Divider */}
      <div className="max-w-4xl mx-auto px-5">
        <LiyawelDivider />
      </div>

      {/* ── BESPOKE CUSTOM TAILORING STUDIO ── */}
      <TailoringStudio />

      {/* Liyawel Cultural Vine Divider */}
      <div className="max-w-4xl mx-auto px-5">
        <LiyawelDivider />
      </div>

      {/* ── STYLE PERSONALITY QUIZ ── */}
      <StyleQuiz />

      {/* ── RECENTLY VIEWED PIECES CAROUSEL ── */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <RecentlyViewed products={recentlyViewed} />
        </div>
      )}

      {/* ── SPOTTED ON #AZHAIGIRL (AESTHETIC PHOTO DUMP) ── */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[#C5A059]/30 relative z-10">
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center gap-2 text-[#701626] text-xs font-bold uppercase tracking-[0.25em]">
            <Camera className="w-4 h-4 text-[#C5A059]" />
            <span>#AzhaiCommunity</span>
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

      {/* ── ATELIER FAQ & CLIENT CARE ── */}
      <section className="py-20 px-4 sm:px-8 max-w-4xl mx-auto relative z-10 border-t border-[#C5A059]/30">
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center gap-2 text-[#701626] text-xs font-bold uppercase tracking-[0.25em]">
            <HelpCircle className="w-4 h-4 text-[#C5A059]" />
            <span>Atelier Care &amp; Guidance</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#110B0E]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#6D6268] font-light max-w-lg mx-auto leading-relaxed">
            Everything you need to know about our handcrafted silks, bespoke sizing in Colombo, and island-wide delivery.
          </p>
        </div>

        <div className="space-y-3">
          {HOME_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-white border border-[#C5A059]/30 overflow-hidden shadow-xs transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F7F4EE]/50 transition-colors"
                >
                  <span className="font-display text-base sm:text-lg font-bold text-[#110B0E] flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#701626]/8 text-[#701626] text-xs flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </span>
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#C5A059] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#6D6268] font-light leading-relaxed border-t border-[#C5A059]/15 pl-14">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ATELIER MANIFESTO & ANIMATED BRAND CENTERPIECE ── */}
      <section className="py-20 px-4 sm:px-8 bg-[#F7F4EE]/60 text-center border-t border-[#C5A059]/30 relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10 p-8 sm:p-12 rounded-[3rem] bg-white border border-[#C5A059]/40 shadow-xl">
          
          <AnimatedLogo size="lg" withAura={true} replayable={true} />

          <div className="space-y-3 pt-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold">
              Atelier Manifesto
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#110B0E] leading-relaxed">
              "Azhai is not just clothing; it is an invitation to celebrate your own inherent elegance through the living art of handloom silk."
            </h2>
            <p className="font-script text-3xl sm:text-4xl text-[#701626] pt-1">
              — Preethi
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/story"
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs uppercase tracking-[0.22em] font-bold rounded-full transition-all shadow-xl shadow-[#701626]/20 border border-[#C5A059]/30"
            >
              <span>Discover Our Story & Weaving Heritage</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
