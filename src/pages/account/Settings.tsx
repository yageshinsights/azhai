import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, KeyRound, Bell, AlertTriangle, Trash2, Check, ShieldCheck, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { getPasswordStrength } from '@/lib/auth-utils';

export default function Settings() {
  const { user, changePassword, updateProfile, deleteAccount } = useAuthStore();
  const navigate = useNavigate();

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  // Notification toggles
  const [newsletter, setNewsletter] = useState(user?.preferences.newsletter ?? true);
  const [smsAlerts, setSmsAlerts] = useState(user?.preferences.smsAlerts ?? true);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const strength = getPasswordStrength(newPassword);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setPwLoading(false);

    if (res.success) {
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(false), 3500);
    } else {
      setPwError(res.error || 'Failed to update password.');
    }
  };

  const handleNotificationChange = (type: 'newsletter' | 'smsAlerts', value: boolean) => {
    if (type === 'newsletter') {
      setNewsletter(value);
      updateProfile({ preferences: { ...user!.preferences, newsletter: value } });
    } else {
      setSmsAlerts(value);
      updateProfile({ preferences: { ...user!.preferences, smsAlerts: value } });
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm deletion.');
      return;
    }

    setDeleteLoading(true);
    const res = await deleteAccount(deletePassword);
    setDeleteLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setDeleteError(res.error || 'Unable to delete account. Please check password.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-[#110B0E]">Account Settings</h2>
        <p className="text-xs text-[#6D6268] font-light">
          Manage your credentials, alerts and privacy preferences.
        </p>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#701626]/8 text-[#701626] flex items-center justify-center border border-[#C5A059]/30">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-[#110B0E]">Security & Password</h3>
            <p className="text-xs text-[#6D6268] font-light">
              Ensure your Azhai account is safeguarded with a unique password.
            </p>
          </div>
        </div>

        {pwSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" /> Password updated successfully!
          </div>
        )}

        {pwError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {pwError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
              Current Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E]"
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

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
              New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E]"
            />
            {newPassword.length > 0 && (
              <div className="text-[10px] text-[#6D6268] flex items-center justify-between pt-1">
                <span>Strength: <strong className="text-[#701626]">{strength.label}</strong></span>
                <span>8+ chars · 1 uppercase · 1 number</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E]"
            />
          </div>

          <button
            type="submit"
            disabled={pwLoading}
            className="px-6 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Notification Preferences Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#701626]/8 text-[#701626] flex items-center justify-center border border-[#C5A059]/30">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-[#110B0E]">Notification Preferences</h3>
            <p className="text-xs text-[#6D6268] font-light">
              Choose how you hear about drops, promotions and parcel dispatches.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#C5A059]/15 pt-2">
          <label className="py-3.5 flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-bold text-[#110B0E]">Festive Drops & Seasonal Pre-orders</p>
              <p className="text-[11px] text-[#6D6268] font-light">
                Receive private access to new handloom collections 24 hours prior to public release.
              </p>
            </div>
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => handleNotificationChange('newsletter', e.target.checked)}
              className="rounded border-[#C5A059]/40 text-[#701626] focus:ring-[#701626] w-4 h-4"
            />
          </label>

          <label className="py-3.5 flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-bold text-[#110B0E]">Courier SMS & Dispatch Alerts</p>
              <p className="text-[11px] text-[#6D6268] font-light">
                Receive real-time Sri Lankan courier tracking codes directly on your mobile.
              </p>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => handleNotificationChange('smsAlerts', e.target.checked)}
              className="rounded border-[#C5A059]/40 text-[#701626] focus:ring-[#701626] w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="bg-rose-50/50 rounded-3xl p-6 sm:p-8 border border-rose-200/80 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-rose-950">Danger Zone</h3>
            <p className="text-xs text-rose-800 font-light">
              Permanently delete your account and all associated order histories and saved addresses.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-colors cursor-pointer"
          >
            Delete Azhai Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-200 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-display text-xl font-bold text-rose-950 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-600" /> Delete Account
                </h3>
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#6D6268] leading-relaxed">
                This action is irreversible. All your personal data, saved delivery addresses, wishlist items and order history will be deleted.
              </p>

              {deleteError && (
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200">
                  {deleteError}
                </div>
              )}

              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your current password"
                    required
                    className="w-full px-4 py-2.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#6D6268]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={deleteLoading}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-2xl disabled:opacity-50 cursor-pointer"
                  >
                    {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
