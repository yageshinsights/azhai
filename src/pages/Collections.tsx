import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAdminStore } from '@/store/admin';
import { COLLECTIONS } from '@/lib/data';
import { ArrowRight, Crown } from 'lucide-react';

export default function Collections() {
  const adminCategories = useAdminStore((s) => s.categories);
  const products = useAdminStore((s) => s.products);
  const categoriesList = adminCategories && adminCategories.length > 0 ? adminCategories : COLLECTIONS;

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
            <span>Curated Silhouettes ({categoriesList.length} Collections)</span>
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#110B0E]">The Collections</h1>
          <p className="text-sm text-[#6D6268] max-w-lg mx-auto font-light leading-relaxed">
            Curated with timeless handloom silks — crafted for modern Sri Lankan celebrations, weddings, and understated luxury.
          </p>
        </motion.div>

        {/* Collections Grid (2-Column Landscape Editorial Banners) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {categoriesList.map((col, i) => {
            const count = products.filter((p) =>
              p.categories.some((c) => c.slug === col.slug)
            ).length;

            return (
              <motion.div
                key={col.id || col.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link 
                  to={`/collections/${col.slug}`} 
                  className="group block relative rounded-[2rem] overflow-hidden aspect-[16/10] sm:aspect-[16/9] bg-[#110B0E] border border-[#C5A059]/40 shadow-lg hover:shadow-2xl hover:border-[#C5A059] transition-all duration-500"
                >
                  <motion.img
                    src={col.heroImage}
                    alt={col.name}
                    className="w-full h-full object-cover object-center opacity-90 group-hover:opacity-100"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#110B0E] via-[#110B0E]/40 to-black/20" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#110B0E]/70 via-transparent to-transparent hidden sm:block" />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="bg-[#701626]/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] text-[#DFBF77] font-bold uppercase tracking-[0.22em] border border-[#C5A059]/40 shadow-md">
                      Edit 0{i + 1}
                    </span>
                    <span className="bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-[8.5px] text-[#701626] font-bold uppercase tracking-[0.2em] shadow-md border border-[#C5A059]/40">
                      {col.season || 'Core Edit'}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 space-y-2 text-white">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#DFBF77] font-semibold">
                        {count > 0 ? `${count} Silhouettes Handcrafted` : 'New Drop'} {col.tagline ? `· ${col.tagline}` : ''}
                      </p>
                    </div>

                    <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold group-hover:text-[#DFBF77] transition-colors leading-tight">
                      {col.name}
                    </h2>

                    <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed line-clamp-2 max-w-lg">
                      {col.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-xs text-[#DFBF77] font-bold uppercase tracking-[0.18em] group-hover:translate-x-1 transition-transform">
                        <span>Explore Collection</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[10px] text-white/50 font-mono tracking-wider">
                        azhai.lk/{col.slug}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
