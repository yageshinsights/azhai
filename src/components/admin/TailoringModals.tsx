import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Upload, Loader2, RefreshCw, Link as LinkIcon, Check, Ruler, Palette } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { compressToWebP } from '@/lib/image-compressor';
import type { DressType, TailoringFabric, MeasurementField, SizePreset } from '@/lib/tailoring';

/* ── 1. Dress Type Modal ── */
interface DressTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<DressType, 'id'>) => void;
  initial?: DressType | null;
}

export function DressTypeModal({ isOpen, onClose, onSave, initial }: DressTypeModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [stitchingFee, setStitchingFee] = useState<number>(0);
  const [leadTime, setLeadTime] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setSlug(initial.slug);
      setStitchingFee(initial.stitchingFee);
      setLeadTime(initial.leadTime);
      setCoverImage(initial.coverImage);
      setIsActive(initial.isActive);
      setDisplayOrder(initial.displayOrder);
      setShowUrlFallback(false);
    } else {
      setName('');
      setSlug('');
      setStitchingFee(0);
      setLeadTime('');
      setCoverImage('');
      setIsActive(true);
      setDisplayOrder(1);
      setShowUrlFallback(false);
    }
  }, [initial, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initial) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const uploadFile = async (rawFile: File) => {
    if (!rawFile) return;
    setIsUploading(true);
    try {
      const compressedWebpFile = await compressToWebP(rawFile, { maxWidth: 1200, maxHeight: 1600, quality: 0.85 });
      if (isSupabaseConfigured()) {
        const fileName = `dress-type-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.webp`;
        const filePath = `tailoring/${fileName}`;
        const { error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(filePath, compressedWebpFile, { contentType: 'image/webp', upsert: true });

        if (!uploadErr) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
          if (data?.publicUrl) {
            setCoverImage(data.publicUrl);
            setIsUploading(false);
            return;
          }
        }
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setCoverImage(event.target.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(compressedWebpFile);
    } catch (err) {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !coverImage.trim()) return;
    onSave({
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      coverImage: coverImage.trim(),
      stitchingFee,
      leadTime: leadTime.trim(),
      isActive,
      displayOrder,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#C5A059]/40 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-4">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[#C5A059]" />
              <h3 className="font-display text-xl font-bold text-[#110B0E]">{initial ? 'Edit Dress Type' : 'Add Dress Type'}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F7F4EE] hover:bg-gray-200 flex items-center justify-center text-[#110B0E] transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">Dress Type Name *</label>
                <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-medium focus:border-[#701626] focus:bg-white focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">URL Slug</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-mono text-[#701626] focus:border-[#701626] focus:bg-white focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">Stitching Fee (LKR) *</label>
                <input type="number" min="0" step="100" value={stitchingFee} onChange={(e) => setStitchingFee(Number(e.target.value))} required className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">Lead Time</label>
                <input type="text" value={leadTime} onChange={(e) => setLeadTime(e.target.value)} placeholder="e.g. 5–7 working days" required className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">Cover Image (3:4) *</label>
                <button type="button" onClick={() => setShowUrlFallback(!showUrlFallback)} className="text-[11px] text-[#701626] hover:underline font-bold flex items-center gap-1"><LinkIcon className="w-3 h-3" /><span>{showUrlFallback ? 'Use File Upload' : 'Paste Image URL'}</span></button>
              </div>
              {showUrlFallback ? (
                <input type="url" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none" />
              ) : (
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} className="hidden" />
                  {coverImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-[#C5A059]/40 group aspect-[3/4] bg-[#110B0E] w-1/2 mx-auto">
                      <img src={coverImage} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="px-3 py-1.5 bg-white text-[#110B0E] rounded-xl text-xs font-bold shadow-md cursor-pointer">{isUploading ? '...' : 'Change'}</button>
                          <button type="button" onClick={() => setCoverImage('')} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer">Remove</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${dragActive ? 'border-[#701626] bg-[#701626]/5' : 'border-[#C5A059]/40 hover:border-[#701626] bg-[#FCFBF8]'}`}>
                      {isUploading ? <Loader2 className="w-8 h-8 text-[#701626] animate-spin mx-auto" /> : <Upload className="w-6 h-6 text-[#701626] mx-auto" />}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F4EE]/80 border border-[#C5A059]/30 flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-[#110B0E] uppercase tracking-wider">Active Status</span>
              <button type="button" role="switch" onClick={() => setIsActive(!isActive)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-[#701626]' : 'bg-gray-300'}`}>
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C5A059]/20">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#6D6268]">Cancel</button>
              <button type="submit" disabled={isUploading || !coverImage} className={`px-6 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center gap-1.5 ${isUploading || !coverImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{initial ? 'Save' : 'Create'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ── 2. Fabric Modal ── */
interface FabricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<TailoringFabric, 'id'>) => void;
  initial?: TailoringFabric | null;
  dressTypes: DressType[];
}

export function FabricModal({ isOpen, onClose, onSave, initial, dressTypes }: FabricModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState<number>(0);
  const [unit, setUnit] = useState('meter');
  const [weight, setWeight] = useState('');
  const [swatchImage, setSwatchImage] = useState('');
  const [inStock, setInStock] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [compatibleIds, setCompatibleIds] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setSlug(initial.slug);
      setPricePerUnit(initial.pricePerUnit);
      setUnit(initial.unit);
      setWeight(initial.weight);
      setSwatchImage(initial.swatchImage);
      setInStock(initial.inStock);
      setDisplayOrder(initial.displayOrder);
      setCompatibleIds(initial.compatibleDressTypeIds);
      setShowUrlFallback(false);
    } else {
      setName('');
      setSlug('');
      setPricePerUnit(0);
      setUnit('meter');
      setWeight('');
      setSwatchImage('');
      setInStock(true);
      setDisplayOrder(1);
      setCompatibleIds([]);
      setShowUrlFallback(false);
    }
  }, [initial, isOpen]);

  if (!isOpen) return null;

  const toggleCompatible = (id: number) => {
    setCompatibleIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const uploadFile = async (rawFile: File) => {
    if (!rawFile) return;
    setIsUploading(true);
    try {
      const compressedWebpFile = await compressToWebP(rawFile, { maxWidth: 800, maxHeight: 800, quality: 0.85 });
      if (isSupabaseConfigured()) {
        const fileName = `fabric-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.webp`;
        const filePath = `tailoring/${fileName}`;
        const { error: uploadErr } = await supabase.storage.from('product-images').upload(filePath, compressedWebpFile, { contentType: 'image/webp', upsert: true });
        if (!uploadErr) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
          if (data?.publicUrl) {
            setSwatchImage(data.publicUrl);
            setIsUploading(false);
            return;
          }
        }
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setSwatchImage(event.target.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(compressedWebpFile);
    } catch (err) {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !swatchImage.trim()) return;
    onSave({
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      swatchImage: swatchImage.trim(),
      pricePerUnit,
      unit: unit.trim(),
      weight: weight.trim(),
      compatibleDressTypeIds: compatibleIds,
      inStock,
      displayOrder,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#C5A059]/40 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#C5A059]" />
              <h3 className="font-display text-xl font-bold text-[#110B0E]">{initial ? 'Edit Fabric' : 'Add Fabric'}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F7F4EE] hover:bg-gray-200 flex items-center justify-center text-[#110B0E] transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">Fabric Name *</label>
                <input type="text" value={name} onChange={(e) => { setName(e.target.value); if (!initial) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')); }} required className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-medium focus:border-[#701626] focus:bg-white focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">URL Slug</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-mono text-[#701626] focus:border-[#701626] focus:bg-white focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1 space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">Price/Unit *</label>
                <input type="number" min="0" step="100" value={pricePerUnit} onChange={(e) => setPricePerUnit(Number(e.target.value))} required className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none" />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">Unit</label>
                <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="meter" required className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none" />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">Weight</label>
                <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="85 GSM" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">Swatch Image *</label>
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#C5A059]/40 bg-gray-100 flex-shrink-0">
                  {swatchImage ? <img src={swatchImage} alt="Swatch" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setShowUrlFallback(!showUrlFallback)} className="text-[11px] text-[#701626] hover:underline font-bold">Toggle URL / Upload</button>
                  </div>
                  {showUrlFallback ? (
                    <input type="url" value={swatchImage} onChange={(e) => setSwatchImage(e.target.value)} placeholder="https://..." className="w-full px-3.5 py-2 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs" />
                  ) : (
                    <div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} className="hidden" />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-[#F7F4EE] border border-[#C5A059]/30 rounded-xl text-xs font-bold">{isUploading ? 'Uploading...' : 'Upload Image'}</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">Compatible Dress Types</label>
              <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-[#C5A059]/30 bg-[#F7F4EE]/40">
                {dressTypes.map(dt => (
                  <label key={dt.id} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#C5A059]/20 cursor-pointer hover:border-[#701626]">
                    <input type="checkbox" checked={compatibleIds.includes(dt.id)} onChange={() => toggleCompatible(dt.id)} className="accent-[#701626]" />
                    <span className="text-[11px] font-medium text-[#110B0E]">{dt.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F4EE]/80 border border-[#C5A059]/30 flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-[#110B0E] uppercase tracking-wider">In Stock</span>
              <button type="button" role="switch" onClick={() => setInStock(!inStock)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${inStock ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${inStock ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C5A059]/20">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#6D6268]">Cancel</button>
              <button type="submit" disabled={isUploading || !swatchImage} className="px-6 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all">
                {initial ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ── 3. Measurement Field Modal ── */
interface MeasurementFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<MeasurementField, 'id' | 'dressTypeId'>) => void;
  initial?: MeasurementField | null;
}

export function MeasurementFieldModal({ isOpen, onClose, onSave, initial }: MeasurementFieldModalProps) {
  const [fieldName, setFieldName] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(0);
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  useEffect(() => {
    if (initial) {
      setFieldName(initial.fieldName);
      setFieldLabel(initial.fieldLabel);
      setMinValue(initial.minValue);
      setMaxValue(initial.maxValue);
      setDisplayOrder(initial.displayOrder);
    } else {
      setFieldName('');
      setFieldLabel('');
      setMinValue(10);
      setMaxValue(60);
      setDisplayOrder(1);
    }
  }, [initial, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim() || !fieldLabel.trim()) return;
    onSave({
      fieldName: fieldName.trim(),
      fieldLabel: fieldLabel.trim(),
      minValue,
      maxValue,
      displayOrder,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#C5A059]/40 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-3">
            <h3 className="font-display text-lg font-bold text-[#110B0E]">{initial ? 'Edit Field' : 'Add Field'}</h3>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider">Field ID (e.g. bust, waist)</label>
              <input type="text" value={fieldName} onChange={(e) => setFieldName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))} required className="w-full px-3 py-2 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-mono" />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider">Display Label</label>
              <input type="text" value={fieldLabel} onChange={(e) => setFieldLabel(e.target.value)} placeholder="Bust / Chest" required className="w-full px-3 py-2 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider">Min (inches)</label>
                <input type="number" min="0" value={minValue} onChange={(e) => setMinValue(Number(e.target.value))} required className="w-full px-3 py-2 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider">Max (inches)</label>
                <input type="number" min="0" value={maxValue} onChange={(e) => setMaxValue(Number(e.target.value))} required className="w-full px-3 py-2 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider">Display Order</label>
              <input type="number" min="1" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} required className="w-full px-3 py-2 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#6D6268]">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#701626] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl">Save</button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ── 4. Size Preset Modal ── */
interface SizePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<SizePreset, 'id' | 'dressTypeId'>) => void;
  initial?: SizePreset | null;
  measurementFields: MeasurementField[];
}

export function SizePresetModal({ isOpen, onClose, onSave, initial, measurementFields }: SizePresetModalProps) {
  const [sizeLabel, setSizeLabel] = useState('');
  const [measurements, setMeasurements] = useState<Record<string, number>>({});

  useEffect(() => {
    if (initial) {
      setSizeLabel(initial.sizeLabel);
      setMeasurements(initial.measurements);
    } else {
      setSizeLabel('');
      const defaultMeas: Record<string, number> = {};
      measurementFields.forEach(f => {
        defaultMeas[f.fieldName] = (f.minValue + f.maxValue) / 2;
      });
      setMeasurements(defaultMeas);
    }
  }, [initial, isOpen, measurementFields]);

  if (!isOpen) return null;

  const handleMeasurementChange = (fieldName: string, val: number) => {
    setMeasurements(prev => ({ ...prev, [fieldName]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeLabel.trim()) return;
    onSave({
      sizeLabel: sizeLabel.trim(),
      measurements,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#C5A059]/40 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-3">
            <h3 className="font-display text-lg font-bold text-[#110B0E]">{initial ? 'Edit Preset' : 'Add Preset'}</h3>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider">Size Label (e.g. S, M, XL)</label>
              <input type="text" value={sizeLabel} onChange={(e) => setSizeLabel(e.target.value.toUpperCase())} required className="w-full px-3 py-2 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-bold" />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider pt-2">Measurements (inches)</label>
              {measurementFields.map(field => (
                <div key={field.id} className="flex items-center justify-between gap-3 bg-[#F7F4EE]/50 p-2 rounded-xl">
                  <span className="text-[11px] font-medium text-[#110B0E]">{field.fieldLabel}</span>
                  <input type="number" step="0.5" min={field.minValue} max={field.maxValue} value={measurements[field.fieldName] || 0} onChange={(e) => handleMeasurementChange(field.fieldName, Number(e.target.value))} required className="w-20 px-2 py-1 rounded-lg bg-white border border-[#C5A059]/30 text-xs text-right focus:border-[#701626]" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#C5A059]/20">
              <button type="button" onClick={onClose} className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#6D6268]">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#701626] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl">Save</button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
