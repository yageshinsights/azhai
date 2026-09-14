import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, 
  Sparkles, 
  RotateCw, 
  Check, 
  ShoppingBag, 
  Clock, 
  ShieldCheck, 
  Info,
  Ruler,
  ChevronRight
} from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { formatLKR, formatMeasurement } from '@/lib/tailoring';
import LotusIcon from './LotusIcon';

// ── BLOUSE DESIGN CHOICES ──
export interface FrontNeckline {
  id: string;
  name: string;
  description: string;
  pathD: string; // SVG inner cut path for front
}

export interface BackCut {
  id: string;
  name: string;
  description: string;
  hasDori: boolean;
  pathD: string; // SVG inner cut path for back
}

export interface SleeveStyle {
  id: string;
  name: string;
  description: string;
  lengthLabel: string;
}

export interface FabricColor {
  id: string;
  name: string;
  hex: string;
  secondaryHex: string;
  zariColor: string;
}

const FRONT_NECKLINES: FrontNeckline[] = [
  {
    id: 'sweetheart',
    name: 'Sweetheart Neck',
    description: 'Classic romantic bridal curve meeting in a graceful central notch.',
    pathD: 'M 75,32 Q 90,58 100,52 Q 110,58 125,32 L 125,30 L 75,30 Z',
  },
  {
    id: 'deep-v',
    name: 'Plunging Deep V',
    description: 'Contemporary elongated V-neck with gold zari piping contour.',
    pathD: 'M 75,32 L 100,68 L 125,32 Z',
  },
  {
    id: 'boat-neck',
    name: 'High Boat Neck',
    description: 'Wide horizontal shoulder-grazing neckline for understated elegance.',
    pathD: 'M 65,32 Q 100,42 135,32 Z',
  },
  {
    id: 'mandarin-collar',
    name: 'Mandarin Royal Collar',
    description: 'Regal structured band collar with center front hook placket.',
    pathD: 'M 82,32 L 82,46 L 100,48 L 118,46 L 118,32 Z',
  },
  {
    id: 'square-neck',
    name: 'Geometric Square',
    description: 'Clean architectural framing highlighting heirloom temple necklaces.',
    pathD: 'M 78,32 L 78,55 L 122,55 L 122,32 Z',
  },
  {
    id: 'queen-anne',
    name: 'Queen Anne Cut',
    description: 'High sculpted shoulder points dipping into an ornate sweetheart bodice.',
    pathD: 'M 72,32 L 80,48 Q 100,62 120,48 L 128,32 Z',
  },
];

const BACK_CUTS: BackCut[] = [
  {
    id: 'deep-u-dori',
    name: 'Deep U with Gold Dori Tassels',
    description: 'Sensational open U-back with hand-spun gold dori cords and bullion latkan tassels.',
    hasDori: true,
    pathD: 'M 75,32 Q 100,82 125,32 Z',
  },
  {
    id: 'keyhole',
    name: 'Diamond Keyhole & Potli Button',
    description: 'Sophisticated diamond-shaped opening with handcrafted gold zari potli button clasp.',
    hasDori: false,
    pathD: 'M 100,38 L 86,52 L 100,66 L 114,52 Z',
  },
  {
    id: 'sheer-organza',
    name: 'Sheer Illusion Organza Back',
    description: 'Translucent cloud-light organza panel with delicate embroidered vine motifs.',
    hasDori: false,
    pathD: 'M 75,32 Q 100,75 125,32 Z',
  },
  {
    id: 'closed-potli',
    name: 'Closed Back with 12 Zari Buttons',
    description: 'Modest high-coverage back accented with a vertical spine of 12 miniature gold buttons.',
    hasDori: false,
    pathD: 'M 88,32 Q 100,38 112,32 Z',
  },
  {
    id: 'inverted-v',
    name: 'Inverted Geometric V',
    description: 'Modern upward tapering back opening that complements fluid handloom drapes.',
    hasDori: true,
    pathD: 'M 76,70 L 100,36 L 124,70 Z',
  },
];

