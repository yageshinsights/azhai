import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Tag, 
  Plus, 
  Trash2, 
  Search, 
  Check, 
  Upload, 
  Crown,
  FileText,
  Scissors,
  Truck,
  ShieldCheck,
  HelpCircle,
  Scale
} from 'lucide-react';
import { useAdminStore } from '@/store/admin';
import type { Product } from '@/lib/data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { compressToWebP } from '@/lib/image-compressor';
import { calculateSLPostPostage } from '@/lib/slpost-calculator';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => void;
  initialProduct?: Product | null;
}

interface ImageItem {
  id: string;
  src: string;
  alt: string;
}

export default function ProductModal({ isOpen, onClose, onSave, initialProduct }: ProductModalProps) {
  const { categories, tags, products: allExistingProducts } = useAdminStore();

  // Tab Navigation within Modal
  const [activeTab, setActiveTab] = useState<'details' | 'media' | 'specs' | 'seo'>('details');

  // 1. Details & Pricing
  const [name, setName] = useState('');
  const [categorySlug, setCategorySlug] = useState('kurties');
  const [priceLKR, setPriceLKR] = useState('14500');
  const [regularPriceLKR, setRegularPriceLKR] = useState('16500');
  const [stockQuantity, setStockQuantity] = useState<string>('15');
  const [weightGrams, setWeightGrams] = useState<string>('400');
  const [tag, setTag] = useState('New Festive Drop');
  const [sizes, setSizes] = useState<string[]>(['XS', 'S', 'M', 'L', 'XL']);

  // 2. Media
  const [imageList, setImageList] = useState<ImageItem[]>([]);
  const [mainIndex, setMainIndex] = useState<number>(0);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3. Descriptions & Styling
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [stylingTip, setStylingTip] = useState('');

  // 4. Fabric, Care & Delivery Specs (Matching Single Product Accordions)
  const [fabricYarn, setFabricYarn] = useState('');
  const [craftedFor, setCraftedFor] = useState('');
  const [careGuide, setCareGuide] = useState('');
  const [shippingNote, setShippingNote] = useState('');
  const [pairingProductIds, setPairingProductIds] = useState<number[]>([]);

  // 5. SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setCategorySlug(initialProduct.categories[0]?.slug || 'kurties');
      setPriceLKR(initialProduct.price.replace(/[^0-9]/g, ''));
      setRegularPriceLKR(initialProduct.regularPrice.replace(/[^0-9]/g, ''));
      setStockQuantity(String(initialProduct.stockQuantity ?? initialProduct.quantity ?? 15));
      setWeightGrams(String(initialProduct.weightGrams ?? 400));
      setTag(initialProduct.tag || '');
      setSizes(initialProduct.attributes[0]?.options || ['XS', 'S', 'M', 'L', 'XL']);

      setShortDescription(initialProduct.shortDescription || '');
      setDescription(initialProduct.description || '');
      setStylingTip(
        initialProduct.stylingTip ||
          'Pair with antique brass jhumkas, delicate dewy makeup, and an effortless textured updo.'
      );

      setFabricYarn(initialProduct.fabricYarn || '100% Handloom Mulberry Silk & Zari');
      setCraftedFor(initialProduct.craftedFor || initialProduct.occasion || 'Modern Sri Lankan festive celebrations & weddings');
      setCareGuide(
        initialProduct.careGuide ||
          '• Dry clean recommended to preserve handloom natural dyes & zari brilliance.\n• Store folded in a breathable cotton muslin bag away from direct sunlight.'
      );
      setShippingNote(
        initialProduct.shippingNote ||
          '• Dispatched within 24–48 business hours via Sri Lanka Post Speed Post.\n• Official weight-based postage & island-wide COD.\n• Sizing exchanges supported in accordance with atelier policy.'
      );
      setPairingProductIds(initialProduct.pairingProductIds || []);

      setMetaTitle(`${initialProduct.name} | Azhai Luxury Sri Lanka`);
      setMetaDescription(initialProduct.shortDescription || '');

      const initialImgs: ImageItem[] = (initialProduct.images || []).map((img, idx) => ({
        id: `img-${idx}-${Date.now()}`,
        src: img.src,
        alt: img.alt || initialProduct.name,
      }));

      setImageList(
        initialImgs.length > 0
          ? initialImgs
          : [{ id: 'img-def', src: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=90', alt: initialProduct.name }]
      );
      setMainIndex(0);
    } else {
      setName('');
      setCategorySlug('kurties');
      setPriceLKR('15500');
      setRegularPriceLKR('17500');
      setStockQuantity('15');
      setTag('New Festive Drop');
      setSizes(['XS', 'S', 'M', 'L', 'XL']);

      setShortDescription('Fitted corset cut with pure handloom silk & temple gold accents.');
      setDescription('Crafted from hand-dyed crimson maroon silk with a contemporary fitted silhouette and delicate temple zari thread border accents. Includes chic cigarette trousers and a featherlight organza dupatta.');
      setStylingTip('Pair with antique brass jhumkas, delicate dewy makeup, and an effortless textured updo.');

      setFabricYarn('100% Handloom Mulberry Silk & Zari');
      setCraftedFor('Festive Celebrations, Sangeet Nights & Receptions');
      setCareGuide('• Dry clean recommended to preserve handloom natural dyes & zari brilliance.\n• Store folded in a breathable cotton muslin bag.');
      setShippingNote('• Dispatched within 24–48 business hours via Sri Lanka Post Speed Post.\n• Island-wide COD & atelier sizing exchange support.');
      setPairingProductIds([]);

      setMetaTitle('');
      setMetaDescription('');
      setImageList([
        {
          id: 'img-1',
          src: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=90',
          alt: 'Primary View',
        },
        {
          id: 'img-2',
          src: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=90',
          alt: 'Zari Border Detail',
        },
      ]);
      setMainIndex(0);
    }
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleToggleSize = (s: string) => {
    if (sizes.includes(s)) {
      setSizes(sizes.filter((item) => item !== s));
    } else {
      setSizes([...sizes, s]);
    }
  };

  // Device File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const rawFile of Array.from(files)) {
      try {
        // 1. Hardware-Accelerated Client-Side WebP Compression
        const compressedWebpFile = await compressToWebP(rawFile, {
          maxWidth: 1400,
          maxHeight: 1800,
          quality: 0.84,
        });

        if (isSupabaseConfigured()) {
          const fileName = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
          const filePath = `products/${fileName}`;

          const { error: uploadErr } = await supabase.storage
            .from('product-images')
            .upload(filePath, compressedWebpFile, { contentType: 'image/webp', upsert: true });

          if (!uploadErr) {
            const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
            if (data?.publicUrl) {
              const newImg: ImageItem = {
                id: `sb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                src: data.publicUrl,
                alt: rawFile.name.replace(/\.[^/.]+$/, ''),
              };
              setImageList((prev) => [...prev, newImg]);
              continue;
            }
          }
        }

        // Local Data URL Fallback
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const newImg: ImageItem = {
              id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              src: event.target.result as string,
              alt: rawFile.name.replace(/\.[^/.]+$/, ''),
            };
            setImageList((prev) => [...prev, newImg]);
          }
        };
        reader.readAsDataURL(compressedWebpFile);
      } catch (err) {
        console.error('[Supabase Storage WebP Upload Error]:', err);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add Image via URL
  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    const newImg: ImageItem = {
      id: `url-${Date.now()}`,
      src: urlInput.trim(),
      alt: name || 'Artisan Silk Creation',
    };
    setImageList([...imageList, newImg]);
    setUrlInput('');
  };

  // Remove Image
  const handleRemoveImage = (indexToRemove: number) => {
    if (imageList.length <= 1) {
      alert('A product must have at least 1 image.');
      return;
    }
    const updated = imageList.filter((_, idx) => idx !== indexToRemove);
    setImageList(updated);
    if (mainIndex === indexToRemove) {
      setMainIndex(0);
    } else if (mainIndex > indexToRemove) {
      setMainIndex(mainIndex - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !priceLKR) {
      alert('Please provide a Product Name and Price.');
      return;
    }

    if (imageList.length === 0) {
      alert('Please upload or provide at least one product photo.');
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const foundCategory = categories.find((c) => c.slug === categorySlug);
    const categoryName = foundCategory ? foundCategory.name : categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

    // Reorder images so that the chosen main image is always at index 0
    const primaryImg = imageList[mainIndex] || imageList[0];
    const otherImgs = imageList.filter((_, i) => i !== mainIndex);
    const sortedImages = [primaryImg, ...otherImgs].map((img) => ({
      src: img.src,
      alt: img.alt || name,
    }));

    const productPayload: Omit<Product, 'id'> = {
      name: name.trim(),
      slug: initialProduct?.slug || slug,
      price: `LKR ${parseInt(priceLKR, 10).toLocaleString()}`,
      regularPrice: `LKR ${parseInt(regularPriceLKR || priceLKR, 10).toLocaleString()}`,
      salePrice:
        parseInt(priceLKR, 10) < parseInt(regularPriceLKR || priceLKR, 10)
          ? `LKR ${parseInt(priceLKR, 10).toLocaleString()}`
          : undefined,
      stockQuantity: Math.max(0, parseInt(stockQuantity, 10) || 0),
      quantity: Math.max(0, parseInt(stockQuantity, 10) || 0),
      weightGrams: Math.max(50, parseInt(weightGrams, 10) || 400),
      description: description.trim() || 'Handcrafted silk creation from Azhai atelier.',
      shortDescription: shortDescription.trim() || 'Handcrafted pure mulberry silk silhouette.',
      stylingTip: stylingTip.trim(),
      fabricYarn: fabricYarn.trim(),
      craftedFor: craftedFor.trim(),
      careGuide: careGuide.trim(),
      shippingNote: shippingNote.trim(),
      pairingProductIds: pairingProductIds.length > 0 ? pairingProductIds : undefined,
      images: sortedImages,
      categories: [{ id: foundCategory?.id || 1, name: categoryName, slug: categorySlug }],
      attributes: [{ name: 'Size', options: sizes.length > 0 ? sizes : ['Free Size'] }],
      tag: tag.trim() || undefined,
      rating: initialProduct?.rating !== undefined ? initialProduct.rating : 0,
      reviewsCount: initialProduct?.reviewsCount !== undefined ? initialProduct.reviewsCount : 0,
    };

    onSave(productPayload);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-3xl w-full border border-[#C5A059]/40 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Top Header */}
          <div className="p-6 border-b border-[#C5A059]/20 flex items-center justify-between bg-[#FCFBF8]">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                Atelier Catalog Studio
              </span>
              <h3 className="font-display text-2xl font-bold text-[#110B0E]">
                {initialProduct ? `Edit: ${initialProduct.name}` : 'Add New Handcrafted Piece'}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#110B0E]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex border-b border-[#C5A059]/20 bg-[#F7F4EE]/60 px-6 pt-2 gap-2 overflow-x-auto text-xs">
            {[
              { key: 'details', label: '1. Basic Info & Pricing' },
              { key: 'media', label: `2. Photos (${imageList.length}) & Cover` },
              { key: 'specs', label: '3. Story, Fabric & Care Specs' },
              { key: 'seo', label: '4. Search & SEO Meta' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-3 px-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-[#701626] text-[#701626]'
                    : 'border-transparent text-[#6D6268] hover:text-[#110B0E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable Form Content */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
            
            {/* ── TAB 1: BASIC INFO & PRICING ── */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!metaTitle) setMetaTitle(`${e.target.value} | Azhai Clothing`);
                      }}
                      placeholder="e.g. Royal Maroon Velvet Kurti Set"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Category *
                    </label>
                    <select
                      value={categorySlug}
                      onChange={(e) => setCategorySlug(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-bold focus:border-[#701626] focus:bg-white focus:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Selling Price (LKR) *
                    </label>
                    <input
                      type="number"
                      value={priceLKR}
                      onChange={(e) => setPriceLKR(e.target.value)}
                      placeholder="14500"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs font-bold text-[#701626] focus:border-[#701626] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Regular Price (LKR)
                    </label>
                    <input
                      type="number"
                      value={regularPriceLKR}
                      onChange={(e) => setRegularPriceLKR(e.target.value)}
                      placeholder="16500"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Badge / Tag
                    </label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="e.g. Viral on Reels ✨"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Atelier Inventory & Stock Quantity Section */}
                <div className="p-4 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/35 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                        Atelier Stock Quantity (Available Pieces) *
                      </label>
                      <p className="text-[11px] text-[#6D6268]">
                        Units physically crafted or ready in atelier. Set to 0 to trigger "Out of Stock".
                      </p>
                    </div>
                    <span className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-[10.5px] font-bold border transition-colors ${
                      Number(stockQuantity) === 0
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : Number(stockQuantity) <= 3
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      {Number(stockQuantity) === 0
                        ? 'Out of Stock'
                        : Number(stockQuantity) <= 3
                        ? `Low Stock (${stockQuantity} Left)`
                        : `${stockQuantity} In Stock`}
                    </span>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-0.5">
                    <div className="relative flex-1 min-w-[120px]">
                      <input
                        type="number"
                        min="0"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(e.target.value)}
                        placeholder="15"
                        required
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#C5A059]/40 text-xs font-bold text-[#110B0E] focus:border-[#701626] focus:outline-none"
                      />
                    </div>

                    {/* Quick Stepper Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setStockQuantity(String(Math.max(0, (Number(stockQuantity) || 0) - 1)))}
                        className="px-2.5 py-2 rounded-xl bg-white hover:bg-gray-100 border border-[#C5A059]/30 text-xs font-bold text-[#110B0E] cursor-pointer"
                        title="Minus 1 Piece"
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        onClick={() => setStockQuantity(String((Number(stockQuantity) || 0) + 1))}
                        className="px-2.5 py-2 rounded-xl bg-white hover:bg-gray-100 border border-[#C5A059]/30 text-xs font-bold text-[#110B0E] cursor-pointer"
                        title="Add 1 Piece"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => setStockQuantity(String((Number(stockQuantity) || 0) + 5))}
                        className="px-2.5 py-2 rounded-xl bg-white hover:bg-gray-100 border border-[#C5A059]/30 text-xs font-bold text-[#110B0E] cursor-pointer"
                        title="Add 5 Pieces"
                      >
                        +5
                      </button>
                      <button
                        type="button"
                        onClick={() => setStockQuantity('0')}
                        className="px-2.5 py-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 cursor-pointer"
                        title="Mark Out of Stock"
                      >
                        0 (Sold Out)
                      </button>
                      <button
                        type="button"
                        onClick={() => setStockQuantity('15')}
                        className="px-2.5 py-2 rounded-xl bg-white hover:bg-[#701626]/10 border border-[#C5A059]/30 text-xs font-bold text-[#701626] cursor-pointer"
                        title="Reset to 15"
                      >
                        15
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Shipping Weight (Grams / SL Post Speed Post) */}
                <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/35 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-[#701626]" />
                      <div>
                        <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                          Product Weight (Grams) *
                        </label>
                        <p className="text-[11px] text-[#6D6268]">
                          Used for exact Sri Lanka Post Speed Post &amp; COD postage calculation.
                        </p>
                      </div>
                    </div>
                    <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-[#701626]/10 text-[#701626] border border-[#C5A059]/30">
                      {((Number(weightGrams) || 400) / 1000).toFixed(2)} kg ({(Number(weightGrams) || 400)} g)
                    </span>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-0.5">
                    <div className="relative flex-1 min-w-[140px]">
                      <input
                        type="number"
                        min="50"
                        max="40000"
                        step="10"
                        value={weightGrams}
                        onChange={(e) => setWeightGrams(e.target.value)}
                        placeholder="400"
                        required
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#C5A059]/40 text-xs font-bold text-[#110B0E] focus:border-[#701626] focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs text-[#6D6268] font-bold">grams</span>
                    </div>

                    {/* Weight Quick Presets */}
                    <div className="flex flex-wrap items-center gap-1">
                      {[
                        { label: 'Kurti', g: 350 },
                        { label: 'Saree', g: 850 },
                        { label: 'Lehenga', g: 2200 },
                        { label: 'Blouse', g: 250 },
                        { label: 'Shawl', g: 280 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setWeightGrams(String(preset.g))}
                          className={`px-2 py-1.5 rounded-xl border text-[10.5px] font-bold transition-all cursor-pointer ${
                            Number(weightGrams) === preset.g
                              ? 'bg-[#701626] text-white border-[#701626]'
                              : 'bg-white hover:bg-[#701626]/5 border-[#C5A059]/30 text-[#110B0E]'
                          }`}
                        >
                          {preset.label} ({preset.g}g)
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live SL Post Postage Estimation Pill */}
                  <div className="pt-1 text-[11px] text-[#6D6268] flex items-center justify-between border-t border-[#C5A059]/15">
                    <span>
                      📮 <strong>SL Post Speed Post Rate:</strong> LKR {calculateSLPostPostage(Number(weightGrams) || 400).fee.toLocaleString()} (per item)
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      Max Limit: 40 kg
                    </span>
                  </div>
                </div>

                {/* Quick Tag Library Pills */}
                {tags.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <label className="block text-[10.5px] font-bold text-[#6D6268] uppercase tracking-wider">
                      Quick Tag Library (Click to apply)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTag(t)}
                          className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold border transition-all cursor-pointer ${
                            tag === t
                              ? 'bg-[#701626] text-white border-[#701626]'
                              : 'bg-[#F7F4EE] text-[#6D6268] border-[#C5A059]/25 hover:border-[#701626]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes Multi-Select */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Available Sizes in Atelier
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleToggleSize(s)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          sizes.includes(s)
                            ? 'bg-[#701626] text-white border-[#701626]'
                            : 'bg-[#F7F4EE] text-[#6D6268] border-[#C5A059]/25 hover:border-[#701626]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: MULTI-IMAGE UPLOAD & COVER SELECTOR ── */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/35 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-[#110B0E] uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-[#701626]" /> Product Images ({imageList.length})
                      </h4>
                      <p className="text-[11px] text-[#6D6268]">
                        Upload high-res photos from device or paste image URLs. Choose one as the <strong>Main Cover</strong>.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload from Device
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Or paste an image URL (https://...)"
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-[#C5A059]/30 focus:border-[#701626] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrlImage}
                      className="px-3 py-2 bg-[#F7F4EE] hover:bg-[#701626] hover:text-white border border-[#C5A059]/30 rounded-xl text-xs font-bold text-[#110B0E] transition-colors"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Visual Image Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {imageList.map((img, idx) => {
                    const isMain = idx === mainIndex;

                    return (
                      <div
                        key={img.id || idx}
                        className={`relative rounded-2xl overflow-hidden border-2 transition-all bg-white shadow-sm flex flex-col justify-between ${
                          isMain ? 'border-[#701626] ring-2 ring-[#701626]/20' : 'border-[#C5A059]/30'
                        }`}
                      >
                        <div className="aspect-[4/5] relative w-full overflow-hidden bg-gray-100">
                          <img src={img.src} alt="" className="w-full h-full object-cover" />

                          {isMain && (
                            <div className="absolute top-2 left-2 bg-[#701626] text-[#DFBF77] text-[9.5px] font-bold px-2 py-0.5 rounded-full shadow-md border border-[#C5A059]/40 flex items-center gap-1">
                              <Crown className="w-3 h-3" /> Main Cover
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                            title="Remove Photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-2 bg-white text-center border-t border-[#C5A059]/15">
                          {isMain ? (
                            <span className="text-[10px] font-bold text-[#701626] flex items-center justify-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" /> Active Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setMainIndex(idx)}
                              className="w-full py-1 text-[10px] font-bold text-[#6D6268] hover:text-[#701626] hover:bg-[#F7F4EE] rounded-lg transition-colors cursor-pointer"
                            >
                              Set as Main Cover
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TAB 3: STORY, FABRIC & CARE SPECS (SINGLE PRODUCT MATCHING) ── */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                {/* Short Tagline */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Short Tagline (Displayed under price)
                  </label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Fitted corset cut with pure handloom silk & temple gold accents."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                  />
                </div>

                {/* How Preethi Styles It */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#701626] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" /> How Preethi Styles It (Styling Tip Card)
                  </label>
                  <input
                    type="text"
                    value={stylingTip}
                    onChange={(e) => setStylingTip(e.target.value)}
                    placeholder="Pair with antique brass jhumkas, delicate dewy makeup, and an effortless textured updo."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Fabric & Story */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Fabric Overview & Weave Narrative (Accordion 1)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Crafted from hand-dyed crimson maroon silk with a contemporary fitted silhouette..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Yarn / Weave Specification
                    </label>
                    <input
                      type="text"
                      value={fabricYarn}
                      onChange={(e) => setFabricYarn(e.target.value)}
                      placeholder="100% Handloom Mulberry Silk & Zari"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Crafted For / Occasion
                    </label>
                    <input
                      type="text"
                      value={craftedFor}
                      onChange={(e) => setCraftedFor(e.target.value)}
                      placeholder="Modern Sri Lankan festive celebrations & weddings"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Delivery Note (Accordion 2) */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Sri Lanka Delivery & Exchange Protocol (Accordion 2)
                  </label>
                  <textarea
                    value={shippingNote}
                    onChange={(e) => setShippingNote(e.target.value)}
                    placeholder="• Dispatched within 24–48 business hours via Sri Lanka Post Speed Post..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Garment Care Guide (Accordion 3) */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Garment Care Guide (Accordion 3)
                  </label>
                  <textarea
                    value={careGuide}
                    onChange={(e) => setCareGuide(e.target.value)}
                    placeholder="• Dry clean recommended to preserve handloom natural dyes & zari brilliance..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                  />
                </div>

                {/* ── CURATED PAIRINGS / COMPLETE THE LOOK PICKER ── */}
                <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/35 space-y-3 pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-[#701626] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" /> Curated Pairings / Complete The Look
                      </label>
                      <p className="text-[11px] text-[#6D6268]">
                        Select 1 to 3 matching companion pieces from the catalog to feature in the "Complete The Look" section and 1-Click Bundle Widget.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#701626] bg-[#701626]/10 px-2.5 py-1 rounded-full shrink-0">
                      {pairingProductIds.length} Selected
                    </span>
                  </div>

                  {/* Horizontal product selector cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto p-1">
                    {(allExistingProducts || [])
                      .filter((p: Product) => p.id !== initialProduct?.id)
                      .map((p: Product) => {
                        const isSelected = pairingProductIds.includes(p.id);

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setPairingProductIds(pairingProductIds.filter((id) => id !== p.id));
                              } else {
                                if (pairingProductIds.length >= 3) {
                                  alert('You can select up to 3 curated pairings.');
                                  return;
                                }
                                setPairingProductIds([...pairingProductIds, p.id]);
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#701626] bg-[#701626]/10 ring-1 ring-[#701626]'
                                : 'border-[#C5A059]/30 bg-white hover:border-[#701626]/40'
                            }`}
                          >
                            <img
                              src={p.images[0]?.src}
                              alt=""
                              className="w-10 h-12 object-cover rounded-lg shrink-0 bg-gray-100"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-[#110B0E] truncate">{p.name}</p>
                              <p className="text-[10.5px] text-[#701626] font-semibold">{p.price}</p>
                              <span className="text-[9.5px] text-[#6D6268]">{p.categories[0]?.name}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#701626] shrink-0" />}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: SEO & GOOGLE PREVIEW ── */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold text-[#110B0E] uppercase tracking-wider">
                      Google Meta Title
                    </label>
                    <span className="text-[10.5px] text-[#6D6268]">{metaTitle.length} / 60</span>
                  </div>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={`${name || 'Creation'} | Azhai Clothing Sri Lanka`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold text-[#110B0E] uppercase tracking-wider">
                      Google Meta Description
                    </label>
                    <span className="text-[10.5px] text-[#6D6268]">{metaDescription.length} / 160</span>
                  </div>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder={shortDescription || 'Shop pure handloom silk couture handcrafted by Preethi in Colombo.'}
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Google Preview Card */}
                <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-gray-200 space-y-1 text-xs">
                  <p className="text-[11px] text-gray-500">https://azhai.lk › products › {name ? name.toLowerCase().replace(/\s+/g, '-') : 'item'}</p>
                  <p className="text-sm font-semibold text-blue-800 hover:underline truncate">
                    {metaTitle || `${name || 'Product'} | Azhai Clothing`}
                  </p>
                  <p className="text-[11.5px] text-gray-600 line-clamp-2">
                    {metaDescription || shortDescription || 'Discover handcrafted silk kurties, sarees, and tops in Colombo, Sri Lanka.'}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-[#C5A059]/20 bg-white">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {activeTab !== 'details' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'media') setActiveTab('details');
                      if (activeTab === 'specs') setActiveTab('media');
                      if (activeTab === 'seo') setActiveTab('specs');
                    }}
                    className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2.5 sm:py-2 bg-[#F7F4EE] hover:bg-gray-200 rounded-xl text-xs font-bold text-[#110B0E] text-center"
                  >
                    ← Back
                  </button>
                )}
                {activeTab !== 'seo' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'details') setActiveTab('media');
                      if (activeTab === 'media') setActiveTab('specs');
                      if (activeTab === 'specs') setActiveTab('seo');
                    }}
                    className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2.5 sm:py-2 bg-[#F7F4EE] hover:bg-[#701626] hover:text-white rounded-xl text-xs font-bold text-[#110B0E] transition-colors text-center"
                  >
                    Next Step →
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 sm:py-2 text-xs font-bold uppercase tracking-wider text-[#6D6268] bg-[#F7F4EE] sm:bg-transparent rounded-xl text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-sm transition-all cursor-pointer text-center"
                >
                  {initialProduct ? 'Save Changes' : 'Publish Creation'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
