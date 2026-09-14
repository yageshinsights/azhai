import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ShieldCheck, Sparkles, ArrowRight, KeyRound, Crown } from 'lucide-react';
import { useAdminStore, type AdminRole } from '@/store/admin';
import SEOHead from '@/components/SEOHead';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('owner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { adminLogin, isAdminAuthenticated, adminUser } = useAdminStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  // Auto-redirect if already logged in as admin
  useEffect(() => {
    if (isAdminAuthenticated && adminUser) {
      navigate(from, { replace: true });
    }
  }, [isAdminAuthenticated, adminUser, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setLoading(true);
    const res = await adminLogin(email, password, role);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Invalid admin credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#110B0E] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <SEOHead title="Admin Atelier Portal" noindex={true} />
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#701626]/40 via-[#C5A059]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-9 border border-[#C5A059]/40 shadow-2xl space-y-6 relative z-10"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <img src="/logo-light.png" alt="Azhai" className="h-12 w-auto mx-auto invert brightness-200" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#701626] border border-[#C5A059]/40 text-[9.5px] uppercase tracking-[0.25em] font-bold text-[#DFBF77]">
            <Crown className="w-3 h-3" /> Atelier Admin Console
          </div>
          <p className="text-xs text-white/70 font-light">
            Authorized management access for Preethi & operations staff.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Role selector */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/80">
              Access Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  role === 'owner'
                    ? 'bg-[#701626] text-white border-[#DFBF77]'
                    : 'bg-white/5 text-white/60 border-white/10'
                }`}
              >
                Owner / Super Admin
              </button>
              <button
                type="button"
                onClick={() => setRole('dispatch')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  role === 'dispatch'
                    ? 'bg-[#701626] text-white border-[#DFBF77]'
                    : 'bg-white/5 text-white/60 border-white/10'
                }`}
              >
                Dispatch Staff
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/80">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@azhai.lk"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/40 focus:border-[#DFBF77] focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/80">
              Passkey / Master Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/40 focus:border-[#DFBF77] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-lg border border-[#C5A059]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter Admin Console'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            to="/"
            className="text-xs text-white/50 hover:text-[#DFBF77] transition-colors"
          >
            ← Return to Customer Storefront
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