const SLEEVE_STYLES: SleeveStyle[] = [
  {
    id: 'elbow',
    name: 'Classic Elbow Length (11")',
    description: 'Traditional South Indian sleeve with a 2.5" gold temple zari border.',
    lengthLabel: '11.0 inches',
  },
  {
    id: 'sleeveless',
    name: 'Modern Sleeveless',
    description: 'Clean armhole finished with delicate 1mm gold zari cord piping.',
    lengthLabel: '0.0 inches',
  },
  {
    id: 'puff',
    name: 'Heritage Handloom Puff Sleeve',
    description: 'Pleated royal puff shoulder tapering into a broad gold zari band.',
    lengthLabel: '9.5 inches',
  },
  {
    id: 'cap',
    name: 'Petal Cap Sleeve (4")',
    description: 'Subtle shoulder cap curve providing featherlight shoulder coverage.',
    lengthLabel: '4.5 inches',
  },
  {
    id: 'full-sheer',
    name: 'Full Wrist Sheer Organza (21")',
    description: 'Floor-to-wrist sheer organza with buttoned gold brocade cuffs.',
    lengthLabel: '21.0 inches',
  },
];

const FABRICS: FabricColor[] = [
  {
    id: 'crimson',
    name: 'Sacred Crimson Silk',
    hex: '#701626',
    secondaryHex: '#8E1E34',
    zariColor: '#DFBF77',
  },
  {
    id: 'gold',
    name: '24K Temple Zari Brocade',
    hex: '#B88E3E',
    secondaryHex: '#D4AF37',
    zariColor: '#FFF4D0',
  },
  {
    id: 'ivory',
    name: 'Ivory Lotus Handloom',
    hex: '#F4EFE6',
    secondaryHex: '#E8DFC8',
    zariColor: '#C5A059',
  },
  {
    id: 'emerald',
    name: 'Peacock Emerald Raw Silk',
    hex: '#0D4B3E',
    secondaryHex: '#166E5B',
    zariColor: '#DFBF77',
  },
  {
    id: 'midnight',
    name: 'Midnight Obsidian Silk',
    hex: '#18151D',
    secondaryHex: '#2C2735',
    zariColor: '#DFBF77',
  },
];

const STANDARD_SIZES = [
  { label: 'S', bust: 34, waist: 26, blouseLength: 14 },
  { label: 'M', bust: 36, waist: 28, blouseLength: 14.5 },
  { label: 'L', bust: 38, waist: 30, blouseLength: 15 },
  { label: 'XL', bust: 40, waist: 33, blouseLength: 15.5 },
  { label: 'XXL', bust: 43, waist: 36, blouseLength: 16 },
];

