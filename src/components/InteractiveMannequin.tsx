import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Ruler, 
  HelpCircle, 
  Minus, 
  Plus, 
  Info,
  Check,
  Scissors,
  Zap,
  ChevronRight,
  Calculator
} from 'lucide-react';
import { 
  type MeasurementField, 
  type SizePreset, 
  formatMeasurement,
  inchesToCm,
  cmToInches 
} from '@/lib/tailoring';

interface InteractiveMannequinProps {
  fields: MeasurementField[];
  presets: SizePreset[];
  measurements: Record<string, number>; // values in inches (canonical)
  onChangeMeasurements: (newVals: Record<string, number>) => void;
  sizeLabel: string;
  onChangeSizeLabel: (newLabel: string) => void;
  unit: 'inches' | 'cm';
  onToggleUnit: (newUnit: 'inches' | 'cm') => void;
  dressTypeName?: string;
  dressTypeSlug?: string;
}

// Detailed measurement profile with dedicated close-up blueprint illustrations
interface DimensionDetail {
  tip: string;
  label: string;
  zone: string;
  recommendedDelta: string;
  howToMeasure: string;
  type: 'bust' | 'waist' | 'hip' | 'shoulder' | 'sleeve' | 'length' | 'backNeck' | 'underbust';
}

const FIELD_DETAILS: Record<string, DimensionDetail> = {
  shoulderWidth: {
    tip: 'Measure across the back shoulder seam from left bone to right bone.',
    label: 'Shoulder Width',
    zone: 'Upper Back & Shoulders',
    recommendedDelta: '±0.5"',
    howToMeasure: 'Keep arms relaxed. Measure flat across the high back between the outer tips of your shoulder bones.',
    type: 'shoulder',
  },
  bust: {
    tip: 'Measure around the fullest part of your chest, keeping the measuring tape level across the back.',
    label: 'Bust / Chest',
    zone: 'Chest & Bustline',
    recommendedDelta: '±1.0"',
    howToMeasure: 'Wear your standard undergarment. Wrap tape around the fullest curve of your bust, parallel to the floor.',
    type: 'bust',
  },
  underbust: {
    tip: 'Measure directly under the bust line where the blouse or crop band rests snug.',
    label: 'Underbust Band',
    zone: 'Ribcage & Band',
    recommendedDelta: '±0.5"',
    howToMeasure: 'Wrap tape firmly around your ribcage directly beneath your bustline where the garment band finishes.',
    type: 'underbust',
  },
  waist: {
    tip: 'Measure around your natural waistline, 1-2 inches above your navel at the narrowest point.',
    label: 'Natural Waist',
    zone: 'Torso Midsection',
    recommendedDelta: '±1.0"',
    howToMeasure: 'Find the narrowest crease of your torso by bending gently sideways. Measure comfortably with 1 finger allowance.',
    type: 'waist',
  },
  hip: {
    tip: 'Stand with feet together and measure around the fullest circumference of your hips and seat.',
    label: 'Hips & Seat',
    zone: 'Pelvis & Hip Curve',
    recommendedDelta: '±1.0"',
    howToMeasure: 'Stand straight with heels together. Wrap tape around the widest projection of your buttocks and hips.',
    type: 'hip',
  },
  sleeveLength: {
    tip: 'Measure from the top shoulder bone along the outer arm to your desired sleeve hemline.',
    label: 'Sleeve Length',
    zone: 'Arm & Sleeve Cut',
    recommendedDelta: '±0.5"',
    howToMeasure: 'From the top point of your shoulder, measure straight down along your arm to desired sleeve length (elbow, 3/4, or wrist).',
    type: 'sleeve',
  },
  length: {
    tip: 'Measure from high shoulder point near the neck straight down to desired hemline.',
    label: 'Garment Length',
    zone: 'Full Vertical Drop',
    recommendedDelta: '±1.0"',
    howToMeasure: 'From the top shoulder seam near the collar, measure straight down past the knee/calf to your desired bottom hem.',
    type: 'length',
  },
  kameezLength: {
    tip: 'Measure from high shoulder straight down to knee/calf according to your style preference.',
    label: 'Kameez Length',
    zone: 'Kameez Hem Drop',
    recommendedDelta: '±1.0"',
    howToMeasure: 'From the high shoulder point next to the neck, let the tape fall straight down to your preferred hemline.',
    type: 'length',
  },
  salwarLength: {
    tip: 'Measure from your waistline where you tie your salwar down to the ankle bone.',
    label: 'Salwar Length',
    zone: 'Leg Drop to Ankle',
    recommendedDelta: '±1.0"',
    howToMeasure: 'From where you fasten your salwar or trousers at the waist, measure straight down to the ankle bone.',
    type: 'length',
  },
  lehengaLength: {
    tip: 'Measure from the waistline where you tie the skirt down to the floor (including heels).',
    label: 'Lehenga Length',
    zone: 'Waist-to-Floor Drop',
    recommendedDelta: '±1.0"',
    howToMeasure: 'Tie a ribbon at your natural waist. Measure down to the floor while wearing the heel height you plan to use.',
    type: 'length',
  },
  blouseLength: {
    tip: 'Measure from top shoulder seam down to your desired blouse bottom hem.',
    label: 'Blouse Length',
    zone: 'Torso Crop Length',
    recommendedDelta: '±0.5"',
    howToMeasure: 'From the high shoulder seam, measure straight down across the bust point to where the blouse bottom hem should end.',
    type: 'length',
  },
  topLength: {
    tip: 'Measure from top shoulder seam down to the bottom hem.',
    label: 'Top Length',
    zone: 'Torso Length',
    recommendedDelta: '±0.5"',
    howToMeasure: 'From top shoulder seam straight down to bottom hem.',
    type: 'length',
  },
  backNeckDepth: {
    tip: 'Measure from the nape of neck down along the spine to your desired back neckline opening.',
    label: 'Back Neck Depth',
    zone: 'Back Neck Cutout',
    recommendedDelta: '±0.5"',
    howToMeasure: 'From the prominent bone at the back of your neck (nape), measure vertically down along your spine to the desired neckline depth.',
    type: 'backNeck',
  },
};

