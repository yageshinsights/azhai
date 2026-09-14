import { motion } from 'framer-motion';
import LotusIcon from './LotusIcon';

export default function AtelierLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="w-16 h-16 rounded-full bg-[#701626]/8 border border-[#DFBF77] flex items-center justify-center shadow-md p-3"
      >
        <LotusIcon size={34} className="drop-shadow-sm" />
      </motion.div>

      <div className="text-center space-y-1">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#701626]">
          Azhai Atelier
        </p>
        <p className="text-xs text-[#6D6268] font-serif italic">
          Preparing handcrafted drapes...
        </p>
      </div>
    </div>
  );
}
