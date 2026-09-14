import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Code2, 
  Share2, 
  FileText,
  Save
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStore } from '@/store/admin';

export default function AdminSEO() {
  const { products, settings, updateSettings } = useAdminStore();
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [metaTitle, setMetaTitle] = useState(
    settings.seo?.metaTitle || 'Azhai Clothing by Preethi | Handcrafted Luxury Silk Kurties & Sarees Sri Lanka'
  );
  const [metaDesc, setMetaDesc] = useState(
    settings.seo?.metaDescription || 'Discover heirloom handloom kurti sets, cloud-light organza sarees, and tailored corset tops. Island-wide Sri Lanka delivery & bespoke sizing in Colombo.'
  );
  const [targetKeywords, setTargetKeywords] = useState(
    settings.seo?.targetKeywords || 'silk kurties sri lanka, bridal saree colombo, handloom clothing boutique, preethi silk couture'
  );
  const [savedToast, setSavedToast] = useState(false);

  const handleSaveSEO = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      seo: {
        metaTitle,
        metaDescription: metaDesc,
        targetKeywords,
      },
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const jsonLdCode = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: 'Azhai Clothing by Preethi',
    image: 'https://azhaiclothing.lk/logo-light.png',
    url: 'https://azhaiclothing.lk',
    telephone: settings.phoneNumber || '+94 77 123 4567',
    priceRange: 'LKR 8,500 - LKR 45,000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.atelierAddress || '42/A Temple Road, Kollupitiya',
      addressLocality: 'Colombo',
      postalCode: '00300',
      addressCountry: 'LK',
    },
    currenciesAccepted: 'LKR',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#110B0E]">
              SEO & Google Search Meta
            </h1>
            <p className="text-xs text-[#6D6268] font-light">
              Optimize organic visibility, Google SERP rich snippets, and social OpenGraph tags.
            </p>
          </div>

          {savedToast && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> SEO Settings Synchronized!
            </span>
          )}
        </div>

        {/* ── LIVE GOOGLE SEARCH ENGINE PREVIEW ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#701626]">
            <Search className="w-5 h-5" />
            <h3 className="font-display text-xl font-bold text-[#110B0E]">
              Live Google Desktop & Mobile SERP Preview
            </h3>
          </div>

          <div className="p-5 rounded-2xl bg-[#FCFBF8] border border-gray-200 max-w-2xl space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-4 h-4 rounded-full bg-[#701626] text-white flex items-center justify-center text-[9px] font-bold">
                A
              </div>
              <span className="text-[11px] text-gray-700 font-medium">Azhai Clothing (Sri Lanka)</span>
              <span className="text-gray-400">› https://azhai.lk</span>
            </div>

            <h4 className="text-base sm:text-lg font-semibold text-[#1a0dab] hover:underline cursor-pointer pt-0.5 leading-snug">
              {metaTitle}
            </h4>

            <p className="text-xs sm:text-[13px] text-[#4d5156] leading-relaxed line-clamp-2">
              {metaDesc}
            </p>
          </div>
        </div>

        {/* ── SEO METADATA FORM ── */}
        <form onSubmit={handleSaveSEO} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-5">
          <h3 className="font-display text-xl font-bold text-[#110B0E]">
            Storefront Meta Tags Configuration
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-[#110B0E] uppercase tracking-wider">
                  Global Meta Title (Max 60 chars)
                </label>
                <span className={`text-[10px] font-bold ${metaTitle.length > 60 ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {metaTitle.length} / 60
                </span>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-[#110B0E] uppercase tracking-wider">
                  Global Meta Description (Max 160 chars)
                </label>
                <span className={`text-[10px] font-bold ${metaDesc.length > 160 ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {metaDesc.length} / 160
                </span>
              </div>
              <textarea
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                Target Search Keywords (Comma separated)
              </label>
              <input
                type="text"
                value={targetKeywords}
                onChange={(e) => setTargetKeywords(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Save Global Meta
            </button>
          </div>
        </form>

        {/* ── AUTOMATED JSON-LD STRUCTURED DATA SCHEMA ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-[#701626]">
            <Code2 className="w-5 h-5" />
            <h3 className="font-display text-xl font-bold text-[#110B0E]">
              Automated Schema.org Structured Data (JSON-LD)
            </h3>
          </div>
          <p className="text-xs text-[#6D6268] font-light">
            Enables rich Google search cards with prices, ratings, and Colombo atelier address.
          </p>

          <pre className="p-4 rounded-2xl bg-[#110B0E] text-[#DFBF77] font-mono text-[11px] overflow-x-auto border border-[#C5A059]/30 leading-relaxed">
            {JSON.stringify(jsonLdCode, null, 2)}
          </pre>
        </div>
      </div>
    </AdminLayout>
  );
}