// Component that renders the close-up anatomical garment blueprint for a specific zone
function SpecificZoneIllustration({ type, displayVal, unit, label }: { type: string; displayVal: number; unit: string; label: string }) {
  switch (type) {
    case 'waist':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full select-none">
          <defs>
            <linearGradient id="skinTone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="100%" stopColor="#F5ECE1" />
            </linearGradient>
          </defs>
          {/* Hourglass Torso Waist Close-up */}
          <path
            d="M 50,20 
               C 65,45 74,75 74,100 
               C 74,125 60,165 45,185 
               L 155,185 
               C 140,165 126,125 126,100 
               C 126,75 135,45 150,20 Z"
            fill="url(#skinTone)"
            stroke="#64748B"
            strokeWidth="1.8"
          />
          {/* Navel reference */}
          <ellipse cx="100" cy="115" rx="2" ry="3" fill="#C5A059" opacity="0.6" />

          {/* Measuring Tape Ribbon wrapping across the waist */}
          <line x1="56" y1="98" x2="144" y2="98" stroke="#701626" strokeWidth="6" strokeLinecap="round" />
          <line x1="56" y1="98" x2="144" y2="98" stroke="#DFBF77" strokeWidth="2" strokeDasharray="3 3" />

          {/* Value Badge Callout */}
          <g transform="translate(100, 98)">
            <rect x="-38" y="-12" width="76" height="24" rx="12" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
              {displayVal}{unit === 'inches' ? '"' : 'cm'}
            </text>
          </g>

          <text x="100" y="160" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600">
            Natural Waistline (1-2" above navel)
          </text>
        </svg>
      );

    case 'bust':
    case 'underbust':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full select-none">
          <defs>
            <linearGradient id="skinToneBust" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="100%" stopColor="#F5ECE1" />
            </linearGradient>
          </defs>
          {/* Chest, Neckline & Bust Close-up */}
          <path
            d="M 30,50 
               C 60,54 80,68 100,68 
               C 120,68 140,54 170,50
               C 165,85 155,120 148,155
               C 130,162 115,165 100,165
               C 85,165 70,162 52,155
               C 45,120 35,85 30,50 Z"
            fill="url(#skinToneBust)"
            stroke="#64748B"
            strokeWidth="1.8"
          />
          {/* Elegant Sweetheart Collarbone Line */}
          <path d="M 85,45 Q 100,55 115,45" fill="none" stroke="#C5A059" strokeWidth="1.2" />

          {/* Measuring Tape wrapping across the fullest bust */}
          <line x1="36" y1="110" x2="164" y2="110" stroke="#701626" strokeWidth="6" strokeLinecap="round" />
          <line x1="36" y1="110" x2="164" y2="110" stroke="#DFBF77" strokeWidth="2" strokeDasharray="3 3" />

          {/* Value Badge */}
          <g transform="translate(100, 110)">
            <rect x="-38" y="-12" width="76" height="24" rx="12" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
              {displayVal}{unit === 'inches' ? '"' : 'cm'}
            </text>
          </g>

          <text x="100" y="180" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600">
            {type === 'bust' ? 'Fullest Chest Curve' : 'Underbust Band Line'}
          </text>
        </svg>
      );

    case 'shoulder':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full select-none">
          {/* Upper Back & Shoulders Close-up */}
          <path
            d="M 90,20 L 90,45 C 60,52 35,65 20,85 L 30,150 C 60,140 85,135 100,135 C 115,135 140,140 170,150 L 180,85 C 165,65 140,52 110,45 L 110,20 Z"
            fill="#FFFDF9"
            stroke="#64748B"
            strokeWidth="1.8"
          />
          {/* Left & Right Shoulder Bone Landmarks */}
          <circle cx="28" cy="80" r="4" fill="#DFBF77" stroke="#701626" strokeWidth="1.5" />
          <circle cx="172" cy="80" r="4" fill="#DFBF77" stroke="#701626" strokeWidth="1.5" />

          {/* Shoulder Measuring Line */}
          <line x1="28" y1="80" x2="172" y2="80" stroke="#701626" strokeWidth="5" strokeLinecap="round" />
          <line x1="28" y1="80" x2="172" y2="80" stroke="#DFBF77" strokeWidth="2" strokeDasharray="3 3" />

          {/* Value Badge */}
          <g transform="translate(100, 80)">
            <rect x="-38" y="-12" width="76" height="24" rx="12" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
              {displayVal}{unit === 'inches' ? '"' : 'cm'}
            </text>
          </g>

          <text x="100" y="165" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600">
            Back Shoulder Seam (Bone to Bone)
          </text>
        </svg>
      );

    case 'sleeve':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full select-none">
          {/* Arm & Sleeve Close-up */}
          <path
            d="M 60,30 
               C 80,32 95,45 105,70 
               C 112,95 108,135 104,175 
               L 80,175 
               C 82,140 82,100 75,75 
               C 70,55 58,42 45,35 Z"
            fill="#FFFDF9"
            stroke="#64748B"
            strokeWidth="1.8"
          />
          {/* Shoulder Top Point */}
          <circle cx="60" cy="30" r="3.5" fill="#DFBF77" stroke="#701626" strokeWidth="1.5" />

          {/* Curved Sleeve Tape measuring down */}
          <path
            d="M 52,32 C 72,60 76,110 74,170"
            fill="none"
            stroke="#701626"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 52,32 C 72,60 76,110 74,170"
            fill="none"
            stroke="#DFBF77"
            strokeWidth="2"
            strokeDasharray="3 3"
          />

          {/* Value Badge */}
          <g transform="translate(130, 105)">
            <rect x="-38" y="-12" width="76" height="24" rx="12" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
              {displayVal}{unit === 'inches' ? '"' : 'cm'}
            </text>
          </g>

          <text x="100" y="190" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600">
            Shoulder Point to Sleeve Hem
          </text>
        </svg>
      );

    case 'hip':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full select-none">
          {/* Pelvis & Hips Close-up with Kurti Side Slit */}
          <path
            d="M 68,25 
               C 68,55 50,85 45,115 
               C 42,140 48,170 54,185 
               L 146,185 
               C 152,170 158,140 155,115 
               C 150,85 132,55 132,25 Z"
            fill="#FFFDF9"
            stroke="#64748B"
            strokeWidth="1.8"
          />
          {/* Kurti Side Slit Reference */}
          <line x1="50" y1="120" x2="50" y2="185" stroke="#C5A059" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="150" y1="120" x2="150" y2="185" stroke="#C5A059" strokeWidth="1.5" strokeDasharray="3 2" />

          {/* Measuring Tape across fullest hip */}
          <line x1="44" y1="115" x2="156" y2="115" stroke="#701626" strokeWidth="6" strokeLinecap="round" />
          <line x1="44" y1="115" x2="156" y2="115" stroke="#DFBF77" strokeWidth="2" strokeDasharray="3 3" />

          {/* Value Badge */}
          <g transform="translate(100, 115)">
            <rect x="-38" y="-12" width="76" height="24" rx="12" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
              {displayVal}{unit === 'inches' ? '"' : 'cm'}
            </text>
          </g>

          <text x="100" y="170" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600">
            Fullest Circumference of Hips & Seat
          </text>
        </svg>
      );

    case 'backNeck':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full select-none">
          {/* Back Neckline Cutout Close-up */}
          <path
            d="M 40,40 L 80,45 C 85,85 115,85 120,45 L 160,40 L 165,150 L 35,150 Z"
            fill="#FFFDF9"
            stroke="#64748B"
            strokeWidth="1.8"
          />
          {/* Deep Neck Opening Curve */}
          <path d="M 80,45 C 80,105 120,105 120,45" fill="none" stroke="#701626" strokeWidth="2" strokeDasharray="3 2" />

          {/* Vertical Depth Measuring Tape */}
          <line x1="100" y1="45" x2="100" y2="105" stroke="#701626" strokeWidth="5" strokeLinecap="round" />
          <line x1="100" y1="45" x2="100" y2="105" stroke="#DFBF77" strokeWidth="2" strokeDasharray="2 2" />

          {/* Value Badge */}
          <g transform="translate(100, 75)">
            <rect x="-38" y="-12" width="76" height="24" rx="12" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
              {displayVal}{unit === 'inches' ? '"' : 'cm'}
            </text>
          </g>

          <text x="100" y="165" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600">
            Nape of Neck to Bottom of Cutout
          </text>
        </svg>
      );

    case 'length':
    default:
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full select-none">
          {/* Garment Full Vertical Drop Close-up */}
          <path
            d="M 65,25 
               L 135,25 
               L 145,160 
               C 120,165 80,165 55,160 Z"
            fill="#FFFDF9"
            stroke="#64748B"
            strokeWidth="1.8"
          />
          {/* Hemline Flare & Slits */}
          <line x1="55" y1="160" x2="145" y2="160" stroke="#C5A059" strokeWidth="2" />

          {/* Vertical Length Measuring Tape */}
          <line x1="100" y1="25" x2="100" y2="160" stroke="#701626" strokeWidth="5" strokeLinecap="round" />
          <line x1="100" y1="25" x2="100" y2="160" stroke="#DFBF77" strokeWidth="2" strokeDasharray="3 3" />

          {/* Value Badge */}
          <g transform="translate(100, 92)">
            <rect x="-38" y="-12" width="76" height="24" rx="12" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
              {displayVal}{unit === 'inches' ? '"' : 'cm'}
            </text>
          </g>

          <text x="100" y="182" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600">
            Top Shoulder Down to Desired Hemline
          </text>
        </svg>
      );
  }
}

