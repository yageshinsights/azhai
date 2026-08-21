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
  Truck
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
    <div className="min-h-screen flex items-center justify-center text-[#6D6268] font-display text-2xl bg-[#FCFBF8]">
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
    <div className="min-h-screen bg-[#FCFBF8] pt-20 pb-20 text-[#110B0E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/collections" className="inline-flex items-center gap-2 text-[#6D6268] hover:text-[#701626] text-xs uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Collections</span>
          </Link>
          <span className="text-xs text-[#6D6268] hidden sm:inline">
            Home / {product.categories[0]?.name} / <strong className="text-[#110B0E]">{product.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* Left Column: Image Showcase */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-7 space-y-4">
            <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] bg-white border border-[#C5A059]/35 shadow-[0_20px_50px_rgba(35,15,22,0.06)]">
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
                <div className="absolute top-4 left-4 bg-[#701626] text-[#F3E8CE] text-[10px] uppercase tracking-wider font-bold px-3.5 py-1 rounded-full shadow-md border border-[#C5A059]/40">
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
                      activeImg === i ? 'border-[#701626] shadow-md scale-105' : 'border-[#C5A059]/30 opacity-60 hover:opacity-100'
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
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                  {product.categories[0]?.name}
                </span>
                {product.rating && (
                  <div className="flex items-center gap-1.5 text-xs text-[#C5A059] font-bold bg-[#F7F4EE] px-3 py-1 rounded-full border border-[#C5A059]/30">
                    <Star className="w-3.5 h-3.5 fill-[#C5A059]" />
                    <span>{product.rating}</span>
                    <span className="text-[#6D6268]">({product.reviewsCount} reviews)</span>
                  </div>
                )}
              </div>
              
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#110B0E] leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl sm:text-4xl font-bold text-[#701626]">{product.price}</span>
              {product.salePrice && product.regularPrice !== product.price && (
                <span className="text-base text-[#6D6268] line-through">{product.regularPrice}</span>
              )}
            </div>

            <p className="text-sm text-[#6D6268] leading-relaxed font-light">{product.shortDescription}</p>

            {/* Styling Tip Note */}
            <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/35 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-[#110B0E]">
                <strong className="text-[#701626]">How Preethi styles it:</strong> Pair with antique brass jhumkas, delicate dewy makeup, and an effortless textured updo.
              </div>
            </div>

            {/* Size selector */}
            {sizes.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="uppercase tracking-wider text-[#110B0E] font-bold">Select Size</span>
                  <button className="text-[#701626] hover:underline text-[11px] font-semibold">Size Guide & Sri Lanka Measurements</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <motion.button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                        selectedSize === size || (!selectedSize && size === sizes[0])
                          ? 'bg-[#701626] text-white shadow-sm'
                          : 'bg-white border border-[#C5A059]/40 text-[#110B0E]/80 hover:border-[#701626]/40'
                      }`}
                      whileTap={{ scale: 0.96 }}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons (Desktop) */}
            <div className="flex gap-3 pt-2">
              <motion.button
                onClick={handleAddToCart}
                className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-3 rounded-full shadow-xl transition-all ${
                  justAdded
                    ? 'bg-emerald-700 text-white shadow-emerald-700/25'
                    : 'bg-[#701626] hover:bg-[#8E1E34] text-white shadow-[#701626]/20'
                } border border-[#C5A059]/40`}
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
                    <span>Add to Shopping Bag</span>
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="p-4 bg-white border border-[#C5A059]/40 rounded-full text-[#110B0E]/70 hover:text-rose-500 shadow-sm transition-all"
                whileTap={{ scale: 0.95 }}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </motion.button>
            </div>

            {/* Accordions */}
            <div className="pt-4 border-t border-[#C5A059]/30 space-y-2">
              
              {/* Fabric Details */}
              <div className="border border-[#C5A059]/35 rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => toggleAccordion('fabric')}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-[#110B0E]"
                >
                  <span>Fabric & Craft Details</span>
                  {openAccordion === 'fabric' ? <ChevronUp className="w-4 h-4 text-[#701626]" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'fabric' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 text-xs text-[#6D6268] leading-relaxed space-y-1.5"
                    >
                      <p>{product.description}</p>
                      <p><strong>Yarn / Weave:</strong> 100% Handloom Mulberry Silk & Zari</p>
                      <p><strong>Crafted For:</strong> Modern Sri Lankan festive celebrations & weddings</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shipping & Returns */}
              <div className="border border-[#C5A059]/35 rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-[#110B0E]"
                >
                  <span>Sri Lanka Delivery & 14-Day Exchanges</span>
                  {openAccordion === 'shipping' ? <ChevronUp className="w-4 h-4 text-[#701626]" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 text-xs text-[#6D6268] leading-relaxed space-y-1"
                    >
                      <p>• Dispatched within 24–48 business hours.</p>
                      <p>• Free Island-wide delivery across Sri Lanka for orders over LKR 15,000 (PromptX / Koombiyo).</p>
                      <p>• Express Same-Day delivery available within Colombo 01–15.</p>
                      <p>• 14-Day hassle-free exchanges with doorstep courier pickup.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Garment Care */}
              <div className="border border-[#C5A059]/35 rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => toggleAccordion('care')}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-[#110B0E]"
                >
                  <span>Garment Care Guide</span>
                  {openAccordion === 'care' ? <ChevronUp className="w-4 h-4 text-[#701626]" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'care' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 text-xs text-[#6D6268] leading-relaxed space-y-1"
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
                { icon: Truck, label: 'Island-wide Courier', sub: 'Free over LKR 15k' },
                { icon: RotateCcw, label: '14-Day Exchanges', sub: 'Doorstep pickup' },
                { icon: Shield, label: 'Silk Mark', sub: '100% Pure Silk' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white rounded-2xl p-3 space-y-0.5 text-center border border-[#C5A059]/35 shadow-sm">
                  <Icon className="w-4 h-4 text-[#701626] mx-auto" />
                  <p className="text-[10px] text-[#110B0E] font-bold">{label}</p>
                  <p className="text-[9px] text-[#6D6268]">{sub}</p>
                </div>
              ))}
            </div>

          </motion.div>

        </div>

        {/* ── COMPLETE THE LOOK / PAIR WITH ── */}
        <section className="mt-20 pt-16 border-t border-[#C5A059]/30">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold">Curated Pairings</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E] mt-1">Complete The Look</h2>
            </div>
            <Link to="/collections" className="text-xs uppercase tracking-widest text-[#701626] font-bold hover:underline">
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

      {/* ── MOBILE FLOATING STICKY BUY BAR ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3.5 bg-white/95 backdrop-blur-xl border-t border-[#C5A059]/40 shadow-2xl z-40 flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-[#6D6268] font-bold">Total Price</p>
          <p className="font-display text-lg font-bold text-[#701626]">{product.price}</p>
        </div>
        <button
          onClick={handleAddToCart}
          className={`flex-1 py-3.5 text-xs uppercase tracking-[0.18em] font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${
            justAdded ? 'bg-emerald-700 text-white' : 'bg-[#701626] text-white'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4" /> Added to Bag!
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" /> Add to Bag
            </>
          )}
        </button>
      </div>

    </div>
  );
}
