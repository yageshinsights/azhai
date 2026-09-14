import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Scissors, Heart, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useAdminStore } from '@/store/admin';
import { PRODUCTS } from '@/lib/data';

export default function MobileBottomNav() {
  const location = useLocation();
  const { totalItems, toggleCart } = useCartStore();
  const { wishlist, isAuthenticated } = useAuthStore();
  const adminProducts = useAdminStore((s) => s.products);
  const allProducts = Array.isArray(adminProducts) ? adminProducts : PRODUCTS;
  const validWishlistCount = wishlist.filter((slug) => allProducts.some((p) => p.slug === slug)).length;
  const cartCount = totalItems();

  const pathname = location.pathname;

  // Strictly hide on all admin routes and checkout flow
  if (pathname.startsWith('/admin') || pathname === '/checkout' || pathname.startsWith('/order-success')) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      to: '/',
      isActive: pathname === '/',
    },
    {
      label: 'Catalog',
      icon: Compass,
      to: '/collections',
      isActive: pathname.startsWith('/collections') || pathname.startsWith('/products'),
    },
    {
      label: 'Tailoring',
      icon: Scissors,
      to: '/tailoring',
      isActive: pathname === '/tailoring',
    },
    {
      label: 'Wishlist',
      icon: Heart,
      to: isAuthenticated ? '/account?tab=wishlist' : '/login',
      isActive: pathname === '/account' && location.search.includes('tab=wishlist'),
      badge: validWishlistCount > 0 ? validWishlistCount : undefined,
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-0 left-0 right-0 z-[9990] lg:hidden bg-[#FCFBF8]/95 backdrop-blur-xl border-t border-[#C5A059]/30 shadow-[0_-10px_25px_rgba(112,22,38,0.06)] px-3 py-2 pb-safe"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                item.isActive 
                  ? 'text-[#701626]' 
                  : 'text-[#6D6268] hover:text-[#110B0E]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${item.isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.7]'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#701626] text-[#F3E8CE] text-[9.5px] font-bold flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium mt-1 tracking-tight ${item.isActive ? 'font-bold text-[#701626]' : ''}`}>
                {item.label}
              </span>
              {item.isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 rounded-full bg-[#701626]" />
              )}
            </Link>
          );
        })}

        {/* Shopping Bag Quick-Drawer Trigger */}
        <button
          onClick={toggleCart}
          className="relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-[#6D6268] hover:text-[#701626] transition-all duration-200"
          aria-label={`Shopping Bag with ${cartCount} items`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.7]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#C5A059] text-[#110B0E] text-[9.5px] font-bold flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium mt-1 tracking-tight">
            Bag
          </span>
        </button>
      </div>
    </nav>
  );
}
