import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { validateEmail } from '@/lib/auth-utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
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
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Failed to sign in.');
    }
  };

  const handleFillDemo = () => {
    setEmail('preethi@azhai.lk');
    setPassword('Azhai@2026');
    setError(null);
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 flex items-center justify-center relative overflow-hidden bg-[#FCFBF8]">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-br from-[#701626]/10 via-[#C5A059]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-9 border border-[#C5A059]/35 shadow-[0_20px_60px_rgba(112,22,38,0.08)] space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-[#701626]/8 border border-[#C5A059]/35">
              <Sparkles className="w-3.5 h-3.5 text-[#701626]" />
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#701626]">
                Azhai Atelier Account
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">
              Welcome Back
            </h1>
            <p className="text-xs text-[#6D6268] font-light">
              Sign in to manage your orders, saved addresses and exclusive wishlist.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 font-medium"
            >
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. preethi@azhai.lk"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-[#701626] hover:text-[#C5A059] font-medium transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6D6268] hover:text-[#110B0E] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Pill */}
          <div className="p-3 bg-[#F7F4EE] rounded-2xl border border-[#C5A059]/30 flex items-center justify-between gap-2">
            <div className="text-[11px] text-[#6D6268]">
              <span className="font-bold text-[#110B0E]">Demo:</span> preethi@azhai.lk
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[10px] font-bold uppercase tracking-wider text-[#701626] hover:underline px-2.5 py-1 rounded-lg bg-white border border-[#C5A059]/30 shrink-0"
            >
              Fill Demo
            </button>
          </div>

          {/* Bottom Link to Signup */}
          <div className="pt-2 border-t border-[#C5A059]/20 text-center space-y-3">
            <p className="text-xs text-[#6D6268]">
              Don&apos;t have an account yet?{' '}
              <Link
                to="/signup"
                className="font-bold text-[#701626] hover:text-[#C5A059] transition-colors inline-flex items-center gap-1"
              >
                Create Account <ArrowRight className="w-3 h-3" />
              </Link>
            </p>

            <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-[#6D6268] font-light">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>256-Bit Encrypted Secure Boutique Login</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
