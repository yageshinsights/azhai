import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { COLLECTIONS, PRODUCTS } from '@/lib/data';
import ProductCard from '@/components/ProductCard';

export default function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const collection = COLLECTIONS.find(c => c.slug === slug);
  const products = PRODUCTS.filter(p => p.categories.some(c => c.slug === slug));

  if (!collection) return (
    <div className="min-h-screen flex items-center justify-center text-[#7A6D74] font-display text-2xl bg-[#FAF7F2]">
      Collection not found.
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-20 text-[#1C1318]">
      
      {/* Hero Banner */}
      <section className="relative h-[48vh] min-h-[360px] overflow-hidden">
        <img src={collection.heroImage} alt={collection.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2] via-[#1C1318]/50 to-[#1C1318]/30" />
        
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-5 sm:px-8 pb-10 space-y-2 text-[#1C1318]"
        >
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B1C2E] font-bold bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#E8D7B5]/60 shadow-sm">
            {collection.season}
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#1C1318] pt-1">{collection.name}</h1>
          <p className="text-sm text-[#7A6D74] max-w-xl font-light">{collection.description}</p>
        </motion.div>
      </section>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <Link to="/collections" className="inline-flex items-center gap-2 text-[#7A6D74] hover:text-[#7B1C2E] text-xs uppercase tracking-widest mb-10 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Collections</span>
        </Link>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3">
            <p className="font-display text-2xl text-[#1C1318]">More pieces arriving soon</p>
            <p className="text-sm text-[#7A6D74]">This collection is being crafted by Preethi.</p>
          </div>
        )}
      </div>

    </div>
  );
}
