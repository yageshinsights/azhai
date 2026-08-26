import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Edit2, Trash2, Check, Star, X, Building, Home, ShieldCheck } from 'lucide-react';
import { useAuthStore, type SavedAddress } from '@/store/auth';
import { validatePhone } from '@/lib/auth-utils';

const SRI_LANKA_DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
];

export default function Addresses() {
  const { addresses, addAddress, updateAddress, removeAddress, setDefaultAddress } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [label, setLabel] = useState('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('Colombo');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingId(null);
    setLabel('Home');
    setFullName('');
    setPhone('');
    setAddress('');
    setCity('');
    setDistrict('Colombo');
    setPostalCode('');
    setIsDefault(addresses.length === 0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: SavedAddress) => {
    setEditingId(addr.id);
    setLabel(addr.label);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddress(addr.address);
    setCity(addr.city);
    setDistrict(addr.district);
    setPostalCode(addr.postalCode || '');
    setIsDefault(addr.isDefault);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !district.trim()) {
      setFormError('Please fill in all required address fields.');
      return;
    }

    if (!validatePhone(phone)) {
      setFormError('Please enter a valid Sri Lankan mobile number (e.g. +94 77 123 4567).');
      return;
    }

    if (editingId) {
      updateAddress(editingId, {
        label,
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        district,
        postalCode: postalCode.trim(),
        isDefault,
      });
    } else {
      addAddress({
        label,
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        district,
        postalCode: postalCode.trim(),
        isDefault,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#110B0E]">Saved Addresses</h2>
          <p className="text-xs text-[#6D6268] font-light">
            Manage your delivery destinations for one-click checkout across Sri Lanka.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {/* Address Grid or Empty State */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#C5A059]/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#701626]/8 text-[#701626] flex items-center justify-center mx-auto border border-[#C5A059]/30">
            <MapPin className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-display text-xl font-bold text-[#110B0E]">No Saved Addresses Yet</h3>
            <p className="text-xs text-[#6D6268] font-light">
              Add your home or office address now for instant one-click express delivery.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-3xl p-6 border transition-all relative flex flex-col justify-between space-y-4 ${
                addr.isDefault
                  ? 'border-[#701626] shadow-[0_8px_30px_rgba(112,22,38,0.06)]'
                  : 'border-[#C5A059]/30 hover:border-[#C5A059]/60 shadow-sm'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#701626]/10 text-[#701626] flex items-center justify-center">
                      {addr.label.toLowerCase().includes('office') ? (
                        <Building className="w-3.5 h-3.5" />
                      ) : (
                        <Home className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <span className="font-display text-base font-bold text-[#110B0E]">
                      {addr.label}
                    </span>
                  </div>

                  {addr.isDefault && (
                    <span className="bg-[#701626] text-[#F3E8CE] text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-[#F3E8CE]" /> Default
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-1 text-[#6D6268] font-light leading-relaxed pt-1">
                  <p className="font-bold text-[#110B0E] font-sans">{addr.fullName}</p>
                  <p>{addr.address}</p>
                  <p>
                    {addr.city}, {addr.district} {addr.postalCode && `· ${addr.postalCode}`}
                  </p>
                  <p className="pt-1 text-[#110B0E] font-medium">Phone: {addr.phone}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#C5A059]/20 text-xs">
                {!addr.isDefault ? (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-[11px] font-bold text-[#701626] hover:underline cursor-pointer"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Default Delivery
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="p-2 text-[#6D6268] hover:text-[#701626] rounded-xl hover:bg-[#F7F4EE] transition-colors"
                    title="Edit Address"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeAddress(addr.id)}
                    className="p-2 text-[#6D6268] hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                    title="Remove Address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#C5A059]/40 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-4">
                <h3 className="font-display text-xl font-bold text-[#110B0E]">
                  {editingId ? 'Edit Delivery Address' : 'Add New Address'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F7F4EE] hover:bg-gray-200 flex items-center justify-center text-[#110B0E]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                {/* Label Radio Buttons */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Address Label
                  </label>
                  <div className="flex items-center gap-2">
                    {['Home', 'Office', 'Other'].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLabel(l)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          label === l
                            ? 'bg-[#701626] text-white shadow-sm'
                            : 'bg-[#F7F4EE] text-[#110B0E]/70 border border-[#C5A059]/20'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Recipient Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Preethi"
                      required
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Phone (SMS) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      required
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E]"
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Street Address & House No. <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. No. 42/A, Temple Road, Kollupitiya"
                    rows={2}
                    required
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E]"
                  />
                </div>

                {/* City & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      City / Town <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Colombo 03"
                      required
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      District <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E]"
                    >
                      {SRI_LANKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Postal Code & Default Checkbox */}
                <div className="space-y-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Postal Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="00300"
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E]"
                    />
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="rounded border-[#C5A059]/40 text-[#701626] focus:ring-[#701626]"
                    />
                    <span className="text-xs text-[#110B0E] font-medium">
                      Set as my default shipping address
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#C5A059]/20">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-xs text-[#6D6268] hover:text-[#110B0E] font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all"
                  >
                    Save Address
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
