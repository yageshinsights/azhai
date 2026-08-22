import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { COLLECTIONS } from '@/lib/data';
import { ArrowRight, Crown } from 'lucide-react';

export default function Collections() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-24 text-[#110B0E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold bg-[#701626]/8 border border-[#C5A059]/30 px-4 py-1.5 rounded-full shadow-sm">
            <Crown className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>The 4 Core Collections</span>
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#110B0E]">The Collections</h1>
          <p className="text-sm text-[#6D6268] max-w-lg mx-auto font-light leading-relaxed">
            Curated with simple, timeless essentials — handloom Kurties, cloud-light Sarees, heirloom Shawls, and tailored Tops.
          </p>
        </motion.div>

        {/* 4 Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLLECTIONS.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link 
                to={`/collections/${col.slug}`} 
                className="group block relative rounded-[2rem] overflow-hidden h-[460px] bg-white border border-[#C5A059]/30 shadow-md hover:shadow-2xl transition-all duration-500"
              >
                <motion.img
                  src={col.heroImage}
                  alt={col.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.7 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#110B0E]/90 via-[#110B0E]/25 to-transparent" />
                
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[8px] text-[#701626] font-bold uppercase tracking-[0.2em] shadow-md border border-[#C5A059]/40">
                  {col.season}
                </div>

                <div className="absolute bottom-0 p-6 space-y-1.5 text-white">
                  <p className="text-[9px] uppercase tracking-[0.22em] text-[#DFBF77] font-semibold">{col.count} Pieces · {col.tagline}</p>
                  <h2 className="font-display text-2xl font-bold group-hover:text-[#DFBF77] transition-colors">{col.name}</h2>
                  <p className="text-xs text-white/75 font-light leading-relaxed line-clamp-2">{col.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#DFBF77] font-bold pt-1 uppercase tracking-wider">
                    <span>Explore Collection</span>
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
