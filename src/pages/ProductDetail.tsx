import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
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
  Truck,
  Maximize2,
  Share2,
  Ruler,
  MessageCircle,
  Link as LinkIcon,
  Plus as PlusIcon,
  Layers,
  Gift
} from 'lucide-react';
import { PRODUCTS } from '@/lib/data';
import { useAdminStore } from '@/store/admin';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import ProductCard from '@/components/ProductCard';
import SizeGuideModal from '@/components/SizeGuideModal';
import ImageLightboxModal from '@/components/ImageLightboxModal';
import ReviewSection from '@/components/ReviewSection';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const adminProducts = useAdminStore((s) => s.products);
  const allProducts = adminProducts && adminProducts.length > 0 ? adminProducts : PRODUCTS;
  
  const product = allProducts.find((p) => p.slug === slug);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImg, setActiveImg] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<'fabric' | 'shipping' | 'care' | null>('fabric');
  
  // Modals
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { addItem } = useCartStore();
  const { isInWishlist, toggleWishlist } = useAuthStore();

  // Curated Pairings & Complete The Look Resolution
  const pairedProducts = useMemo(() => {
    if (!product) return [];
    
    // 1. If explicit curated pairing IDs are defined in admin studio
    if (product.pairingProductIds && product.pairingProductIds.length > 0) {
      const matched = allProducts.filter((p) => product.pairingProductIds?.includes(p.id) && p.id !== product.id);
      if (matched.length > 0) return matched;
    }

    // 2. Smart Cross-Category Ensemble Fallback
    const currentCatSlug = product.categories[0]?.slug;
    const crossCategoryItems = allProducts.filter(
      (p) => p.id !== product.id && !p.categories.some((c) => c.slug === currentCatSlug)
    );

    if (crossCategoryItems.length > 0) {
      return crossCategoryItems.slice(0, 3);
    }

    return allProducts.filter((p) => p.id !== product.id).slice(0, 3);
  }, [product, allProducts]);

  // Primary Companion Product for 1-Click Bundle
  const companionProduct = pairedProducts[0];
  const companionSizes = companionProduct?.attributes[0]?.options || ['Free Size'];
  const [companionSize, setCompanionSize] = useState<string>('');
  const [bundleAdded, setBundleAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#6D6268] font-display text-2xl bg-[#FCFBF8]">
        Product not found.
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.slug);
  const sizes = product.attributes[0]?.options || [];

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

  const handleAddBundle = () => {
    if (!companionProduct) return;

    // 1. Add current main product
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.src,
      quantity: 1,
      size: selectedSize || sizes[0] || 'M',
    });

    // 2. Add companion product
    addItem({
      id: companionProduct.id,
      name: companionProduct.name,
      price: companionProduct.price,
      image: companionProduct.images[0]?.src,
      quantity: 1,
      size: companionSize || companionSizes[0] || 'Free Size',
    });

    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleAccordion = (id: 'fabric' | 'shipping' | 'care') => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Check out this gorgeous ${product.name} at Azhai Boutique: ${window.location.href}`
  )}`;

  // Pricing calculations for bundle
  const prodPriceNum = parseInt(product.price.replace(/[^0-9]/g, ''), 10) || 0;
  const compPriceNum = companionProduct ? parseInt(companionProduct.price.replace(/[^0-9]/g, ''), 10) || 0 : 0;
  const bundleTotal = prodPriceNum + compPriceNum;

  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-24 pb-20 text-[#110B0E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center gap-2 text-xs text-[#6D6268] mb-8 font-light">
          <Link to="/collections" className="hover:text-[#701626] transition-colors">Collections</Link>
          <span>/</span>
          <Link to={`/collections/${product.categories[0]?.slug}`} className="hover:text-[#701626] transition-colors">
            {product.categories[0]?.name}
          </Link>
          <span>/</span>
          <span className="text-[#110B0E] font-medium truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </div>

        {/* Main Product Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-4"
          >
            {/* Primary Main Image */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-white border border-[#C5A059]/35 shadow-xl group aspect-[3/4]">
              <img
                src={product.images[activeImg]?.src || product.images[0]?.src}
                alt={product.images[activeImg]?.alt || product.name}
                className="w-full h-full object-cover object-center"
              />

              {product.tag && (
                <div className="absolute top-6 left-6 bg-[#701626] text-[#DFBF77] text-[10px] font-bold uppercase tracking-[0.25em] px-4 py-1.5 rounded-full shadow-lg border border-[#C5A059]/40">
                  {product.tag}
                </div>
              )}

              {/* Lightbox trigger button */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-6 right-6 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-[#C5A059]/40 text-[#110B0E] flex items-center justify-center shadow-lg hover:bg-[#701626] hover:text-white transition-all cursor-pointer"
                title="View Fullscreen Lightbox"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden border-2 transition-all bg-white shrink-0 cursor-pointer ${
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
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 space-y-6 py-2"
          >
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
              <span className="font-display text-3xl sm:text-4xl font-bold text-[#701626]">
                {product.price}
              </span>
              {product.salePrice && product.regularPrice !== product.price && (
                <span className="text-base text-[#6D6268] line-through">{product.regularPrice}</span>
              )}
            </div>

            <p className="text-sm text-[#6D6268] leading-relaxed font-light">
              {product.shortDescription}
            </p>

            {/* Styling Tip Note */}
            <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/35 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-[#110B0E]">
                <strong className="text-[#701626]">How Preethi styles it:</strong>{' '}
                {product.stylingTip || 'Pair with antique brass jhumkas, delicate dewy makeup, and an effortless textured updo.'}
              </div>
            </div>

            {/* Size selector + Size Guide Trigger */}
            {sizes.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="uppercase tracking-wider text-[#110B0E] font-bold">Select Size</span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[#701626] hover:underline text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Ruler className="w-3 h-3 text-[#C5A059]" /> Size Guide & Measurements
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <motion.button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
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
                className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-3 rounded-full shadow-xl transition-all cursor-pointer ${
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
                onClick={() => toggleWishlist(product.slug)}
                className={`p-4 bg-white border border-[#C5A059]/40 rounded-full transition-all cursor-pointer ${
                  isWishlisted ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-[#110B0E]/70 hover:text-rose-500'
                }`}
                whileTap={{ scale: 0.95 }}
                title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
              </motion.button>
            </div>

            {/* Social Share & Copy Link */}
            <div className="flex items-center justify-between pt-2 border-t border-[#C5A059]/20 text-xs text-[#6D6268]">
              <span className="font-light">Share this piece:</span>
              <div className="flex items-center gap-2">
                <a
                  href={waShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-[#F7F4EE] hover:bg-gray-200 text-[#110B0E] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-3.5 h-3.5" /> Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Accordions */}
            <div className="pt-2 space-y-2">
              
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
                      <p><strong>Yarn / Weave:</strong> {product.fabricYarn || '100% Handloom Mulberry Silk & Zari'}</p>
                      <p><strong>Crafted For:</strong> {product.craftedFor || product.occasion || 'Modern Sri Lankan festive celebrations & weddings'}</p>
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
                      className="px-4 pb-4 text-xs text-[#6D6268] leading-relaxed space-y-1 whitespace-pre-line"
                    >
                      {product.shippingNote ? (
                        <p>{product.shippingNote}</p>
                      ) : (
                        <>
                          <p>• Dispatched within 24–48 business hours.</p>
                          <p>• Free Island-wide delivery across Sri Lanka for orders over LKR 15,000 (PromptX / Koombiyo).</p>
                          <p>• Express Same-Day delivery available within Colombo 01–15.</p>
                          <p>• 14-Day hassle-free exchanges with doorstep courier pickup.</p>
                        </>
                      )}
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
                      className="px-4 pb-4 text-xs text-[#6D6268] leading-relaxed space-y-1 whitespace-pre-line"
                    >
                      {product.careGuide ? (
                        <p>{product.careGuide}</p>
                      ) : (
                        <>
                          <p>• Dry clean recommended to preserve handloom natural dyes & zari brilliance.</p>
                          <p>• Store folded in a breathable cotton muslin bag away from direct sunlight.</p>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </motion.div>
        </div>

        {/* ── CUSTOMER REVIEWS SECTION ── */}
        <ReviewSection productName={product.name} />

        {/* ── COMPLETE THE LOOK / CURATED PAIRINGS ── */}
        <section className="mt-20 pt-16 border-t border-[#C5A059]/30 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" /> Atelier Styling Recommendations
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E] mt-1">
                Complete The Look
              </h2>
              <p className="text-xs text-[#6D6268] font-light max-w-md mt-1">
                Pair this handcrafted silhouette with coordinating handloom stoles, crop tops, and jewelry for a harmonious celebration ensemble.
              </p>
            </div>
            <Link to="/collections" className="text-xs uppercase tracking-widest text-[#701626] font-bold hover:underline self-start sm:self-auto">
              Explore All Collections →
            </Link>
          </div>

          {/* 🌟 1-CLICK ENSEMBLE BUNDLE CARD 🌟 */}
          {companionProduct && (
            <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white border-2 border-[#C5A059]/40 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#701626] text-white flex items-center justify-center text-xs font-bold">
                    <Layers className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#110B0E]">
                      The Curated 2-Piece Ensemble
                    </h3>
                    <p className="text-[11px] text-[#6D6268]">
                      Styled together for seamless festive elegance
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-[#701626] bg-[#701626]/8 border border-[#C5A059]/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <Gift className="w-3 h-3 text-[#C5A059]" /> Free Keepsake Box
                </span>
              </div>

              {/* Connected Visual Items Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Piece 1: Current Product */}
                <div className="md:col-span-4 flex items-center gap-4 p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/30">
                  <img
                    src={product.images[0]?.src}
                    alt={product.name}
                    className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl border border-[#C5A059]/30 shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-[#701626] font-bold">
                      Main Creation
                    </span>
                    <p className="text-xs font-bold text-[#110B0E] line-clamp-1">{product.name}</p>
                    <p className="text-xs font-bold text-[#701626]">{product.price}</p>
                    <span className="text-[10px] text-[#6D6268] bg-white px-2 py-0.5 rounded-md border border-gray-200 inline-block font-medium">
                      Size: {selectedSize || sizes[0] || 'M'}
                    </span>
                  </div>
                </div>

                {/* Connector Plus Sign */}
                <div className="md:col-span-1 flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#701626] text-white flex items-center justify-center shadow-md font-bold text-sm">
                    <PlusIcon className="w-4 h-4" />
                  </div>
                </div>

                {/* Piece 2: Paired Companion Product */}
                <div className="md:col-span-4 flex items-center gap-4 p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/30">
                  <img
                    src={companionProduct.images[0]?.src}
                    alt={companionProduct.name}
                    className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl border border-[#C5A059]/30 shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-[#701626] font-bold">
                      Curated Companion
                    </span>
                    <p className="text-xs font-bold text-[#110B0E] line-clamp-1">{companionProduct.name}</p>
                    <p className="text-xs font-bold text-[#701626]">{companionProduct.price}</p>
                    
                    {/* Companion Size Selector */}
                    {companionSizes.length > 1 ? (
                      <select
                        value={companionSize || companionSizes[0]}
                        onChange={(e) => setCompanionSize(e.target.value)}
                        className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-md border border-gray-300 focus:outline-none"
                      >
                        {companionSizes.map((s) => (
                          <option key={s} value={s}>Size: {s}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-[10px] text-[#6D6268] bg-white px-2 py-0.5 rounded-md border border-gray-200 inline-block font-medium">
                        Size: {companionSizes[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Piece 3: 1-Click Multi-Add Bundle CTA */}
                <div className="md:col-span-3 flex flex-col items-center md:items-end justify-center space-y-2 text-center md:text-right">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#6D6268] font-bold">Ensemble Price</span>
                    <p className="font-display text-2xl sm:text-3xl font-bold text-[#701626]">
                      LKR {bundleTotal.toLocaleString()}
                    </p>
                  </div>

                  <motion.button
                    onClick={handleAddBundle}
                    className={`w-full py-3.5 px-5 text-xs uppercase tracking-[0.16em] font-bold rounded-full shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#C5A059]/40 ${
                      bundleAdded
                        ? 'bg-emerald-700 text-white shadow-emerald-700/25'
                        : 'bg-[#701626] hover:bg-[#8E1E34] text-white shadow-[#701626]/20'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {bundleAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Ensemble Added!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add Both to Bag</span>
                      </>
                    )}
                  </motion.button>
                </div>

              </div>
            </div>
          )}

          {/* Curated Pairings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pairedProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>

      </div>

      {/* ── SIZE GUIDE MODAL ── */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.categories[0]?.name}
      />

      {/* ── IMAGE LIGHTBOX MODAL ── */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={product.images}
        currentIndex={activeImg}
        onSelectIndex={setActiveImg}
        productName={product.name}
      />

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
