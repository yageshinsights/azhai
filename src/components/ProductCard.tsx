import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Star, Check, Sparkles, Eye } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import type { Product } from '@/lib/data';

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.attributes[0]?.options[0] || 'M');
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCartStore();
  const { isInWishlist, toggleWishlist } = useAuthStore();
  const navigate = useNavigate();

  const isWishlisted = isInWishlist(product.slug);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.src,
      quantity: 1,
      size: selectedSize,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.slug);
  };

  const handleCardClick = () => {
    navigate(`/products/${product.slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
    >
      <div 
        onClick={handleCardClick}
        className="block group cursor-pointer"
      >
        <div 
          className="relative rounded-3xl overflow-hidden card-couture"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Image Aspect Ratio */}
          <div className="relative aspect-[4/5] overflow-hidden bg-[#F7F4EE]">
            
            {/* Hairline Gold Vignette Accent */}
            <div className="absolute inset-0 border border-[#C5A059]/20 rounded-t-3xl pointer-events-none z-10" />

            <motion.img
              src={product.images[0]?.src}
              alt={product.name}
              className="w-full h-full object-cover"
              animate={{ scale: hovered ? 1.04 : 1 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            />

            {/* Top Luxury Badges */}
            <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20">
              {product.tag ? (
                <div className="bg-[#701626] text-[#F3E8CE] text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full shadow-md border border-[#C5A059]/40">
                  {product.tag}
                </div>
              ) : <div />}

              {/* Wishlist Heart */}
              <button
                onClick={handleToggleWishlist}
                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#110B0E]/70 hover:text-rose-500 transition-all shadow-sm border border-white/80"
                title="Save to Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

            {/* Occasion Pill */}
            {product.occasion && (
              <div className="absolute bottom-3.5 left-3.5 z-20 bg-white/92 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-semibold text-[#701626] border border-[#C5A059]/40 shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-2.5 h-2.5 text-[#C5A059]" />
                <span>{product.occasion}</span>
              </div>
            )}

            {/* Slide-Up Quick Action Overlay */}
            <motion.div
              className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-white via-white/95 to-transparent z-30 flex flex-col gap-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 15 }}
              transition={{ duration: 0.25 }}
            >
              {/* Size Selectors */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {product.attributes[0]?.options.map(sz => (
                  <button
                    key={sz}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(sz);
                    }}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      selectedSize === sz
                        ? 'bg-[#701626] text-white shadow-sm'
                        : 'bg-[#F7F4EE] text-[#110B0E]/70 hover:text-[#110B0E] border border-[#C5A059]/20'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              {/* Action Row: Quick Add + View Piece Button */}
              <div className="flex items-center gap-1.5 w-full">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-2.5 text-[10px] uppercase tracking-[0.16em] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                    justAdded 
                      ? 'bg-emerald-700 text-white' 
                      : 'bg-[#701626] hover:bg-[#8E1E34] text-white'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Added!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" /> Quick Add ({selectedSize})
                    </>
                  )}
                </button>

                {/* View Details Button */}
                <Link
                  to={`/products/${product.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-2.5 bg-[#F7F4EE] hover:bg-[#C5A059]/20 text-[#110B0E] hover:text-[#701626] rounded-xl text-[10px] uppercase tracking-wider font-bold border border-[#C5A059]/35 flex items-center justify-center transition-colors shrink-0 shadow-sm"
                  title="View Piece Details"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Luxury Typography & Details */}
          <div className="p-4 sm:p-5 space-y-1.5 bg-white border-t border-[#C5A059]/15">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#6D6268] font-bold">
                {product.categories[0]?.name}
              </span>
              {product.rating && (
                <div className="flex items-center gap-1 text-[10px] text-[#C5A059] font-bold">
                  <Star className="w-3 h-3 fill-[#C5A059]" />
                  <span>{product.rating}</span>
                </div>
              )}
            </div>

            <h3 className="font-display text-lg font-bold text-[#110B0E] group-hover:text-[#701626] transition-colors line-clamp-1">
              {product.name}
            </h3>

            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-display text-xl font-bold text-[#701626]">{product.price}</span>
              {product.salePrice && product.regularPrice !== product.price && (
                <span className="text-xs text-[#6D6268] line-through">{product.regularPrice}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
