import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Feather, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const FABRICS = [
  {
    id: 'kanjivaram',
    name: 'Kanjivaram Mulberry Silk',
    tamil: 'காஞ்சிபுரம் பட்டு',
    tag: 'Heirloom Grade',
    weight: '85 GSM · Heavy Fall',
    feel: 'Soft temple luster, butter-smooth fluid drape',
    craft: 'Woven on pit-looms with interlocking korvai borders & real zari thread.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=90',
    swatchColor: '#701626',
    samplePiece: 'Maroon Corset Handloom Kurti Set',
    sampleSlug: 'maroon-corset-kurti-set',
    samplePrice: 'LKR 14,500'
  },
  {
    id: 'rawsilk',
    name: '32-Kali Raw Silk',
    tamil: 'மூல பட்டு அனார்கலி',
    tag: 'Twirl Approved',
    weight: '110 GSM · High Volume',
    feel: 'Rich tactile slub texture, maximum slow-mo flare',
    craft: 'Hand-dyed in small batches with unbroken maroon cord embellishment.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=90',
    swatchColor: '#8E1E34',
    samplePiece: '32-Kali Twirl Raw Silk Shalwar Suit',
    sampleSlug: 'raw-silk-shalwar-suit',
    samplePrice: 'LKR 28,500'
  },
  {
    id: 'organza',
    name: 'Featherlight Sheer Organza',
    tamil: 'மெல்லிய தாமரை பட்டு',
    tag: 'Cloud Drape',
    weight: '28 GSM · Ultra Light',
    feel: 'Translucent, breezy, holds delicate sculpted pleats',
    craft: 'Hand-painted with botanical crimson lotus motifs using fine camel-hair brushes.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=90',
    swatchColor: '#FAF7F2',
    samplePiece: 'Sheer Organza Peplum Blouse Top',
    sampleSlug: 'sheer-organza-peplum-top',
    samplePrice: 'LKR 9,800'
  },
  {
    id: 'chanderi',
    name: 'Handloom Cotton-Silk Chanderi',
    tamil: 'சந்தேரி பருத்தி பட்டு',
    tag: 'Everyday Luxe',
    weight: '45 GSM · Breathable',
    feel: 'Featherlight, crisp yet soft against the skin',
    craft: 'Woven with gold zari motifs inspired by traditional Tamil temple architecture.',
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=90',
    swatchColor: '#DFBF77',
    samplePiece: 'Temple Border Chanderi Kurti',
    sampleSlug: 'temple-border-chanderi-kurti',
    samplePrice: 'LKR 11,200'
  }
];

export default function FabricExplorer() {
  const [activeTab, setActiveTab] = useState(0);
  const fabric = FABRICS[activeTab];

  return (
    <section id="craft" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative z-10 scroll-mt-24">
      
      <div className="text-center space-y-2.5 mb-12">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold">
          Tactile Craft & Weaves
        </span>
        <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#110B0E]">
          Feel the Weave
        </h2>
        <p className="text-sm text-[#6D6268] max-w-lg mx-auto font-light leading-relaxed">
          Every thread is sourced from certified handloom clusters, dyed in sacred crimson and woven with 24K gold zari.
        </p>
      </div>

      {/* Fabric Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-10">
        {FABRICS.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setActiveTab(i)}
            className={`px-5 sm:px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 ${
              activeTab === i
                ? 'bg-[#701626] text-white shadow-xl shadow-[#701626]/20 border border-[#C5A059]/50 scale-105'
                : 'bg-white text-[#110B0E]/80 hover:text-[#701626] border border-[#C5A059]/30 shadow-sm'
            }`}
          >
            <span 
              className="w-3 h-3 rounded-full border border-black/10 shrink-0" 
              style={{ backgroundColor: f.swatchColor }} 
            />
            <span>{f.name.split(' ')[0]} {f.name.split(' ')[1]}</span>
          </button>
        ))}
      </div>

      {/* Main Feature Card */}
      <div className="rounded-[2.5rem] bg-white border border-[#C5A059]/35 shadow-xl p-6 sm:p-10 lg:p-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Visual Showcase */}
          <div className="lg:col-span-6 relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#F7F4EE] border border-[#C5A059]/30">
            <AnimatePresence mode="wait">
              <motion.img
                key={fabric.id}
                src={fabric.image}
                alt={fabric.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              />
            </AnimatePresence>

            {/* Tamil Traditional Badge */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] text-[#701626] font-bold border border-[#C5A059]/40 shadow-sm">
              {fabric.tamil}
            </div>

            <div className="absolute bottom-4 right-4 bg-[#701626] text-white px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
              {fabric.tag}
            </div>
          </div>

          {/* Details & Specs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">Fabric Blueprint</span>
              <h3 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">{fabric.name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/30 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#6D6268] font-bold flex items-center gap-1.5">
                  <Feather className="w-3.5 h-3.5 text-[#701626]" /> Weave Density
                </span>
                <p className="text-xs font-bold text-[#110B0E]">{fabric.weight}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/30 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#6D6268] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" /> Hand-Feel
                </span>
                <p className="text-xs font-bold text-[#110B0E]">{fabric.feel}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-[#701626] font-bold">Artisanal Heritage:</span>
              <p className="text-xs sm:text-sm text-[#6D6268] leading-relaxed font-light">{fabric.craft}</p>
            </div>

            {/* Sample piece bridge */}
            <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/40 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase tracking-wider text-[#6D6268] font-bold">Featured In:</span>
                <h4 className="font-display text-sm font-bold text-[#110B0E]">{fabric.samplePiece}</h4>
                <p className="text-xs font-bold text-[#701626]">{fabric.samplePrice}</p>
              </div>
              <Link
                to={`/products/${fabric.sampleSlug}`}
                className="px-5 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-[11px] uppercase tracking-wider font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors shrink-0"
              >
                <span>Shop Piece</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </div>

    </section>
  );
}