export default function InteractiveMannequin({
  fields,
  presets,
  measurements,
  onChangeMeasurements,
  sizeLabel,
  onChangeSizeLabel,
  unit,
  onToggleUnit,
  dressTypeName = 'Garment',
  dressTypeSlug = 'kurti',
}: InteractiveMannequinProps) {
  const [activeTab, setActiveTab] = useState<'standard' | 'custom'>(
    sizeLabel === 'Custom' ? 'custom' : 'standard'
  );
  const [activeFieldKey, setActiveFieldKey] = useState<string>(fields[0]?.fieldName || 'bust');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showEstimatorModal, setShowEstimatorModal] = useState(false);

  // Estimator inputs
  const [estHeightFeet, setEstHeightFeet] = useState('5');
  const [estHeightInches, setEstHeightInches] = useState('4');
  const [estBustSize, setEstBustSize] = useState('36');

  const activeField = useMemo(
    () => fields.find((f) => f.fieldName === activeFieldKey) || fields[0],
    [fields, activeFieldKey]
  );

  // Apply a standard size preset
  const handleSelectPreset = (preset: SizePreset) => {
    onChangeSizeLabel(preset.sizeLabel);
    onChangeMeasurements({ ...preset.measurements });
  };

  // Adjust a specific measurement
  const handleAdjustValue = (fieldKey: string, delta: number) => {
    const currentInches = measurements[fieldKey] ?? activeField?.minValue ?? 34;
    const stepInches = unit === 'inches' ? delta : delta / 2.54;
    const targetField = fields.find((f) => f.fieldName === fieldKey);
    const min = targetField ? targetField.minValue : 20;
    const max = targetField ? targetField.maxValue : 60;

    const newInches = Math.min(max, Math.max(min, Math.round((currentInches + stepInches) * 10) / 10));

    onChangeSizeLabel('Custom');
    onChangeMeasurements({
      ...measurements,
      [fieldKey]: newInches,
    });
  };

  // Direct manual input handler
  const handleDirectInput = (fieldKey: string, rawVal: string) => {
    const num = parseFloat(rawVal);
    if (isNaN(num)) return;

    const inchesVal = unit === 'inches' ? num : cmToInches(num);
    const targetField = fields.find((f) => f.fieldName === fieldKey);
    const min = targetField ? targetField.minValue : 20;
    const max = targetField ? targetField.maxValue : 60;

    const clampedInches = Math.min(max, Math.max(min, Math.round(inchesVal * 10) / 10));

    onChangeSizeLabel('Custom');
    onChangeMeasurements({
      ...measurements,
      [fieldKey]: clampedInches,
    });
  };

  // Smart size estimator calculation
  const handleApplyEstimation = () => {
    const bustNum = parseFloat(estBustSize);
    if (isNaN(bustNum)) return;

    let bestPreset = presets[0];
    let minDiff = 999;

    presets.forEach((p) => {
      const pBust = p.measurements['bust'] || 36;
      const diff = Math.abs(pBust - bustNum);
      if (diff < minDiff) {
        minDiff = diff;
        bestPreset = p;
      }
    });

    if (bestPreset) {
      handleSelectPreset(bestPreset);
      setActiveTab('standard');
      setShowEstimatorModal(false);
    }
  };

  const activeDetail = activeField ? FIELD_DETAILS[activeField.fieldName] : null;
  const activeTip = activeDetail?.howToMeasure || 'Measure comfortably with 1 finger breathing allowance.';
  const currentInches = activeField ? (measurements[activeField.fieldName] ?? activeField.minValue) : 34;
  const displayVal = unit === 'inches' ? currentInches : inchesToCm(currentInches);

  return (
    <div className="space-y-6">
      
      {/* ── TOP LUXURY BAR: Mode Switcher, Unit Toggle & Quick Helpers ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3.5 sm:p-4 rounded-3xl bg-[#FCFBF8] border border-[#C5A059]/35 shadow-sm">
        
        {/* Main Tab Switcher: Standard vs Custom Bespoke */}
        <div className="flex items-center bg-[#F7F4EE] p-1 rounded-2xl border border-[#C5A059]/25 w-full md:w-auto">
          <button
            onClick={() => {
              setActiveTab('standard');
              if (sizeLabel === 'Custom' && presets.length > 0) {
                handleSelectPreset(presets[1] || presets[0]); // default to M
              }
            }}
            className={`flex-1 md:flex-initial px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'standard'
                ? 'bg-[#701626] text-white shadow-md shadow-[#701626]/20'
                : 'text-[#6D6268] hover:text-[#110B0E]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#DFBF77]" />
            <span>Standard Sizes (S – XXL)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('custom');
              onChangeSizeLabel('Custom');
            }}
            className={`flex-1 md:flex-initial px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-[#701626] text-white shadow-md shadow-[#701626]/20'
                : 'text-[#6D6268] hover:text-[#110B0E]'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 text-[#DFBF77]" />
            <span>Custom Bespoke Tailor</span>
          </button>
        </div>

        {/* Right Auxiliaries: Units Switcher, Size Estimator, Help Guide */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Inches ↔ CM Switcher */}
          <div className="flex items-center bg-[#F7F4EE] p-1 rounded-xl border border-[#C5A059]/30">
            <button
              onClick={() => onToggleUnit('inches')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                unit === 'inches'
                  ? 'bg-white text-[#701626] shadow-sm'
                  : 'text-[#6D6268] hover:text-[#110B0E]'
              }`}
            >
              Inches (")
            </button>
            <button
              onClick={() => onToggleUnit('cm')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                unit === 'cm'
                  ? 'bg-white text-[#701626] shadow-sm'
                  : 'text-[#6D6268] hover:text-[#110B0E]'
              }`}
            >
              CM
            </button>
          </div>

          {/* Size Estimator Button */}
          <button
            onClick={() => setShowEstimatorModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F7F4EE] hover:bg-[#F0ECE1] text-[#701626] border border-[#C5A059]/30 text-xs font-bold transition-colors cursor-pointer"
            title="Calculate recommended size"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Find My Size</span>
          </button>

          {/* Fit Guide */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="p-1.5 rounded-xl bg-[#F7F4EE] hover:bg-[#F0ECE1] text-[#701626] border border-[#C5A059]/30 transition-colors cursor-pointer"
            title="Measurement Instructions"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ── MODE 1: STANDARD SIZES GALLERY ── */}
      {activeTab === 'standard' && (
        <motion.div
          key="standard-mode"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
          {/* Preset Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
            {presets.map((preset) => {
              const isSelected = sizeLabel === preset.sizeLabel;
              const bust = preset.measurements['bust'];
              const waist = preset.measurements['waist'];
              const hip = preset.measurements['hip'];
              const length = preset.measurements['length'] || preset.measurements['kameezLength'] || preset.measurements['blouseLength'];

              return (
                <button
                  key={preset.id || preset.sizeLabel}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-left transition-all relative overflow-hidden border-2 cursor-pointer flex flex-col justify-between min-h-[140px] sm:min-h-[160px] group ${
                    isSelected
                      ? 'bg-[#701626] text-white border-[#DFBF77] shadow-xl shadow-[#701626]/20 scale-[1.02]'
                      : 'bg-white hover:bg-[#FCFBF8] text-[#110B0E] border-[#C5A059]/30 hover:border-[#C5A059]/60 shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#DFBF77] text-[#701626] flex items-center justify-center font-bold shadow-sm">
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                  )}

                  <div>
                    <span className={`text-[9px] sm:text-[10px] uppercase tracking-widest font-bold block ${
                      isSelected ? 'text-[#DFBF77]' : 'text-[#6D6268]'
                    }`}>
                      Standard Fit
                    </span>
                    <h4 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">
                      {preset.sizeLabel}
                    </h4>
                  </div>

                  <div className={`space-y-0.5 sm:space-y-1 text-[11px] sm:text-xs pt-2 sm:pt-3 border-t ${
                    isSelected ? 'border-white/15 text-white/90' : 'border-[#C5A059]/15 text-[#6D6268]'
                  }`}>
                    {bust && (
                      <div className="flex justify-between">
                        <span>Bust:</span>
                        <strong className={isSelected ? 'text-white' : 'text-[#110B0E]'}>
                          {formatMeasurement(bust, unit)}
                        </strong>
                      </div>
                    )}
                    {waist && (
                      <div className="flex justify-between">
                        <span>Waist:</span>
                        <strong className={isSelected ? 'text-white' : 'text-[#110B0E]'}>
                          {formatMeasurement(waist, unit)}
                        </strong>
                      </div>
                    )}
                    {hip && (
                      <div className="flex justify-between">
                        <span>Hip:</span>
                        <strong className={isSelected ? 'text-white' : 'text-[#110B0E]'}>
                          {formatMeasurement(hip, unit)}
                        </strong>
                      </div>
                    )}
                    {length && (
                      <div className="flex justify-between">
                        <span>Length:</span>
                        <strong className={isSelected ? 'text-white' : 'text-[#110B0E]'}>
                          {formatMeasurement(length, unit)}
                        </strong>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Full Measurements Matrix for Selected Size */}
          <div className="p-5 rounded-3xl bg-white border border-[#C5A059]/30 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#C5A059]/20">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#701626]" />
                <h4 className="font-display text-lg font-bold text-[#110B0E]">
                  Complete Tailoring Specs for Size {sizeLabel}
                </h4>
              </div>

              <button
                onClick={() => {
                  setActiveTab('custom');
                  onChangeSizeLabel('Custom');
                }}
                className="text-xs text-[#701626] font-bold hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>Customize any specific dimension</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Spec Chips Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {fields.map((f) => {
                const inches = measurements[f.fieldName] ?? f.minValue;
                const formatted = formatMeasurement(inches, unit);

                return (
                  <div
                    key={f.id}
                    className="p-3 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/25 flex flex-col justify-between"
                  >
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6D6268] truncate">
                      {f.fieldLabel}
                    </span>
                    <span className="font-display text-base font-bold text-[#701626] pt-1">
                      {formatted}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </motion.div>
      )}

      {/* ── MODE 2: CUSTOM BESPOKE TAILOR STUDIO (WITH CLOSE-UP BODY & GARMENT BLUEPRINTS) ── */}
      {activeTab === 'custom' && (
        <motion.div
          key="custom-mode"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
          {/* Dimension Selector Pills Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {fields.map((f) => {
              const isActive = f.fieldName === activeFieldKey;
              const inches = measurements[f.fieldName] ?? f.minValue;
              const formatted = formatMeasurement(inches, unit);

              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFieldKey(f.fieldName)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 border ${
                    isActive
                      ? 'bg-[#701626] text-white border-[#DFBF77] shadow-md shadow-[#701626]/20 scale-105'
                      : 'bg-white hover:bg-[#F7F4EE] text-[#110B0E] border-[#C5A059]/30'
                  }`}
                >
                  <span>{f.fieldLabel}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#701626]/10 text-[#701626]'
                  }`}>
                    {formatted}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Field Studio with Close-Up Visual Blueprint on Left and Tactile Adjuster on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* LEFT: CLOSE-UP SECTION OF THE BODY & GARMENT CUT BLUEPRINT (5 cols) */}
            <div className="lg:col-span-5 relative bg-gradient-to-b from-[#FCFBF8] to-[#F7F4EE] rounded-3xl border border-[#C5A059]/35 shadow-sm p-6 flex flex-col items-center justify-between min-h-[380px]">
              
              <div className="w-full flex items-center justify-between pb-3 border-b border-[#C5A059]/20">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#701626] flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-[#C5A059]" />
                  {dressTypeName} Blueprint
                </span>
                <span className="text-[9px] bg-[#701626]/10 text-[#701626] font-bold px-2.5 py-0.5 rounded-full">
                  {activeDetail?.zone || 'Active Zone'}
                </span>
              </div>

              {/* Close-Up Body & Garment Cut Visual Illustration */}
              <div className="my-auto py-3 w-full max-w-[220px] aspect-square flex items-center justify-center">
                <motion.div
                  key={activeFieldKey}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full rounded-2xl bg-white border border-[#C5A059]/40 shadow-md p-3 flex items-center justify-center relative overflow-hidden"
                >
                  <SpecificZoneIllustration
                    type={activeDetail?.type || 'length'}
                    displayVal={displayVal}
                    unit={unit}
                    label={activeField?.fieldLabel || 'Fit'}
                  />
                </motion.div>
              </div>

              <p className="text-[11px] text-[#6D6268] text-center italic">
                Master cutters calibrate this garment zone to within {activeDetail?.recommendedDelta || '±0.5"'} precision.
              </p>
            </div>

            {/* RIGHT: TACTILE MASTER ADJUSTER (7 cols) */}
            {activeField && (
              <div className="lg:col-span-7 space-y-4">
                <motion.div
                  key={activeField.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-3xl bg-white border-2 border-[#C5A059]/60 shadow-lg space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold block">
                        Target Measurement
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#110B0E] pt-0.5">
                        {activeField.fieldLabel}
                      </h3>
                    </div>

                    {/* Big Value Badge */}
                    <div className="text-right bg-[#F7F4EE] px-5 py-2.5 rounded-2xl border border-[#C5A059]/40">
                      <span className="text-[9px] uppercase tracking-wider text-[#6D6268] block font-medium">Bespoke Fit</span>
                      <span className="font-display text-3xl font-bold text-[#701626]">
                        {displayVal}
                        <span className="text-xs text-[#6D6268] font-normal ml-1">
                          {unit === 'inches' ? 'in' : 'cm'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Tactile Micro-Steppers & Smooth Slider */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAdjustValue(activeField.fieldName, -0.5)}
                        className="w-12 h-12 rounded-2xl bg-[#F7F4EE] hover:bg-[#701626] hover:text-white text-[#110B0E] border border-[#C5A059]/40 flex items-center justify-center font-bold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                        title="Decrease 0.5 inch"
                      >
                        <Minus className="w-5 h-5" />
                      </button>

                      {/* Range Slider */}
                      <div className="flex-1 relative flex items-center">
                        <input
                          type="range"
                          min={unit === 'inches' ? activeField.minValue : inchesToCm(activeField.minValue)}
                          max={unit === 'inches' ? activeField.maxValue : inchesToCm(activeField.maxValue)}
                          step={unit === 'inches' ? 0.5 : 1}
                          value={displayVal}
                          onChange={(e) => handleDirectInput(activeField.fieldName, e.target.value)}
                          className="w-full h-3 bg-[#F7F4EE] rounded-lg appearance-none cursor-pointer accent-[#701626] border border-[#C5A059]/30"
                        />
                      </div>

                      <button
                        onClick={() => handleAdjustValue(activeField.fieldName, 0.5)}
                        className="w-12 h-12 rounded-2xl bg-[#F7F4EE] hover:bg-[#701626] hover:text-white text-[#110B0E] border border-[#C5A059]/40 flex items-center justify-center font-bold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                        title="Increase 0.5 inch"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Numerical Boundaries & Direct Input */}
                    <div className="flex items-center justify-between text-xs text-[#6D6268]">
                      <span>
                        Safe Range: {formatMeasurement(activeField.minValue, unit)} – {formatMeasurement(activeField.maxValue, unit)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span>Exact:</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={displayVal}
                          onChange={(e) => handleDirectInput(activeField.fieldName, e.target.value)}
                          className="w-16 px-2 py-1 bg-[#FCFBF8] border border-[#C5A059]/50 rounded-lg text-center font-bold text-[#110B0E] focus:outline-none focus:border-[#701626]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Illustrated Tailor Advice */}
                  <div className="p-3.5 rounded-2xl bg-[#F7F4EE]/90 border border-[#C5A059]/30 flex items-start gap-2.5 text-xs text-[#6D6268]">
                    <Info className="w-4 h-4 text-[#701626] shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-light">
                      <strong className="text-[#110B0E] font-medium">How to measure: </strong>
                      {activeTip}
                    </p>
                  </div>
                </motion.div>
              </div>
            )}

          </div>
        </motion.div>
      )}

      {/* ── SIZE ESTIMATOR MODAL ── */}
      <AnimatePresence>
        {showEstimatorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEstimatorModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#C5A059]/40 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/20">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#701626]" />
                  <h3 className="font-display text-xl font-bold text-[#110B0E]">
                    Find Your Recommended Size
                  </h3>
                </div>
                <button
                  onClick={() => setShowEstimatorModal(false)}
                  className="text-[#6D6268] hover:text-[#701626] font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs text-[#6D6268]">
                <div>
                  <label className="block font-bold text-[#110B0E] mb-1">Approximate Height</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1 bg-[#F7F4EE] p-2 rounded-xl border border-[#C5A059]/30">
                      <input
                        type="number"
                        value={estHeightFeet}
                        onChange={(e) => setEstHeightFeet(e.target.value)}
                        className="w-full bg-transparent font-bold text-center text-[#110B0E] focus:outline-none"
                      />
                      <span>ft</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#F7F4EE] p-2 rounded-xl border border-[#C5A059]/30">
                      <input
                        type="number"
                        value={estHeightInches}
                        onChange={(e) => setEstHeightInches(e.target.value)}
                        className="w-full bg-transparent font-bold text-center text-[#110B0E] focus:outline-none"
                      />
                      <span>in</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#110B0E] mb-1">Bust / Bra Size Estimate (inches)</label>
                  <input
                    type="number"
                    value={estBustSize}
                    onChange={(e) => setEstBustSize(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F4EE] rounded-xl border border-[#C5A059]/30 font-bold text-center text-[#110B0E] focus:outline-none focus:border-[#701626]"
                    placeholder="e.g. 36"
                  />
                </div>
              </div>

              <button
                onClick={handleApplyEstimation}
                className="w-full py-3 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Apply Recommended Size
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MEASURING GUIDE MODAL ── */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuideModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#C5A059]/40 space-y-5 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/20">
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-[#701626]" />
                  <h3 className="font-display text-xl font-bold text-[#110B0E]">
                    Atelier Measurement Guide
                  </h3>
                </div>
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="text-[#6D6268] hover:text-[#701626] font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs text-[#6D6268] leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-[#F7F4EE] border border-[#C5A059]/30 space-y-1">
                  <span className="font-bold text-[#701626] block">🌟 Golden Fitting Rule:</span>
                  <p>Keep measuring tape comfortably snug but never tight. Always leave a 1-finger breathing ease inside the tape.</p>
                </div>

                <div className="space-y-3 divide-y divide-[#C5A059]/15">
                  <div className="pt-2">
                    <strong className="text-[#110B0E] block mb-0.5">Bust / Chest:</strong>
                    Measure across the fullest point of the bust with your bra on. Keep tape straight across your back.
                  </div>
                  <div className="pt-2">
                    <strong className="text-[#110B0E] block mb-0.5">Natural Waist:</strong>
                    Measure at the narrowest point of your torso, typically 1–2 inches above the navel.
                  </div>
                  <div className="pt-2">
                    <strong className="text-[#110B0E] block mb-0.5">Hips & Seat:</strong>
                    Stand with heels together and measure around the fullest circumference of your hips.
                  </div>
                  <div className="pt-2">
                    <strong className="text-[#110B0E] block mb-0.5">Sleeve & Length:</strong>
                    Measure from shoulder point along the arm or straight down to desired hemline.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full py-3 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Got It, Return to Fitting
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
