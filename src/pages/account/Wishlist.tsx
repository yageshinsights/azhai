import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, Check } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useAdminStore } from '@/store/admin';
import { useCartStore } from '@/store/cart';
import { PRODUCTS } from '@/lib/data';
import { useState, useEffect } from 'react';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, cleanWishlist } = useAuthStore();
  const { addItem } = useCartStore();
  const adminProducts = useAdminStore((s) => s.products);
  const allProducts = Array.isArray(adminProducts) ? adminProducts : PRODUCTS;
  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  // Auto clean-up any orphaned or stale slugs from local storage
  useEffect(() => {
    const validSlugs = allProducts.map((p) => p.slug);
    const hasOrphaned = wishlist.some((slug) => !validSlugs.includes(slug));
    if (hasOrphaned) {
      cleanWishlist(validSlugs);
    }
  }, [wishlist, allProducts, cleanWishlist]);

  // Match saved slugs to catalog products
  const savedProducts = allProducts.filter((p) => wishlist.includes(p.slug));

  const handleMoveToBag = (product: typeof PRODUCTS[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.src,
      quantity: 1,
      size: product.attributes[0]?.options[0] || 'M',
    });
    setAddedSlug(product.slug);
    setTimeout(() => setAddedSlug(null), 2000);
  };

  if (savedProducts.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#C5A059]/30 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#701626]/8 text-[#701626] flex items-center justify-center mx-auto border border-[#C5A059]/30">
          <Heart className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="font-display text-xl font-bold text-[#110B0E]">Your Wishlist is Empty</h3>
          <p className="text-xs text-[#6D6268] font-light">
            Explore our curated collections of pure mulberry silks, handloom kurties and festive sarees, and click the heart icon to save your favorites.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" /> Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#110B0E]">My Wishlist</h2>
          <p className="text-xs text-[#6D6268] font-light">
            Saved heirloom pieces reserved for your upcoming celebrations.
          </p>
        </div>
        <span className="text-xs font-bold text-[#701626] bg-[#701626]/10 px-3 py-1 rounded-full border border-[#C5A059]/25">
          {savedProducts.length} Saved {savedProducts.length === 1 ? 'Piece' : 'Pieces'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {savedProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-3xl overflow-hidden border border-[#C5A059]/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-[4/5] bg-[#F7F4EE] overflow-hidden group">
              <Link to={`/products/${product.slug}`}>
                <img
                  src={product.images[0]?.src}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              {/* Remove button */}
              <button
                onClick={() => removeFromWishlist(product.slug)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#6D6268] hover:text-rose-600 transition-colors shadow-sm"
                title="Remove from wishlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {product.tag && (
                <div className="absolute top-3 left-3 bg-[#701626] text-[#F3E8CE] text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  {product.tag}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              <div>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#6D6268] font-bold">
                  {product.categories[0]?.name}
                </span>
                <Link to={`/products/${product.slug}`} className="block">
                  <h3 className="font-display text-base font-bold text-[#110B0E] hover:text-[#701626] transition-colors truncate">
                    {product.name}
                  </h3>
                </Link>
                <p className="font-display text-lg font-bold text-[#701626] pt-1">
                  {product.price}
                </p>
              </div>

              {/* Quick Add to Bag */}
              <button
                onClick={() => handleMoveToBag(product)}
                className={`w-full py-2.5 text-[10px] uppercase tracking-[0.18em] font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                  addedSlug === product.slug
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#701626] hover:bg-[#8E1E34] text-white shadow-sm'
                }`}
              >
                {addedSlug === product.slug ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" /> Move to Bag
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
