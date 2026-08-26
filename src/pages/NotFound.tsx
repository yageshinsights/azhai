import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, ArrowRight, Home, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-28 pb-20 px-4 sm:px-8 flex items-center justify-center text-center text-[#110B0E] relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-br from-[#701626]/10 via-[#C5A059]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full bg-white/90 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-[#C5A059]/40 shadow-[0_20px_60px_rgba(112,22,38,0.08)] space-y-6 relative z-10"
      >
        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold bg-[#701626]/8 border border-[#C5A059]/30 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>404 · Page Not Found</span>
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#110B0E]">
            Lost in the Atelier
          </h1>
          <p className="text-xs sm:text-sm text-[#6D6268] font-light leading-relaxed max-w-md mx-auto">
            The handloom creation or page you are looking for has been moved or retired to our seasonal archives.
          </p>
        </div>

        {/* Quick Collections Shortcuts */}
        <div className="pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#110B0E] mb-3">
            Explore Handcrafted Collections:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Kurties', to: '/collections/kurties' },
              { label: 'Sarees', to: '/collections/sarees' },
              { label: 'Shawls', to: '/collections/shawls' },
              { label: 'Tops', to: '/collections/tops' },
            ].map((col) => (
              <Link
                key={col.label}
                to={col.to}
                className="py-2.5 px-3 bg-[#F7F4EE] hover:bg-[#701626] hover:text-white rounded-xl text-xs font-bold text-[#110B0E] border border-[#C5A059]/25 transition-all"
              >
                {col.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="pt-4 border-t border-[#C5A059]/20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-md transition-all"
          >
            <Home className="w-4 h-4" /> Return to Boutique Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
