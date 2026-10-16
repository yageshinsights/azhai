import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Sparkles, SlidersHorizontal, ArrowUpDown, X, Filter, ChevronDown, HelpCircle } from 'lucide-react';
import { COLLECTIONS, PRODUCTS, type Product } from '@/lib/data';
import { useAdminStore } from '@/store/admin';
import { normalizeCategorySlug } from '@/lib/constants';
import ProductCard from '@/components/ProductCard';
import SEOHead from '@/components/SEOHead';
import { trackViewItemList } from '@/lib/gtm';

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating';

const CATEGORY_SEO_MAP: Record<string, { title: string; description: string }> = {
  kurties: {
    title: 'Silk Kurti Sets Sri Lanka — Handloom & Festive',
    description: 'Shop handcrafted silk kurti sets online in Sri Lanka. Tailored with pure mulberry silk, breathable handloom weaves, and matching pants. Colombo dispatch.',
  },
  sarees: {
    title: 'Organza & Handloom Sarees Sri Lanka — Festive',
    description: 'Discover ethereal hand-painted lotus organza sarees and traditional handloom silks in Colombo. Weightless celebratory drapes with island-wide shipping.',
  },
  anarkali: {
    title: 'Anarkali Suits & Flared Gowns Sri Lanka | Azhai Colombo',
    description: 'Buy luxury Anarkali dresses online in Sri Lanka. Flared pure chiffon and mulberry silk gowns with handcrafted details. Express delivery across Colombo.',
  },
  'cord-sets': {
    title: 'Co Ord Sets Sri Lanka — Minimal Linen & Silk',
    description: 'Shop stylish women’s co-ord sets online in Colombo. Breathable linen blends, minimal silhouettes, and pockets designed for modern Sri Lankan comfort.',
  },
};

const CATEGORY_FAQS: Record<string, Array<{ q: string; a: string }>> = {
  kurties: [
    {
      q: 'What fabrics are used in Azhai silk kurti sets?',
      a: 'Our kurti sets are handcrafted using pure mulberry silks, tissue organzas, and breathable handloom cotton blends tailored specifically for South Asian climates.',
    },
    {
      q: 'Are pants or palazzos included with the kurti?',
      a: 'Yes, our kurti sets include coordinated, tailored trousers or palazzo pants designed with practical pockets and comfortable elasticated backs.',
    },
    {
      q: 'Can I request custom sleeve or bust sizing for my kurti set?',
      a: 'Yes! You can specify custom measurements during checkout or commission our bespoke tailoring service in Colombo for a made-to-measure fit.',
    },
    {
      q: 'How long does delivery take across Sri Lanka?',
      a: 'Ready-to-wear kurti sets are dispatched within 24 hours. Express Colombo delivery takes 1–2 working days, and island-wide delivery takes 2–4 working days with SMS tracking.',
    },
  ],
  sarees: [
    {
      q: 'Does each saree come with an unstitched blouse piece?',
      a: 'Yes, all our handloom and lotus organza sarees include 0.8m to 1m of coordinated unstitched blouse fabric. You can also have it tailored directly via our 2D blouse customizer.',
    },
    {
      q: 'How lightweight and wearable is the lotus organza fabric?',
      a: 'Our lotus organza sarees are specially processed to be cloud-light and drape softly without the stiff bulk often associated with synthetic organzas.',
    },
    {
      q: 'What are the recommended care instructions for festive sarees?',
      a: 'We recommend professional dry cleaning for your first wear to preserve the delicate hand-painted motifs and pure metallic gold borders.',
    },
    {
      q: 'Do you offer Cash on Delivery (COD) for sarees in Sri Lanka?',
      a: 'Yes, Cash on Delivery is available across Sri Lanka for ready-to-wear sarees, alongside secure card payments via PayHere.',
    },
  ],
  anarkali: [
    {
      q: 'What is the skirt flare (ghera) on Azhai Anarkali suits?',
      a: 'Our festive Anarkalis feature an expansive 4.5+ meter flare with comfortable breathable lining to create graceful movement without excessive weight.',
    },
    {
      q: 'Are the Anarkali suits pre-stitched and ready to wear?',
      a: 'Yes, all our Anarkalis are fully stitched with premium lining, coordinated dupattas, and tailored bottoms ready for your celebrations.',
    },
    {
      q: 'Can I adjust the length if I am taller or shorter?',
      a: 'Our atelier offers complimentary length adjustments prior to courier dispatch. Simply leave a note at checkout or contact our WhatsApp concierge.',
    },
  ],
  'cord-sets': [
    {
      q: 'Are Azhai cord sets suitable for both casual and festive wear?',
      a: 'Yes! Crafted from breathable linen and silk blends, our minimal cord sets seamlessly transition from daytime chic to celebratory evenings with simple jewelry pairings.',
    },
    {
      q: 'Do the cord set pants feature pockets?',
      a: 'Yes, all our cord set trousers feature deep, discreet tailored pockets designed for everyday practicality.',
    },
    {
      q: 'What size range is available for cord sets?',
      a: 'Our ready-to-wear cord sets range from XS to XXL, with relaxed comfort fits tailored to South Asian silhouettes.',
    },
  ],
};

