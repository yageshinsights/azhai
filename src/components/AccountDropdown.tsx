import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, MapPin, Heart, Settings, LogOut, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountDropdown({ isOpen, onClose }: AccountDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout, wishlist, orders } = useAuthStore();
  const navigate = useNavigate();

  // Close on outside click
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

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Guest';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-xl rounded-3xl border border-[#C5A059]/35 shadow-[0_20px_50px_rgba(112,22,38,0.12)] p-2 z-50 overflow-hidden"
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
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 rounded-xl transition-colors font-medium"
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
  );
}
