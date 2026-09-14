import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Sparkles } from 'lucide-react';

interface TailoringMeasurementGuideProps {
  activeField?: string; // 'bust' | 'waist' | 'hips' | 'length' | 'shoulder' | 'sleeve' | string;
  unit: 'in' | 'cm';
}

const MEASUREMENT_TIPS: Record<string, { label: string; tip: string; yPos: number }> = {
  bust: {
    label: 'Bust / Chest Circumference',
    tip: 'Wrap the measuring tape around the fullest part of your bust, keeping tape straight across your back.',
    yPos: 110,
  },
  chest: {
    label: 'Bust / Chest Circumference',
    tip: 'Wrap the measuring tape around the fullest part of your bust, keeping tape straight across your back.',
    yPos: 110,
  },
  waist: {
    label: 'Natural Waistline',
    tip: 'Measure around the narrowest part of your torso, typically 1-2 inches above your navel.',
    yPos: 155,
  },
  hips: {
    label: 'Hip Circumference',
    tip: 'Measure around the fullest part of your hips and seat with feet together.',
    yPos: 200,
  },
  hip: {
    label: 'Hip Circumference',
    tip: 'Measure around the fullest part of your hips and seat with feet together.',
    yPos: 200,
  },
  length: {
    label: 'Garment Length',
    tip: 'Measure vertically from the highest point of your shoulder down to your desired hemline.',
    yPos: 260,
  },
  kurti_length: {
    label: 'Kurti Hem Length',
    tip: 'Measure vertically from the highest point of your shoulder down to where you want the kurti to end.',
    yPos: 260,
  },
  shoulder: {
    label: 'Across Shoulder Width',
    tip: 'Measure horizontally across the back from the tip of one shoulder bone to the other.',
    yPos: 75,
  },
  sleeve: {
    label: 'Sleeve Length',
    tip: 'Measure from the top shoulder point down along your arm to your preferred sleeve cuff length.',
    yPos: 130,
  },
};

export default function TailoringMeasurementGuide({ activeField = 'bust', unit }: TailoringMeasurementGuideProps) {
  const normalizedKey = activeField.toLowerCase().replace(/[\s-]/g, '_');
  const activeInfo = MEASUREMENT_TIPS[normalizedKey] || MEASUREMENT_TIPS['bust'];

  return (
    <div className="bg-[#F7F4EE] rounded-3xl p-5 border border-[#C5A059]/30 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative Atelier Watermark */}
      <div className="absolute top-2 right-3 text-[10px] tracking-[0.2em] uppercase font-bold text-[#701626]/40 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-[#C5A059]" /> Fit Guide
      </div>

      <div className="space-y-3">
        <h4 className="font-display text-base font-bold text-[#110B0E]">
          Atelier Fitting Silhouette
        </h4>

        {/* Dynamic Tip Banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={normalizedKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="p-3 bg-white rounded-2xl border border-[#C5A059]/25 shadow-sm space-y-1"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#701626]">
              <Info className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{activeInfo.label}</span>
            </div>
            <p className="text-[11px] text-[#6D6268] leading-relaxed">
              {activeInfo.tip}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Interactive Mannequin SVG Vector */}
      <div className="relative w-full max-w-[200px] mx-auto my-4 flex items-center justify-center">
        <svg
          viewBox="0 0 200 320"
          className="w-full h-auto drop-shadow-sm select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Mannequin Silhouette Body */}
          <path
            d="M 100 20 C 108 20 114 26 114 34 C 114 42 108 48 100 48 C 92 48 86 42 86 34 C 86 26 92 20 100 20 Z"
            fill="#EFEAE1"
            stroke="#C5A059"
            strokeWidth="1.2"
          />
          {/* Neck */}
          <path d="M 94 48 L 94 62 L 106 62 L 106 48 Z" fill="#EFEAE1" />
          {/* Torso & Dress Silhouette */}
          <path
            d="M 100 62 
               C 120 64 140 70 148 78
               C 142 98 132 110 126 122
               C 122 135 120 148 116 158
               C 126 180 138 210 144 240
               C 148 260 152 285 154 300
               L 46 300
               C 48 285 52 260 56 240
               C 62 210 74 180 84 158
               C 80 148 78 135 74 122
               C 68 110 58 98 52 78
               C 60 70 80 64 100 62 Z"
            fill="#FAF8F5"
            stroke="#C5A059"
            strokeWidth="1.5"
          />

          {/* Guidelines with Highlight States */}
          {/* Shoulder Line */}
          <line
            x1="52"
            y1="78"
            x2="148"
            y2="78"
            stroke={normalizedKey.includes('shoulder') ? '#701626' : '#C5A059'}
            strokeWidth={normalizedKey.includes('shoulder') ? '3' : '1'}
            strokeDasharray={normalizedKey.includes('shoulder') ? 'none' : '4 3'}
            className="transition-all duration-300"
          />

          {/* Bust Line */}
          <line
            x1="65"
            y1="110"
            x2="135"
            y2="110"
            stroke={normalizedKey.includes('bust') || normalizedKey.includes('chest') ? '#701626' : '#C5A059'}
            strokeWidth={normalizedKey.includes('bust') || normalizedKey.includes('chest') ? '3' : '1'}
            strokeDasharray={normalizedKey.includes('bust') || normalizedKey.includes('chest') ? 'none' : '4 3'}
            className="transition-all duration-300"
          />

          {/* Waist Line */}
          <line
            x1="76"
            y1="155"
            x2="124"
            y2="155"
            stroke={normalizedKey.includes('waist') ? '#701626' : '#C5A059'}
            strokeWidth={normalizedKey.includes('waist') ? '3' : '1'}
            strokeDasharray={normalizedKey.includes('waist') ? 'none' : '4 3'}
            className="transition-all duration-300"
          />

          {/* Hip Line */}
          <line
            x1="62"
            y1="200"
            x2="138"
            y2="200"
            stroke={normalizedKey.includes('hip') ? '#701626' : '#C5A059'}
            strokeWidth={normalizedKey.includes('hip') ? '3' : '1'}
            strokeDasharray={normalizedKey.includes('hip') ? 'none' : '4 3'}
            className="transition-all duration-300"
          />

          {/* Vertical Hemline Length */}
          <line
            x1="100"
            y1="62"
            x2="100"
            y2="300"
            stroke={normalizedKey.includes('length') ? '#701626' : '#DFBF77'}
            strokeWidth={normalizedKey.includes('length') ? '3' : '1'}
            strokeDasharray={normalizedKey.includes('length') ? 'none' : '2 3'}
            className="transition-all duration-300"
          />

          {/* Active Glowing Pin Marker */}
          <circle
            cx="100"
            cy={activeInfo.yPos}
            r="5"
            fill="#701626"
            stroke="#DFBF77"
            strokeWidth="2"
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Unit hint */}
      <div className="text-center pt-2 border-t border-[#C5A059]/20">
        <span className="text-[10.5px] text-[#6D6268] font-medium">
          Tape unit active: <strong className="text-[#110B0E] uppercase">{unit === 'in' ? 'Inches (in)' : 'Centimeters (cm)'}</strong>
        </span>
      </div>
    </div>
  );
}
