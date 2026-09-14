import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, KeyRound, Sparkles, CheckCircle2, ArrowLeft, Check } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { getPasswordStrength } from '@/lib/auth-utils';
import SEOHead from '@/components/SEOHead';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuthStore();
  const navigate = useNavigate();

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid or missing password reset token. Please request a new link.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(token, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setError(res.error || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 flex items-center justify-center relative overflow-hidden bg-[#FCFBF8]">
      <SEOHead title="Set New Password | Azhai Boutique Colombo" noindex={true} />
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
                Set New Password
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">
              Create New Password
            </h1>
            <p className="text-xs text-[#6D6268] font-light">
              Choose a strong password to protect your Azhai account.
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 text-center py-4"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-display text-xl font-bold text-emerald-950">Password Updated!</p>
                <p className="text-xs text-emerald-800 font-light">
                  Your password has been changed successfully. Redirecting you to sign in...
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#701626] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Go to Sign In Now
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
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

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
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

                  {newPassword.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#6D6268]">Strength:</span>
                        <span
                          className={`font-bold ${
                            strength.label === 'Strong'
                              ? 'text-emerald-700'
                              : strength.label === 'Medium'
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#F7F4EE] rounded-full overflow-hidden flex gap-1">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            strength.score >= 1
                              ? strength.score === 1
                                ? 'bg-rose-500 w-1/3'
                                : strength.score === 2
                                ? 'bg-amber-500 w-2/3'
                                : 'bg-emerald-600 w-full'
                              : 'w-0'
                          }`}
                        />
                      </div>
                      <div className="flex items-center gap-3 text-[9.5px] text-[#6D6268] pt-0.5">
                        <span className={`flex items-center gap-1 ${strength.hasMinLength ? 'text-emerald-700 font-bold' : ''}`}>
                          {strength.hasMinLength && <Check className="w-3 h-3" />} 8+ chars
                        </span>
                        <span className={`flex items-center gap-1 ${strength.hasUppercase ? 'text-emerald-700 font-bold' : ''}`}>
                          {strength.hasUppercase && <Check className="w-3 h-3" />} 1 uppercase
                        </span>
                        <span className={`flex items-center gap-1 ${strength.hasNumber ? 'text-emerald-700 font-bold' : ''}`}>
                          {strength.hasNumber && <Check className="w-3 h-3" />} 1 number
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" /> Save New Password
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-[#C5A059]/20 text-center">
                <Link
                  to="/login"
                  className="text-xs text-[#701626] hover:text-[#C5A059] font-bold inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
