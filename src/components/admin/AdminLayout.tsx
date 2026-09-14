import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Sparkles, 
  DollarSign, 
  Truck, 
  Tag, 
  Users, 
  Search, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  Shield, 
  Banknote,
  Crown,
  ChevronRight,
  Layers,
  Scissors
} from 'lucide-react';
import { useAdminStore } from '@/store/admin';
import SEOHead from '@/components/SEOHead';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { adminUser, adminLogout, orders, settings, toggleCOD } = useAdminStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;

  const NAV_ITEMS = [
    { label: 'Executive Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Orders & Dispatch', path: '/admin/orders', icon: Package, badge: pendingOrdersCount },
    { label: 'Products & Stock', path: '/admin/products', icon: Sparkles },
    { label: 'Categories & Tags', path: '/admin/categories', icon: Layers },
    { label: 'Custom Tailoring', path: '/admin/tailoring', icon: Scissors },
    { label: 'Finance & Ledger', path: '/admin/finance', icon: DollarSign },
    { label: 'Sri Lanka Shipping', path: '/admin/shipping', icon: Truck },
    { label: 'Marketing & Coupons', path: '/admin/marketing', icon: Tag },
    { label: 'Patron CRM', path: '/admin/customers', icon: Users },
    { label: 'SEO & Search Meta', path: '/admin/seo', icon: Search },
    { label: 'Atelier Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EE]/60 text-[#110B0E] flex flex-col lg:flex-row">
      <SEOHead title="Atelier Admin Portal" noindex={true} />
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex w-72 bg-[#110B0E] text-white flex-col justify-between p-6 border-r border-[#C5A059]/30 fixed inset-y-0 left-0 z-30 shadow-2xl">
        <div className="space-y-6">
          {/* Logo & Atelier Portal Title */}
          <div className="pb-5 border-b border-white/10 space-y-2">
            <Link to="/admin" className="flex items-center gap-3">
              <img src="/logo-light.png" alt="Azhai" className="h-10 w-auto invert brightness-200" />
            </Link>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#DFBF77] font-bold">
                Atelier Admin Console
              </span>
              <span className="text-[9px] bg-[#701626] text-[#F3E8CE] font-bold px-2 py-0.5 rounded-full border border-[#C5A059]/40">
                {adminUser?.role === 'owner' ? 'Owner' : 'Manager'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#701626] text-white shadow-md border border-[#C5A059]/35 font-bold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#DFBF77]' : 'text-white/60'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[9.5px] bg-[#C5A059] text-[#110B0E] font-bold px-2 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: COD Quick Switch + User + Storefront Link */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          {/* Master COD Switch in Sidebar */}
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-[#DFBF77]" />
              <div className="text-[11px]">
                <p className="font-bold text-white">Cash on Delivery</p>
                <p className="text-[9.5px] text-white/50">{settings.enableCOD ? 'Active Storewide' : 'Disabled'}</p>
              </div>
            </div>

            <button
              onClick={() => toggleCOD(!settings.enableCOD)}
              className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                settings.enableCOD ? 'bg-emerald-600' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.enableCOD ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* User Profile Mini Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#701626] text-[#F3E8CE] flex items-center justify-center font-bold text-xs font-display shrink-0 border border-[#C5A059]/40">
                {adminUser?.name?.charAt(0) || 'P'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{adminUser?.name}</p>
                <p className="text-[10px] text-white/50 truncate">{adminUser?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-white/60 hover:text-rose-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Storefront External Link */}
          <Link
            to="/"
            target="_blank"
            className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-white/10"
          >
            <span>Live Boutique Storefront</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </aside>

      {/* ── MOBILE HEADER BAR ── */}
      <header className="lg:hidden bg-[#110B0E] text-white px-5 py-4 flex items-center justify-between border-b border-[#C5A059]/30 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src="/logo-light.png" alt="Azhai" className="h-8 w-auto invert brightness-200" />
          <span className="text-[10px] uppercase tracking-wider text-[#DFBF77] font-bold">Admin</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white/80 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#110B0E] text-white border-b border-[#C5A059]/30 px-4 py-4 space-y-3 z-30 max-h-[calc(100vh-64px)] overflow-y-auto"
          >
            {/* User Profile Mini Bar on Mobile */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#701626] text-[#F3E8CE] flex items-center justify-center font-bold text-xs font-display shrink-0 border border-[#C5A059]/40">
                  {adminUser?.name?.charAt(0) || 'P'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{adminUser?.name}</p>
                  <p className="text-[10px] text-white/50 truncate capitalize">{adminUser?.role} • {adminUser?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Master COD Toggle on Mobile */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2.5">
                <Banknote className="w-4 h-4 text-[#DFBF77]" />
                <div>
                  <p className="text-xs font-bold text-white">Cash on Delivery</p>
                  <p className="text-[10px] text-white/50">{settings.enableCOD ? 'Active (Island-wide)' : 'Disabled'}</p>
                </div>
              </div>

              <button
                onClick={() => toggleCOD(!settings.enableCOD)}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.enableCOD ? 'bg-emerald-600' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.enableCOD ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-1 pt-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive ? 'bg-[#701626] text-white shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="text-[9px] bg-[#C5A059] text-[#110B0E] font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <Link to="/" target="_blank" className="text-xs text-[#DFBF77] font-bold flex items-center gap-1.5 py-1">
                <span>Live Storefront</span> <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button onClick={handleLogout} className="text-xs text-rose-400 font-bold py-1">
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="flex-1 lg:ml-72 p-3 sm:p-6 lg:p-8 max-w-7xl min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
