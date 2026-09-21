import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
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
  Plus,
  Minus,
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
import SEOHead from '@/components/SEOHead';
import RecentlyViewed from '@/components/RecentlyViewed';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const adminProducts = useAdminStore((s) => s.products);
  const allProducts = Array.isArray(adminProducts) ? adminProducts : PRODUCTS;
  
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
  const recentlyViewed = useRecentlyViewed(product?.slug);

  // Schema.org Product JSON-LD for Google Rich Snippets
  const productSchema = useMemo(() => {
    if (!product) return undefined;
    const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, '')) || 14500;
    const primaryCat = product.categories?.[0];
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
          ...(primaryCat
            ? [
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: primaryCat.name,
                  item: `https://azhaiclothing.lk/collections/${primaryCat.slug}`,
                },
                {
                  '@type': 'ListItem',
                  position: 4,
                  name: product.name,
                  item: `https://azhaiclothing.lk/products/${product.slug}`,
                },
              ]
            : [
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: product.name,
                  item: `https://azhaiclothing.lk/products/${product.slug}`,
                },
              ]),
        ],
      },
      {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        image: product.images.map((i) => i.src),
        description: product.description || product.shortDescription,
        brand: {
          '@type': 'Brand',
          name: 'Azhai Clothing by Preethi',
        },
        offers: {
          '@type': 'Offer',
          url: `https://azhaiclothing.lk/products/${product.slug}`,
          priceCurrency: 'LKR',
          price: numericPrice,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating || 4.9,
          reviewCount: product.reviewsCount || 64,
        },
      },
    ];
  }, [product]);

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

  const [quantity, setQuantity] = useState(1);
  const availableStock = product.stockQuantity !== undefined 
    ? product.stockQuantity 
    : (product.quantity !== undefined ? product.quantity : 15);
  const isOutOfStock = availableStock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.src,
      quantity: quantity,
      size: selectedSize || sizes[0] || 'M',
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyBar(window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} — Azhai Boutique`,
          text: `Discover this gorgeous handcrafted piece: ${product.name}`,
          url: window.location.href,
        });
        return;
      } catch {
        // User cancelled or share not supported, fall back to copy link
      }
    }
    handleCopyLink();
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
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2000);
        })
        .catch(() => {});
    }
  };

  const toggleAccordion = (id: 'fabric' | 'shipping' | 'care') => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] pt-32 pb-20 text-[#110B0E]">
        <SEOHead title="Piece Not Found" noindex={true} />
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#701626]/10 text-[#701626] flex items-center justify-center mx-auto border border-[#C5A059]/30">
            <Sparkles className="w-8 h-8 text-[#C5A059]" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-[#110B0E]">Piece Not Found</h1>
            <p className="text-xs text-[#6D6268] leading-relaxed">
              This handcrafted piece may have been sold out or moved. Explore our ongoing festive selections below.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/collections"
              className="px-6 py-3 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md transition-colors"
            >
              Explore Collections
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-white hover:bg-[#F7F4EE] text-[#110B0E] border border-[#C5A059]/40 text-xs font-bold uppercase tracking-wider rounded-2xl transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Check out this gorgeous ${product.name} at Azhai Boutique: ${window.location.href}`
  )}`;

  // Pricing calculations for bundle
  const prodPriceNum = parseInt(product.price.replace(/[^0-9]/g, ''), 10) || 0;
  const compPriceNum = companionProduct ? parseInt(companionProduct.price.replace(/[^0-9]/g, ''), 10) || 0 : 0;
  const bundleTotal = prodPriceNum + compPriceNum;

  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-32 sm:pt-36 pb-36 sm:pb-24 text-[#110B0E]">
      <SEOHead
        title={product.name}
        description={product.shortDescription || product.description}
        image={product.images[0]?.src}
        type="product"
        canonicalUrl={`https://azhaiclothing.lk/products/${product.slug}`}
        url={`https://azhaiclothing.lk/products/${product.slug}`}
        schema={productSchema}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center gap-2 text-xs text-[#6D6268] mb-8 font-light">
          <Link to="/collections" className="hover:text-[#701626] transition-colors">Collections</Link>
          {product.categories?.[0] && (
            <>
              <span>/</span>
              <Link to={`/collections/${product.categories[0]?.slug}`} className="hover:text-[#701626] transition-colors">
                {product.categories[0]?.name}
              </Link>
            </>
          )}
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

            {/* Quantity Selector & Stock Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="uppercase tracking-wider text-[#110B0E] font-bold text-xs">
                  Quantity
                </span>
                <div className="flex items-center bg-white rounded-full border border-[#C5A059]/40 p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-[#F7F4EE] text-[#701626] disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    title="Decrease quantity"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-9 sm:w-8 text-center font-bold font-mono text-sm text-[#110B0E]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(availableStock || 99, q + 1))}
                    disabled={isOutOfStock || (availableStock > 0 && quantity >= availableStock)}
                    className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-[#F7F4EE] text-[#701626] disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    title="Increase quantity"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stock Status Badge */}
              <div className="flex items-center gap-1.5">
                {isOutOfStock ? (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Currently Out of Stock
                  </span>
                ) : availableStock <= 3 ? (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                    ⚡ Only {availableStock} pieces remaining
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> In Stock · Ready for Dispatch
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons (Desktop) */}
            <div className="flex gap-3 pt-2">
              <motion.button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-3 rounded-full shadow-xl transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed shadow-none'
                    : justAdded
                    ? 'bg-emerald-700 text-white shadow-emerald-700/25 border border-[#C5A059]/40'
                    : 'bg-[#701626] hover:bg-[#8E1E34] text-white shadow-[#701626]/20 border border-[#C5A059]/40'
                }`}
                whileHover={isOutOfStock ? {} : { scale: 1.01 }}
                whileTap={isOutOfStock ? {} : { scale: 0.98 }}
              >
                {isOutOfStock ? (
                  <span>Sold Out / Made to Order</span>
                ) : justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added {quantity > 1 ? `${quantity} Items` : 'to Bag'}!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{quantity > 1 ? `Add ${quantity} to Shopping Bag` : 'Add to Shopping Bag'}</span>
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

            {/* Social Share & Native Share Link */}
            <div className="flex items-center justify-between pt-2 border-t border-[#C5A059]/20 text-xs text-[#6D6268]">
              <span className="font-light">Share this piece:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNativeShare}
                  className="px-3 py-1.5 rounded-xl bg-[#701626]/8 hover:bg-[#701626]/15 text-[#701626] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Share Piece"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#701626]" /> Share
                </button>
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
                  <span>Sri Lanka Delivery & Exchanges</span>
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
                          <p>• Official Sri Lanka Post Speed Post delivery (24h Western Province / 48h Island-wide).</p>
                          <p>• Weight-based postage calculation &amp; island-wide Cash on Delivery (COD) supported.</p>
                          <p>• Dispatched in signature Azhai protective keepsake packaging within 24 hours.</p>
                          <p>• Sizing exchanges supported in accordance with atelier policy.</p>
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

        {/* ── RECENTLY ADMIRED PIECES TRAY ── */}
        <RecentlyViewed products={recentlyViewed} />

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

      {/* ── RESPONSIVE FLOATING STICKY BUY BAR ── */}
      <AnimatePresence>
        {showStickyBar && (
          <>
            {/* Mobile Sticky Buy Bar (Docked above MobileBottomNav) */}
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden fixed bottom-[calc(58px+env(safe-area-inset-bottom,0px))] left-0 right-0 p-3 bg-white/95 backdrop-blur-xl border-t border-[#C5A059]/40 shadow-[0_-10px_25px_rgba(112,22,38,0.08)] z-[9980] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={product.images[0]?.src}
                  alt={product.name}
                  className="w-10 h-12 object-cover rounded-lg border border-[#C5A059]/30 shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-display text-xs font-bold text-[#110B0E] truncate">{product.name}</p>
                  <p className="text-xs font-bold text-[#701626]">{product.price}</p>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`shrink-0 px-4 py-2.5 text-xs uppercase tracking-wider font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : justAdded 
                    ? 'bg-emerald-700 text-white' 
                    : 'bg-[#701626] hover:bg-[#8E1E34] text-white'
                }`}
              >
                {isOutOfStock ? (
                  <span>Sold Out</span>
                ) : justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Added!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" /> {quantity > 1 ? `Add (${quantity})` : 'Add to Bag'}
                  </>
                )}
              </button>
            </motion.div>

            {/* Desktop Floating Sticky Buy Bar */}
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:flex fixed bottom-8 right-8 z-40 items-center gap-4 p-3 pr-4 bg-white/95 backdrop-blur-xl rounded-2xl border border-[#C5A059]/40 shadow-2xl"
            >
              <img
                src={product.images[0]?.src}
                alt={product.name}
                className="w-12 h-14 object-cover rounded-xl border border-[#C5A059]/30 shrink-0"
              />
              <div className="space-y-0.5">
                <p className="font-display text-sm font-bold text-[#110B0E] max-w-[200px] truncate">{product.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#701626]">{product.price}</span>
                  {selectedSize && (
                    <span className="text-[10px] bg-[#F7F4EE] px-1.5 py-0.5 rounded border border-[#C5A059]/30 font-medium text-[#6D6268]">
                      {selectedSize}
                    </span>
                  )}
                  {quantity > 1 && (
                    <span className="text-[10px] bg-[#701626]/10 px-1.5 py-0.5 rounded border border-[#701626]/20 font-bold text-[#701626]">
                      Qty: {quantity}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`px-5 py-3 text-xs uppercase tracking-wider font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : justAdded 
                    ? 'bg-emerald-700 text-white' 
                    : 'bg-[#701626] hover:bg-[#8E1E34] text-white'
                }`}
              >
                {isOutOfStock ? (
                  <span>Sold Out</span>
                ) : justAdded ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Bag!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> {quantity > 1 ? `Add (${quantity}) to Bag` : 'Add to Bag'}
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
