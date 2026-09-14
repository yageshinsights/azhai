import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Ruler, Palette, ShoppingBag, ChevronRight, ChevronLeft, Check, Clock, Sparkles } from 'lucide-react';
import { useAdminStore } from '@/store/admin';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import InteractiveMannequin from './InteractiveMannequin';
import {
  type DressType,
  type TailoringFabric,
  type SizePreset,
  DEFAULT_DRESS_TYPES,
  DEFAULT_FABRICS,
  DEFAULT_MEASUREMENT_FIELDS,
  DEFAULT_SIZE_PRESETS,
  formatMeasurement,
  formatLKR,
  inchesToCm,
  cmToInches
} from '@/lib/tailoring';

export default function TailoringStudio() {
  // State from Admin Store (with fallback)
  const storeDressTypes = useAdminStore((s) => s.dressTypes);
  const storeFabrics = useAdminStore((s) => s.tailoringFabrics);
  const storeFields = useAdminStore((s) => s.measurementFields);
  const storePresets = useAdminStore((s) => s.sizePresets);

  const dressTypes = storeDressTypes && storeDressTypes.length > 0 ? storeDressTypes : DEFAULT_DRESS_TYPES;
  const fabrics = storeFabrics && storeFabrics.length > 0 ? storeFabrics : DEFAULT_FABRICS;
  const measurementFields = storeFields && storeFields.length > 0 ? storeFields : DEFAULT_MEASUREMENT_FIELDS;
  const sizePresets = storePresets && storePresets.length > 0 ? storePresets : DEFAULT_SIZE_PRESETS;

  // Cart Store & Auth Store
  const addItem = useCartStore((s) => s.addItem);
  const familyProfiles = useAuthStore((s) => s.familyProfiles) || [];

  // Component State
  const [step, setStep] = useState(1);
  const [selectedDressType, setSelectedDressType] = useState<DressType | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<TailoringFabric | null>(null);
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [sizeLabel, setSizeLabel] = useState<string>('M');
  const [measurements, setMeasurements] = useState<Record<string, number>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Filtered Data
  const activeDressTypes = useMemo(() => 
    dressTypes.filter(d => d.isActive).sort((a,b) => a.displayOrder - b.displayOrder),
  [dressTypes]);

  const compatibleFabrics = useMemo(() => {
    if (!selectedDressType) return [];
    return fabrics
      .filter(f => f.inStock && f.compatibleDressTypeIds.includes(selectedDressType.id))
      .sort((a,b) => a.displayOrder - b.displayOrder);
  }, [fabrics, selectedDressType]);

  const currentMeasurementFields = useMemo(() => {
    if (!selectedDressType) return [];
    return measurementFields
      .filter(f => f.dressTypeId === selectedDressType.id)
      .sort((a,b) => a.displayOrder - b.displayOrder);
  }, [measurementFields, selectedDressType]);

  const currentSizePresets = useMemo(() => {
    if (!selectedDressType) return [];
    return sizePresets.filter(p => p.dressTypeId === selectedDressType.id);
  }, [sizePresets, selectedDressType]);

  // When dress type changes, initialize measurements from 'M' preset or defaults
  useEffect(() => {
    if (selectedDressType) {
      const defaultPreset = currentSizePresets.find(p => p.sizeLabel === 'M') || currentSizePresets[0];
      if (defaultPreset) {
        setSizeLabel(defaultPreset.sizeLabel);
        setMeasurements({ ...defaultPreset.measurements });
      } else {
        const initialMap: Record<string, number> = {};
        currentMeasurementFields.forEach(f => {
          initialMap[f.fieldName] = f.minValue;
        });
        setSizeLabel('Custom');
        setMeasurements(initialMap);
      }
    }
  }, [selectedDressType, currentSizePresets, currentMeasurementFields]);

  const handleDressSelect = (dt: DressType) => {
    setSelectedDressType(dt);
    setSelectedFabric(null);
    setStep(2);
  };

  const handleFabricSelect = (fb: TailoringFabric) => {
    setSelectedFabric(fb);
    setStep(3);
  };

  const handleAddToCart = () => {
    if (!selectedDressType || !selectedFabric) return;

    const fabricPrice = selectedFabric.pricePerUnit;
    const stitchingFee = selectedDressType.stitchingFee;
    const totalPrice = fabricPrice + stitchingFee;

    addItem({
      id: Date.now(),
      name: `Custom ${selectedDressType.name} — ${selectedFabric.name}`,
      price: `LKR ${totalPrice.toLocaleString()}`,
      image: selectedDressType.coverImage,
      quantity: 1,
      size: sizeLabel === 'Custom' ? 'Custom Fit' : sizeLabel,
      tailoring: {
        dressTypeName: selectedDressType.name,
        dressTypeSlug: selectedDressType.slug,
        fabricName: selectedFabric.name,
        fabricPrice,
        stitchingFee,
        sizeLabel: sizeLabel === 'Custom' ? 'Custom Fit' : sizeLabel,
        measurements: { ...measurements },
        leadTime: selectedDressType.leadTime,
      }
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setStep(1);
      setSelectedDressType(null);
      setSelectedFabric(null);
    }, 2000);
  };

  // Helper for step transitions
  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative z-10 scroll-mt-24 bg-[#FCFBF8] rounded-3xl my-10">
      <div className="text-center space-y-2.5 mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold flex items-center justify-center gap-2">
          <Scissors className="w-3.5 h-3.5" /> BESPOKE TAILORING STUDIO
        </span>
        <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#110B0E]">
          Your measurements. Your fabric. Your masterpiece.
        </h2>
        <p className="text-xs sm:text-sm text-[#6D6268] max-w-lg mx-auto font-light leading-relaxed">
          Handcrafted exactly to your size in the finest curated fabrics.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-3xl mx-auto mb-10 relative">
        <div className="flex justify-between items-center relative z-10">
          {[
            { id: 1, label: 'DRESS TYPE', icon: Scissors },
            { id: 2, label: 'PICK FABRIC', icon: Palette },
            { id: 3, label: 'YOUR SIZE', icon: Ruler },
            { id: 4, label: 'REVIEW & ADD', icon: ShoppingBag },
          ].map((s, i) => {
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            const Icon = isCompleted ? Check : s.icon;
            
            return (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <button
                  disabled={step < s.id && !isCompleted}
                  onClick={() => setStep(s.id)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#701626] text-white shadow-lg border border-[#C5A059]'
                      : isCompleted
                      ? 'bg-[#C5A059] text-white'
                      : 'bg-[#F7F4EE] text-[#6D6268] border border-black/5'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-bold ${isActive ? 'text-[#701626]' : 'text-[#6D6268]'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* Progress Line */}
        <div className="absolute top-5 sm:top-6 left-0 right-0 h-0.5 bg-black/5 -z-0">
          <motion.div
            className="h-full bg-[#C5A059]"
            initial={{ width: 0 }}
            animate={{ width: `${((step - 1) / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Steps Content */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#C5A059]/30 shadow-xl overflow-hidden min-h-[500px]">
        <AnimatePresence mode="wait">
          
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" className="p-6 sm:p-10 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl font-bold text-[#110B0E]">Select Dress Type</h3>
              </div>
              <div className="flex overflow-x-auto gap-4 pb-6 snap-x -mx-6 px-6 sm:mx-0 sm:px-0 hide-scrollbar">
                {activeDressTypes.map(dt => {
                  const isSelected = selectedDressType?.id === dt.id;
                  return (
                    <button
                      key={dt.id}
                      onClick={() => handleDressSelect(dt)}
                      className={`relative shrink-0 w-[240px] sm:w-[280px] aspect-[3/4] rounded-2xl overflow-hidden group snap-center text-left ${
                        isSelected ? 'ring-2 ring-[#C5A059] ring-offset-2' : ''
                      }`}
                    >
                      <img src={dt.coverImage} alt={dt.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h4 className="text-white font-display text-xl font-bold mb-2">{dt.name}</h4>
                        <div className="flex items-center gap-3 text-white/80 text-xs font-medium">
                          <span className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">Stitching: {formatLKR(dt.stitchingFee)}</span>
                        </div>
                        <div className="mt-2 text-white/60 text-[10px] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {dt.leadTime}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && selectedDressType && (
            <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" className="p-6 sm:p-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setStep(1)} className="p-2 bg-[#F7F4EE] rounded-full text-[#110B0E] hover:bg-[#C5A059] hover:text-white transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#110B0E]">Choose Fabric</h3>
                  <p className="text-xs text-[#6D6268]">For your {selectedDressType.name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {compatibleFabrics.map(fb => {
                  const isSelected = selectedFabric?.id === fb.id;
                  return (
                    <button
                      key={fb.id}
                      onClick={() => handleFabricSelect(fb)}
                      className={`text-left p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
                        isSelected 
                          ? 'border-[#C5A059] bg-[#FCFBF8] shadow-md ring-1 ring-[#C5A059]' 
                          : 'border-black/5 hover:border-[#C5A059]/50 hover:bg-[#F7F4EE]'
                      }`}
                    >
                      <div className="aspect-[4/3] rounded-xl overflow-hidden mb-1">
                        <img src={fb.swatchImage} alt={fb.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#110B0E] line-clamp-1">{fb.name}</h4>
                        <p className="text-[10px] text-[#6D6268] uppercase tracking-wider mt-0.5">{fb.weight}</p>
                      </div>
                      <div className="mt-auto flex justify-between items-end">
                        <span className="text-[#701626] font-bold text-sm">{formatLKR(fb.pricePerUnit)} <span className="text-[10px] font-normal">/ {fb.unit}</span></span>
                      </div>
                    </button>
                  );
                })}
                {compatibleFabrics.length === 0 && (
                  <div className="col-span-full py-10 text-center text-sm text-[#6D6268]">
                    No compatible fabrics available for this dress type currently.
                  </div>
                )}
              </div>
            </motion.div>
          )}          {/* STEP 3 — INTERACTIVE MANNEQUIN FITTING */}
          {step === 3 && selectedDressType && (
            <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" className="p-6 sm:p-10 flex flex-col h-full space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setStep(2)} className="p-2 bg-[#F7F4EE] rounded-full text-[#110B0E] hover:bg-[#C5A059] hover:text-white transition-colors cursor-pointer">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-[#110B0E]">Visual Fit & Measurements</h3>
                    <p className="text-xs text-[#6D6268]">Tailored for your {selectedDressType.name}</p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#701626] font-bold bg-[#701626]/10 px-3 py-1.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" /> {selectedDressType.leadTime}
                </div>
              </div>

              {/* Quick Load Saved Family Fitting Profile */}
              {familyProfiles.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-[#F7F4EE] via-[#FCFBF8] to-[#F7F4EE] rounded-2xl border border-[#C5A059]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#701626]/10 text-[#701626] flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-[#C5A059]" />
                    </div>
                    <div>
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#701626] block">
                        Patron Fitting Vault
                      </span>
                      <p className="text-xs text-[#110B0E] font-medium">
                        1-Click Auto-Fill from Saved Family Measurements
                      </p>
                    </div>
                  </div>

                  <select
                    onChange={(e) => {
                      const selected = familyProfiles.find((p) => p.id === e.target.value);
                      if (selected) {
                        setMeasurements({ ...selected.measurements });
                        setSizeLabel('Custom');
                        if (selected.unit) setUnit(selected.unit);
                      }
                    }}
                    defaultValue=""
                    className="px-4 py-2 rounded-xl bg-white border border-[#C5A059]/40 text-xs font-bold text-[#701626] focus:outline-none focus:ring-1 focus:ring-[#701626] cursor-pointer shadow-xs"
                  >
                    <option value="" disabled>✨ Load Saved Family Silhouette...</option>
                    {familyProfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.relationship}){p.isDefault ? ' ⭐ Default' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Interactive Haute-Couture Fitting Studio */}
              <InteractiveMannequin
                fields={currentMeasurementFields}
                presets={currentSizePresets}
                measurements={measurements}
                onChangeMeasurements={setMeasurements}
                sizeLabel={sizeLabel}
                onChangeSizeLabel={setSizeLabel}
                unit={unit}
                onToggleUnit={setUnit}
                dressTypeName={selectedDressType.name}
                dressTypeSlug={selectedDressType.slug}
              />

              {/* Step 3 Action Bar */}
              <div className="pt-4 border-t border-[#C5A059]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[#6D6268]">
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  <span>
                    Selected: <strong className="text-[#110B0E]">{sizeLabel === 'Custom' ? 'Custom Fit Dimensions' : `Preset Size ${sizeLabel}`}</strong>
                  </span>
                </div>

                <button
                  onClick={() => setStep(4)}
                  className="w-full sm:w-auto px-8 py-3 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#701626]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Review & Complete Order</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4 */}
          {step === 4 && selectedDressType && selectedFabric && (
            <motion.div key="step4" variants={variants} initial="initial" animate="animate" exit="exit" className="p-6 sm:p-10">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setStep(3)} className="p-2 bg-[#F7F4EE] rounded-full text-[#110B0E] hover:bg-[#C5A059] hover:text-white transition-colors cursor-pointer">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-display text-2xl font-bold text-[#110B0E]">Review & Add to Bag</h3>
              </div>

              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-md">
                    <Check className="w-10 h-10" />
                  </div>
                  <h4 className="font-display text-2xl font-bold text-[#110B0E] mb-2">Added to Bag!</h4>
                  <p className="text-sm text-[#6D6268]">Your bespoke masterpiece has been added to your shopping bag.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="aspect-[4/5] rounded-3xl overflow-hidden relative border border-[#C5A059]/30 shadow-lg">
                      <img src={selectedDressType.coverImage} alt={selectedDressType.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl border-2 border-white overflow-hidden shadow-xl">
                            <img src={selectedFabric.swatchImage} alt={selectedFabric.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#DFBF77] tracking-wider block">Selected Fabric</span>
                            <span className="font-display text-sm font-bold text-white block">{selectedFabric.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#FCFBF8] border border-[#C5A059]/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-md">
                    <div>
                      <div className="mb-6 pb-4 border-b border-[#C5A059]/20">
                        <span className="text-[10px] uppercase tracking-wider text-[#701626] font-bold">Bespoke Couture Order</span>
                        <h4 className="font-display text-2xl sm:text-3xl font-bold text-[#110B0E] mt-1">{selectedDressType.name}</h4>
                        <p className="text-sm text-[#6D6268] mt-1">Crafted in {selectedFabric.name}</p>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center pb-2 border-b border-black/5">
                          <span className="text-xs font-bold text-[#6D6268] uppercase tracking-wider">Fit Profile</span>
                          <span className="text-xs font-bold text-[#701626] bg-[#701626]/10 px-3 py-1 rounded-full">
                            {sizeLabel === 'Custom' ? '✨ Custom Fit' : `Preset Size ${sizeLabel}`}
                          </span>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-4 border border-[#C5A059]/30 shadow-sm">
                          <h5 className="text-[10px] uppercase tracking-wider font-bold text-[#6D6268] mb-3 flex items-center gap-1.5">
                            <Ruler className="w-3.5 h-3.5 text-[#701626]" /> Tailor Measurement Matrix
                          </h5>
                          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                            {currentMeasurementFields.map(field => {
                              const inches = measurements[field.fieldName] ?? field.minValue;
                              return (
                                <div key={field.id} className="flex justify-between text-xs py-1 border-b border-black/5">
                                  <span className="text-[#6D6268]">{field.fieldLabel}:</span>
                                  <span className="font-mono font-bold text-[#110B0E]">{formatMeasurement(inches, unit)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-2 pt-2 text-xs text-[#6D6268]">
                          <div className="flex justify-between items-center">
                            <span>Fabric Cost ({selectedFabric.name}):</span>
                            <span className="font-bold text-[#110B0E]">{formatLKR(selectedFabric.pricePerUnit)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Master Stitching & Tailoring:</span>
                            <span className="font-bold text-[#110B0E]">{formatLKR(selectedDressType.stitchingFee)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-[#C5A059]/30 text-base font-bold text-[#110B0E]">
                            <span>Total Investment:</span>
                            <span className="text-[#701626] font-display text-2xl font-bold">
                              {formatLKR(selectedFabric.pricePerUnit + selectedDressType.stitchingFee)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#C5A059]/20 space-y-3">
                      <div className="bg-[#F7F4EE] p-3 rounded-xl border border-[#C5A059]/30 text-[11px] text-[#6D6268] flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#701626]" /> Lead Time
                        </span>
                        <strong className="text-[#701626]">{selectedDressType.leadTime}</strong>
                      </div>

                      <button
                        onClick={handleAddToCart}
                        className="w-full py-4 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs uppercase tracking-widest font-bold rounded-2xl shadow-xl shadow-[#701626]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add Bespoke Creation to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
}
