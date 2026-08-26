import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, Sparkles, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { validateEmail, validatePhone, getPasswordStrength } from '@/lib/auth-utils';
import { sendBrevoEmail, buildWelcomeEmailHtml } from '@/lib/brevo';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+94 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signup } = useAuthStore();
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (phone.trim().length > 4 && !validatePhone(phone)) {
      setError('Please enter a valid Sri Lankan mobile number (e.g. +94 77 123 4567).');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await signup({
      fullName,
      email,
      phone,
      password,
      newsletter,
    });
    setLoading(false);

    if (res.success) {
      // Trigger Welcome Email to Customer
      sendBrevoEmail({
        to: [{ email: email.trim(), name: fullName.trim() }],
        subject: '✨ Welcome to Azhai Atelier — Handcrafted Luxury Couture',
        htmlContent: buildWelcomeEmailHtml({ customerName: fullName.trim(), email: email.trim() }),
      }).catch((err) => console.error('[Welcome Email Error]:', err));

      navigate('/account', { replace: true });
    } else {
      setError(res.error || 'Failed to create account.');
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
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-9 border border-[#C5A059]/35 shadow-[0_20px_60px_rgba(112,22,38,0.08)] space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-[#701626]/8 border border-[#C5A059]/35">
              <Sparkles className="w-3.5 h-3.5 text-[#701626]" />
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#701626]">
                Join Azhai Atelier
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">
              Create Your Account
            </h1>
            <p className="text-xs text-[#6D6268] font-light">
              Become an Azhai Insider for early festive drop access, saved addresses & priority dispatch.
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
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Preethi"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E] transition-all"
                />
              </div>
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="preethi@azhai.lk"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Phone (Courier SMS)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                Create Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#6D6268]">Password Strength:</span>
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
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E] transition-all"
                />
              </div>
            </div>

            {/* Newsletter Checkbox */}
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className="mt-0.5 rounded border-[#C5A059]/40 text-[#701626] focus:ring-[#701626]"
              />
              <span className="text-[11px] text-[#6D6268] font-light leading-snug">
                Receive curated Azhai seasonal drops, handloom stories & festive private sale invitations.
              </span>
            </label>

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
                  <UserPlus className="w-4 h-4" /> Create Account
                </>
              )}
            </button>
          </form>

          {/* Bottom Link to Login */}
          <div className="pt-2 border-t border-[#C5A059]/20 text-center space-y-3">
            <p className="text-xs text-[#6D6268]">
              Already have an Azhai account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#701626] hover:text-[#C5A059] transition-colors inline-flex items-center gap-1"
              >
                Sign In <ArrowRight className="w-3 h-3" />
              </Link>
            </p>

            <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-[#6D6268] font-light">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Your personal details are safely encrypted and never shared.</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
