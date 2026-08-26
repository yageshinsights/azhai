import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { ArrowLeft, Sparkles, SlidersHorizontal, ArrowUpDown, X, Filter } from 'lucide-react';
import { COLLECTIONS, PRODUCTS, type Product } from '@/lib/data';
import { useAdminStore } from '@/store/admin';
import ProductCard from '@/components/ProductCard';

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating';

export default function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const storeCategories = useAdminStore((state) => state.categories);
  const storeProducts = useAdminStore((state) => state.products);

  const allCategories = storeCategories.length > 0 ? storeCategories : COLLECTIONS;
  const allProducts = storeProducts.length > 0 ? storeProducts : PRODUCTS;

  const collection = allCategories.find((c) => c.slug === slug);
  const rawProducts = allProducts.filter((p) => p.categories.some((c) => c.slug === slug));

  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(50000);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

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

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#6D6268] font-display text-2xl bg-[#FCFBF8]">
        Collection not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-24 text-[#110B0E]">
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
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
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
              className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#C5A059]/30 text-xs font-bold text-[#110B0E]"
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
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm lg:hidden">
              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl border border-[#C5A059]/40"
              >
                <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-3">
                  <h3 className="font-display text-xl font-bold text-[#110B0E]">Filter Collection</h3>
                  <button
                    onClick={() => setFilterDrawerOpen(false)}
                    className="p-2 rounded-full bg-[#F7F4EE] text-[#110B0E]"
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
                      className={`px-4 py-2 text-xs font-bold rounded-xl border ${
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
                        className={`px-4 py-2 text-xs font-bold rounded-xl border ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {filteredProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
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
      </div>
    </div>
  );
}
