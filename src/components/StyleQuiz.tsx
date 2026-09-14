import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, RotateCcw, ShoppingBag, Crown, Check, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '@/store/admin';
import { useCartStore } from '@/store/cart';
import { PRODUCTS, type Product } from '@/lib/data';

interface QuizOption {
  label: string;
  subtitle: string;
  categoryTarget: 'kurties' | 'sarees' | 'tops' | 'shawls';
  icon: string;
}

interface OccasionOption {
  label: string;
  subtitle: string;
  keywords: string[];
  icon: string;
}

const SILHOUETTE_OPTIONS: QuizOption[] = [
  {
    label: 'Modern Corset Kurtis & Cigarette Sets',
    subtitle: 'Breathable handloom cotton-silk with tailored cuts & gold temple borders',
    categoryTarget: 'kurties',
    icon: '👗',
  },
  {
    label: 'Heirloom Sarees & Hand-Painted Organzas',
    subtitle: 'Cloud-light drapes with crimson lotus motifs & sacred temple zari',
    categoryTarget: 'sarees',
    icon: '🪷',
  },
  {
    label: 'Structured Corset Bustiers & Organza Peplums',
    subtitle: 'Chic separates for modern Colombo cocktail & festive saree fusion',
    categoryTarget: 'tops',
    icon: '💃',
  },
  {
    label: 'Pure Silk Shawls & Atelier Wraps',
    subtitle: 'Heirloom zari-embroidered dupattas to elevate wedding drapes & evening grace',
    categoryTarget: 'shawls',
    icon: '✨',
  },
];

const OCCASION_OPTIONS: OccasionOption[] = [
  {
    label: 'Colombo Grand Ballrooms & Sundowner Sangeets',
    subtitle: 'Galle Face, Shangri-La & Waters Edge receptions with golden-hour twirl drama',
    keywords: ['sangeet', 'cocktail', 'reception', 'partywear', 'reels', 'bestseller', 'evening'],
    icon: '🥂',
  },
  {
    label: 'Sacred Temple Poojas, Kovil Archanai & Avurudu',
    subtitle: 'Nallur, Kelaniya, Sinhala & Tamil New Year traditions & auspicious rituals',
    keywords: ['temple', 'pooja', 'avurudu', 'haldi', 'muhurtham', 'bridal', 'traditional', 'heirloom'],
    icon: '🪔',
  },
  {
    label: 'Island Day Weddings, Poruwa & Coastal Soirées',
    subtitle: 'Bentota beach drapes, Kandy hills, or sunlit garden Poruwa ceremonies',
    keywords: ['day weddings', 'golden hour', 'wedding', 'brunch', 'everyday', 'preethi', 'lotus'],
    icon: '🌸',
  },
];

