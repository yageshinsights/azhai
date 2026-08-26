import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, ArrowLeft, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { validateEmail } from '@/lib/auth-utils';
import { sendBrevoEmail, buildPasswordResetEmailHtml } from '@/lib/brevo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { requestPasswordReset } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await requestPasswordReset(email);
    setLoading(false);

    if (res.success && res.token) {
      setGeneratedToken(res.token);
      setSubmitted(true);

      // Trigger Brevo Password Reset Email
      const resetUrl = `${window.location.origin}/reset-password?token=${res.token}`;
      sendBrevoEmail({
        to: [{ email: email.trim() }],
        subject: '🔐 Reset Your Azhai Atelier Password',
        htmlContent: buildPasswordResetEmailHtml({ resetUrl }),
      }).catch((err) => console.error('[Password Reset Email Error]:', err));
    } else {
      setError(res.error || 'Unable to process reset request.');
    }
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
                Account Recovery
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">
              Reset Password
            </h1>
            <p className="text-xs text-[#6D6268] font-light">
              Enter your registered email address and we will generate your secure password reset link.
            </p>
          </div>

          {/* Success State */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5"
            >
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-900">Reset Link Ready</p>
                  <p className="text-[11px] text-emerald-800 font-light leading-relaxed">
                    A password recovery token has been generated for{' '}
                    <strong className="font-semibold">{email}</strong>.
                  </p>
                </div>
              </div>

              {/* Instant Reset Action Pill */}
              {generatedToken && (
                <button
                  type="button"
                  onClick={() => navigate(`/reset-password?token=${generatedToken}`)}
                  className="w-full py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" /> Continue to Set New Password
                </button>
              )}

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs text-[#701626] hover:text-[#C5A059] font-bold inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
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
                    Registered Email Address
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" /> Request Reset Link
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login Link */}
              <div className="pt-2 border-t border-[#C5A059]/20 text-center space-y-3">
                <Link
                  to="/login"
                  className="text-xs text-[#701626] hover:text-[#C5A059] font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>

                <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-[#6D6268] font-light">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Secure reset token with 1-hour expiration</span>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