export default function BlouseCustomizer() {
  const addItem = useCartStore((s) => s.addItem);
  const familyProfiles = useAuthStore((s) => s.familyProfiles) || [];

  // Active Atelier Configurator States
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const [selectedFrontNeck, setSelectedFrontNeck] = useState<FrontNeckline>(FRONT_NECKLINES[0]);
  const [selectedBackCut, setSelectedBackCut] = useState<BackCut>(BACK_CUTS[0]);
  const [selectedSleeve, setSelectedSleeve] = useState<SleeveStyle>(SLEEVE_STYLES[0]);
  const [selectedFabric, setSelectedFabric] = useState<FabricColor>(FABRICS[0]);
  
  // Embellishments
  const [hasLatkanTassels, setHasLatkanTassels] = useState(true);
  const [hasPearlPiping, setHasPearlPiping] = useState(false);
  const [isPadded, setIsPadded] = useState(true);

  // Sizing
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [customMeasurements, setCustomMeasurements] = useState({
    bust: 36,
    waist: 28,
    blouseLength: 14.5,
    sleeveLength: 11,
    shoulderWidth: 14.5,
  });

  const [isAdded, setIsAdded] = useState(false);

  // Price Calculation
  const basePrice = 3800; // Base master tailoring
  const fabricPrice = 2400; // Handloom / raw silk
  const latkanPrice = hasLatkanTassels ? 650 : 0;
  const pearlPrice = hasPearlPiping ? 950 : 0;
  const totalPrice = basePrice + fabricPrice + latkanPrice + pearlPrice;

  // Handle Quick Load Family Profile
  const handleLoadFamilyProfile = (profId: string) => {
    const prof = familyProfiles.find((p) => p.id === profId);
    if (prof) {
      setCustomMeasurements({
        bust: prof.measurements.bust || 36,
        waist: prof.measurements.waist || 28,
        blouseLength: prof.measurements.blouseLength || 14.5,
        sleeveLength: prof.measurements.sleeveLength || 11,
        shoulderWidth: prof.measurements.shoulderWidth || 14.5,
      });
      setSelectedSize('Custom');
    }
  };

  const handleAddToCart = () => {
    const itemTitle = `Bespoke Saree Blouse (${selectedFrontNeck.name} + ${selectedBackCut.name})`;

    addItem({
      id: Date.now(),
      name: itemTitle,
      price: `LKR ${totalPrice.toLocaleString('en-LK')}`,
      image: '/assets/blouse-atelier.jpg',
      quantity: 1,
      size: selectedSize,
      tailoring: {
        dressTypeName: 'Bespoke Saree Blouse',
        dressTypeSlug: 'saree-blouse',
        fabricName: `${selectedFabric.name} with ${selectedSleeve.name}`,
        fabricPrice: fabricPrice,
        stitchingFee: basePrice + latkanPrice + pearlPrice,
        sizeLabel: selectedSize,
        measurements: {
          bust: customMeasurements.bust,
          waist: customMeasurements.waist,
          blouseLength: customMeasurements.blouseLength,
          sleeveLength: customMeasurements.sleeveLength,
          shoulderWidth: customMeasurements.shoulderWidth,
        },
        leadTime: '5–7 working days',
      },
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
      {/* ── Studio Header ── */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-[#701626]/10 px-4 py-1.5 rounded-full border border-[#701626]/20">
          <LotusIcon size={16} variant="maroon" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
            Interactive Atelier Studio
          </span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#110B0E]">
          2D Bespoke Blouse Customizer
        </h2>
        <p className="text-xs sm:text-sm text-[#6D6268] max-w-xl mx-auto font-light">
          Design your heirloom saree blouse in real-time. Choose your front neckline, back opening, sleeve silhouette, and gold bullion trims.
        </p>
      </div>

      {/* ── Main 2-Column Atelier Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* LEFT COLUMN: Interactive 2D Visual Canvas (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#FAF8F5] to-[#F3EDE2] rounded-3xl p-6 border border-[#C5A059]/40 shadow-lg sticky top-24 lg:top-28 z-20 self-start space-y-5 text-center">
          
          {/* Canvas Top Bar: Flip View & Active Fabric */}
          <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: selectedFabric.hex }} />
              <span className="text-xs font-bold text-[#110B0E] font-display">
                {selectedFabric.name}
              </span>
            </div>

            {/* Flip Front/Back Button */}
            <button
              onClick={() => setViewSide(viewSide === 'front' ? 'back' : 'front')}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#C5A059]/40 hover:bg-[#701626] hover:text-white text-xs font-bold text-[#701626] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{viewSide === 'front' ? 'Flip to Back View' : 'Flip to Front View'}</span>
            </button>
          </div>

          {/* ── SVG 2D BLOUSE VECTOR CANVAS ── */}
          <div className="relative w-full aspect-square max-w-sm mx-auto flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewSide}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full"
              >
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full drop-shadow-[0_12px_24px_rgba(112,22,38,0.15)]"
                >
                  <defs>
                    {/* Fabric Texture Gradient */}
                    <linearGradient id="blouseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={selectedFabric.hex} />
                      <stop offset="60%" stopColor={selectedFabric.secondaryHex} />
                      <stop offset="100%" stopColor={selectedFabric.hex} />
                    </linearGradient>

                    {/* Gold Zari Texture */}
                    <linearGradient id="zariGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#DFBF77" />
                      <stop offset="50%" stopColor="#FFF2B2" />
                      <stop offset="100%" stopColor="#C5A059" />
                    </linearGradient>
                  </defs>

                  {/* ── SLEEVES ── */}
                  {selectedSleeve.id === 'elbow' && (
                    <g id="elbow-sleeves">
                      {/* Left Sleeve */}
                      <path d="M 52,38 L 22,82 L 36,88 L 64,52 Z" fill="url(#blouseGrad)" stroke="#3A0812" strokeWidth="0.8" />
                      <path d="M 22,82 L 20,86 L 34,92 L 36,88 Z" fill="url(#zariGrad)" stroke="#9E7D3B" strokeWidth="0.5" />
                      {/* Right Sleeve */}
                      <path d="M 148,38 L 178,82 L 164,88 L 136,52 Z" fill="url(#blouseGrad)" stroke="#3A0812" strokeWidth="0.8" />
                      <path d="M 178,82 L 180,86 L 166,92 L 164,88 Z" fill="url(#zariGrad)" stroke="#9E7D3B" strokeWidth="0.5" />
                    </g>
                  )}

                  {selectedSleeve.id === 'puff' && (
                    <g id="puff-sleeves">
                      {/* Left Puff */}
                      <ellipse cx="40" cy="46" rx="18" ry="14" fill="url(#blouseGrad)" stroke="#3A0812" strokeWidth="0.8" />
                      <path d="M 25,58 L 23,76 L 37,79 L 42,60 Z" fill="url(#blouseGrad)" stroke="#3A0812" strokeWidth="0.8" />
                      <path d="M 23,76 L 22,80 L 36,83 L 37,79 Z" fill="url(#zariGrad)" />
                      {/* Right Puff */}
                      <ellipse cx="160" cy="46" rx="18" ry="14" fill="url(#blouseGrad)" stroke="#3A0812" strokeWidth="0.8" />
                      <path d="M 175,58 L 177,76 L 163,79 L 158,60 Z" fill="url(#blouseGrad)" stroke="#3A0812" strokeWidth="0.8" />
                      <path d="M 177,76 L 178,80 L 164,83 L 163,79 Z" fill="url(#zariGrad)" />
                    </g>
                  )}

                  {selectedSleeve.id === 'cap' && (
                    <g id="cap-sleeves">
                      <path d="M 52,38 Q 30,48 42,62 L 64,52 Z" fill="url(#blouseGrad)" stroke="#3A0812" strokeWidth="0.8" />
                      <path d="M 148,38 Q 170,48 158,62 L 136,52 Z" fill="url(#blouseGrad)" stroke="#3A0812" strokeWidth="0.8" />
                    </g>
                  )}

                  {selectedSleeve.id === 'full-sheer' && (
                    <g id="full-sheer-sleeves" opacity="0.85">
                      <path d="M 52,38 L 15,135 L 28,138 L 64,52 Z" fill={selectedFabric.hex} fillOpacity="0.4" stroke="#DFBF77" strokeWidth="0.8" />
                      <rect x="14" y="133" width="15" height="6" rx="2" fill="url(#zariGrad)" />
                      <path d="M 148,38 L 185,135 L 172,138 L 136,52 Z" fill={selectedFabric.hex} fillOpacity="0.4" stroke="#DFBF77" strokeWidth="0.8" />
                      <rect x="171" y="133" width="15" height="6" rx="2" fill="url(#zariGrad)" />
                    </g>
                  )}

                  {/* ── MAIN BODICE SILHOUETTE ── */}
                  <path
                    d="M 52,38 L 75,32 L 125,32 L 148,38 L 138,105 L 62,105 Z"
                    fill="url(#blouseGrad)"
                    stroke="#2D060E"
                    strokeWidth="1"
                  />

                  {/* Front/Back Waistband Zari Trim */}
                  <path d="M 62,101 L 138,101 L 138,105 L 62,105 Z" fill="url(#zariGrad)" stroke="#9E7D3B" strokeWidth="0.5" />

                  {/* Princess Cut Seam Lines */}
                  <path d="M 78,48 Q 80,75 74,101" stroke="#3A0812" strokeWidth="0.8" fill="none" opacity="0.6" />
                  <path d="M 122,48 Q 120,75 126,101" stroke="#3A0812" strokeWidth="0.8" fill="none" opacity="0.6" />

                  {/* ── FRONT VIEW CUTOUT & DETAILS ── */}
                  {viewSide === 'front' && (
                    <g id="front-neck-render">
                      {/* Neck Cutout */}
                      <path
                        d={selectedFrontNeck.pathD}
                        fill="#F3EDE2"
                        stroke="#DFBF77"
                        strokeWidth={hasPearlPiping ? "2.5" : "1.2"}
                        strokeDasharray={hasPearlPiping ? "2,2" : undefined}
                      />

                      {/* Front Placket & Lotus Crest */}
                      <circle cx="100" cy="80" r="1.5" fill="#DFBF77" />
                      <circle cx="100" cy="90" r="1.5" fill="#DFBF77" />
                      <circle cx="100" cy="99" r="1.5" fill="#DFBF77" />
                    </g>
                  )}

                  {/* ── BACK VIEW CUTOUT & DETAILS ── */}
                  {viewSide === 'back' && (
                    <g id="back-neck-render">
                      {/* Back Cutout */}
                      <path
                        d={selectedBackCut.pathD}
                        fill={selectedBackCut.id === 'sheer-organza' ? 'rgba(243,237,226,0.5)' : '#F3EDE2'}
                        stroke="#DFBF77"
                        strokeWidth={hasPearlPiping ? "2.5" : "1.2"}
                        strokeDasharray={hasPearlPiping ? "2,2" : undefined}
                      />

                      {/* Gold Dori Strings and Latkan Tassels */}
                      {(selectedBackCut.hasDori || hasLatkanTassels) && (
                        <g id="latkan-tassels">
                          {/* Top Tie Bow */}
                          <path d="M 76,36 Q 100,48 124,36" stroke="#DFBF77" strokeWidth="1.5" fill="none" />
                          <circle cx="100" cy="42" r="2.5" fill="#C5A059" />

                          {/* Left Hanging Dori & Tassel */}
                          <path d="M 98,42 Q 92,65 88,88" stroke="#DFBF77" strokeWidth="1.2" fill="none" />
                          <path d="M 88,88 L 84,98 L 92,98 Z" fill="url(#zariGrad)" stroke="#9E7D3B" strokeWidth="0.5" />
                          <circle cx="88" cy="100" r="1.5" fill="#701626" />

                          {/* Right Hanging Dori & Tassel */}
                          <path d="M 102,42 Q 108,65 112,88" stroke="#DFBF77" strokeWidth="1.2" fill="none" />
                          <path d="M 112,88 L 108,98 L 116,98 Z" fill="url(#zariGrad)" stroke="#9E7D3B" strokeWidth="0.5" />
                          <circle cx="112" cy="100" r="1.5" fill="#701626" />
                        </g>
                      )}

                      {/* Closed Back 12 Potli Buttons */}
                      {selectedBackCut.id === 'closed-potli' && (
                        <g id="potli-buttons">
                          {[38, 44, 50, 56, 62, 68, 74, 80, 86, 92, 98].map((y) => (
                            <circle key={y} cx="100" cy={y} r="1.5" fill="#DFBF77" />
                          ))}
                        </g>
                      )}
                    </g>
                  )}

                  {/* Scalloped Pearl Trim Accent Indicator */}
                  {hasPearlPiping && (
                    <circle cx="100" cy="32" r="3" fill="#FFF8EE" stroke="#C5A059" strokeWidth="0.5" />
                  )}
                </svg>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Active Silhouette Summary Pill */}
          <div className="p-3 bg-white rounded-2xl border border-[#C5A059]/30 text-left space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#110B0E]">Front: {selectedFrontNeck.name}</span>
              <span className="text-[10px] text-[#701626] font-bold uppercase">{viewSide} view</span>
            </div>
            <p className="text-[11px] text-[#6D6268]">
              Back: {selectedBackCut.name} · Sleeve: {selectedSleeve.name}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Customization Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. SILK FABRIC & COLOR PALETTE */}
          <div className="p-6 bg-white rounded-3xl border border-[#C5A059]/30 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#110B0E] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" /> 1. Select Pure Silk Fabric & Tone
              </label>
              <span className="text-xs font-bold text-[#701626]">Included (LKR {fabricPrice})</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {FABRICS.map((fab) => (
                <button
                  key={fab.id}
                  onClick={() => setSelectedFabric(fab)}
                  className={`p-3 rounded-2xl border transition-all text-left space-y-2 cursor-pointer ${
                    selectedFabric.id === fab.id
                      ? 'border-[#701626] bg-[#701626]/5 ring-1 ring-[#701626]'
                      : 'border-[#C5A059]/25 hover:border-[#701626]/40 bg-white'
                  }`}
                >
                  <div
                    className="w-full h-8 rounded-xl shadow-xs border border-black/10"
                    style={{ backgroundColor: fab.hex }}
                  />
                  <p className="text-[11px] font-bold text-[#110B0E] truncate leading-tight">
                    {fab.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. FRONT NECKLINE SELECTOR */}
          <div className="p-6 bg-white rounded-3xl border border-[#C5A059]/30 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#110B0E] uppercase tracking-wider flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#C5A059]" /> 2. Front Neckline Contour
              </label>
              <button
                onClick={() => setViewSide('front')}
                className="text-[10.5px] font-bold text-[#701626] hover:underline cursor-pointer"
              >
                Preview Front
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FRONT_NECKLINES.map((neck) => (
                <button
                  key={neck.id}
                  onClick={() => {
                    setSelectedFrontNeck(neck);
                    setViewSide('front');
                  }}
                  className={`p-3.5 rounded-2xl border transition-all text-left space-y-1 cursor-pointer ${
                    selectedFrontNeck.id === neck.id
                      ? 'border-[#701626] bg-[#701626]/5 ring-1 ring-[#701626]'
                      : 'border-[#C5A059]/25 hover:border-[#701626]/40 bg-[#FCFBF8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#110B0E]">{neck.name}</h4>
                    {selectedFrontNeck.id === neck.id && <Check className="w-3.5 h-3.5 text-[#701626]" />}
                  </div>
                  <p className="text-[10px] text-[#6D6268] line-clamp-2 leading-relaxed">
                    {neck.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. BACK OPENING CUT SELECTOR */}
          <div className="p-6 bg-white rounded-3xl border border-[#C5A059]/30 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#110B0E] uppercase tracking-wider flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-[#C5A059]" /> 3. Back Opening & Silhouette
              </label>
              <button
                onClick={() => setViewSide('back')}
                className="text-[10.5px] font-bold text-[#701626] hover:underline cursor-pointer"
              >
                Preview Back
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BACK_CUTS.map((back) => (
                <button
                  key={back.id}
                  onClick={() => {
                    setSelectedBackCut(back);
                    setViewSide('back');
                  }}
                  className={`p-3.5 rounded-2xl border transition-all text-left space-y-1 cursor-pointer ${
                    selectedBackCut.id === back.id
                      ? 'border-[#701626] bg-[#701626]/5 ring-1 ring-[#701626]'
                      : 'border-[#C5A059]/25 hover:border-[#701626]/40 bg-[#FCFBF8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#110B0E]">{back.name}</h4>
                    {selectedBackCut.id === back.id && <Check className="w-3.5 h-3.5 text-[#701626]" />}
                  </div>
                  <p className="text-[10px] text-[#6D6268] line-clamp-2 leading-relaxed">
                    {back.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 4. SLEEVE SILHOUETTE SELECTOR */}
          <div className="p-6 bg-white rounded-3xl border border-[#C5A059]/30 shadow-xs space-y-3">
            <label className="text-xs font-bold text-[#110B0E] uppercase tracking-wider flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-[#C5A059]" /> 4. Sleeve Style & Border
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SLEEVE_STYLES.map((slv) => (
                <button
                  key={slv.id}
                  onClick={() => setSelectedSleeve(slv)}
                  className={`p-3.5 rounded-2xl border transition-all text-left space-y-1 cursor-pointer ${
                    selectedSleeve.id === slv.id
                      ? 'border-[#701626] bg-[#701626]/5 ring-1 ring-[#701626]'
                      : 'border-[#C5A059]/25 hover:border-[#701626]/40 bg-[#FCFBF8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#110B0E]">{slv.name}</h4>
                    {selectedSleeve.id === slv.id && <Check className="w-3.5 h-3.5 text-[#701626]" />}
                  </div>
                  <p className="text-[10px] text-[#6D6268] leading-relaxed">
                    {slv.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 5. ATELIER EMBELLISHMENTS & TRIMS */}
          <div className="p-6 bg-white rounded-3xl border border-[#C5A059]/30 shadow-xs space-y-3">
            <label className="text-xs font-bold text-[#110B0E] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" /> 5. Luxury Embellishments & Finishing
            </label>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F4EE]/60 border border-[#C5A059]/25 hover:bg-[#F7F4EE] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={hasLatkanTassels}
                    onChange={(e) => setHasLatkanTassels(e.target.checked)}
                    className="w-4 h-4 rounded text-[#701626] border-[#C5A059]/40 focus:ring-[#701626]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#110B0E]">Handmade Gold Bullion Latkan Tassels</p>
                    <p className="text-[10.5px] text-[#6D6268]">Heavy handcrafted metallic bells with pure silk cords</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#701626]">+LKR 650</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F4EE]/60 border border-[#C5A059]/25 hover:bg-[#F7F4EE] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={hasPearlPiping}
                    onChange={(e) => setHasPearlPiping(e.target.checked)}
                    className="w-4 h-4 rounded text-[#701626] border-[#C5A059]/40 focus:ring-[#701626]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#110B0E]">Scalloped Muthu Pearl & Zari Piping</p>
                    <p className="text-[10.5px] text-[#6D6268]">Delicate 2mm seed pearls hand-stitched along neck and sleeves</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#701626]">+LKR 950</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F4EE]/60 border border-[#C5A059]/25 hover:bg-[#F7F4EE] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isPadded}
                    onChange={(e) => setIsPadded(e.target.checked)}
                    className="w-4 h-4 rounded text-[#701626] border-[#C5A059]/40 focus:ring-[#701626]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#110B0E]">Padded Cups & Pure Cotton Silk Inner Lining</p>
                    <p className="text-[10.5px] text-[#6D6268]">Soft contoured inner pads with anti-chafing breathable lining</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700">Free</span>
              </label>
            </div>
          </div>

          {/* 6. SIZING & SAVED FAMILY PROFILE LOADER */}
          <div className="p-6 bg-white rounded-3xl border border-[#C5A059]/30 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#110B0E] uppercase tracking-wider flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-[#C5A059]" /> 6. Blouse Size & Body Measurements
              </label>
              
              {/* Quick load from family vault */}
              {familyProfiles.length > 0 && (
                <select
                  onChange={(e) => handleLoadFamilyProfile(e.target.value)}
                  defaultValue=""
                  className="px-3 py-1 rounded-xl bg-[#F7F4EE] border border-[#C5A059]/40 text-[11px] font-bold text-[#701626] focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>✨ Load Saved Fitting...</option>
                  {familyProfiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.relationship})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Standard Size Pills */}
            <div className="flex flex-wrap gap-2">
              {STANDARD_SIZES.map((sz) => (
                <button
                  key={sz.label}
                  onClick={() => {
                    setSelectedSize(sz.label);
                    setCustomMeasurements((prev) => ({
                      ...prev,
                      bust: sz.bust,
                      waist: sz.waist,
                      blouseLength: sz.blouseLength,
                    }));
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSize === sz.label
                      ? 'bg-[#701626] text-white shadow-md'
                      : 'bg-[#F7F4EE] text-[#110B0E] border border-[#C5A059]/30 hover:border-[#701626]'
                  }`}
                >
                  Size {sz.label} ({sz.bust}")
                </button>
              ))}
              <button
                onClick={() => setSelectedSize('Custom')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSize === 'Custom'
                    ? 'bg-[#701626] text-white shadow-md'
                    : 'bg-[#F7F4EE] text-[#110B0E] border border-[#C5A059]/30 hover:border-[#701626]'
                }`}
              >
                Custom Fit ✂️
              </button>
            </div>

            {/* Numeric Measurements Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-2.5 rounded-xl bg-[#F7F4EE]/60 border border-[#C5A059]/20">
                <span className="text-[9.5px] uppercase tracking-wider text-[#6D6268] block">Bust / Chest</span>
                <input
                  type="number"
                  step="0.5"
                  value={customMeasurements.bust}
                  onChange={(e) => {
                    setCustomMeasurements({ ...customMeasurements, bust: parseFloat(e.target.value) || 0 });
                    setSelectedSize('Custom');
                  }}
                  className="w-full bg-transparent font-bold text-xs text-[#110B0E] focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-[#F7F4EE]/60 border border-[#C5A059]/20">
                <span className="text-[9.5px] uppercase tracking-wider text-[#6D6268] block">Underbust Waist</span>
                <input
                  type="number"
                  step="0.5"
                  value={customMeasurements.waist}
                  onChange={(e) => {
                    setCustomMeasurements({ ...customMeasurements, waist: parseFloat(e.target.value) || 0 });
                    setSelectedSize('Custom');
                  }}
                  className="w-full bg-transparent font-bold text-xs text-[#110B0E] focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-[#F7F4EE]/60 border border-[#C5A059]/20">
                <span className="text-[9.5px] uppercase tracking-wider text-[#6D6268] block">Blouse Length</span>
                <input
                  type="number"
                  step="0.5"
                  value={customMeasurements.blouseLength}
                  onChange={(e) => {
                    setCustomMeasurements({ ...customMeasurements, blouseLength: parseFloat(e.target.value) || 0 });
                    setSelectedSize('Custom');
                  }}
                  className="w-full bg-transparent font-bold text-xs text-[#110B0E] focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-[#F7F4EE]/60 border border-[#C5A059]/20">
                <span className="text-[9.5px] uppercase tracking-wider text-[#6D6268] block">Sleeve Length</span>
                <input
                  type="number"
                  step="0.5"
                  value={customMeasurements.sleeveLength}
                  onChange={(e) => {
                    setCustomMeasurements({ ...customMeasurements, sleeveLength: parseFloat(e.target.value) || 0 });
                    setSelectedSize('Custom');
                  }}
                  className="w-full bg-transparent font-bold text-xs text-[#110B0E] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ── PRICE BREAKDOWN & ADD TO BAG CTA ── */}
          <div className="p-6 bg-gradient-to-br from-white via-white to-[#F7F4EE] rounded-3xl border-2 border-[#C5A059]/40 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#C5A059]/25">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#6D6268] font-bold block">
                  Total Custom Blouse Investment
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl sm:text-4xl font-bold text-[#701626]">
                    {formatLKR(totalPrice)}
                  </span>
                  <span className="text-xs text-[#6D6268] font-light">(All materials & stitching included)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#701626] font-bold bg-[#701626]/10 px-3.5 py-1.5 rounded-full border border-[#C5A059]/30 self-start sm:self-auto">
                <Clock className="w-4 h-4" /> Ready in 5–7 working days
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#6D6268]">
              <div>• Base Tailoring: <strong>LKR {basePrice}</strong></div>
              <div>• Silk Fabric: <strong>LKR {fabricPrice}</strong></div>
              <div>• Latkan Tassels: <strong>{hasLatkanTassels ? 'LKR 650' : 'None'}</strong></div>
              <div>• Pearl Piping: <strong>{hasPearlPiping ? 'LKR 950' : 'None'}</strong></div>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                isAdded
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#701626] hover:bg-[#8E1E34] text-white shadow-[#701626]/20'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-5 h-5" /> Bespoke Blouse Added to Bag!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" /> Add Custom Blouse to Bag ({formatLKR(totalPrice)})
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
