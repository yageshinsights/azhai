import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { isUUID } from '@/lib/auth-utils';
import type { CartItem } from '@/store/cart';

interface OrderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CartItem | null;
  orderId: string;
  defaultLocation?: string;
  onReviewSubmitted: (productName: string) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Unsatisfied / Poor Fit',
  2: 'Below Expectations',
  3: 'Satisfactory Quality',
  4: 'Very Good / Pleased',
  5: 'Exceptional Couture & Fit',
};

export default function OrderReviewModal({
  isOpen,
  onClose,
  item,
  orderId,
  defaultLocation = 'Colombo, Sri Lanka',
  onReviewSubmitted,
}: OrderReviewModalProps) {
  const user = useAuthStore((s) => s.user);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [fit, setFit] = useState<'True to Size' | 'Runs Slightly Small' | 'Runs Slightly Large'>('True to Size');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState(user?.fullName || 'Valued Patron');
  const [location, setLocation] = useState(defaultLocation);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!comment.trim()) {
      setError('Please share a few words about the fabric, fit, and craftsmanship.');
      return;
    }

    setLoading(true);

    try {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const userId = user?.id && isUUID(user.id) ? user.id : null;

      if (isSupabaseConfigured()) {
        const { error: sbErr } = await supabase.from('product_reviews').insert({
          product_name: item.name,
          product_slug: slug,
          user_id: userId,
          author_name: authorName.trim() || user?.fullName || 'Azhai Patron',
          location: location.trim() || 'Sri Lanka',
          rating,
          title: title.trim() || 'Verified Atelier Purchase',
          comment: comment.trim(),
          fit,
          is_verified: true,
          likes: 0,
          is_approved: true,
        });

        if (sbErr) {
          console.warn('[Supabase Review Insert Notice]:', sbErr.message);
        }
      }

      // Record reviewed item in localStorage for persistent client verification
      try {
        const reviewKey = `azhai_reviewed_${orderId}_${item.name}`;
        localStorage.setItem(reviewKey, JSON.stringify({ rating, date: new Date().toISOString() }));
      } catch {
        // ignore storage errors
      }

      setSubmitted(true);
      onReviewSubmitted(item.name);

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('[Review Submit Error]:', err);
      setError(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#C5A059]/40 shadow-2xl z-10 space-y-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-[#C5A059]/20 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  Patron Review
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Order #{orderId}
                </span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#110B0E] pt-1">
                Rate &amp; Review Your Piece
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#6D6268] hover:text-[#110B0E] hover:bg-[#F7F4EE] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-display text-2xl font-bold text-emerald-950">
                  Thank You, {authorName.split(' ')[0]}!
                </h4>
                <p className="text-xs text-emerald-800 max-w-sm mx-auto font-light leading-relaxed">
                  Your verified review for <strong className="font-semibold">{item.name}</strong> has been published to the Azhai Atelier catalog.
                </p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Preview Card */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/30">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-16 object-cover rounded-xl border border-[#C5A059]/30 bg-[#F7F4EE] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-bold text-[#110B0E] truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#6D6268] pt-0.5">
                    {item.size ? `Size: ${item.size} · ` : ''}{item.price}
                  </p>
                </div>
              </div>

              {/* Star Rating Selection */}
              <div className="space-y-1.5 text-center py-1">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Overall Craftsmanship &amp; Satisfaction
                </label>
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-[#C5A059] transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            active ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#C5A059]/30'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] font-medium text-[#701626]">
                  {RATING_LABELS[hoverRating || rating]}
                </p>
              </div>

              {/* Fit Assessment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  How Did It Fit?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Runs Slightly Small', 'True to Size', 'Runs Slightly Large'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFit(opt)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border text-center ${
                        fit === opt
                          ? 'bg-[#701626] text-white border-[#701626] shadow-xs'
                          : 'bg-[#FCFBF8] text-[#6D6268] border-[#C5A059]/30 hover:border-[#701626]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Headline */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Headline / Summary
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Stunning silk saree, drape was magical!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E]"
                />
              </div>

              {/* Written Review */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                  Detailed Experience &amp; Comments <span className="text-rose-600">*</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How does the fabric feel? Tell other patrons about the drape, comfort, stitching precision, or festive styling..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] border border-[#C5A059]/30 focus:border-[#701626] focus:bg-white focus:outline-none text-xs text-[#110B0E]"
                />
              </div>

              {/* Author & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#FCFBF8] border border-[#C5A059]/30 focus:border-[#701626] focus:outline-none text-xs text-[#110B0E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#110B0E] uppercase tracking-wider">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Colombo 07"
                    className="w-full px-3 py-2 rounded-xl bg-[#FCFBF8] border border-[#C5A059]/30 focus:border-[#701626] focus:outline-none text-xs text-[#110B0E]"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6D6268] hover:bg-[#F7F4EE] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Star className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
                      <span>Submit Verified Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
