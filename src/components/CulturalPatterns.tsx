import { motion } from 'framer-motion';

/**
 * 24K Gold Zari Kandyan Nelum Rosette Medallion
 * Intricate multi-layered royal lotus seal with fine filigree lines
 */
export function NelumRosetteMedallion({ className = '', size = 360 }: { className?: string; size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 160, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="120" cy="120" r="115" stroke="#C5A059" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.6" />
      <circle cx="120" cy="120" r="108" stroke="#701626" strokeWidth="1.2" opacity="0.35" />
      <circle cx="120" cy="120" r="95" stroke="#C5A059" strokeWidth="0.6" opacity="0.5" />
      
      {/* 8 Radiating Liyawel / Lotus Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <g key={i} transform={`rotate(${angle} 120 120)`}>
          {/* Outer Liyawel Vine Leaf */}
          <path
            d="M120,18 C138,40 150,65 120,90 C90,65 102,40 120,18 Z"
            fill="#C5A059"
            fillOpacity="0.08"
            stroke="#C5A059"
            strokeWidth="1"
          />
          {/* Inner Punkalasa Mesh */}
          <path
            d="M114,38 Q120,30 126,38 Q120,46 114,38"
            stroke="#701626"
            strokeWidth="0.8"
            opacity="0.45"
          />
          <circle cx="120" cy="55" r="2.5" fill="#C5A059" opacity="0.7" />
        </g>
      ))}

      {/* Central Nelum (Lotus) Core */}
      <circle cx="120" cy="120" r="32" fill="#FCFBF8" stroke="#701626" strokeWidth="1.2" />
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <path
          key={i}
          d="M120,100 C126,110 126,116 120,120 C114,116 114,110 120,100 Z"
          transform={`rotate(${angle} 120 120)`}
          fill="#701626"
          fillOpacity="0.2"
          stroke="#701626"
          strokeWidth="0.8"
        />
      ))}
      <circle cx="120" cy="120" r="5" fill="#C5A059" />
    </motion.svg>
  );
}

/**
 * Royal Sri Lankan Liyawel (Foliage Vine) Divider
 */
export function LiyawelDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full flex items-center justify-center gap-4 py-8 overflow-hidden ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#C5A059]/40 to-[#701626]/30" />
      
      <svg width="130" height="26" viewBox="0 0 130 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-[#701626]">
        {/* Central Nelum Motif */}
        <path d="M65,2 C70,9 74,15 65,24 C56,15 60,9 65,2 Z" fill="#701626" fillOpacity="0.12" stroke="#701626" strokeWidth="1" />
        <circle cx="65" cy="13" r="2.5" fill="#C5A059" />
        
        {/* Left Flowing Vine */}
        <path d="M54,13 C45,5 35,21 22,13 C13,7 5,15 0,13" stroke="#C5A059" strokeWidth="1" strokeLinecap="round" />
        <path d="M38,11 C41,8 45,11 43,15" stroke="#701626" strokeWidth="0.8" />
        
        {/* Right Flowing Vine */}
        <path d="M76,13 C85,5 95,21 108,13 C117,7 125,15 130,13" stroke="#C5A059" strokeWidth="1" strokeLinecap="round" />
        <path d="M92,11 C89,8 85,11 87,15" stroke="#701626" strokeWidth="0.8" />
      </svg>

      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#C5A059]/40 to-[#701626]/30" />
    </div>
  );
}

/**
 * Moorish & Jaffna Star Jaali (Geometric Lattice) Subtle Watermark
 */
export function JaaliPatternBackground({ className = '', opacity = 0.02 }: { className?: string; opacity?: number }) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24,0 L28,10 L38,10 L30,17 L34,27 L24,21 L14,27 L18,17 L10,10 L20,10 Z M24,48 L28,38 L38,38 L30,31 L34,21 L24,27 L14,21 L18,31 L10,38 L20,38 Z M0,24 L10,20 L10,10 L17,18 L27,14 L21,24 L27,34 L17,30 L10,38 L10,28 Z M48,24 L38,20 L38,10 L31,18 L21,14 L27,24 L21,34 L31,30 L38,38 L38,28 Z' fill='%23701626' fill-opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '48px 48px',
      }}
    />
  );
}
