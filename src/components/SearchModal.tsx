import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '@/lib/data';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  'Organza Saree',
  'Corset Kurta',
  '32-Kali Anarkali',
  'Temple Silk',
  'Sangeet',
  'Pooja'
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const results = query.trim()
    ? PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
        p.categories.some(c => c.name.toLowerCase().includes(query.toLowerCase())) ||
        p.occasion?.toLowerCase().includes(query.toLowerCase()) ||
        p.tag?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-[#110B0E]/60 backdrop-blur-md z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="fixed top-0 left-0 right-0 z-[80] bg-[#FCFBF8] border-b border-[#C5A059]/40 shadow-2xl px-5 sm:px-8 pt-8 pb-12 max-h-[85vh] overflow-y-auto"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Top Search Input Bar */}
              <div className="flex items-center justify-between gap-4 border-b-2 border-[#701626] pb-4">
                <div className="flex items-center gap-3.5 flex-1">
                  <Search className="w-6 h-6 text-[#701626] shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search sarees, corset sets, anarkalis, silk weaves..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent text-lg sm:text-2xl font-display font-bold text-[#110B0E] placeholder:text-[#6D6268]/50 focus:outline-none"
                  />
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-[#110B0E]/60 hover:text-[#701626] rounded-full hover:bg-black/5 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Popular Quick Suggestions */}
              {!query.trim() && (
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#6D6268] font-bold">Trending Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map(item => (
                      <button
                        key={item}
                        onClick={() => setQuery(item)}
                        className="px-4 py-2 rounded-full bg-[#F7F4EE] hover:bg-[#701626]/10 text-xs font-semibold text-[#110B0E] border border-[#C5A059]/30 hover:border-[#701626]/40 transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3 h-3 text-[#C5A059]" />
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Search Results */}
              {query.trim() && (
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#6D6268] font-bold">
                    Found {results.length} {results.length === 1 ? 'Piece' : 'Pieces'}
                  </p>

                  {results.length === 0 ? (
                    <div className="py-12 text-center text-[#6D6268] font-light">
                      No matching pieces found for "{query}". Try searching for <em>Organza</em>, <em>Corset</em>, or <em>Anarkali</em>.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      {results.map(prod => (
                        <Link
                          key={prod.id}
                          to={`/products/${prod.slug}`}
                          onClick={onClose}
                          className="group flex gap-4 p-3 rounded-2xl bg-white border border-[#C5A059]/20 hover:border-[#701626]/40 hover:shadow-md transition-all"
                        >
                          <div className="w-20 h-24 rounded-xl overflow-hidden bg-[#F7F4EE] shrink-0">
                            <img src={prod.images[0]?.src} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1 py-1">
                            <span className="text-[9px] uppercase tracking-wider text-[#701626] font-bold">
                              {prod.categories[0]?.name}
                            </span>
                            <h4 className="font-display text-base font-bold text-[#110B0E] group-hover:text-[#701626] transition-colors leading-snug line-clamp-2">
                              {prod.name}
                            </h4>
                            <p className="font-display text-sm font-bold text-[#701626]">{prod.price}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
