import { Link } from 'react-router-dom';
import { Eye, ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/data';

interface RecentlyViewedProps {
  products: Product[];
}

export default function RecentlyViewed({ products }: RecentlyViewedProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="pt-12 pb-6 border-t border-[#C5A059]/25 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#701626] flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-[#C5A059]" /> Recently Admired
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#110B0E]">
            Pieces You Recently Explored
          </h3>
        </div>

        <Link
          to="/collections"
          className="text-xs text-[#701626] font-bold hover:underline flex items-center gap-1"
        >
          <span>View All Edit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.slice(0, 4).map((p) => (
          <Link
            key={p.id}
            to={`/products/${p.slug}`}
            className="group block bg-white rounded-2xl p-3 border border-[#C5A059]/30 hover:border-[#701626] shadow-xs transition-all space-y-2"
          >
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#F7F4EE]">
              <img
                src={p.images[0]?.src}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-[#110B0E] line-clamp-1 group-hover:text-[#701626] transition-colors">
                {p.name}
              </p>
              <p className="text-xs font-bold text-[#701626]">{p.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
