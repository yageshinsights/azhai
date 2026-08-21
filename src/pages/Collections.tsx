import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { COLLECTIONS } from '@/lib/data';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Collections() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-20 text-[#1C1318]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 mb-16"
        >
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-[#7B1C2E] font-bold bg-[#7B1C2E]/8 px-3.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-[#C9A96E]" />
            <span>The 2026 Chapters</span>
          </span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-[#1C1318]">The Collections</h1>
          <p className="text-sm text-[#7A6D74] max-w-lg mx-auto font-light leading-relaxed">
            Each chapter represents a distinct aesthetic mood—uniting sacred dyes, temple motifs, and featherlight organza drapes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLLECTIONS.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link 
                to={`/collections/${col.slug}`} 
                className="group block relative rounded-3xl overflow-hidden h-[500px] bg-white border border-[#E8D7B5]/50 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <motion.img
                  src={col.heroImage}
                  alt={col.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.7 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1318]/90 via-[#1C1318]/30 to-transparent" />
                
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-1 rounded-full text-[9px] text-[#7B1C2E] font-bold uppercase tracking-wider shadow-sm">
                  {col.season}
                </div>

                <div className="absolute bottom-0 p-7 space-y-2 text-white">
                  <p className="text-[10px] uppercase tracking-widest text-[#E8D7B5] font-semibold">{col.tagline}</p>
                  <h2 className="font-display text-3xl font-bold group-hover:text-[#E8D7B5] transition-colors">{col.name}</h2>
                  <p className="text-xs text-white/70 font-light leading-relaxed">{col.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#E8D7B5] font-semibold pt-2">
                    <span>Explore Pieces</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