export default function StyleQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSilhouette, setSelectedSilhouette] = useState<QuizOption['categoryTarget']>('kurties');
  const [selectedOccasionIndex, setSelectedOccasionIndex] = useState<number>(0);
  const [isFinished, setIsFinished] = useState(false);
  const [addedMain, setAddedMain] = useState(false);
  const [addedPair, setAddedPair] = useState(false);

  const { addItem } = useCartStore();
  const storeProducts = useAdminStore((s) => s.products);

  // Dynamic Product Catalog Ingestion
  const catalog: Product[] = useMemo(() => {
    return Array.isArray(storeProducts) ? storeProducts : PRODUCTS;
  }, [storeProducts]);

  // Dynamic Match Computation based on Live Catalog & Sri Lankan context
  const { topProduct, pairedProduct, personaTitle, personaDesc } = useMemo(() => {
    const targetCat = selectedSilhouette;
    const occasionKeywords = OCCASION_OPTIONS[selectedOccasionIndex]?.keywords || [];

    // Filter by matching category
    const categoryMatches = catalog.filter((p) =>
      p.categories?.some((c) => c.slug.toLowerCase().includes(targetCat) || c.name.toLowerCase().includes(targetCat))
    );

    const candidates = categoryMatches.length > 0 ? categoryMatches : catalog;

    // Score candidates based on occasion, rating, tag, and isFeatured
    const scored = candidates.map((p) => {
      let score = 0;
      const textToSearch = `${p.name} ${p.description} ${p.shortDescription} ${p.occasion || ''} ${p.tag || ''}`.toLowerCase();

      occasionKeywords.forEach((kw) => {
        if (textToSearch.includes(kw.toLowerCase())) {
          score += 25;
        }
      });

      if (p.isFeatured) score += 15;
      if (p.rating) score += p.rating * 4;
      if (p.tag && p.tag.includes('✨')) score += 10;

      return { product: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const hero = scored[0]?.product || catalog[0] || null;

    // Find complementary pairing piece (different category)
    let paired: Product | null = null;
    if (hero) {
      if (hero.pairingProductIds && hero.pairingProductIds.length > 0) {
        paired = catalog.find((p) => hero.pairingProductIds?.includes(p.id)) || null;
      }

      if (!paired) {
        // Suggest a luxury shawl if saree/kurti, or a kurti if top
        const altCat = targetCat === 'shawls' ? 'sarees' : 'shawls';
        paired =
          catalog.find((p) =>
            p.id !== hero.id &&
            p.categories?.some((c) => c.slug.toLowerCase().includes(altCat) || c.name.toLowerCase().includes(altCat))
          ) || null;
      }
    }

    // Localized Sri Lankan Persona Profiles
    let title = 'The Colombo Modern Muse';
    let desc = 'You appreciate breathable handloom cotton-silks with structured corset tailoring—crafted for tropical Ceylon evenings with effortless poise.';

    if (targetCat === 'sarees') {
      title = 'The Island Heritage Icon';
      desc = 'You cherish timeless Sri Lankan grace with hand-painted lotus blooms and sacred temple zari drapes that catch the coastal golden-hour breeze.';
    } else if (targetCat === 'tops') {
      title = 'The Contemporary Ceylon Couturier';
      desc = 'Bold, modern, and distinct. You love pairing structured raw silk bustiers with effortless draped bottoms for high-fashion Colombo soirée looks.';
    } else if (targetCat === 'shawls') {
      title = 'The Royal Atelier Connoisseur';
      desc = 'You know true luxury is defined by artisanal finishing touches. Opulent pure silk zari wraps designed for stately Sri Lankan wedding receptions.';
    }

    return {
      topProduct: hero,
      pairedProduct: paired,
      personaTitle: title,
      personaDesc: desc,
    };
  }, [catalog, selectedSilhouette, selectedOccasionIndex]);

  const handleSelectSilhouette = (cat: QuizOption['categoryTarget']) => {
    setSelectedSilhouette(cat);
    setCurrentStep(1);
  };

  const handleSelectOccasion = (idx: number) => {
    setSelectedOccasionIndex(idx);
    setIsFinished(true);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsFinished(false);
    setAddedMain(false);
    setAddedPair(false);
  };

  const handleAddMainProduct = () => {
    if (!topProduct) return;
    const defaultSize = topProduct.attributes?.find((a) => a.name.toLowerCase() === 'size')?.options?.[0] || 'M';
    addItem({
      id: topProduct.id,
      name: topProduct.name,
      price: topProduct.price,
      image: topProduct.images?.[0]?.src || '',
      quantity: 1,
      size: defaultSize,
    });
    setAddedMain(true);
    setTimeout(() => setAddedMain(false), 2500);
  };

  const handleAddPairedProduct = () => {
    if (!pairedProduct) return;
    const defaultSize = pairedProduct.attributes?.find((a) => a.name.toLowerCase() === 'size')?.options?.[0] || 'Free Size';
    addItem({
      id: pairedProduct.id,
      name: pairedProduct.name,
      price: pairedProduct.price,
      image: pairedProduct.images?.[0]?.src || '',
      quantity: 1,
      size: defaultSize,
    });
    setAddedPair(true);
    setTimeout(() => setAddedPair(false), 2500);
  };

  return (
    <section id="quiz" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto relative z-10 scroll-mt-24">
      <div className="rounded-[2.5rem] bg-[#F7F4EE] border border-[#C5A059]/40 shadow-xl p-6 sm:p-10 lg:p-12 text-center space-y-6">
        
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 text-[#701626] text-[10px] font-bold uppercase tracking-[0.25em] bg-white px-4 py-1.5 rounded-full border border-[#C5A059]/40 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Ceylon Silhouette Matcher</span>
        </div>

        <div className="space-y-1">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">
            Discover Your Island Festive Era
          </h2>
          <p className="text-xs sm:text-sm text-[#6D6268] font-light">
            Curated by Preethi for Sri Lankan celebrations, temple traditions, and Colombo soirées.
          </p>
        </div>

        {/* Dynamic Quiz Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {!isFinished ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-[#701626] font-bold">
                    Step {currentStep + 1} of 2
                  </span>
                  <span className="text-[10px] font-bold text-[#6D6268]">
                    {currentStep === 0 ? 'Silhouette Selection' : 'Island Occasion Curation'}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold text-[#110B0E]">
                  {currentStep === 0
                    ? "Select your signature island silhouette"
                    : "Where are you making an entrance across Sri Lanka?"}
                </h3>

                {/* Step 1: Silhouette Choices */}
                {currentStep === 0 && (
                  <div className="space-y-3">
                    {SILHOUETTE_OPTIONS.map((opt) => (
                      <button
                        key={opt.categoryTarget}
                        onClick={() => handleSelectSilhouette(opt.categoryTarget)}
                        className="w-full p-4 rounded-2xl bg-[#FCFBF8] hover:bg-[#701626]/5 border border-[#C5A059]/30 hover:border-[#701626]/40 transition-all text-left flex items-start gap-3.5 group cursor-pointer"
                      >
                        <span className="text-2xl pt-0.5">{opt.icon}</span>
                        <div className="space-y-0.5 flex-1">
                          <p className="text-xs sm:text-sm font-bold text-[#110B0E] group-hover:text-[#701626] transition-colors">
                            {opt.label}
                          </p>
                          <p className="text-[11px] text-[#6D6268] font-light">{opt.subtitle}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:text-[#701626] transition-colors self-center shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 2: Occasion Choices */}
                {currentStep === 1 && (
                  <div className="space-y-3">
                    {OCCASION_OPTIONS.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectOccasion(i)}
                        className="w-full p-4 rounded-2xl bg-[#FCFBF8] hover:bg-[#701626]/5 border border-[#C5A059]/30 hover:border-[#701626]/40 transition-all text-left flex items-start gap-3.5 group cursor-pointer"
                      >
                        <span className="text-2xl pt-0.5">{opt.icon}</span>
                        <div className="space-y-0.5 flex-1">
                          <p className="text-xs sm:text-sm font-bold text-[#110B0E] group-hover:text-[#701626] transition-colors">
                            {opt.label}
                          </p>
                          <p className="text-[11px] text-[#6D6268] font-light">{opt.subtitle}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:text-[#701626] transition-colors self-center shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              /* Step 3: Dynamic Live Match Result */
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-[#701626] font-bold bg-[#701626]/10 px-3 py-1 rounded-full border border-[#C5A059]/30">
                  <Crown className="w-3 h-3 text-[#C5A059]" />
                  <span>Your Curated Island Match</span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-3xl font-bold text-[#110B0E]">{personaTitle}</h3>
                  <p className="text-xs text-[#6D6268] leading-relaxed font-light">{personaDesc}</p>
                </div>

                {/* Primary Matched Product Card or Bespoke Studio CTA */}
                {topProduct ? (
                  <>
                    <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/40 flex items-center gap-4 text-left shadow-xs">
                      <div className="w-20 h-24 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm border border-[#C5A059]/30 relative">
                        <img
                          src={topProduct.images?.[0]?.src || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=90'}
                          alt={topProduct.name}
                          className="w-full h-full object-cover"
                        />
                        {topProduct.tag && (
                          <div className="absolute top-1 left-1 bg-[#701626]/90 text-[#F3E8CE] text-[8px] font-bold px-1.5 py-0.5 rounded-sm">
                            ★
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] uppercase tracking-wider text-[#701626] font-bold">
                            Primary Match
                          </span>
                          {topProduct.tag && (
                            <span className="text-[9px] text-[#6D6268] truncate">· {topProduct.tag}</span>
                          )}
                        </div>
                        <h4 className="font-display text-base font-bold text-[#110B0E] leading-tight line-clamp-1">
                          {topProduct.name}
                        </h4>
                        <p className="font-display text-base font-bold text-[#701626]">{topProduct.price}</p>
                      </div>
                    </div>

                    {/* Optional Styled Pairing Suggestion */}
                    {pairedProduct && (
                      <div className="p-3.5 rounded-2xl bg-white border border-[#DFBF77]/60 flex items-center justify-between gap-3 text-left">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={pairedProduct.images?.[0]?.src || ''}
                            alt={pairedProduct.name}
                            className="w-12 h-14 object-cover rounded-lg border border-[#C5A059]/30 shrink-0"
                          />
                          <div className="min-w-0 space-y-0.5">
                            <span className="text-[9px] uppercase font-bold text-[#C5A059] flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Complete the Look:
                            </span>
                            <p className="text-xs font-bold text-[#110B0E] truncate">{pairedProduct.name}</p>
                            <p className="text-[11px] font-bold text-[#701626]">{pairedProduct.price}</p>
                          </div>
                        </div>

                        <button
                          onClick={handleAddPairedProduct}
                          className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                            addedPair
                              ? 'bg-emerald-700 text-white'
                              : 'bg-[#F7F4EE] hover:bg-[#701626] text-[#701626] hover:text-white border border-[#C5A059]/40'
                          }`}
                        >
                          {addedPair ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          <span>{addedPair ? 'Added' : 'Add Pair'}</span>
                        </button>
                      </div>
                    )}

                    {/* Primary Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        onClick={handleAddMainProduct}
                        className={`flex-1 py-3.5 text-xs uppercase tracking-wider font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                          addedMain
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#701626] hover:bg-[#8E1E34] text-white shadow-md'
                        }`}
                      >
                        {addedMain ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                        <span>{addedMain ? 'Added to Bag!' : `Quick Add (${topProduct.price})`}</span>
                      </button>

                      <Link
                        to={`/products/${topProduct.slug}`}
                        className="px-5 py-3.5 bg-white hover:bg-[#F7F4EE] border border-[#C5A059]/40 text-[#110B0E] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>View Piece</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={handleReset}
                        className="p-3.5 text-[#6D6268] hover:text-[#110B0E] rounded-xl flex items-center justify-center transition-colors border border-[#C5A059]/30 cursor-pointer"
                        title="Retake Quiz"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/40 text-center space-y-4 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-[#701626]/10 text-[#701626] flex items-center justify-center mx-auto border border-[#C5A059]/30">
                      <Sparkles className="w-6 h-6 text-[#C5A059]" />
                    </div>
                    <p className="font-display text-lg font-bold text-[#110B0E]">
                      Crafted Bespoke Just For You
                    </p>
                    <p className="text-xs text-[#6D6268] max-w-sm mx-auto leading-relaxed">
                      Our new season pieces are being weaved in the Colombo atelier. Bring your personalized style to life right now in our Made-to-Measure Studio.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <Link
                        to="/tailoring"
                        className="px-6 py-3 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <span>Custom Tailor This Style</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={handleReset}
                        className="px-4 py-3 bg-white hover:bg-[#F7F4EE] border border-[#C5A059]/40 text-[#110B0E] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
