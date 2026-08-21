import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Heart, 
  Package, 
  RotateCcw, 
  Shield, 
  Check, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Share2
} from 'lucide-react';
import { PRODUCTS } from '@/lib/data';
import { useCartStore } from '@/store/cart';
import ProductCard from '@/components/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const product = PRODUCTS.find(p => p.slug === slug);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImg, setActiveImg] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<'fabric' | 'shipping' | 'care' | null>('fabric');
  const { addItem } = useCartStore();

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center text-[#7A6D74] font-display text-2xl bg-[#FAF7F2]">
      Product not found.
    </div>
  );

  const sizes = product.attributes[0]?.options || [];
  const relatedProducts = PRODUCTS.filter(p => p.id !== product.id).slice(0, 3);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.src,
      quantity: 1,
      size: selectedSize || sizes[0] || 'M',
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const toggleAccordion = (id: 'fabric' | 'shipping' | 'care') => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-20 text-[#1C1318]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/collections" className="inline-flex items-center gap-2 text-[#7A6D74] hover:text-[#7B1C2E] text-xs uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Collections</span>
          </Link>
          <span className="text-xs text-[#7A6D74]">
            Home / {product.categories[0]?.name} / <strong className="text-[#1C1318]">{product.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Image Showcase */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-7 space-y-4">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-white border border-[#E8D7B5]/60 shadow-[0_15px_40px_rgba(70,40,50,0.06)]">
              <motion.img
                key={activeImg}
                src={product.images[activeImg]?.src}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              />
              {product.tag && (
                <div className="absolute top-4 left-4 bg-[#7B1C2E] text-white text-[10px] uppercase tracking-wider font-bold px-3.5 py-1 rounded-full shadow-sm">
                  {product.tag}
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-24 h-28 rounded-2xl overflow-hidden border-2 transition-all bg-white ${
                      activeImg === i ? 'border-[#7B1C2E] shadow-md scale-105' : 'border-[#E8D7B5]/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column: Product Specs & Actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="lg:col-span-5 space-y-6 py-2">
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B1C2E] font-bold">
                  {product.categories[0]?.name}
                </span>
                {product.rating && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold bg-amber-50 px-2.5 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-[#7A6D74]">({product.reviewsCount} reviews)</span>
                  </div>
                )}
              </div>
              
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C1318] leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-[#7B1C2E]">{product.price}</span>
              {product.salePrice && product.regularPrice !== product.price && (
                <span className="text-base text-[#7A6D74] line-through">{product.regularPrice}</span>
              )}
            </div>

            <p className="text-sm text-[#7A6D74] leading-relaxed font-light">{product.shortDescription}</p>

            {/* Styling Tip Note */}
            <div className="p-4 rounded-2xl bg-[#F4EFEA] border border-[#E8D7B5]/60 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#C9A96E] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-[#1C1318]">
                <strong className="text-[#7B1C2E]">How Preethi styles it:</strong> Pair with antique brass jhumkas, delicate dewy makeup, and an effortless textured updo.
              </div>
            </div>

            {/* Size selector */}
            {sizes.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="uppercase tracking-wider text-[#1C1318] font-bold">Select Size</span>
                  <button className="text-[#7B1C2E] hover:underline text-[11px] font-semibold">Size Guide & Measurements</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <motion.button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                        selectedSize === size || (!selectedSize && size === sizes[0])
                          ? 'bg-[#7B1C2E] text-white shadow-sm'
                          : 'bg-white border border-[#E8D7B5]/80 text-[#1C1318]/80 hover:border-[#7B1C2E]/40'
                      }`}
                      whileTap={{ scale: 0.96 }}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <motion.button
                onClick={handleAddToCart}
                className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-3 rounded-full shadow-lg transition-all ${
                  justAdded
                    ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                    : 'bg-[#7B1C2E] hover:bg-[#9B2D42] text-white shadow-[#7B1C2E]/25'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="p-4 bg-white border border-[#E8D7B5]/80 rounded-full text-[#1C1318]/70 hover:text-rose-500 shadow-sm transition-all"
                whileTap={{ scale: 0.95 }}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </motion.button>
            </div>

            {/* Accordions */}
            <div className="pt-4 border-t border-[#E8D7B5]/50 space-y-2">
              
              {/* Fabric Details */}
              <div className="border border-[#E8D7B5]/60 rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => toggleAccordion('fabric')}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-[#1C1318]"
                >
                  <span>Fabric & Craft Details</span>
                  {openAccordion === 'fabric' ? <ChevronUp className="w-4 h-4 text-[#7B1C2E]" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'fabric' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 text-xs text-[#7A6D74] leading-relaxed space-y-1.5"
                    >
                      <p>{product.description}</p>
                      <p><strong>Yarn / Weave:</strong> 100% Handloom Mulberry Silk & Zari</p>
                      <p><strong>Origin:</strong> Crafted by master artisans in Tamil Nadu</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shipping & Returns */}
              <div className="border border-[#E8D7B5]/60 rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-[#1C1318]"
                >
                  <span>Complimentary Shipping & 14-Day Exchanges</span>
                  {openAccordion === 'shipping' ? <ChevronUp className="w-4 h-4 text-[#7B1C2E]" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 text-xs text-[#7A6D74] leading-relaxed space-y-1"
                    >
                      <p>• Dispatched within 24-48 business hours.</p>
                      <p>• Free Express shipping across India for orders over ₹5,000.</p>
                      <p>• 14-Day hassle-free exchanges with complimentary reverse pickup.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Garment Care */}
              <div className="border border-[#E8D7B5]/60 rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => toggleAccordion('care')}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-[#1C1318]"
                >
                  <span>Garment Care Guide</span>
                  {openAccordion === 'care' ? <ChevronUp className="w-4 h-4 text-[#7B1C2E]" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'care' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 text-xs text-[#7A6D74] leading-relaxed space-y-1"
                    >
                      <p>• Dry clean recommended to preserve handloom natural dyes & zari brilliance.</p>
                      <p>• Store folded in a breathable cotton muslin bag away from direct sunlight.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Package, label: 'Free Express', sub: 'Over ₹5,000' },
                { icon: RotateCcw, label: '14-Day Returns', sub: 'Easy exchange' },
                { icon: Shield, label: 'Silk Mark', sub: '100% Pure Silk' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white rounded-2xl p-3 space-y-0.5 text-center border border-[#E8D7B5]/50 shadow-sm">
                  <Icon className="w-4 h-4 text-[#7B1C2E] mx-auto" />
                  <p className="text-[10px] text-[#1C1318] font-bold">{label}</p>
                  <p className="text-[9px] text-[#7A6D74]">{sub}</p>
                </div>
              ))}
            </div>

          </motion.div>

        </div>

        {/* ── COMPLETE THE LOOK / PAIR WITH ── */}
        <section className="mt-24 pt-16 border-t border-[#E8D7B5]/50">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#7B1C2E] font-bold">Curated Pairings</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1C1318] mt-1">Complete The Look</h2>
            </div>
            <Link to="/collections" className="text-xs uppercase tracking-widest text-[#7B1C2E] font-bold hover:underline">
              Explore All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