const DEFAULT_COLLECTION_FAQS = [
  {
    q: 'How do I choose the correct size?',
    a: 'We provide an exact size guide on every piece. If you are between sizes, we recommend choosing your standard bust measurement, or contacting our WhatsApp styling concierge for personalized sizing advice.',
  },
  {
    q: 'What are your delivery timelines and fees across Sri Lanka?',
    a: 'Standard courier delivery is LKR 450 (or free on orders above LKR 15,000). Express Colombo delivery is LKR 850 with 1–2 day arrival.',
  },
  {
    q: 'Can I exchange a piece if the fit is not right?',
    a: 'Yes, we offer hassle-free courier exchange assistance across Sri Lanka for unworn garments with original atelier tags intact within 7 days.',
  },
];

export default function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const storeCategories = useAdminStore((state) => state.categories);
  const storeProducts = useAdminStore((state) => state.products);

  const allCategories = Array.isArray(storeCategories) && storeCategories.length > 0 ? storeCategories : COLLECTIONS;
  const allProducts = Array.isArray(storeProducts) ? storeProducts : PRODUCTS;

  const cleanSlug = normalizeCategorySlug(slug);

  const collection = allCategories.find((c) =>
    c.slug === slug ||
    normalizeCategorySlug(c.slug) === cleanSlug ||
    normalizeCategorySlug(c.name) === cleanSlug
  );

  const categorySeo = CATEGORY_SEO_MAP[cleanSlug] || {
    title: `${collection?.name || 'Collection'} Collection — Designer Ethnic Wear Colombo`,
    description: collection?.description || `Discover Azhai's handcrafted ${collection?.name} collection in Colombo, Sri Lanka. Bespoke festive couture with island-wide delivery.`,
  };

  const rawProducts = allProducts.filter((p) =>
    p.categories.some((c) =>
      c.slug === slug ||
      normalizeCategorySlug(c.slug) === cleanSlug ||
      normalizeCategorySlug(c.name) === cleanSlug ||
      (collection && c.id === collection.id)
    )
  );

  // Auto-rewrite dirty or non-canonical URL to clean slug (e.g. /collections/Cord%20sets -> /collections/cord-sets)
  useEffect(() => {
    if (slug && cleanSlug && (slug !== cleanSlug || decodeURIComponent(slug).toLowerCase() !== cleanSlug)) {
      navigate(`/collections/${cleanSlug}${location.search}`, { replace: true });
    }
  }, [slug, cleanSlug, location.search, navigate]);

  // Track Collection / Category Impression (GA4 view_item_list & Meta ViewCategory)
  useEffect(() => {
    if (collection && rawProducts.length > 0) {
      trackViewItemList(collection.name, rawProducts);
    }
  }, [collection?.name, rawProducts.length]);

  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(50000);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const activeFaqs = useMemo(() => {
    return CATEGORY_FAQS[cleanSlug] || DEFAULT_COLLECTION_FAQS;
  }, [cleanSlug]);

  // Available sizes in this collection
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    rawProducts.forEach((p) => {
      p.attributes.forEach((attr) => {
        attr.options.forEach((opt) => set.add(opt));
      });
    });
    return Array.from(set);
  }, [rawProducts]);

  // Helper to extract numeric price from 'LKR 14,500'
  const parsePrice = (priceStr: string): number => {
    const cleaned = priceStr.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...rawProducts];

    // Filter by Size
    if (selectedSize !== 'all') {
      result = result.filter((p) =>
        p.attributes.some((attr) => attr.options.includes(selectedSize))
      );
    }

    // Filter by Price
    result = result.filter((p) => parsePrice(p.price) <= priceMax);

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [rawProducts, selectedSize, priceMax, sortBy]);

  const hasActiveFilters = selectedSize !== 'all' || priceMax < 50000;

  const resetFilters = () => {
    setSelectedSize('all');
    setPriceMax(50000);
    setSortBy('featured');
  };

  const collectionSchema = useMemo(() => {
    if (!collection) return undefined;
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://azhaiclothing.lk/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Collections',
            item: 'https://azhaiclothing.lk/collections',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: collection.name,
            item: `https://azhaiclothing.lk/collections/${collection.slug}`,
          },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${categorySeo.title} — Azhai Clothing Colombo`,
        description: categorySeo.description,
        url: `https://azhaiclothing.lk/collections/${collection.slug || cleanSlug}`,
        image: collection.heroImage,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: rawProducts.map((p, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: `https://azhaiclothing.lk/products/${p.slug}`,
            name: p.name,
          })),
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: activeFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
    ];
  }, [collection, rawProducts, categorySeo, cleanSlug, activeFaqs]);

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] pt-32 pb-20 text-[#110B0E]">
        <SEOHead title="Collection Not Found" noindex={true} />
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#701626]/10 text-[#701626] flex items-center justify-center mx-auto border border-[#C5A059]/30">
            <Sparkles className="w-8 h-8 text-[#C5A059]" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-[#110B0E]">Collection Not Found</h1>
            <p className="text-xs text-[#6D6268] leading-relaxed">
              This seasonal collection may have been archived or moved. Explore our ongoing festive selections below.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/collections"
              className="px-6 py-3 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md transition-colors"
            >
              All Collections
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-white hover:bg-gray-50 border border-[#C5A059]/40 text-[#110B0E] text-xs font-bold uppercase tracking-wider rounded-2xl transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-32 sm:pt-36 text-[#110B0E]">
      <SEOHead
        title={categorySeo.title}
        description={categorySeo.description}
        image={collection.heroImage}
        canonicalUrl={`https://azhaiclothing.lk/collections/${collection.slug || cleanSlug}`}
        url={`https://azhaiclothing.lk/collections/${collection.slug || cleanSlug}`}
        schema={collectionSchema}
      />
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[320px] overflow-hidden">
        <img
          src={collection.heroImage}
          alt={collection.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FCFBF8] via-[#110B0E]/50 to-[#110B0E]/30" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-5 sm:px-8 pb-8 space-y-2"
        >
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full border border-[#C5A059]/40 shadow-sm inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#C5A059]" />
            <span>{collection.season}</span>
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#110B0E] pt-1">
            {collection.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#6D6268] max-w-xl font-light leading-relaxed">
            {collection.description}
          </p>
        </motion.div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-28 sm:py-10">
        {/* Navigation & Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#C5A059]/30">
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 text-[#6D6268] hover:text-[#701626] text-xs uppercase tracking-widest transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Collections</span>
          </Link>

          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Size Filter Pills (Desktop) */}
            {availableSizes.length > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#C5A059]/30">
                <button
                  type="button"
                  onClick={() => setSelectedSize('all')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    selectedSize === 'all'
                      ? 'bg-[#701626] text-white shadow-sm'
                      : 'text-[#6D6268] hover:text-[#110B0E]'
                  }`}
                >
                  All Sizes
                </button>
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-[#701626] text-white shadow-sm'
                        : 'text-[#6D6268] hover:text-[#110B0E]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}

            {/* Desktop Price Slider */}
            <div className="hidden xl:flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-2xl border border-[#C5A059]/30 text-xs">
              <span className="text-[#6D6268] font-light">Max:</span>
              <span className="font-bold text-[#701626] min-w-[70px]">LKR {priceMax.toLocaleString('en-US')}</span>
              <input
                type="range"
                min={5000}
                max={50000}
                step={1000}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-24 accent-[#701626] cursor-pointer"
                title={`Max Price: LKR ${priceMax.toLocaleString()}`}
              />
            </div>

            {/* Sort Select Dropdown */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-[#C5A059]/30 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#701626]" />
              <label htmlFor="sortSelect" className="text-[#6D6268] font-light hidden sm:inline">
                Sort By:
              </label>
              <select
                id="sortSelect"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="font-bold text-[#110B0E] bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Pieces</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Mobile Filter Trigger Button */}
            <button
              onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#C5A059]/30 text-xs font-bold text-[#110B0E] cursor-pointer"
              aria-label="Open Filter Drawer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#701626]" />
              <span>Filters {hasActiveFilters && '•'}</span>
            </button>
          </div>
        </div>

        {/* Active Filters Bar */}
        <div className="flex items-center justify-between pb-6 text-xs text-[#6D6268]">
          <p>
            Showing <strong className="text-[#110B0E] font-bold">{filteredProducts.length}</strong> of{' '}
            {rawProducts.length} handcrafted pieces
          </p>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#701626] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>

        {/* Mobile Filter Modal */}
        <AnimatePresence>
          {filterDrawerOpen && (
            <div 
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobileFilterTitle"
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm lg:hidden"
            >
              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl border border-[#C5A059]/40 max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-3">
                  <h3 id="mobileFilterTitle" className="font-display text-xl font-bold text-[#110B0E]">Filter Collection</h3>
                  <button
                    onClick={() => setFilterDrawerOpen(false)}
                    className="p-2 rounded-full bg-[#F7F4EE] text-[#110B0E] cursor-pointer"
                    aria-label="Close Filter Drawer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Size Filter Options */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Select Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSize('all')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                        selectedSize === 'all'
                          ? 'bg-[#701626] text-white border-[#701626]'
                          : 'bg-[#F7F4EE] text-[#6D6268] border-[#C5A059]/25'
                      }`}
                    >
                      All
                    </button>
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                          selectedSize === size
                            ? 'bg-[#701626] text-white border-[#701626]'
                            : 'bg-[#F7F4EE] text-[#6D6268] border-[#C5A059]/25'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Price Range Slider */}
                <div className="space-y-2 pt-2 border-t border-[#C5A059]/20">
                  <div className="flex justify-between items-center text-xs">
                    <label htmlFor="mobilePriceMax" className="font-bold text-[#110B0E] uppercase tracking-wider">
                      Price Up To:
                    </label>
                    <span className="font-bold text-[#701626]">
                      LKR {priceMax.toLocaleString('en-US')}
                    </span>
                  </div>
                  <input
                    id="mobilePriceMax"
                    type="range"
                    min={5000}
                    max={50000}
                    step={1000}
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full accent-[#701626] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#6D6268]">
                    <span>LKR 5,000</span>
                    <span>LKR 50,000</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#C5A059]/20">
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-[#6D6268] hover:text-[#110B0E]"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setFilterDrawerOpen(false)}
                    className="px-6 py-2.5 bg-[#701626] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : rawProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white rounded-3xl p-8 border border-[#C5A059]/30 max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#701626]/10 text-[#701626] flex items-center justify-center mx-auto border border-[#C5A059]/30">
              <Sparkles className="w-7 h-7 text-[#C5A059]" />
            </div>
            <p className="font-display text-2xl font-bold text-[#110B0E]">New Curations Arriving Soon</p>
            <p className="text-xs text-[#6D6268] leading-relaxed max-w-sm mx-auto">
              Our master artisans are currently weaving and preparing pieces for this collection. Explore our made-to-measure studio in the meantime.
            </p>
            <Link
              to="/tailoring"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#701626] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm hover:bg-[#8E1E34] transition-colors cursor-pointer"
            >
              Explore Bespoke Studio
            </Link>
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 bg-white rounded-3xl p-8 border border-[#C5A059]/30">
            <p className="font-display text-2xl font-bold text-[#110B0E]">No Pieces Match Your Filters</p>
            <p className="text-xs text-[#6D6268] max-w-sm mx-auto">
              Try adjusting your size or price filters to see more of Preethi&apos;s handcrafted collection.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 bg-[#701626] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Collection-Specific Editorial FAQs & Buying Guide */}
        {activeFaqs && activeFaqs.length > 0 && (
          <section className="mt-20 pt-16 border-t border-[#C5A059]/30 max-w-4xl mx-auto">
            <div className="text-center space-y-2 mb-10">
              <div className="inline-flex items-center gap-2 text-[#701626] text-xs font-bold uppercase tracking-[0.25em]">
                <HelpCircle className="w-4 h-4 text-[#C5A059]" />
                <span>Buyer Guidance &amp; Sizing</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#110B0E]">
                {collection.name} FAQs
              </h2>
              <p className="text-xs sm:text-sm text-[#6D6268] font-light max-w-lg mx-auto leading-relaxed">
                Important details regarding fabrics, custom tailoring options, sizing, and delivery for our {collection.name.toLowerCase()} collection.
              </p>
            </div>

            <div className="space-y-3">
              {activeFaqs.map((faq, idx) => {
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
                      <ChevronDown
                        className={`w-4 h-4 text-[#C5A059] shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
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
        )}
      </div>
    </div>
  );
}
