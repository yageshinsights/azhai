import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Ruler, 
  HelpCircle, 
  Minus, 
  Plus, 
  Info, 
  Scissors, 
  Calculator,
  Check
} from 'lucide-react';
import { 
  type MeasurementField, 
  formatMeasurement,
  inchesToCm,
  cmToInches 
} from '@/lib/tailoring';

interface InteractiveMannequinProps {
  fields: MeasurementField[];
  measurements: Record<string, number>; // values in inches (canonical)
  onChangeMeasurements: (newVals: Record<string, number>) => void;
  sizeLabel?: string;
  onChangeSizeLabel?: (newLabel: string) => void;
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
  length: {
    tip: 'Measure from high shoulder point down over the bust apex to your desired kurti/dress hem.',
    label: 'Garment Length',
    zone: 'Vertical Silhouette Drop',
    recommendedDelta: '±1.0"',
    howToMeasure: 'Stand straight. Measure from where your shoulder meets your neck, straight down to where you want the hem to fall.',
    type: 'length',
  },
  kameezLength: {
    tip: 'Measure from high shoulder point straight down to below the knee or calf.',
    label: 'Kameez Length',
    zone: 'Tunic Vertical Drop',
    recommendedDelta: '±1.0"',
    howToMeasure: 'From shoulder-neck seam straight down to your desired tunic length.',
    type: 'length',
  },
  lehengaLength: {
    tip: 'Measure from waistband navel down along the outer hip straight to the floor (wear your heels).',
    label: 'Lehenga Skirt Length',
    zone: 'Skirt Vertical Drop',
    recommendedDelta: '±0.5"',
    howToMeasure: 'Measure from where you tie your lehenga skirt down to the floor, wearing the shoes you plan to wear.',
    type: 'length',
  },
  salwarLength: {
    tip: 'Measure from your waist down to the ankle bone.',
    label: 'Salwar Trouser Length',
    zone: 'Trouser Vertical Drop',
    recommendedDelta: '±1.0"',
    howToMeasure: 'From natural waist where you tie the drawstring down to your ankle bone.',
    type: 'length',
  },
  topLength: {
    tip: 'From high shoulder down to natural waistline or hip where top finishes.',
    label: 'Top Length',
    zone: 'Torso Vertical Drop',
    recommendedDelta: '±0.5"',
    howToMeasure: 'From shoulder seam down to your desired top hemline.',
    type: 'length',
  },
  blouseLength: {
    tip: 'Measure from high shoulder seam down over the bust curve to the lower blouse hem.',
    label: 'Blouse Length',
    zone: 'Crop Blouse Finish',
    recommendedDelta: '±0.5"',
    howToMeasure: 'From shoulder down over the bust to where your saree blouse band should end.',
    type: 'length',
  },
  choliLength: {
    tip: 'Measure from high shoulder down over the bust apex to where the choli waistband ends.',
    label: 'Choli Blouse Length',
    zone: 'Choli Torso Finish',
    recommendedDelta: '±0.5"',
    howToMeasure: 'From shoulder down over the bust to the bottom ribcage seam of the choli.',
    type: 'length',
  },
  sleeveLength: {
    tip: 'Measure from the top outer shoulder seam down along the arm to your desired cuff position.',
    label: 'Sleeve Length',
    zone: 'Arm & Cuff',
    recommendedDelta: '±0.5"',
    howToMeasure: 'Bend elbow slightly. Measure from outer shoulder bone down along the outer arm to desired sleeve hem (elbow, 3/4, or wrist). Enter 0 for sleeveless.',
    type: 'sleeve',
  },
  backNeckDepth: {
    tip: 'Measure from nape of back neck down along the spine to the deepest point of the neck cutout.',
    label: 'Back Neckline Cutout',
    zone: 'Back Neck & Latkan',
    recommendedDelta: '±0.5"',
    howToMeasure: 'From the top neck bone down the center spine to where you want the blouse back cutout to drop.',
    type: 'backNeck',
  },
};

