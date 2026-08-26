import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Image as ImageIcon, Upload, Loader2, RefreshCw, Link as LinkIcon, Check } from 'lucide-react';
import type { Collection } from '@/lib/data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { compressToWebP } from '@/lib/image-compressor';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (catData: Omit<Collection, 'id' | 'count'>) => void;
  initialCategory?: Collection | null;
}

export default function CategoryModal({ isOpen, onClose, onSave, initialCategory }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [season, setSeason] = useState('Festive Edit');
  const [heroImage, setHeroImage] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.name);
      setSlug(initialCategory.slug);
      setTagline(initialCategory.tagline || '');
      setSeason(initialCategory.season || 'Core Edit');
      setHeroImage(initialCategory.heroImage || '');
      setDescription(initialCategory.description || '');
      setIsFeatured(initialCategory.isFeatured !== undefined ? initialCategory.isFeatured : true);
      setShowUrlFallback(false);
    } else {
      setName('');
      setSlug('');
      setTagline('');
      setSeason('Festive Drop 2026');
      setHeroImage('');
      setDescription('');
      setIsFeatured(true);
      setShowUrlFallback(false);
    }
  }, [initialCategory, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialCategory) {
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
      // 1. Client-Side WebP Compression (Hardware Accelerated)
      const compressedWebpFile = await compressToWebP(rawFile, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.85,
      });

      if (isSupabaseConfigured()) {
        const fileName = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.webp`;
        const filePath = `categories/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(filePath, compressedWebpFile, { contentType: 'image/webp', upsert: true });

        if (!uploadErr) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
          if (data?.publicUrl) {
            setHeroImage(data.publicUrl);
            setIsUploading(false);
            return;
          }
        } else {
          console.error('[Supabase Category Upload Error]:', uploadErr);
        }
      }

      // Local DataURL fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setHeroImage(event.target.result as string);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(compressedWebpFile);
    } catch (err) {
      console.error('[Category Image Compression/Upload Error]:', err);
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
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
    if (!name.trim() || !heroImage.trim()) return;

    onSave({
      name: name.trim(),
      slug:
        slug.trim() ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
      tagline: tagline.trim() || 'Handcrafted bespoke silk silhouette.',
      season: season.trim() || 'Curated Edit',
      heroImage: heroImage.trim(),
      description: description.trim() || 'Handloom pure silk couture curated for Sri Lankan celebrations.',
      isFeatured,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#C5A059]/40 shadow-2xl space-y-6"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C5A059]" />
              <h3 className="font-display text-xl font-bold text-[#110B0E]">
                {initialCategory ? 'Edit Collection' : 'Create New Collection'}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F7F4EE] hover:bg-gray-200 flex items-center justify-center text-[#110B0E] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Collection Name & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Bridal Lehengas"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-medium focus:border-[#701626] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="bridal-lehengas"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-mono text-[#701626] focus:border-[#701626] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Season & Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Season / Badge Label
                </label>
                <input
                  type="text"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  placeholder="Bridal Edit 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Short Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Royal ceremonial silhouettes & zari drape."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* ── HERO BANNER UPLOAD CARD ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Collection Hero Banner *
                </label>
                <button
                  type="button"
                  onClick={() => setShowUrlFallback(!showUrlFallback)}
                  className="text-[11px] text-[#701626] hover:underline font-bold flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>{showUrlFallback ? 'Use File Upload' : 'Paste Image URL'}</span>
                </button>
              </div>

              {/* URL Fallback Input (if toggled) */}
              {showUrlFallback ? (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                  />
                  {heroImage && (
                    <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-[#C5A059]/30">
                      <img src={heroImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ) : (
                /* Primary Direct Upload UI */
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {heroImage ? (
                    /* Image Uploaded Preview Card */
                    <div className="relative rounded-2xl overflow-hidden border border-[#C5A059]/40 group aspect-[16/9] bg-[#110B0E]">
                      <img
                        src={heroImage}
                        alt="Collection Hero"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4 text-white">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-[#701626] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-[#C5A059]/40">
                            {season || 'Collection Banner'}
                          </span>
                          <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded-md font-mono text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Ready
                          </span>
                        </div>

                        <div>
                          <p className="font-display font-bold text-lg text-white drop-shadow-sm leading-tight">
                            {name || 'New Collection'}
                          </p>
                          <p className="text-xs text-white/80 line-clamp-1 drop-shadow-sm font-light">
                            {tagline || 'Bespoke handloom artisan couture'}
                          </p>

                          <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="px-3 py-1.5 bg-white text-[#110B0E] hover:bg-[#F7F4EE] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                            >
                              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                              <span>{isUploading ? 'Uploading...' : 'Change Photo'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setHeroImage('')}
                              className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Dropzone / Upload Prompt */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                        dragActive
                          ? 'border-[#701626] bg-[#701626]/5'
                          : 'border-[#C5A059]/40 hover:border-[#701626] bg-[#FCFBF8] hover:bg-[#F7F4EE]'
                      }`}
                    >
                      {isUploading ? (
                        <div className="py-4 space-y-2 flex flex-col items-center justify-center">
                          <Loader2 className="w-8 h-8 text-[#701626] animate-spin" />
                          <p className="text-xs font-bold text-[#110B0E]">Uploading to Supabase CDN...</p>
                          <p className="text-[10.5px] text-[#6D6268]">Optimizing banner image</p>
                        </div>
                      ) : (
                        <div className="space-y-2 py-2">
                          <div className="w-12 h-12 rounded-2xl bg-[#701626]/10 text-[#701626] flex items-center justify-center mx-auto border border-[#C5A059]/30 shadow-sm">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#110B0E]">
                              Click to upload collection hero banner
                            </p>
                            <p className="text-[10.5px] text-[#6D6268] pt-0.5">
                              or drag and drop your photo here (PNG, JPG, WebP)
                            </p>
                          </div>
                          <span className="inline-block text-[9.5px] bg-[#C5A059]/15 text-[#701626] px-2.5 py-0.5 rounded-full font-bold">
                            Direct Supabase Cloud Storage
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── FEATURE IN HOMEPAGE HERO SWITCH ── */}
            <div className="p-4 rounded-2xl bg-[#F7F4EE]/80 border border-[#C5A059]/30 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span className="text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Feature in Homepage Hero Carousel
                  </span>
                </div>
                <p className="text-[11px] text-[#6D6268] leading-tight">
                  Display this collection as a primary sliding showcase at the top of the homepage.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isFeatured}
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isFeatured ? 'bg-[#701626]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isFeatured ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Narrative Story */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                Collection Narrative Story
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the fabric weaves, temple border motifs, and styling heritage for this edit..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none leading-relaxed"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C5A059]/20">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#6D6268]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !heroImage}
                className={`px-6 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center gap-1.5 ${
                  isUploading || !heroImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{initialCategory ? 'Save Collection' : 'Create Collection'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
