import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Sparkles, Check, Info } from 'lucide-react';
import { useAdminStore } from '@/store/admin';
import { inchesToCm } from '@/lib/tailoring';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export default function SizeGuideModal({ isOpen, onClose, category = 'Kurties' }: SizeGuideModalProps) {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [activeTab, setActiveTab] = useState<'kurties' | 'tops' | 'sarees'>(
    category.toLowerCase().includes('top') ? 'tops' : category.toLowerCase().includes('saree') ? 'sarees' : 'kurties'
  );

  const storeDressTypes = useAdminStore((s) => s.dressTypes) || [];
  const storeFields = useAdminStore((s) => s.measurementFields) || [];
  const storePresets = useAdminStore((s) => s.sizePresets) || [];

  // Determine current active dress type from store
  const activeDressType = useMemo(() => {
    if (activeTab === 'kurties') {
      return storeDressTypes.find((d) => d.slug?.includes('kurti') || d.name?.toLowerCase().includes('kurti'));
    }
    if (activeTab === 'tops') {
      return storeDressTypes.find((d) => d.slug?.includes('top') || d.name?.toLowerCase().includes('top') || d.slug?.includes('bustier'));
    }
    return null;
  }, [activeTab, storeDressTypes]);

  const activeFields = useMemo(() => {
    if (!activeDressType) return [];
    return storeFields
      .filter((f) => f.dressTypeId === activeDressType.id)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [activeDressType, storeFields]);

  const activePresets = useMemo(() => {
    if (!activeDressType) return [];
    return storePresets.filter((p) => p.dressTypeId === activeDressType.id);
  }, [activeDressType, storePresets]);

  const kurtiSizes = [
    { size: 'XS', bustIn: '34', bustCm: '86', waistIn: '30', waistCm: '76', hipIn: '38', hipCm: '96', lengthIn: '44', lengthCm: '112' },
    { size: 'S', bustIn: '36', bustCm: '91', waistIn: '32', waistCm: '81', hipIn: '40', hipCm: '102', lengthIn: '44', lengthCm: '112' },
    { size: 'M', bustIn: '38', bustCm: '97', waistIn: '34', waistCm: '86', hipIn: '42', hipCm: '107', lengthIn: '45', lengthCm: '114' },
    { size: 'L', bustIn: '40', bustCm: '102', waistIn: '36', waistCm: '91', hipIn: '44', hipCm: '112', lengthIn: '45', lengthCm: '114' },
    { size: 'XL', bustIn: '42', bustCm: '107', waistIn: '38', waistCm: '97', hipIn: '46', hipCm: '117', lengthIn: '46', lengthCm: '117' },
    { size: 'XXL', bustIn: '44', bustCm: '112', waistIn: '40', waistCm: '102', hipIn: '48', hipCm: '122', lengthIn: '46', lengthCm: '117' },
  ];

  const topSizes = [
    { size: 'XS', bustIn: '32-34', bustCm: '81-86', waistIn: '26-28', waistCm: '66-71', lengthIn: '15', lengthCm: '38' },
    { size: 'S', bustIn: '34-36', bustCm: '86-91', waistIn: '28-30', waistCm: '71-76', lengthIn: '15.5', lengthCm: '39' },
    { size: 'M', bustIn: '36-38', bustCm: '91-97', waistIn: '30-32', waistCm: '76-81', lengthIn: '16', lengthCm: '40' },
    { size: 'L', bustIn: '38-40', bustCm: '97-102', waistIn: '32-34', waistCm: '81-86', lengthIn: '16.5', lengthCm: '42' },
    { size: 'XL', bustIn: '40-42', bustCm: '102-107', waistIn: '34-36', waistCm: '86-91', lengthIn: '17', lengthCm: '43' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#C5A059]/40 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#701626]/10 text-[#701626] flex items-center justify-center">
                  <Ruler className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-[#110B0E]">
                    Azhai Size Guide & Fit
                  </h3>
                  <p className="text-[11px] text-[#6D6268] font-light">
                    Handcrafted tailored dimensions for flawless boutique drape.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F7F4EE] hover:bg-gray-200 flex items-center justify-center text-[#110B0E] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Tabs & Unit Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 bg-[#F7F4EE] p-1 rounded-2xl border border-[#C5A059]/25">
                {[
                  { key: 'kurties', label: 'Kurties & Sets' },
                  { key: 'tops', label: 'Tops & Bustiers' },
                  { key: 'sarees', label: 'Sarees & Shawls' },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === t.key
                        ? 'bg-[#701626] text-white shadow-sm'
                        : 'text-[#6D6268] hover:text-[#110B0E]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Inches vs CM toggle */}
              {activeTab !== 'sarees' && (
                <div className="flex items-center gap-1 bg-[#F7F4EE] p-1 rounded-2xl border border-[#C5A059]/25 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setUnit('inches')}
                    className={`px-3 py-1 text-[11px] font-bold rounded-xl transition-all ${
                      unit === 'inches' ? 'bg-[#701626] text-white' : 'text-[#6D6268]'
                    }`}
                  >
                    Inches
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('cm')}
                    className={`px-3 py-1 text-[11px] font-bold rounded-xl transition-all ${
                      unit === 'cm' ? 'bg-[#701626] text-white' : 'text-[#6D6268]'
                    }`}
                  >
                    CM
                  </button>
                </div>
              )}
            </div>

            {/* Table based on active tab */}
            {(activeTab === 'kurties' || activeTab === 'tops') && (
              <div className="overflow-x-auto rounded-2xl border border-[#C5A059]/30">
                {activeFields.length > 0 && activePresets.length > 0 ? (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#701626] text-[#F3E8CE] uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Size</th>
                        {activeFields.map((f) => (
                          <th key={f.id} className="p-3 whitespace-nowrap">
                            {f.fieldLabel} ({unit === 'inches' ? 'in' : 'cm'})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5A059]/15">
                      {activePresets.map((preset, idx) => (
                        <tr key={preset.id || preset.sizeLabel} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FCFBF8]'}>
                          <td className="p-3 font-bold text-[#701626]">{preset.sizeLabel}</td>
                          {activeFields.map((f) => {
                            const val = preset.measurements?.[f.fieldName];
                            const displayVal =
                              val != null
                                ? unit === 'inches'
                                  ? `${val}"`
                                  : `${inchesToCm(val)} cm`
                                : '—';
                            return (
                              <td key={f.id} className="p-3 text-[#110B0E] whitespace-nowrap">
                                {displayVal}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : activeTab === 'kurties' ? (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#701626] text-[#F3E8CE] uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Size</th>
                        <th className="p-3">Bust ({unit === 'inches' ? 'in' : 'cm'})</th>
                        <th className="p-3">Waist ({unit === 'inches' ? 'in' : 'cm'})</th>
                        <th className="p-3">Hip ({unit === 'inches' ? 'in' : 'cm'})</th>
                        <th className="p-3">Length ({unit === 'inches' ? 'in' : 'cm'})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5A059]/15">
                      {kurtiSizes.map((row, idx) => (
                        <tr key={row.size} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FCFBF8]'}>
                          <td className="p-3 font-bold text-[#701626]">{row.size}</td>
                          <td className="p-3 text-[#110B0E]">{unit === 'inches' ? row.bustIn : row.bustCm}</td>
                          <td className="p-3 text-[#110B0E]">{unit === 'inches' ? row.waistIn : row.waistCm}</td>
                          <td className="p-3 text-[#110B0E]">{unit === 'inches' ? row.hipIn : row.hipCm}</td>
                          <td className="p-3 text-[#110B0E]">{unit === 'inches' ? row.lengthIn : row.lengthCm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#701626] text-[#F3E8CE] uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Size</th>
                        <th className="p-3">Bust ({unit === 'inches' ? 'in' : 'cm'})</th>
                        <th className="p-3">Waist ({unit === 'inches' ? 'in' : 'cm'})</th>
                        <th className="p-3">Crop Length ({unit === 'inches' ? 'in' : 'cm'})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5A059]/15">
                      {topSizes.map((row, idx) => (
                        <tr key={row.size} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FCFBF8]'}>
                          <td className="p-3 font-bold text-[#701626]">{row.size}</td>
                          <td className="p-3 text-[#110B0E]">{unit === 'inches' ? row.bustIn : row.bustCm}</td>
                          <td className="p-3 text-[#110B0E]">{unit === 'inches' ? row.waistIn : row.waistCm}</td>
                          <td className="p-3 text-[#110B0E]">{unit === 'inches' ? row.lengthIn : row.lengthCm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'sarees' && (
              <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/30 space-y-3">
                <div className="space-y-1">
                  <h4 className="font-display text-base font-bold text-[#110B0E]">
                    Standard Saree & Shawl Specifications
                  </h4>
                  <p className="text-xs text-[#6D6268] font-light leading-relaxed">
                    All Azhai Silk Sarees are woven to standard <strong>6.25 meters</strong> length, inclusive of an attached unstitched matching blouse fabric piece (80 cm).
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-[#C5A059]/20">
                    <span className="font-bold text-[#701626]">Saree Dimensions:</span>
                    <p className="text-[#6D6268] pt-1">Length: 5.5m Saree + 0.8m Blouse (Width: 44–46 inches)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#C5A059]/20">
                    <span className="font-bold text-[#701626]">Cashmere Shawl Dimensions:</span>
                    <p className="text-[#6D6268] pt-1">Length: 2.0 meters (Width: 28–30 inches)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Measuring Tips Box */}
            <div className="p-4 rounded-2xl bg-[#701626]/5 border border-[#701626]/20 flex items-start gap-3">
              <Info className="w-4 h-4 text-[#701626] shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs text-[#110B0E]">
                <p className="font-bold">Need Bespoke Tailoring or Sizing Assistance?</p>
                <p className="text-[11px] text-[#6D6268] font-light">
                  If you fall between sizes, we recommend sizing up. For personalized alterations in Colombo, chat with Preethi directly on WhatsApp.
                </p>
              </div>
            </div>

            {/* Close action */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
