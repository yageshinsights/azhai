import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, MapPin, Heart, Settings as SettingsIcon, LogOut, Sparkles, Ruler } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useAdminStore } from '@/store/admin';
import { PRODUCTS } from '@/lib/data';
import Profile from './account/Profile';
import Orders from './account/Orders';
import Addresses from './account/Addresses';
import Wishlist from './account/Wishlist';
import Settings from './account/Settings';
import FamilyMeasurements from './account/FamilyMeasurements';
import SEOHead from '@/components/SEOHead';

type TabKey = 'profile' | 'orders' | 'measurements' | 'addresses' | 'wishlist' | 'settings';

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'profile', label: 'My Profile', icon: User },
  { key: 'orders', label: 'My Orders', icon: Package },
  { key: 'measurements', label: 'Fitting Vault', icon: Ruler },
  { key: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { key: 'wishlist', label: 'Wishlist', icon: Heart },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabKey) || 'profile';
  const { user, logout, orders, wishlist } = useAuthStore();
  const adminProducts = useAdminStore((s) => s.products);
  const allProducts = Array.isArray(adminProducts) ? adminProducts : PRODUCTS;
  const validWishlistCount = wishlist.filter((slug) => allProducts.some((p) => p.slug === slug)).length;
  const navigate = useNavigate();

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleTabChange = (tab: TabKey) => {
    setSearchParams({ tab });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto relative z-10">
      <SEOHead title="My Account" noindex={true} />
      {/* Top Header / Welcome */}
      <div className="mb-8 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold">
            Private Patron Portal
          </span>
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#110B0E]">
          My Azhai Account
        </h1>
        <p className="text-xs sm:text-sm text-[#6D6268] font-light">
          Manage your bespoke wardrobe, track island-wide deliveries, and update delivery coordinates.
        </p>
      </div>

      {/* Mobile Horizontal Tab Bar */}
      <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto no-scrollbar flex items-center gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const badgeCount =
            tab.key === 'orders' ? orders.length : tab.key === 'wishlist' ? validWishlistCount : 0;

          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#701626] text-white shadow-md'
                  : 'bg-white text-[#110B0E]/70 border border-[#C5A059]/30 hover:text-[#701626]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F3E8CE]' : 'text-[#701626]'}`} />
              <span>{tab.label}</span>
              {badgeCount > 0 && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#701626]/10 text-[#701626]'
                  }`}
                >
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Sidebar (Desktop) + Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar (1 col) */}
        <aside className="hidden lg:block space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/35 shadow-sm space-y-5">
            {/* Patron Profile Mini Card */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-[#C5A059]/20">
              <div className="w-12 h-12 rounded-2xl bg-[#701626] text-[#F3E8CE] flex items-center justify-center font-display text-xl font-bold border border-[#C5A059]/40 shadow-sm shrink-0">
                {user.fullName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#110B0E] truncate font-display sm:font-sans">
                  {user.fullName}
                </p>
                <p className="text-[10.5px] text-[#6D6268] truncate font-light">{user.email}</p>
              </div>
            </div>

            {/* Tab Navigation Links */}
            <nav className="space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                const badgeCount =
                  tab.key === 'orders'
                    ? orders.length
                    : tab.key === 'wishlist'
                    ? validWishlistCount
                    : 0;

                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#701626] text-white shadow-sm'
                        : 'text-[#110B0E] hover:bg-[#F7F4EE] hover:text-[#701626]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${isActive ? 'text-[#F3E8CE]' : 'text-[#701626]'}`}
                      />
                      <span>{tab.label}</span>
                    </div>

                    {badgeCount > 0 && (
                      <span
                        className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#701626]/10 text-[#701626]'
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="pt-2 border-t border-[#C5A059]/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs text-rose-700 hover:bg-rose-50 rounded-2xl font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Tab Content Area (3 cols) */}
        <main className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && <Profile />}
              {activeTab === 'orders' && <Orders />}
              {activeTab === 'measurements' && <FamilyMeasurements />}
              {activeTab === 'addresses' && <Addresses />}
              {activeTab === 'wishlist' && <Wishlist />}
              {activeTab === 'settings' && <Settings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
