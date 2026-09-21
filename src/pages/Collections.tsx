import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAdminStore } from '@/store/admin';
import { COLLECTIONS, PRODUCTS, type Product } from '@/lib/data';
import { ArrowRight, Crown } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

export default function Collections() {
  const adminCategories = useAdminStore((s) => s.categories);
  const products = useAdminStore((s) => s.products);
  const categoriesList = Array.isArray(adminCategories) && adminCategories.length > 0 ? adminCategories : COLLECTIONS;
  const allProducts = Array.isArray(products) ? products : PRODUCTS;

  const collectionsSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Curated Silhouettes & Collections — Azhai Clothing',
    description: 'Explore Azhai’s handcrafted festive collections: handloom kurti sets, lotus organza sarees, Kashmiri tilla shawls, and tailored silk crop tops.',
    url: 'https://azhaiclothing.lk/collections',
    hasPart: categoriesList.map((col) => ({
      '@type': 'ProductModel',
      name: col.name,
      description: col.description,
      url: `https://azhaiclothing.lk/collections/${col.slug}`,
      image: col.heroImage,
    })),
  }), [categoriesList]);

  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-32 sm:pt-36 text-[#110B0E]">
      <SEOHead
        title="The Collections — Handloom Silks, Saree Sets & Kurties"
        description="Explore curated handloom kurti sets, hand-painted lotus organza sarees, Kashmiri tilla shawls, and tailored festive couture by Preethi."
        canonicalUrl="https://azhaiclothing.lk/collections"
        url="https://azhaiclothing.lk/collections"
        schema={collectionsSchema}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-28 sm:py-16">
        
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
        {categoriesList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {categoriesList.map((col, i) => {
            const count = allProducts.filter((p: Product) =>
              p.categories && p.categories.some((c: any) => c.slug === col.slug)
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
                  className="group block relative rounded-[2rem] overflow-hidden aspect-[4/3] xs:aspect-[16/10] sm:aspect-[16/9] bg-[#110B0E] border border-[#C5A059]/30 shadow-lg hover:shadow-2xl hover:border-[#C5A059] transition-all duration-500"
                >
                  <motion.img
                    src={col.heroImage}
                    alt={col.name}
                    className="w-full h-full object-cover object-center opacity-95 group-hover:opacity-100"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7 }}
                  />
                  {/* Atmospheric Bottom Gradient Scrim - Keeps upper 70% unobstructed */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#110B0E]/90 via-[#110B0E]/40 to-transparent pointer-events-none" />
                  
                  {/* Top Season Badge */}
                  {col.season && (
                    <div className="absolute top-4 right-4 pointer-events-none z-10">
                      <span className="bg-[#110B0E]/60 backdrop-blur-md px-3.5 py-1 rounded-full text-[9px] text-[#DFBF77] font-medium uppercase tracking-[0.2em] border border-[#C5A059]/30 shadow-sm">
                        {col.season}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 space-y-2 text-white z-10">
                    {count > 0 && (
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#DFBF77] font-medium">
                        {count} Silhouettes Handcrafted {col.tagline ? `· ${col.tagline}` : ''}
                      </p>
                    )}

                    <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold group-hover:text-[#DFBF77] transition-colors leading-tight">
                      {col.name}
                    </h2>

                    {col.description && (
                      <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed line-clamp-1 sm:line-clamp-2 max-w-lg">
                        {col.description}
                      </p>
                    )}

                    <div className="pt-2 flex items-center">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#DFBF77] uppercase tracking-[0.18em] group-hover:text-white transition-colors">
                        <span className="border-b border-[#C5A059]/50 group-hover:border-white pb-0.5 transition-colors">
                          Explore Collection
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#C5A059]/30 p-8 max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#701626]/10 text-[#701626] flex items-center justify-center mx-auto border border-[#C5A059]/30">
            <Crown className="w-6 h-6 text-[#C5A059]" />
          </div>
          <h3 className="font-display text-2xl font-bold text-[#110B0E]">New Curations Coming Soon</h3>
          <p className="text-xs sm:text-sm text-[#6D6268] leading-relaxed">
            Our upcoming festive collections and handcrafted handloom silks are currently being tailored in our Colombo studio.
          </p>
          <Link
            to="/"
            className="inline-block px-7 py-3 bg-[#701626] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:bg-[#8E1E34] transition-colors"
          >
            Return to Boutique
          </Link>
        </div>
      )}

      </div>
    </div>
  );
}
