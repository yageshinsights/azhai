import { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Sparkles, RotateCcw } from 'lucide-react';

interface AnimatedLogoProps {
  variant?: 'light' | 'dark' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withAura?: boolean;
  replayable?: boolean;
}

export default function AnimatedLogo({
  variant = 'light',
  size = 'md',
  className = '',
  withAura = true,
  replayable = false,
}: AnimatedLogoProps) {
  const [key, setKey] = useState(0);

  // Height sizing for the exact logo
  const sizeClasses = {
    sm: 'h-14 sm:h-16',
    md: 'h-20 sm:h-24',
    lg: 'h-28 sm:h-36',
    xl: 'h-36 sm:h-48',
  };

  const logoSrc =
    variant === 'dark' || variant === 'gold'
      ? '/logo-gold.png'
      : '/logo-light.png';

  // 3D Parallax Tilt Physics on Hover
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-80, 80], [6, -6]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(mouseX, [-80, 80], [-6, 6]), { stiffness: 220, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      key={key}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 900,
        rotateX,
        rotateY,
      }}
      className={`relative inline-flex flex-col items-center justify-center select-none group cursor-pointer ${className}`}
    >
      {/* ── 1. AMBIENT SOFT GOLDEN AURA (Subtle & Luxurious) ── */}
      {withAura && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#DFBF77]/20 via-[#C5A059]/30 to-[#701626]/20 blur-3xl -z-10 pointer-events-none"
          animate={{
            scale: [0.92, 1.12, 0.92],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* ── 2. THE AUTHENTIC EXACT BRAND LOGO WITH CINEMATIC REVEAL & FOIL SHEEN ── */}
      <div className="relative overflow-hidden p-3 flex items-center justify-center">
        
        {/* The Exact Brand Logo Asset */}
        <motion.img
          src={logoSrc}
          alt="Azhai Clothing by Preethi"
          className={`${sizeClasses[size]} w-auto object-contain drop-shadow-md`}
          initial={{ opacity: 0, scale: 0.94, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{
            duration: 1.1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />

        {/* Diagonal Liquid Gold Foil Light Ray */}
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 pointer-events-none"
          animate={{
            translateX: ['-160%', '220%'],
          }}
          transition={{
            repeat: Infinity,
            repeatDelay: 3.8,
            duration: 1.4,
            ease: 'easeInOut',
          }}
        />

        {/* Glowing Lotus Crown Starlight Sparkle */}
        <motion.div
          className="absolute top-2 right-4 sm:right-6 text-[#C5A059] pointer-events-none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0.4, 1, 0],
            scale: [0.5, 1.4, 0.8, 1.3, 0.5],
            rotate: [0, 90, 180],
          }}
          transition={{
            delay: 1.0,
            duration: 3,
            repeat: Infinity,
            repeatDelay: 4,
            ease: 'easeInOut',
          }}
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#DFBF77] drop-shadow-[0_0_8px_#C5A059]" />
        </motion.div>

        {/* A-Loop Golden Thread Shimmer Accent */}
        <motion.div
          className="absolute bottom-5 left-4 sm:left-6 text-[#DFBF77] pointer-events-none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.6, 1.2, 0.6],
          }}
          transition={{
            delay: 1.6,
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 5,
            ease: 'easeInOut',
          }}
        >
          <Sparkles className="w-3 h-3 text-[#C5A059]" />
        </motion.div>
      </div>

      {/* Optional Replay Button on Hover */}
      {replayable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setKey((prev) => prev + 1);
          }}
          className="mt-1 text-[9px] uppercase tracking-widest text-[#6D6268] hover:text-[#701626] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Replay Animation"
        >
          <RotateCcw className="w-3 h-3" /> Replay
        </button>
      )}
    </motion.div>
  );
}
