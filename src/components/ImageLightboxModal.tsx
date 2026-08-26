import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: { src: string; alt?: string }[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  productName: string;
}

export default function ImageLightboxModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onSelectIndex,
  productName,
}: ImageLightboxModalProps) {
  // Handle keyboard arrow navigation & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onSelectIndex((currentIndex + 1) % images.length);
      if (e.key === 'ArrowLeft') onSelectIndex((currentIndex - 1 + images.length) % images.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onSelectIndex]);

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8">
        {/* Top bar */}
        <div className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-4 h-4 text-[#DFBF77]" />
            <span className="font-display text-base sm:text-lg font-bold truncate max-w-xs sm:max-w-md">
              {productName}
            </span>
            <span className="text-xs text-white/60 pl-2">
              ({currentIndex + 1} of {images.length})
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close Lightbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={() => onSelectIndex((currentIndex - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20 cursor-pointer"
            title="Previous Image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Main Image */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative max-h-[82vh] max-w-[85vw] flex items-center justify-center overflow-hidden rounded-3xl"
        >
          <img
            src={images[currentIndex]?.src}
            alt={productName}
            className="max-h-[82vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-white/10"
          />
        </motion.div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={() => onSelectIndex((currentIndex + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20 cursor-pointer"
            title="Next Image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Bottom thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2.5 z-20 px-4 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onSelectIndex(idx)}
                className={`w-14 h-18 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  currentIndex === idx ? 'border-[#DFBF77] scale-105 shadow-lg' : 'border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}
