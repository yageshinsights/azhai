import { useEffect, useMemo } from 'react';
import { PRODUCTS, type Product } from '@/lib/data';
import { useAdminStore } from '@/store/admin';

const STORAGE_KEY = 'azhai_recently_viewed_slugs';

export function useRecentlyViewed(currentSlug?: string) {
  const adminProducts = useAdminStore((s) => s.products);
  const allProducts = Array.isArray(adminProducts) ? adminProducts : PRODUCTS;

  // Persist current slug on mount/slug change
  useEffect(() => {
    if (!currentSlug) return;
    try {
      const stored: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = [currentSlug, ...stored.filter((s) => s !== currentSlug)].slice(0, 6);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[RecentlyViewed Hook Storage Exception]:', e);
    }
  }, [currentSlug]);

  // Compute matching products declaratively
  const recentProducts = useMemo(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const slugsToFetch = currentSlug ? stored.filter((s) => s !== currentSlug) : stored;
      return slugsToFetch
        .map((s) => allProducts.find((p) => p.slug === s))
        .filter((p): p is Product => Boolean(p));
    } catch {
      return [];
    }
  }, [currentSlug, allProducts]);

  return recentProducts;
}
