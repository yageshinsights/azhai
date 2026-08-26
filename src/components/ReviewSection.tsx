import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2, ThumbsUp, Plus, X, MessageSquare, Sparkles } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  fit: 'True to Size' | 'Runs Slightly Small' | 'Runs Slightly Large';
  verified: boolean;
  likes: number;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Ananya S.',
    location: 'Colombo 07',
    rating: 5,
    date: '3 weeks ago',
    title: 'Exquisite handloom drape and stitching',
    comment:
      'The silk is featherlight and the maroon hue is truly royal. Wore this for my cousin’s engagement in Colombo and received endless compliments. Sizing was spot-on.',
    fit: 'True to Size',
    verified: true,
    likes: 12,
  },
  {
    id: 'rev-2',
    author: 'Tharushi W.',
    location: 'Kandy',
    rating: 5,
    date: '1 month ago',
    title: 'Prompt delivery and heirloom packaging',
    comment:
      'Arrived in Kandy within 48 hours via PromptX courier. The gold zari weaving is breathtaking and the fabric breathes beautifully in our climate.',
    fit: 'True to Size',
    verified: true,
    likes: 8,
  },
  {
    id: 'rev-3',
    author: 'Preethi K.',
    location: 'Jaffna',
    rating: 5,
    date: '2 months ago',
    title: 'Authentic craftsmanship by Preethi',
    comment:
      'You can feel the artisan touch in every border detail. The lining is soft pure cotton, making it extremely comfortable for all-day wear.',
    fit: 'True to Size',
    verified: true,
    likes: 15,
  },
];

export default function ReviewSection({ productName }: { productName: string }) {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  // Form state
  const [authorName, setAuthorName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [fit, setFit] = useState<'True to Size' | 'Runs Slightly Small' | 'Runs Slightly Large'>('True to Size');
  const [submitted, setSubmitted] = useState(false);

  const averageRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
  ).toFixed(1);

  const handleLike = (id: string) => {
    if (likedIds.includes(id)) return;
    setLikedIds([...likedIds, id]);
    setReviews(reviews.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r)));
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    const newRev: Review = {
      id: 'rev-' + Date.now(),
      author: authorName.trim(),
      location: location.trim() || 'Sri Lanka',
      rating,
      date: 'Just now',
      title: title.trim() || 'Azhai Couture Experience',
      comment: comment.trim(),
      fit,
      verified: true,
      likes: 0,
    };

    setReviews([newRev, ...reviews]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
      setAuthorName('');
      setLocation('');
      setTitle('');
      setComment('');
    }, 1800);
  };

  return (
    <div className="pt-16 border-t border-[#C5A059]/30 space-y-10">
      {/* Header & Rating Breakdown */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm">
        {/* Left: Star Score */}
        <div className="flex items-center gap-6">
          <div className="text-center space-y-1 pr-6 border-r border-[#C5A059]/25">
            <span className="font-display text-5xl sm:text-6xl font-bold text-[#701626]">
              {averageRating}
            </span>
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-wider text-[#6D6268]">
              {reviews.length} Verified Reviews
            </p>
          </div>

          <div className="space-y-1.5 flex-1">
            <h3 className="font-display text-2xl font-bold text-[#110B0E]">
              Patron Reviews & Feedback
            </h3>
            <p className="text-xs text-[#6D6268] font-light leading-relaxed">
              100% of verified buyers recommend this piece for festive elegance and bespoke comfort.
            </p>
          </div>
        </div>

        {/* Right: Write Review Button */}
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Write a Review
          </button>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-3xl p-6 border border-[#C5A059]/25 shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#701626]/10 text-[#701626] flex items-center justify-center font-bold text-xs font-display">
                  {rev.author.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#110B0E]">{rev.author}</h4>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[9.5px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.2 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Buyer
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#6D6268] font-light">
                    {rev.location} · {rev.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex gap-0.5 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
                <span className="text-[10px] bg-[#F7F4EE] text-[#701626] font-bold px-2.5 py-0.5 rounded-full border border-[#C5A059]/25">
                  {rev.fit}
                </span>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <h5 className="font-display text-base font-bold text-[#110B0E]">{rev.title}</h5>
              <p className="text-xs text-[#6D6268] font-light leading-relaxed">{rev.comment}</p>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-[#C5A059]/15">
              <button
                onClick={() => handleLike(rev.id)}
                className={`inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                  likedIds.includes(rev.id) ? 'text-[#701626] font-bold' : 'text-[#6D6268] hover:text-[#701626]'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({rev.likes})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Write a Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#C5A059]/40 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[9.5px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                    Azhai Patron Voice
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#110B0E]">
                    Review {productName}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F7F4EE] hover:bg-gray-200 flex items-center justify-center text-[#110B0E]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {submitted ? (
                <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="font-display text-lg font-bold text-emerald-950">Thank You for Your Feedback!</p>
                  <p className="text-xs text-emerald-800 font-light">
                    Your verified patron review has been posted to the boutique.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAddReview} className="space-y-4">
                  {/* Rating Selector */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Overall Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRating(num)}
                          className="p-1 text-amber-500 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${num <= rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-[#701626] pl-2">{rating} of 5 Stars</span>
                    </div>
                  </div>

                  {/* Sizing Fit */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Sizing & Fit
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Runs Small', val: 'Runs Slightly Small' as const },
                        { label: 'True to Size', val: 'True to Size' as const },
                        { label: 'Runs Large', val: 'Runs Slightly Large' as const },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setFit(item.val)}
                          className={`py-2 text-[10.5px] font-bold rounded-xl border transition-all ${
                            fit === item.val
                              ? 'bg-[#701626] text-white border-[#701626]'
                              : 'bg-[#F7F4EE] text-[#6D6268] border-[#C5A059]/25 hover:border-[#701626]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="e.g. Ananya S."
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                        City / Town
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Colombo 07"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Headline & Comments */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Review Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Beautiful silk weave & perfect fit"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Review Comments *
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Describe the fabric feel, drape, color accuracy and styling experience..."
                      rows={3}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#6D6268]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all"
                    >
                      Post Review
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
