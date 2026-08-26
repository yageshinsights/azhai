import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  Settings, 
  LogOut, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { validateEmail } from '@/lib/auth-utils';

interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountDropdown({ isOpen, onClose }: AccountDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout, wishlist, orders, login } = useAuthStore();
  const navigate = useNavigate();

  // Mobile Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on outside click for desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setError(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      onClose();
      navigate('/account');
    } else {
      setError(res.error || 'Failed to sign in.');
    }
  };

  const handleFillDemo = () => {
    setEmail('preethi@azhai.lk');
    setPassword('Azhai@2026');
    setError(null);
  };

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Guest';

  // ── MOBILE PORTAL CONTENT (Rendered directly in document.body to avoid header transform traps) ──
  const mobilePortalContent = typeof document !== 'undefined' && isOpen ? createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:hidden">
          
          {/* Dark Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-md"
          />

          {/* Bottom Sheet Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-full bg-[#FCFBF8] rounded-t-[2.5rem] border-t-2 border-[#C5A059]/40 shadow-2xl p-6 max-h-[85vh] overflow-y-auto space-y-5"
          >
            {/* Grabber pill & Top Header */}
            <div className="w-12 h-1.5 bg-[#C5A059]/40 rounded-full mx-auto mb-1" />

            <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/20">
              <div className="flex items-center gap-2">
                <img src="/logo-light.png" alt="Azhai" className="h-9 w-auto object-contain" />
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F7F4EE] hover:bg-[#701626] hover:text-white text-[#110B0E] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AUTHENTICATED MOBILE VIEW */}
            {isAuthenticated && user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3.5 p-4 bg-white rounded-2xl border border-[#C5A059]/30 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#701626] text-[#F3E8CE] flex items-center justify-center font-display text-xl font-bold shadow-sm shrink-0 border border-[#C5A059]/40">
                    {firstName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display text-base font-bold text-[#110B0E] truncate">
                        {user.fullName}
                      </h3>
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                    </div>
                    <p className="text-xs text-[#6D6268] truncate font-light">{user.email}</p>
                  </div>
                </div>

                {/* Navigation Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/account?tab=orders"
                    onClick={onClose}
                    className="p-3.5 bg-white rounded-2xl border border-[#C5A059]/25 flex items-center justify-between text-xs font-bold text-[#110B0E] shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#701626]" />
                      <span>Orders</span>
                    </div>
                    {orders.length > 0 && (
                      <span className="text-[10px] bg-[#701626]/10 text-[#701626] font-bold px-2 py-0.5 rounded-full">
                        {orders.length}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/account?tab=wishlist"
                    onClick={onClose}
                    className="p-3.5 bg-white rounded-2xl border border-[#C5A059]/25 flex items-center justify-between text-xs font-bold text-[#110B0E] shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[#701626]" />
                      <span>Wishlist</span>
                    </div>
                    {wishlist.length > 0 && (
                      <span className="text-[10px] bg-[#C5A059]/20 text-[#701626] font-bold px-2 py-0.5 rounded-full">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>
                </div>

                <div className="space-y-2 pt-1">
                  <Link
                    to="/account?tab=profile"
                    onClick={onClose}
                    className="w-full p-3 bg-white rounded-2xl border border-[#C5A059]/25 flex items-center gap-3 text-xs font-medium text-[#110B0E]"
                  >
                    <User className="w-4 h-4 text-[#701626]" />
                    <span>My Profile & Fit Measurements</span>
                  </Link>

                  <Link
                    to="/account?tab=addresses"
                    onClick={onClose}
                    className="w-full p-3 bg-white rounded-2xl border border-[#C5A059]/25 flex items-center gap-3 text-xs font-medium text-[#110B0E]"
                  >
                    <MapPin className="w-4 h-4 text-[#701626]" />
                    <span>Saved Delivery Addresses</span>
                  </Link>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            ) : (
              /* UNAUTHENTICATED MOBILE VIEW: FULL INLINE AUTH */
              <div className="space-y-4 pb-2">
                <div className="text-center space-y-1">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                    Azhai Atelier Account
                  </span>
                  <h2 className="font-display text-2xl font-bold text-[#110B0E]">
                    Sign In to Your Account
                  </h2>
                  <p className="text-xs text-[#6D6268] font-light">
                    Track orders, save handloom favorites & enjoy express checkout.
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleQuickLogin} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#110B0E] uppercase tracking-wider block">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-3 py-2.5 bg-white rounded-xl border border-[#C5A059]/40 text-xs text-[#110B0E] focus:outline-none focus:border-[#701626]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[#110B0E] uppercase tracking-wider block">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        onClick={onClose}
                        className="text-[10px] text-[#701626] font-bold hover:underline"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-white rounded-xl border border-[#C5A059]/40 text-xs text-[#110B0E] focus:outline-none focus:border-[#701626]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6D6268]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#701626]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {loading ? (
                      <span>Signing In...</span>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-3 border-t border-[#C5A059]/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6D6268]">New to Azhai?</span>
                    <Link
                      to="/signup"
                      onClick={onClose}
                      className="text-[#701626] font-bold hover:underline"
                    >
                      Create Account →
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="w-full py-2 bg-[#F7F4EE] hover:bg-[#F0ECE1] text-[#701626] text-[11px] font-bold rounded-xl border border-[#C5A059]/30 transition-colors"
                  >
                    ⚡ Quick Fill Demo Account
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  ) : null;

  return (
    <>
      {/* Mobile Portal */}
      {mobilePortalContent}

      {/* ── DESKTOP DROPDOWN POPUP (sm: and above) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden sm:block absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-3xl border border-[#C5A059]/35 shadow-[0_20px_50px_rgba(112,22,38,0.12)] p-2 z-50 overflow-hidden"
          >
            {/* Subtle top gold accent glow */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#701626] via-[#C5A059] to-[#701626]" />

            {isAuthenticated && user ? (
              <div className="p-3">
                {/* User Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-[#C5A059]/20">
                  <div className="w-11 h-11 rounded-2xl bg-[#701626] text-[#F3E8CE] flex items-center justify-center font-display text-lg font-bold shadow-sm shrink-0 border border-[#C5A059]/40">
                    {firstName.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-[#110B0E] truncate font-display sm:font-sans">
                        {user.fullName}
                      </p>
                      <Sparkles className="w-3 h-3 text-[#C5A059] shrink-0" />
                    </div>
                    <p className="text-[10px] text-[#6D6268] truncate font-light">{user.email}</p>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="py-2 space-y-0.5">
                  <Link
                    to="/account?tab=profile"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-[#110B0E] hover:text-[#701626] hover:bg-[#F7F4EE] rounded-xl transition-colors font-medium"
                  >
                    <User className="w-4 h-4 text-[#701626]/80" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/account?tab=orders"
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2 text-xs text-[#110B0E] hover:text-[#701626] hover:bg-[#F7F4EE] rounded-xl transition-colors font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-[#701626]/80" />
                      <span>My Orders</span>
                    </div>
                    {orders.length > 0 && (
                      <span className="text-[9px] bg-[#701626]/10 text-[#701626] font-bold px-2 py-0.5 rounded-full">
                        {orders.length}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/account?tab=wishlist"
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2 text-xs text-[#110B0E] hover:text-[#701626] hover:bg-[#F7F4EE] rounded-xl transition-colors font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-[#701626]/80" />
                      <span>Wishlist</span>
                    </div>
                    {wishlist.length > 0 && (
                      <span className="text-[9px] bg-[#C5A059]/20 text-[#701626] font-bold px-2 py-0.5 rounded-full">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/account?tab=addresses"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-[#110B0E] hover:text-[#701626] hover:bg-[#F7F4EE] rounded-xl transition-colors font-medium"
                  >
                    <MapPin className="w-4 h-4 text-[#701626]/80" />
                    <span>Saved Addresses</span>
                  </Link>

                  <Link
                    to="/account?tab=settings"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-[#110B0E] hover:text-[#701626] hover:bg-[#F7F4EE] rounded-xl transition-colors font-medium"
                  >
                    <Settings className="w-4 h-4 text-[#701626]/80" />
                    <span>Account Settings</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="pt-2 border-t border-[#C5A059]/20">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 rounded-xl transition-colors font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <div className="text-center space-y-1">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                    Azhai Atelier
                  </span>
                  <p className="font-display text-base font-bold text-[#110B0E]">
                    Sign In to Your Account
                  </p>
                  <p className="text-[10px] text-[#6D6268] font-light">
                    Track orders, save handloom favorites & enjoy swift VIP checkout.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="w-full py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-[11px] font-bold uppercase tracking-[0.16em] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Sign In
                  </Link>

                  <Link
                    to="/signup"
                    onClick={onClose}
                    className="w-full py-2.5 bg-[#F7F4EE] hover:bg-[#C5A059]/20 text-[#110B0E] hover:text-[#701626] text-[11px] font-bold uppercase tracking-[0.16em] rounded-xl flex items-center justify-center gap-2 border border-[#C5A059]/35 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Create Account
                  </Link>
                </div>

                <div className="pt-2 border-t border-[#C5A059]/15 text-center">
                  <p className="text-[9.5px] text-[#6D6268]">
                    Demo: <span className="font-semibold text-[#701626]">preethi@azhai.lk</span> / <span className="font-semibold text-[#701626]">Azhai@2026</span>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