/** Close-Up Anatomical / Pattern SVG Illustration */
function SpecificZoneIllustration({
  type,
  displayVal,
  unit,
}: {
  type: DimensionDetail['type'];
  displayVal: number;
  unit: 'inches' | 'cm';
  label: string;
}) {
  switch (type) {
    case 'shoulder':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full select-none">
          <path d="M 40,90 Q 70,60 100,55 Q 130,60 160,90 L 165,110 L 140,110 L 130,75 Q 100,70 70,75 L 60,110 L 35,110 Z" fill="#FFFDF9" stroke="#64748B" strokeWidth="1.8" />
          <line x1="40" y1="90" x2="160" y2="90" stroke="#701626" strokeWidth="4" strokeLinecap="round" />
          <line x1="40" y1="90" x2="160" y2="90" stroke="#DFBF77" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="40" cy="90" r="4.5" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
          <circle cx="160" cy="90" r="4.5" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
          <g transform="translate(100, 90)">
            <rect x="-35" y="-12" width="70" height="24" rx="12" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
              {displayVal}{unit === 'inches' ? '"' : 'cm'}
            </text>
          </g>
          <text x="100" y="145" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600">
            Outer Shoulder Bone to Shoulder Bone
          </text>
        </svg>
      );

    case 'bust':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full select-none">
          <path d="M 50,40 Q 60,95 45,160 L 155,160 Q 140,95 150,40 Z" fill="#FFFDF9" stroke="#64748B" strokeWidth="1.8" />
          <path d="M 70,85 Q 100,105 130,85" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="2 2" />
          <ellipse cx="100" cy="85" rx="55" ry="16" fill="none" stroke="#701626" strokeWidth="4" />
          <ellipse cx="100" cy="85" rx="55" ry="16" fill="none" stroke="#DFBF77" strokeWidth="1.5" strokeDasharray="3 3" />
          <g transform="translate(100, 85)">
            <rect x="-35" y="-12" width="70" height="24" rx="12" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
              {displayVal}{unit === 'inches' ? '"' : 'cm'}
            </text>
          </g>
          <text x="100" y="145" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600">
            Fullest Circumference Across Apex
          </text>
        </svg>
      );

    case 'underbust':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full select-none">
          <path d="M 60,35 Q 65,80 55,160 L 145,160 Q 135,80 140,35 Z" fill="#FFFDF9" stroke="#64748B" strokeWidth="1.8" />
          <ellipse cx="100" cy="105" rx="46" ry="14" fill="none" stroke="#701626" strokeWidth="4" />
          <ellipse cx="100" cy="105" rx="46" ry="14" fill="none" stroke="#DFBF77" strokeWidth="1.5" strokeDasharray="3 3" />
          <g transform="translate(100, 105)">
            <rect x="-35" y="-12" width="70" height="24" rx="12" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
              {displayVal}{unit === 'inches' ? '"' : 'cm'}
            </text>
          </g>
          <text x="100" y="150" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600">
            Directly Under Bust Ribcage Band
          </text>
        </svg>
      );

    case 'waist':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full select-none">
          <path d="M 50,30 Q 75,95 50,170 L 150,170 Q 125,95 150,30 Z" fill="#FFFDF9" stroke="#64748B" strokeWidth="1.8" />
          <ellipse cx="100" cy="98" rx="42" ry="12" fill="none" stroke="#701626" strokeWidth="4" />
          <ellipse cx="100" cy="98" rx="42" ry="12" fill="none" stroke="#DFBF77" strokeWidth="1.5" strokeDasharray="3 3" />
          <g transform="translate(100, 98)">
            <rect x="-35" y="-12" width="70" height="24" rx="12" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
              {displayVal}{unit === 'inches' ? '"' : 'cm'}
            </text>
          </g>
          <text x="100" y="155" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600">
            Narrowest Point of Natural Torso
          </text>
        </svg>
      );

    case 'hip':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full select-none">
          <path d="M 70,30 Q 50,90 80,170 L 120,170 Q 150,90 130,30 Z" fill="#FFFDF9" stroke="#64748B" strokeWidth="1.8" />
          <ellipse cx="100" cy="95" rx="58" ry="16" fill="none" stroke="#701626" strokeWidth="4" />
          <ellipse cx="100" cy="95" rx="58" ry="16" fill="none" stroke="#DFBF77" strokeWidth="1.5" strokeDasharray="3 3" />
          <g transform="translate(100, 95)">
            <rect x="-35" y="-12" width="70" height="24" rx="12" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
              {displayVal}{unit === 'inches' ? '"' : 'cm'}
            </text>
          </g>
          <text x="100" y="155" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600">
            Widest Circumference Across Seat & Hips
          </text>
        </svg>
      );

    case 'sleeve':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full select-none">
          <path d="M 60,40 Q 95,45 130,55 L 115,160 Q 85,155 60,150 Z" fill="#FFFDF9" stroke="#64748B" strokeWidth="1.8" />
          <line x1="130" y1="55" x2="115" y2="160" stroke="#701626" strokeWidth="4" strokeLinecap="round" />
          <line x1="130" y1="55" x2="115" y2="160" stroke="#DFBF77" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="130" cy="55" r="4" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
          <circle cx="115" cy="160" r="4" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
          <g transform="translate(122, 107)">
            <rect x="-35" y="-12" width="70" height="24" rx="12" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
              {displayVal}{unit === 'inches' ? '"' : 'cm'}
            </text>
          </g>
          <text x="100" y="180" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600">
            Outer Shoulder Bone Down to Desired Cuff
          </text>
        </svg>
      );

    case 'backNeck':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full select-none">
          <path d="M 40,40 Q 100,50 160,40 L 155,160 L 45,160 Z" fill="#FFFDF9" stroke="#64748B" strokeWidth="1.8" />
          <path d="M 70,43 Q 100,125 130,43" fill="#F7F4EE" stroke="#64748B" strokeWidth="1.8" />
          <line x1="100" y1="46" x2="100" y2="115" stroke="#701626" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="46" x2="100" y2="115" stroke="#DFBF77" strokeWidth="1.5" strokeDasharray="3 3" />
          <g transform="translate(100, 80)">
            <rect x="-35" y="-12" width="70" height="24" rx="12" fill="#701626" stroke="#DFBF77" strokeWidth="1.5" />
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
          <path d="M 65,25 L 135,25 L 145,160 C 120,165 80,165 55,160 Z" fill="#FFFDF9" stroke="#64748B" strokeWidth="1.8" />
          <line x1="55" y1="160" x2="145" y2="160" stroke="#C5A059" strokeWidth="2" />
          <line x1="100" y1="25" x2="100" y2="160" stroke="#701626" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="25" x2="100" y2="160" stroke="#DFBF77" strokeWidth="1.5" strokeDasharray="3 3" />
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
  measurements,
  onChangeMeasurements,
  onChangeSizeLabel,
  unit,
  onToggleUnit,
  dressTypeName = 'Garment',
}: InteractiveMannequinProps) {
  const [activeFieldKey, setActiveFieldKey] = useState<string>(fields[0]?.fieldName || 'bust');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showEstimatorModal, setShowEstimatorModal] = useState(false);

  // Estimator inputs
  const [estHeightFeet, setEstHeightFeet] = useState('5');
  const [estHeightInches, setEstHeightInches] = useState('4');
  const [estBustSize, setEstBustSize] = useState('36');

  // Input typing buffer (fixes Bug 8: prevents clamping while user is mid-typing)
  const [inputBuffer, setInputBuffer] = useState<string | null>(null);

  const activeField = useMemo(
    () => fields.find((f) => f.fieldName === activeFieldKey) || fields[0],
    [fields, activeFieldKey]
  );

  const activeDetail = FIELD_DETAILS[activeFieldKey] || {
    tip: 'Measure comfortably with relaxed posture.',
    label: activeField?.fieldLabel || 'Target Zone',
    zone: 'Silhouette Area',
    recommendedDelta: '±0.5"',
    howToMeasure: 'Use a standard tailor tape.',
    type: 'length',
  };

  // Adjust a specific measurement via -0.5 / +0.5 buttons
  const handleAdjustValue = (fieldKey: string, delta: number) => {
    const currentInches = measurements[fieldKey] ?? activeField?.minValue ?? 34;
    const stepInches = unit === 'inches' ? delta : delta / 2.54;
    const targetField = fields.find((f) => f.fieldName === fieldKey);
    const min = targetField ? targetField.minValue : 20;
    const max = targetField ? targetField.maxValue : 60;

    const newInches = Math.min(max, Math.max(min, Math.round((currentInches + stepInches) * 10) / 10));

    setInputBuffer(null);
    onChangeSizeLabel?.('Custom Fit');
    onChangeMeasurements({
      ...measurements,
      [fieldKey]: newInches,
    });
  };

  // Clamped commit when user finishes typing (onBlur / enter)
  const commitDirectInput = (fieldKey: string, rawVal: string) => {
    const num = parseFloat(rawVal);
    setInputBuffer(null);
    if (isNaN(num)) return;

    const inchesVal = unit === 'inches' ? num : cmToInches(num);
    const targetField = fields.find((f) => f.fieldName === fieldKey);
    const min = targetField ? targetField.minValue : 20;
    const max = targetField ? targetField.maxValue : 60;

    const clampedInches = Math.min(max, Math.max(min, Math.round(inchesVal * 10) / 10));

    onChangeSizeLabel?.('Custom Fit');
    onChangeMeasurements({
      ...measurements,
      [fieldKey]: clampedInches,
    });
  };

  // Slider change handler (slider values are always within min/max bounds)
  const handleSliderChange = (fieldKey: string, val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    const inchesVal = unit === 'inches' ? num : cmToInches(num);
    const targetField = fields.find((f) => f.fieldName === fieldKey);
    const min = targetField ? targetField.minValue : 20;
    const max = targetField ? targetField.maxValue : 60;
    const clampedInches = Math.min(max, Math.max(min, Math.round(inchesVal * 10) / 10));

    setInputBuffer(null);
    onChangeSizeLabel?.('Custom Fit');
    onChangeMeasurements({
      ...measurements,
      [fieldKey]: clampedInches,
    });
  };

  // Smart size estimator calculation (calibrates custom measurements from height + bust)
  const handleApplyEstimation = () => {
    const bustNum = parseFloat(estBustSize);
    if (isNaN(bustNum)) return;

    const estimatedMap: Record<string, number> = { ...measurements };
    fields.forEach((f) => {
      if (f.fieldName === 'bust') estimatedMap[f.fieldName] = bustNum;
      else if (f.fieldName === 'waist') estimatedMap[f.fieldName] = Math.max(f.minValue, bustNum - 6);
      else if (f.fieldName === 'hip') estimatedMap[f.fieldName] = Math.min(f.maxValue, bustNum + 2);
      else if (f.fieldName === 'underbust') estimatedMap[f.fieldName] = Math.max(f.minValue, bustNum - 4);
      else if (!estimatedMap[f.fieldName]) estimatedMap[f.fieldName] = Math.round((f.minValue + f.maxValue) / 2);
    });

    onChangeSizeLabel?.('Custom Fit');
    onChangeMeasurements(estimatedMap);
    setShowEstimatorModal(false);
  };

  const currentInches = activeField ? (measurements[activeField.fieldName] ?? activeField.minValue) : 34;
  const displayVal = unit === 'inches' ? currentInches : inchesToCm(currentInches);

  return (
    <div className="space-y-6">
      
      {/* ── TOP LUXURY BAR: Unit Toggle & Quick Helpers ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3.5 sm:p-4 rounded-3xl bg-[#FCFBF8] border border-[#C5A059]/35 shadow-xs">
        
        {/* Title Indicator */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="w-8 h-8 rounded-xl bg-[#701626]/10 text-[#701626] flex items-center justify-center shrink-0">
            <Scissors className="w-4 h-4 text-[#701626]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#701626] font-bold block">
              Bespoke Fitting Studio
            </span>
            <p className="text-xs text-[#110B0E] font-medium">
              Calibrated to Your Exact Body Measurements
            </p>
          </div>
        </div>

        {/* Right Auxiliaries: Units Switcher, Size Estimator, Help Guide */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Inches ↔ CM Switcher */}
          <div className="flex items-center bg-[#F7F4EE] p-1 rounded-xl border border-[#C5A059]/30">
            <button
              onClick={() => onToggleUnit('inches')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                unit === 'inches'
                  ? 'bg-white text-[#701626] shadow-xs'
                  : 'text-[#6D6268] hover:text-[#110B0E]'
              }`}
            >
              Inches (")
            </button>
            <button
              onClick={() => onToggleUnit('cm')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                unit === 'cm'
                  ? 'bg-white text-[#701626] shadow-xs'
                  : 'text-[#6D6268] hover:text-[#110B0E]'
              }`}
            >
              CM
            </button>
          </div>

          {/* Size Estimator Button */}
          <button
            onClick={() => setShowEstimatorModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F4EE] hover:bg-[#F0ECE1] text-[#701626] border border-[#C5A059]/30 text-xs font-bold transition-colors cursor-pointer"
            title="Calculate recommended custom starting measurements"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fit Estimator</span>
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

      {/* ── CUSTOM BESPOKE TAILOR STUDIO ── */}
      <motion.div
        key="custom-studio"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
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
                onClick={() => {
                  setActiveFieldKey(f.fieldName);
                  setInputBuffer(null);
                }}
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
          
          {/* LEFT: CLOSE-UP BLUEPRINT (5 cols) */}
          <div className="lg:col-span-5 relative bg-gradient-to-b from-[#FCFBF8] to-[#F7F4EE] rounded-3xl border border-[#C5A059]/35 shadow-xs p-6 flex flex-col items-center justify-between min-h-[360px]">
            
            <div className="w-full flex items-center justify-between pb-3 border-b border-[#C5A059]/20">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#701626] flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#C5A059]" />
                {dressTypeName} Cut
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
              Our master cutters calibrate this garment zone to within {activeDetail?.recommendedDelta || '±0.5"'} precision.
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
                      Target Dimension
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#110B0E] pt-0.5">
                      {activeField.fieldLabel}
                    </h3>
                  </div>

                  {/* Big Value Badge */}
                  <div className="text-right bg-[#F7F4EE] px-5 py-2.5 rounded-2xl border border-[#C5A059]/40">
                    <span className="text-[9px] uppercase tracking-wider text-[#6D6268] block font-medium">Custom Fit</span>
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
                      className="w-12 h-12 rounded-2xl bg-[#F7F4EE] hover:bg-[#701626] hover:text-white text-[#110B0E] border border-[#C5A059]/40 flex items-center justify-center font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                      title={`Decrease 0.5 ${unit === 'cm' ? 'cm' : 'inch'}`}
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
                        onChange={(e) => handleSliderChange(activeField.fieldName, e.target.value)}
                        className="w-full h-3 bg-[#F7F4EE] rounded-lg appearance-none cursor-pointer accent-[#701626] border border-[#C5A059]/30"
                      />
                    </div>

                    <button
                      onClick={() => handleAdjustValue(activeField.fieldName, 0.5)}
                      className="w-12 h-12 rounded-2xl bg-[#F7F4EE] hover:bg-[#701626] hover:text-white text-[#110B0E] border border-[#C5A059]/40 flex items-center justify-center font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                      title={`Increase 0.5 ${unit === 'cm' ? 'cm' : 'inch'}`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Numerical Boundaries & Buffered Direct Input (Fixes Bug 8) */}
                  <div className="flex items-center justify-between text-xs text-[#6D6268]">
                    <span>
                      Safe Range: {formatMeasurement(activeField.minValue, unit)} – {formatMeasurement(activeField.maxValue, unit)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>Exact:</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={inputBuffer !== null ? inputBuffer : displayVal}
                        onChange={(e) => setInputBuffer(e.target.value)}
                        onBlur={(e) => commitDirectInput(activeField.fieldName, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
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
                    {activeDetail.howToMeasure || activeDetail.tip}
                  </p>
                </div>
              </motion.div>
            </div>
          )}

        </div>

        {/* Spec Chips Matrix Summary for All Fields */}
        <div className="p-5 rounded-3xl bg-white border border-[#C5A059]/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#C5A059]/20">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#701626]" />
              <h4 className="font-display text-base sm:text-lg font-bold text-[#110B0E]">
                All Garment Measurement Specifications
              </h4>
            </div>
            <span className="text-[10px] text-[#701626] font-bold bg-[#701626]/10 px-2.5 py-0.5 rounded-full">
              ✨ Custom Fit ({unit.toUpperCase()})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {fields.map((f) => {
              const inches = measurements[f.fieldName] ?? f.minValue;
              const formatted = formatMeasurement(inches, unit);
              const isSelected = f.fieldName === activeFieldKey;

              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setActiveFieldKey(f.fieldName);
                    setInputBuffer(null);
                  }}
                  className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#FCFBF8] border-[#701626] ring-1 ring-[#701626]'
                      : 'bg-[#FCFBF8] border-[#C5A059]/25 hover:border-[#C5A059]/60'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6D6268] block truncate">
                    {f.fieldLabel}
                  </span>
                  <span className="font-display text-base font-bold text-[#701626] pt-0.5 block">
                    {formatted}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </motion.div>

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
                    Bespoke Sizing Estimator
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
                <p className="leading-relaxed">
                  Enter your approximate height and bust/chest size to calculate proportional starting measurements. You can further fine-tune any specific dimension.
                </p>

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
                  <label className="block font-bold text-[#110B0E] mb-1">Bust / Bra Size (inches)</label>
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
                Apply Proportional Measurements
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
                    Measure around the narrowest crease of your waist (usually 1-2 inches above the navel).
                  </div>
                  <div className="pt-2">
                    <strong className="text-[#110B0E] block mb-0.5">Hips & Seat:</strong>
                    Stand with heels together and measure around the fullest circumference of your hips and buttocks.
                  </div>
                  <div className="pt-2">
                    <strong className="text-[#110B0E] block mb-0.5">Shoulder Width:</strong>
                    Measure flat across the high back from outer shoulder bone to outer shoulder bone.
                  </div>
                  <div className="pt-2">
                    <strong className="text-[#110B0E] block mb-0.5">Sleeve Length:</strong>
                    Measure from the outer shoulder tip down to your desired sleeve hem. Enter 0 for sleeveless.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full py-3 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
