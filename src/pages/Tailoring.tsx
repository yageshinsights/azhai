import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Sparkles, Clock, Award, Palette, Shirt } from 'lucide-react';
import TailoringStudio from '@/components/TailoringStudio';
import BlouseCustomizer from '@/components/BlouseCustomizer';
import { LiyawelDivider } from '@/components/CulturalPatterns';
import SEOHead from '@/components/SEOHead';

export default function Tailoring() {
  const [activeMode, setActiveMode] = useState<'apparel' | 'blouse'>('apparel');

  const tailoringSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Bespoke Custom Tailoring & Saree Blouse Crafting',
    provider: {
      '@type': 'ClothingStore',
      name: 'Azhai Clothing by Preethi',
      url: 'https://azhaiclothing.lk',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Colombo',
        addressCountry: 'LK',
      },
    },
    areaServed: {
      '@type': 'Country',
      name: 'Sri Lanka',
    },
    description: 'Custom bespoke handloom kurti sets, tailored saree blouses, 2D neckline customizer, and personalized measurements in Colombo, Sri Lanka.',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'LKR',
      price: '4500',
      priceValidUntil: '2027-12-31',
    },
  }), []);

  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-24 sm:pt-32 pb-20">
      <SEOHead
        title="Custom Tailoring Studio & 2D Saree Blouse Customizer"
        description="Design your custom saree blouse or bespoke handloom outfit with Azhai. Real-time 2D neckline & sleeve customizer, fitting vault, and express island-wide delivery."
        canonicalUrl="https://azhaiclothing.lk/tailoring"
        url="https://azhaiclothing.lk/tailoring"
        schema={tailoringSchema}
      />
      
      {/* ── Page Hero Header ── */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-[#701626]/10 px-4 py-1.5 rounded-full border border-[#701626]/20"
        >
          <Scissors className="w-3.5 h-3.5 text-[#701626]" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
            Azhai Atelier Bespoke
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl font-bold text-[#110B0E] tracking-tight"
        >
          Custom Tailoring Studio
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xs sm:text-base text-[#6D6268] max-w-2xl mx-auto font-light leading-relaxed"
        >
          Handcrafted luxury apparel tailored exactly to your unique silhouette. Choose your silhouette, select your premium handloom or silk fabric, and configure your bespoke fit.
        </motion.p>

        {/* ── ATELIER MODE TOGGLE BAR ── */}
        <div className="pt-4 flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-[#C5A059]/40 shadow-md">
            <button
              onClick={() => setActiveMode('apparel')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeMode === 'apparel'
                  ? 'bg-[#701626] text-white shadow-md'
                  : 'text-[#6D6268] hover:text-[#701626]'
              }`}
            >
              <Shirt className="w-4 h-4" />
              <span>Full Bespoke Outfits</span>
            </button>

            <button
              onClick={() => setActiveMode('blouse')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeMode === 'blouse'
                  ? 'bg-[#701626] text-white shadow-md'
                  : 'text-[#6D6268] hover:text-[#701626]'
              }`}
            >
              <Palette className="w-4 h-4 text-[#C5A059]" />
              <span>2D Blouse & Neckline Studio</span>
              <span className="text-[9px] bg-[#C5A059] text-white font-bold px-1.5 py-0.2 rounded-full">
                Interactive
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 3 Atelier Guarantees ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="p-4 rounded-2xl bg-white border border-[#C5A059]/30 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#701626]/10 text-[#701626] flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#110B0E]">Perfect Fit Guarantee</h4>
            <p className="text-[11px] text-[#6D6268]">Free alteration adjustments</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#C5A059]/30 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#701626]/10 text-[#701626] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#110B0E]">Pure Handloom & Silk</h4>
            <p className="text-[11px] text-[#6D6268]">Certified artisanal textiles</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#C5A059]/30 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#701626]/10 text-[#701626] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#110B0E]">Express Atelier Crafting</h4>
            <p className="text-[11px] text-[#6D6268]">Ready in 4 to 7 business days</p>
          </div>
        </div>
      </div>

      {/* ── Active Atelier Studio Mode ── */}
      <AnimatePresence mode="wait">
        {activeMode === 'apparel' ? (
          <motion.div
            key="apparel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TailoringStudio />
          </motion.div>
        ) : (
          <motion.div
            key="blouse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BlouseCustomizer />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cultural Divider */}
      <div className="max-w-4xl mx-auto px-5 my-12">
        <LiyawelDivider />
      </div>

      {/* ── Bespoke FAQ Section ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
            Frequently Asked Questions
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#110B0E]">
            How Bespoke Tailoring Works
          </h3>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does the fabric + stitching bundle pricing work?',
              a: 'You choose your fabric from our inventory and your preferred dress type. Your total price is the sum of the fabric cost plus the master tailoring fee (e.g. Silk Fabric LKR 4,200 + Stitching Fee LKR 3,500 = Total LKR 7,700).',
            },
            {
              q: 'Can I request custom sleeve or neckline alterations?',
              a: 'Yes! In Step 3, you can choose "Custom Bespoke Tailor" to specify exact sleeve lengths, bust, waist, and back neck depths. You can also write specific styling notes during checkout.',
            },
            {
              q: 'What if the garment needs a minor adjustment after delivery?',
              a: 'All our tailored garments include a 1.5-inch inner seam margin for easy future adjustments, and our boutique offers free tailoring adjustments within 14 days of delivery.',
            },
            {
              q: 'How long does custom stitching take?',
              a: 'Standard tailoring takes 4 to 7 working days before dispatch. Once stitched, we notify you via SMS/WhatsApp with live courier tracking.',
            },
          ].map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-[#C5A059]/30 shadow-xs space-y-1.5">
              <h4 className="font-bold text-sm text-[#110B0E] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#701626]/10 text-[#701626] text-xs flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                {faq.q}
              </h4>
              <p className="text-xs text-[#6D6268] leading-relaxed pl-7">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
