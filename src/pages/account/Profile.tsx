import { useState } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Phone, Calendar, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { validatePhone } from '@/lib/auth-utils';

export default function Profile() {
  const { user, updateProfile } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [newsletter, setNewsletter] = useState(user?.preferences.newsletter ?? true);
  const [savedMessage, setSavedMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Full name cannot be empty.');
      return;
    }

    if (phone.trim() && !validatePhone(phone)) {
      setError('Please provide a valid Sri Lankan mobile number.');
      return;
    }

    const res = updateProfile({
      fullName: fullName.trim(),
      phone: phone.trim(),
      dob: dob || undefined,
      preferences: {
        ...user.preferences,
        newsletter,
      },
    });

    if (res.success) {
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } else {
      setError(res.error || 'Failed to update profile.');
    }
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-br from-white via-white to-[#F7F4EE] rounded-3xl p-6 sm:p-8 border border-[#C5A059]/35 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#701626] text-[#F3E8CE] flex items-center justify-center font-display text-3xl font-bold border-2 border-[#C5A059]/40 shadow-md shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#110B0E]">
                {user.fullName}
              </h2>
              <span className="bg-[#C5A059]/20 text-[#701626] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#C5A059]/30">
                VIP Patron
              </span>
            </div>
            <p className="text-xs text-[#6D6268] font-light">{user.email}</p>
            <p className="text-[11px] text-[#C5A059] font-medium flex items-center gap-1.5 pt-0.5">
              <Sparkles className="w-3.5 h-3.5" /> Patron since {memberSince}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6D6268] bg-[#F7F4EE] px-4 py-2 rounded-2xl border border-[#C5A059]/25">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Boutique Member</span>
        </div>
      </div>

      {/* Edit Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-6">
        <div>
          <h3 className="font-display text-xl font-bold text-[#110B0E]">Personal Information</h3>
          <p className="text-xs text-[#6D6268] font-light">
            Update your contact details for smooth dispatch and personalized greetings.
          </p>
        </div>

        {savedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-600" /> Changes saved to your Azhai profile.
          </motion.div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E] transition-all"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                Email Address <span className="text-[10px] text-[#6D6268] font-normal lowercase">(read-only)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-100/80 border border-gray-200 text-xs text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                Phone Number (Courier Updates)
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

            {/* Birthday */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                Date of Birth <span className="text-[10px] text-[#C5A059] font-normal">(for birthday treats)</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Newsletter Opt-in */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className="rounded border-[#C5A059]/40 text-[#701626] focus:ring-[#701626]"
              />
              <span className="text-xs text-[#110B0E] font-medium">
                Subscribe to VIP exclusive handloom drops & styling notes
              </span>
            </label>
          </div>

          {/* Save Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
