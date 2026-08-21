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
    samplePiece: 'Maroon Kanjivaram Corset Kurta Set',
    sampleSlug: 'maroon-kanjivaram-kurta-set',
    samplePrice: '₹8,499'
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
    samplePiece: 'Dreamy Ivory Lotus Organza Saree',
    sampleSlug: 'ivory-lotus-organza-saree',
    samplePrice: '₹12,800'
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
    samplePiece: '32-Kali Twirl Raw Silk Anarkali',
    sampleSlug: 'raw-silk-anarkali',
    samplePrice: '₹15,500'
  },
  {
    id: 'chanderi',
    name: 'Handloom Cotton-Silk Chanderi',
    tamil: 'சந்தேரி பருத்தி பட்டு',
    tag: 'Everyday Chic',
    weight: '45 GSM · Breathable',
    feel: 'Featherlight, crisp yet soft against the skin',
    craft: 'Woven with gold zari motifs inspired by traditional Tamil temple architecture.',
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=90',
    swatchColor: '#DFBF77',
    samplePiece: 'Pre-Draped Chanderi Co-ord Set',
    sampleSlug: 'temple-border-chanderi-tunic',
    samplePrice: '₹6,200'
  }
];

export default function FabricExplorer() {
  const [activeTab, setActiveTab] = useState(0);
  const fabric = FABRICS[activeTab];

  return (
    <section className="py-24 px-5 sm:px-8 max-w-7xl mx-auto relative z-10">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold bg-[#701626]/8 border border-[#C5A059]/30 px-4 py-1.5 rounded-full shadow-sm">
            <Crown className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>The Tactile Atelier</span>
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#110B0E]">
            Touch the craft behind Azhai
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#6D6268] max-w-md font-light leading-relaxed">
          We use zero polyester or stiff synthetic fabrics. Every single thread is handloom-grade, breathable, and woven to last generations.
        </p>
      </div>

      {/* Interactive Swatch Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {FABRICS.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setActiveTab(i)}
            className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3.5 ${
              activeTab === i
                ? 'bg-white border-[#701626] shadow-lg shadow-[#701626]/10 scale-[1.02] ring-1 ring-[#701626]/40'
                : 'bg-white/80 border-[#C5A059]/30 hover:bg-white hover:border-[#C5A059]'
            }`}
          >
            <div 
              className="w-9 h-9 rounded-full shadow-inner shrink-0 border border-[#C5A059]/60"
              style={{ backgroundColor: f.swatchColor }}
            />
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#6D6268] font-bold">{f.tag}</p>
              <p className="text-xs font-bold text-[#110B0E] truncate leading-tight pt-0.5">{f.name.split(' ')[0]} {f.name.split(' ')[1]}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Active Fabric Showcase Deck */}
      <div className="rounded-[2rem] bg-white p-6 sm:p-10 border border-[#C5A059]/35 shadow-[0_20px_50px_rgba(35,15,22,0.06)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={fabric.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
          >
            
            {/* Fabric Image */}
            <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#F7F4EE] border border-[#C5A059]/30 shadow-md">
              <img
                src={fabric.image}
                alt={fabric.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-[9px] font-bold text-[#701626] shadow-sm border border-[#C5A059]/30">
                {fabric.tamil}
              </div>
            </div>

            {/* Fabric Specs & Story */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#701626] font-bold bg-[#701626]/10 px-3 py-1 rounded-full border border-[#701626]/20">
                    {fabric.tag}
                  </span>
                  <span className="text-xs text-[#6D6268] font-medium">{fabric.weight}</span>
                </div>
                <h3 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">
                  {fabric.name}
                </h3>
              </div>

              <div className="space-y-3 text-sm text-[#6D6268] leading-relaxed">
                <p className="flex items-start gap-2.5">
                  <Feather className="w-4 h-4 text-[#C5A059] shrink-0 mt-1" />
                  <span><strong>The Feel:</strong> {fabric.feel}</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#701626] shrink-0 mt-1" />
                  <span><strong>The Weaving Process:</strong> {fabric.craft}</span>
                </p>
              </div>

              {/* Sample Piece Callout */}
              <div className="p-5 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/40 flex items-center justify-between gap-4 shadow-sm">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#6D6268] font-bold">Featured Atelier Piece in this Silk</p>
                  <h4 className="font-display text-lg font-bold text-[#110B0E] leading-tight pt-0.5">
                    {fabric.samplePiece}
                  </h4>
                  <p className="text-xs font-bold text-[#701626] pt-1">{fabric.samplePrice}</p>
                </div>
                <Link
                  to={`/products/${fabric.sampleSlug}`}
                  className="px-6 py-3 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-xl flex items-center gap-2 shrink-0 transition-colors shadow-md border border-[#C5A059]/30"
                >
                  <span>View Piece</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </motion.div>
        </AnimatePresence>
      </div>

    </section>
  );
}
