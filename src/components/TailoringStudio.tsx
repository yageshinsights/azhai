import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Ruler, Palette, ShoppingBag, ChevronRight, ChevronLeft, Check, Clock, Sparkles } from 'lucide-react';
import { useAdminStore } from '@/store/admin';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { COLLECTIONS, type Collection } from '@/lib/data';
import InteractiveMannequin from './InteractiveMannequin';
import {
  type DressType,
  type TailoringFabric,
  DEFAULT_DRESS_TYPES,
  DEFAULT_FABRICS,
  DEFAULT_MEASUREMENT_FIELDS,
  formatMeasurement,
  formatLKR,
} from '@/lib/tailoring';

export default function TailoringStudio() {
  // Main Collections & Tailoring Data from Admin Store (with fallback)
  const storeCategories = useAdminStore((s) => s.categories);
  const collections = Array.isArray(storeCategories) && storeCategories.length > 0 ? storeCategories : COLLECTIONS;

  const storeDressTypes = useAdminStore((s) => s.dressTypes);
  const storeFabrics = useAdminStore((s) => s.tailoringFabrics);
  const storeFields = useAdminStore((s) => s.measurementFields);

  const dressTypes = storeDressTypes && storeDressTypes.length > 0 ? storeDressTypes : DEFAULT_DRESS_TYPES;
  const fabrics = storeFabrics && storeFabrics.length > 0 ? storeFabrics : DEFAULT_FABRICS;
  const measurementFields = storeFields && storeFields.length > 0 ? storeFields : DEFAULT_MEASUREMENT_FIELDS;

  // Cart Store & Auth Store
  const addItem = useCartStore((s) => s.addItem);
  const familyProfiles = useAuthStore((s) => s.familyProfiles) || [];

  // 5-Step Configurator State
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedDressType, setSelectedDressType] = useState<DressType | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<TailoringFabric | null>(null);
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [sizeLabel, setSizeLabel] = useState<string>('Custom Fit');
  const [measurements, setMeasurements] = useState<Record<string, number>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Collection Slider state and navigation handlers
  const collectionSliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const checkScroll = () => {
    if (!collectionSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = collectionSliderRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
    const itemWidth = 320;
    const index = Math.round(scrollLeft / itemWidth);
    setActiveSlideIndex(Math.min(Math.max(0, index), collections.length - 1));
  };

  const slideLeft = () => {
    if (collectionSliderRef.current) {
      collectionSliderRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const slideRight = () => {
    if (collectionSliderRef.current) {
      collectionSliderRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  const scrollToSlide = (idx: number) => {
    if (collectionSliderRef.current) {
      const target = collectionSliderRef.current.children[idx] as HTMLElement;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      }
    }
  };

  // Filtered Active Silhouettes
  const activeDressTypes = useMemo(() => 
    dressTypes.filter(d => d.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
  [dressTypes]);

  // Silhouettes for the selected collection (matching by collectionSlug or collectionId)
  const collectionSilhouettes = useMemo(() => {
    if (!selectedCollection) return [];
    return activeDressTypes.filter(d => 
      d.collectionSlug === selectedCollection.slug || 
      (d.collectionId && d.collectionId === selectedCollection.id)
    );
  }, [activeDressTypes, selectedCollection]);

  // Compatible fabrics for selected silhouette
  const compatibleFabrics = useMemo(() => {
    if (!selectedDressType) return [];
    return fabrics
      .filter(f => f.inStock && f.compatibleDressTypeIds.includes(selectedDressType.id))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [fabrics, selectedDressType]);

  // Measurement fields for the selected garment collection
  const currentMeasurementFields = useMemo(() => {
    if (!selectedCollection) return [];
    return measurementFields
      .filter(f => f.categorySlug === selectedCollection.slug)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [measurementFields, selectedCollection]);

  // When collection or dress type changes, initialize measurements to balanced defaults
  useEffect(() => {
    if (currentMeasurementFields.length > 0) {
      const initialMap: Record<string, number> = {};
      currentMeasurementFields.forEach(f => {
        initialMap[f.fieldName] = Math.round((f.minValue + f.maxValue) / 2);
      });
      setSizeLabel('Custom Fit');
      setMeasurements(initialMap);
    }
  }, [currentMeasurementFields]);

  // Step 1 -> Select Collection
  const handleCollectionSelect = (col: Collection) => {
    setSelectedCollection(col);
    setSelectedDressType(null);
    setSelectedFabric(null);
    setStep(2);
  };

  // Step 2 -> Select Silhouette
  const handleDressSelect = (dt: DressType) => {
    setSelectedDressType(dt);
    setSelectedFabric(null);
    setStep(3);
  };

  // Step 3 -> Select Fabric
  const handleFabricSelect = (fb: TailoringFabric) => {
    setSelectedFabric(fb);
    setStep(4);
  };

  // Step 5 -> Add To Bag with Transparent Material + Stitching Calculation
  const handleAddToCart = () => {
    if (!selectedDressType || !selectedFabric || !selectedCollection) return;

    const fabricPricePerMeter = selectedFabric.pricePerUnit;
    const requiredMeters = selectedDressType.requiredMeters || 2.5;
    const fabricTotal = fabricPricePerMeter * requiredMeters;
    const stitchingFee = selectedDressType.stitchingFee;
    const totalPrice = fabricTotal + stitchingFee;

    addItem({
      id: Date.now(),
      name: `Custom ${selectedDressType.name} — ${selectedFabric.name}`,
      price: `LKR ${Math.round(totalPrice).toLocaleString()}`,
      image: selectedDressType.coverImage,
      quantity: 1,
      size: 'Custom Fit',
      tailoring: {
        collectionName: selectedCollection.name,
        collectionSlug: selectedCollection.slug,
        dressTypeName: selectedDressType.name,
        dressTypeSlug: selectedDressType.slug,
        fabricName: selectedFabric.name,
        fabricPricePerMeter,
        requiredMeters,
        fabricTotal,
        stitchingFee,
        sizeLabel: 'Custom Fit',
        measurements: { ...measurements },
        leadTime: selectedDressType.leadTime,
      }
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setStep(1);
      setSelectedCollection(null);
      setSelectedDressType(null);
      setSelectedFabric(null);
    }, 2200);
  };

  // Helper for step transitions
  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <section className="py-10 sm:py-16 px-3 sm:px-8 max-w-7xl mx-auto relative z-10 scroll-mt-24 bg-[#FCFBF8] rounded-3xl my-6 sm:my-10">
      {/* Header */}
      <div className="text-center space-y-2.5 mb-8 sm:mb-10 px-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold flex items-center justify-center gap-2">
          <Scissors className="w-3.5 h-3.5" /> BESPOKE TAILORING STUDIO
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#110B0E]">
          Your measurements. Your fabric. Your masterpiece.
        </h2>
        <p className="text-xs sm:text-sm text-[#6D6268] max-w-xl mx-auto font-light leading-relaxed">
          Select your garment collection, choose your signature silhouette, customize with handcrafted silks, and experience precision bespoke couture.
        </p>
      </div>

      {/* 5-Step Horizontal Progress Indicator */}
      <div className="max-w-3xl mx-auto mb-8 sm:mb-10 relative px-1 sm:px-0">
        <div className="flex justify-between items-center relative z-10">
          {[
            { id: 1, label: 'COLLECTION', icon: Sparkles },
            { id: 2, label: 'SILHOUETTE', icon: Scissors },
            { id: 3, label: 'FABRIC', icon: Palette },
            { id: 4, label: 'SIZING', icon: Ruler },
            { id: 5, label: 'REVIEW', icon: ShoppingBag },
          ].map((s) => {
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            const Icon = isCompleted ? Check : s.icon;
            
            return (
              <div key={s.id} className="flex flex-col items-center gap-1.5 sm:gap-2">
                <button
                  disabled={step < s.id && !isCompleted}
                  onClick={() => {
                    if (s.id === 1) setStep(1);
                    else if (s.id === 2 && selectedCollection) setStep(2);
                    else if (s.id === 3 && selectedDressType) setStep(3);
                    else if (s.id === 4 && selectedFabric) setStep(4);
                    else if (s.id === 5 && selectedFabric) setStep(5);
                  }}
                  className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#701626] text-white shadow-lg border border-[#C5A059]'
                      : isCompleted
                      ? 'bg-[#C5A059] text-white'
                      : 'bg-[#F7F4EE] text-[#6D6268] border border-black/5 opacity-60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </button>
                <span className={`text-[7.5px] xs:text-[8.5px] sm:text-[10px] uppercase tracking-tight xs:tracking-wider font-bold text-center max-w-[56px] xs:max-w-none truncate ${isActive ? 'text-[#701626]' : 'text-[#6D6268]'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* Progress Line */}
        <div className="absolute top-4 sm:top-6 left-5 right-5 h-0.5 bg-black/5 -z-0">
          <motion.div
            className="h-full bg-[#C5A059]"
            initial={{ width: 0 }}
            animate={{ width: `${((step - 1) / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Studio Card Container */}
      <div className="bg-white rounded-3xl border border-[#C5A059]/30 shadow-xl overflow-hidden min-h-[500px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: CHOOSE GARMENT COLLECTION */}
          {step === 1 && (
            <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-10 flex flex-col h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#110B0E]">
                    1. Choose Garment Collection
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6D6268]">
                    Select which attire category you want custom-tailored to your exact fit.
                  </p>
                </div>
                
                {/* Desktop Carousel Navigation Controls */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={slideLeft}
                    disabled={!canScrollLeft}
                    className={`w-9 h-9 rounded-full border border-[#C5A059]/40 flex items-center justify-center transition-all ${
                      canScrollLeft 
                        ? 'bg-white text-[#701626] hover:bg-[#701626] hover:text-white cursor-pointer shadow-xs' 
                        : 'bg-[#F7F4EE] text-gray-300 border-gray-200 cursor-not-allowed'
                    }`}
                    title="Slide Left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={slideRight}
                    disabled={!canScrollRight}
                    className={`w-9 h-9 rounded-full border border-[#C5A059]/40 flex items-center justify-center transition-all ${
                      canScrollRight 
                        ? 'bg-white text-[#701626] hover:bg-[#701626] hover:text-white cursor-pointer shadow-xs' 
                        : 'bg-[#F7F4EE] text-gray-300 border-gray-200 cursor-not-allowed'
                    }`}
                    title="Slide Right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Horizontal Scrollable Row of Garment Collections */}
              <div className="relative">
                <div 
                  ref={collectionSliderRef}
                  onScroll={checkScroll}
                  className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth hide-scrollbar px-1"
                >
                  {collections.map(col => {
                    const isSelected = selectedCollection?.id === col.id;
                    const silhouettesInCol = activeDressTypes.filter(d => 
                      d.collectionSlug === col.slug || 
                      (d.collectionId && d.collectionId === col.id)
                    );

                    return (
                      <div
                        key={col.id}
                        className="w-[260px] xs:w-[280px] sm:w-[320px] shrink-0 snap-start flex flex-col"
                      >
                        <button
                          onClick={() => handleCollectionSelect(col)}
                          className={`w-full text-left rounded-3xl border-2 transition-all p-3 sm:p-4 bg-[#FCFBF8] flex flex-col h-full group/card cursor-pointer ${
                            isSelected 
                              ? 'border-[#701626] shadow-xl shadow-[#701626]/10 ring-2 ring-[#701626]/20 bg-white' 
                              : 'border-[#C5A059]/30 hover:border-[#C5A059] hover:shadow-lg hover:bg-white'
                          }`}
                        >
                          {/* Image Container with Aspect Ratio */}
                          <div className="aspect-[4/5] rounded-2xl overflow-hidden relative mb-3 sm:mb-4 bg-gray-100">
                            <img 
                              src={col.heroImage} 
                              alt={col.name} 
                              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            
                            {/* Badges on image */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                                {col.season || 'Signature Edit'}
                              </span>
                              <span className="text-[9.5px] font-bold text-[#DFBF77] bg-[#701626]/90 px-2.5 py-0.5 rounded-full shadow-xs">
                                {silhouettesInCol.length} Silhouettes
                              </span>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 text-white">
                              <h4 className="font-display text-xl sm:text-2xl font-bold leading-tight drop-shadow-sm">
                                {col.name}
                              </h4>
                            </div>
                          </div>

                          {/* Collection Description & CTA */}
                          <div className="space-y-2 flex-1 flex flex-col justify-between px-1">
                            <p className="text-xs text-[#6D6268] line-clamp-2 leading-relaxed">
                              {col.tagline || col.description}
                            </p>

                            <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs font-bold text-[#701626]">
                              <span>Explore Silhouettes</span>
                              <span className="w-7 h-7 rounded-full bg-[#701626]/10 flex items-center justify-center group-hover/card:bg-[#701626] group-hover/card:text-white transition-colors">
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Swipe / Dots Indicator */}
              <div className="flex sm:hidden justify-center items-center gap-1.5 pt-2 pb-1">
                {collections.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToSlide(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeSlideIndex === i ? 'w-5 bg-[#701626]' : 'w-1.5 bg-[#C5A059]/40'
                    }`}
                    title={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: CHOOSE DESIGN SILHOUETTE */}
          {step === 2 && selectedCollection && (
            <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setStep(1)}
                  className="p-2 bg-[#F7F4EE] rounded-full text-[#110B0E] hover:bg-[#C5A059] hover:text-white transition-colors cursor-pointer"
                  title="Back to Collections"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#110B0E]">
                    2. Select Design Silhouette
                  </h3>
                  <p className="text-xs text-[#6D6268]">
                    Designs crafted specifically for <strong className="text-[#701626]">{selectedCollection.name}</strong>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {collectionSilhouettes.map(dt => {
                  const isSelected = selectedDressType?.id === dt.id;
                  return (
                    <button
                      key={dt.id}
                      onClick={() => handleDressSelect(dt)}
                      className={`text-left p-3 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all flex flex-col gap-2 sm:gap-3 cursor-pointer ${
                        isSelected 
                          ? 'border-[#701626] bg-[#FCFBF8] shadow-md ring-2 ring-[#701626]/20' 
                          : 'border-black/5 hover:border-[#C5A059]/50 hover:bg-[#F7F4EE]/60'
                      }`}
                    >
                      <div className="aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden relative mb-1 bg-gray-100">
                        <img src={dt.coverImage} alt={dt.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-semibold text-white flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#DFBF77]" />
                          <span>{dt.leadTime}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-display text-sm sm:text-base font-bold text-[#110B0E] line-clamp-1">{dt.name}</h4>
                        {dt.description && (
                          <p className="text-[11px] text-[#6D6268] line-clamp-2 mt-1 hidden sm:block">{dt.description}</p>
                        )}
                        <span className="inline-block mt-1 text-[9.5px] font-bold text-[#701626] bg-[#701626]/8 px-2 py-0.5 rounded-full">
                          📐 {dt.requiredMeters || 2.5}m Fabric Required
                        </span>
                      </div>
                      <div className="mt-auto flex justify-between items-end pt-2 border-t border-black/5">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-[#6D6268] block">Master Stitching</span>
                          <span className="text-[#701626] font-bold text-xs sm:text-sm">{formatLKR(dt.stitchingFee)}</span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-[#C5A059] hidden xs:inline">Select &rarr;</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {collectionSilhouettes.length === 0 && (
                <div className="py-16 text-center space-y-3">
                  <p className="text-sm text-[#6D6268]">
                    No bespoke silhouettes are currently listed under <strong>{selectedCollection.name}</strong>.
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-2 rounded-xl bg-[#701626] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Choose Another Collection
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: CHOOSE COMPATIBLE FABRIC */}
          {step === 3 && selectedDressType && (
            <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setStep(2)}
                  className="p-2 bg-[#F7F4EE] rounded-full text-[#110B0E] hover:bg-[#C5A059] hover:text-white transition-colors cursor-pointer"
                  title="Back to Silhouettes"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#110B0E]">3. Choose Fabric</h3>
                  <p className="text-xs text-[#6D6268]">
                    Finest artisanal silks and weaves compatible with your <strong className="text-[#701626]">{selectedDressType.name}</strong> ({selectedDressType.requiredMeters || 2.5}m)
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {compatibleFabrics.map(fb => {
                  const isSelected = selectedFabric?.id === fb.id;
                  const fabricTotal = fb.pricePerUnit * (selectedDressType.requiredMeters || 2.5);
                  return (
                    <button
                      key={fb.id}
                      onClick={() => handleFabricSelect(fb)}
                      className={`text-left p-3 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all flex flex-col gap-2 sm:gap-3 cursor-pointer ${
                        isSelected 
                          ? 'border-[#C5A059] bg-[#FCFBF8] shadow-md ring-2 ring-[#C5A059]' 
                          : 'border-black/5 hover:border-[#C5A059]/50 hover:bg-[#F7F4EE]/60'
                      }`}
                    >
                      <div className="aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden mb-1 bg-gray-100">
                        <img src={fb.swatchImage} alt={fb.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#110B0E] line-clamp-1">{fb.name}</h4>
                        <p className="text-[9.5px] sm:text-[10px] text-[#6D6268] uppercase tracking-wider mt-0.5 truncate">{fb.weight}</p>
                      </div>
                      <div className="mt-auto flex justify-between items-end pt-2 border-t border-black/5">
                        <div>
                          <div className="text-[#701626] font-bold text-xs sm:text-sm">
                            {formatLKR(fabricTotal)}
                          </div>
                          <div className="text-[9px] text-[#6D6268]">
                            {formatLKR(fb.pricePerUnit)}/m × {selectedDressType.requiredMeters || 2.5}m
                          </div>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-[#C5A059] hidden xs:inline">Select & Fit &rarr;</span>
                      </div>
                    </button>
                  );
                })}
                {compatibleFabrics.length === 0 && (
                  <div className="col-span-full py-12 text-center text-sm text-[#6D6268]">
                    No compatible fabrics available for this design silhouette currently.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 4: VISUAL FIT & MEASUREMENTS */}
          {step === 4 && selectedDressType && selectedFabric && selectedCollection && (
            <motion.div key="step4" variants={variants} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-10 flex flex-col h-full space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setStep(3)}
                    className="p-2 bg-[#F7F4EE] rounded-full text-[#110B0E] hover:bg-[#C5A059] hover:text-white transition-colors cursor-pointer"
                    title="Back to Fabrics"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-[#110B0E]">4. Visual Fit & Measurements</h3>
                    <p className="text-xs text-[#6D6268]">
                      Custom tailoring for your <strong className="text-[#701626]">{selectedDressType.name}</strong> ({selectedCollection.name})
                    </p>
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
                        setSizeLabel('Custom Fit');
                        if (selected.unit) setUnit(selected.unit);
                      }
                    }}
                    defaultValue=""
                    className="px-4 py-2 rounded-xl bg-white border border-[#C5A059]/40 text-xs font-bold text-[#701626] focus:outline-none focus:ring-1 focus:ring-[#701626] cursor-pointer shadow-xs"
                  >
                    <option value="" disabled>✨ Load Saved Family Profile...</option>
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
                measurements={measurements}
                onChangeMeasurements={setMeasurements}
                sizeLabel={sizeLabel}
                onChangeSizeLabel={setSizeLabel}
                unit={unit}
                onToggleUnit={setUnit}
                dressTypeName={selectedDressType.name}
                dressTypeSlug={selectedDressType.slug}
              />

              {/* Step 4 Action Bar */}
              <div className="pt-4 border-t border-[#C5A059]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[#6D6268]">
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  <span>
                    Fit Profile: <strong className="text-[#110B0E]">Bespoke Custom Measurements</strong>
                  </span>
                </div>

                <button
                  onClick={() => setStep(5)}
                  className="w-full sm:w-auto px-8 py-3 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#701626]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Review & Complete Order</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: REVIEW & ADD TO BAG */}
          {step === 5 && selectedDressType && selectedFabric && selectedCollection && (
            <motion.div key="step5" variants={variants} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-10">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setStep(4)}
                  className="p-2 bg-[#F7F4EE] rounded-full text-[#110B0E] hover:bg-[#C5A059] hover:text-white transition-colors cursor-pointer"
                  title="Back to Sizing"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#110B0E]">5. Review & Add to Bag</h3>
                  <p className="text-xs text-[#6D6268]">Confirm bespoke garment details and master tailoring</p>
                </div>
              </div>

              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-md">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
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
                        <span className="text-[10px] uppercase tracking-wider text-[#701626] font-bold">
                          {selectedCollection.name} · Bespoke Couture
                        </span>
                        <h4 className="font-display text-2xl sm:text-3xl font-bold text-[#110B0E] mt-1">{selectedDressType.name}</h4>
                        <p className="text-sm text-[#6D6268] mt-1">
                          Crafted in {selectedFabric.name} · {selectedDressType.requiredMeters || 2.5}m fabric
                        </p>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center pb-2 border-b border-black/5">
                          <span className="text-xs font-bold text-[#6D6268] uppercase tracking-wider">Fit Profile</span>
                          <span className="text-xs font-bold text-[#701626] bg-[#701626]/10 px-3 py-1 rounded-full">
                            ✨ Custom Fit Dimensions
                          </span>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-4 border border-[#C5A059]/30 shadow-xs">
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

                        {/* Transparent Price Breakdown */}
                        <div className="space-y-2 pt-2 text-xs text-[#6D6268]">
                          <div className="flex justify-between items-center">
                            <span>
                              Fabric Cost ({selectedFabric.name} · {selectedDressType.requiredMeters || 2.5}m @ {formatLKR(selectedFabric.pricePerUnit)}/m):
                            </span>
                            <span className="font-bold text-[#110B0E]">
                              {formatLKR(selectedFabric.pricePerUnit * (selectedDressType.requiredMeters || 2.5))}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Master Stitching & Tailoring:</span>
                            <span className="font-bold text-[#110B0E]">{formatLKR(selectedDressType.stitchingFee)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-[#C5A059]/30 text-base font-bold text-[#110B0E]">
                            <span>Total Investment:</span>
                            <span className="text-[#701626] font-display text-2xl font-bold">
                              {formatLKR((selectedFabric.pricePerUnit * (selectedDressType.requiredMeters || 2.5)) + selectedDressType.stitchingFee)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#C5A059]/20 space-y-3">
                      <div className="bg-[#F7F4EE] p-3 rounded-xl border border-[#C5A059]/30 text-[11px] text-[#6D6268] flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#701626]" /> Estimated Delivery
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
