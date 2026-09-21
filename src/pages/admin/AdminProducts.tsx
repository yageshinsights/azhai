import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Plus, 
  Minus,
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  Star, 
  ExternalLink,
  Eye,
  Package,
  MessageSquare,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ThumbsUp,
  ShieldCheck,
  Clock
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStore } from '@/store/admin';
import type { Product } from '@/lib/data';
import ProductModal from '@/components/admin/ProductModal';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface PatronReview {
  id: string;
  product_name: string;
  product_slug?: string;
  user_id?: string;
  author_name: string;
  location?: string;
  rating: number;
  title?: string;
  comment: string;
  fit?: string;
  is_verified?: boolean;
  likes?: number;
  is_approved: boolean;
  created_at?: string;
}

export default function AdminProducts() {
  const { products, categories, addProduct, updateProduct, updateProductStock, deleteProduct } = useAdminStore();
  
  // Tab switcher: Catalog vs Reviews
  const [activeTab, setActiveTab] = useState<'catalog' | 'reviews'>('catalog');

  // Catalog State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Reviews Moderation State
  const [reviews, setReviews] = useState<PatronReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewSearchTerm, setReviewSearchTerm] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [reviewToDelete, setReviewToDelete] = useState<PatronReview | null>(null);

  // Sync reviews from Supabase product_reviews table
  const fetchReviews = async () => {
    if (!isSupabaseConfigured()) return;
    setIsLoadingReviews(true);
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Reviews Load Notice]:', error.message);
      } else if (data) {
        setReviews(data as PatronReview[]);
      }
    } catch (err) {
      console.warn('Failed to load reviews from Supabase:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (review: PatronReview) => {
    const nextApproved = !review.is_approved;
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, is_approved: nextApproved } : r))
    );

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('product_reviews')
          .update({ is_approved: nextApproved })
          .eq('id', review.id);

        if (error) {
          console.warn('[Supabase Review Status Update Notice]:', error.message);
        }
      } catch (err) {
        console.warn('Failed to persist review approval:', err);
      }
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    const id = reviewToDelete.id;
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setReviewToDelete(null);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('product_reviews')
          .delete()
          .eq('id', id);

        if (error) {
          console.warn('[Supabase Review Delete Notice]:', error.message);
        }
      } catch (err) {
        console.warn('Failed to delete review from Supabase:', err);
      }
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const term = reviewSearchTerm.toLowerCase();
      const matchSearch =
        r.author_name.toLowerCase().includes(term) ||
        r.product_name.toLowerCase().includes(term) ||
        (r.title && r.title.toLowerCase().includes(term)) ||
        r.comment.toLowerCase().includes(term) ||
        (r.location && r.location.toLowerCase().includes(term));

      const matchStatus =
        reviewStatusFilter === 'all'
          ? true
          : reviewStatusFilter === 'approved'
          ? r.is_approved
          : !r.is_approved;

      const matchRating = ratingFilter === 'all' ? true : r.rating === ratingFilter;

      return matchSearch && matchStatus && matchRating;
    });
  }, [reviews, reviewSearchTerm, reviewStatusFilter, ratingFilter]);

  const pendingReviewsCount = reviews.filter((r) => !r.is_approved).length;
  const approvedReviewsCount = reviews.filter((r) => r.is_approved).length;
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return '5.0';
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat =
      selectedCategory === 'all' ||
      (Array.isArray(p.categories) && p.categories.some((c) => c.slug === selectedCategory));
    return matchSearch && matchCat;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#110B0E]">
              {activeTab === 'catalog' ? 'Atelier Catalog & Inventory' : 'Patron Reviews Moderation'}
            </h1>
            <p className="text-xs text-[#6D6268] font-light">
              {activeTab === 'catalog'
                ? 'Manage handcrafted silk collections, stock levels, and pricing.'
                : 'Audit, approve, and manage customer product testimonials synced with Supabase.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'catalog' ? (
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Creation
              </button>
            ) : (
              <button
                onClick={fetchReviews}
                disabled={isLoadingReviews}
                className="px-4 py-2 bg-white hover:bg-[#F7F4EE] border border-[#C5A059]/30 text-[#701626] text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isLoadingReviews ? 'animate-spin' : ''}`} />
                {isLoadingReviews ? 'Refreshing...' : 'Sync Supabase'}
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation: Catalog vs Reviews */}
        <div className="flex items-center gap-2 border-b border-[#C5A059]/20 pb-4">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-[#701626] text-white shadow-sm'
                : 'bg-white text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/20'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Atelier Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-[#701626] text-white shadow-sm'
                : 'bg-white text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/20'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Patron Reviews</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'reviews'
                  ? 'bg-[#C5A059] text-[#110B0E]'
                  : 'bg-[#F7F4EE] text-[#701626]'
              }`}
            >
              {reviews.length}
            </span>
            {pendingReviewsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                {pendingReviewsCount} Pending
              </span>
            )}
          </button>
        </div>

        {activeTab === 'catalog' && (
          <div className="space-y-6">

        {/* Search & Category Filter Pills */}
        <div className="bg-white rounded-3xl p-5 border border-[#C5A059]/30 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by title..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs text-[#110B0E] focus:outline-none focus:border-[#701626]"
              />
            </div>

            {/* Dynamic Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#701626] text-white shadow-sm'
                    : 'bg-[#F7F4EE] text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/20'
                }`}
              >
                All ({products.length})
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.slug
                      ? 'bg-[#701626] text-white shadow-sm'
                      : 'bg-[#F7F4EE] text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/20'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-[#C5A059]/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[880px]">
              <thead className="bg-[#701626] text-[#F3E8CE] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4 whitespace-nowrap min-w-[220px]">Piece</th>
                  <th className="p-4 whitespace-nowrap min-w-[120px]">Category</th>
                  <th className="p-4 whitespace-nowrap min-w-[120px]">Price (LKR)</th>
                  <th className="p-4 whitespace-nowrap min-w-[165px]">Atelier Stock</th>
                  <th className="p-4 whitespace-nowrap min-w-[110px]">Weight (SL Post)</th>
                  <th className="p-4 whitespace-nowrap min-w-[160px]">Sizes Supported</th>
                  <th className="p-4 whitespace-nowrap min-w-[160px]">Tag / Badge</th>
                  <th className="p-4 whitespace-nowrap min-w-[90px]">Rating</th>
                  <th className="p-4 text-right whitespace-nowrap min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A059]/15">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#F7F4EE] border border-[#C5A059]/30 flex items-center justify-center mx-auto text-[#701626]">
                          <Package className="w-6 h-6" />
                        </div>
                        <p className="font-display font-bold text-base text-[#110B0E]">No creations in catalog yet</p>
                        <p className="text-xs text-[#6D6268]">
                          {searchTerm || selectedCategory !== 'all' 
                            ? 'No creations match your search or filter.' 
                            : "Click 'Add New Creation' to publish your first piece to the online boutique."}
                        </p>
                        {searchTerm || selectedCategory !== 'all' ? (
                          <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                            className="text-xs font-bold text-[#701626] hover:underline cursor-pointer"
                          >
                            Clear filters
                          </button>
                        ) : (
                          <button
                            onClick={handleOpenAdd}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            <Plus className="w-4 h-4" /> Add New Creation
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#F7F4EE]/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#FCFBF8]'
                      }`}
                    >
                    <td className="p-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <img
                          src={p.images[0]?.src}
                          alt=""
                          className="w-12 h-14 object-cover rounded-xl border border-[#C5A059]/25 bg-[#F7F4EE] shrink-0"
                        />
                        <div>
                          <p className="font-bold text-[#110B0E] text-xs font-display sm:font-sans leading-tight">
                            {p.name}
                          </p>
                          <p className="text-[10.5px] text-[#6D6268] font-mono pt-0.5">/{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-[#F7F4EE] text-[#701626] px-2.5 py-1 rounded-lg font-bold text-[10.5px] border border-[#C5A059]/25 whitespace-nowrap inline-block">
                        {p.categories?.[0]?.name || 'Uncategorized'}
                      </span>
                    </td>

                    <td className="p-4 font-display text-sm font-bold text-[#701626] whitespace-nowrap">
                      {p.price}
                    </td>

                    {/* Interactive Stock / Quantity Column */}
                    <td className="p-4 whitespace-nowrap">
                      {(() => {
                        const qty = p.stockQuantity !== undefined ? p.stockQuantity : (p.quantity !== undefined ? p.quantity : 15);
                        return (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-[#F7F4EE] rounded-xl border border-[#C5A059]/35 p-0.5 shadow-sm">
                              <button
                                onClick={() => updateProductStock(p.id, Math.max(0, qty - 1))}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white text-[#701626] transition-colors cursor-pointer"
                                title="Decrease Stock by 1"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center font-bold font-mono text-xs text-[#110B0E]">
                                {qty}
                              </span>
                              <button
                                onClick={() => updateProductStock(p.id, qty + 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white text-[#701626] transition-colors cursor-pointer"
                                title="Increase Stock by 1"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                qty === 0
                                  ? 'bg-rose-100 text-rose-700 border-rose-200'
                                  : qty <= 3
                                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {qty === 0 ? 'Out of Stock' : qty <= 3 ? 'Low Stock' : 'In Stock'}
                            </span>
                          </div>
                        );
                      })()}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#110B0E]">
                          {p.weightGrams || 400} g
                        </span>
                        <span className="text-[10px] text-[#6D6268]">
                          ({((p.weightGrams || 400) / 1000).toFixed(2)} kg)
                        </span>
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {p.attributes[0]?.options.map((sz) => (
                          <span
                            key={sz}
                            className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-700 whitespace-nowrap inline-block"
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {p.tag ? (
                        <span className="bg-[#701626]/10 text-[#701626] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#C5A059]/25 whitespace-nowrap inline-block">
                          {p.tag}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#6D6268] italic">—</span>
                      )}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-[#C5A059] font-bold">
                        <Star className="w-3.5 h-3.5 fill-[#C5A059]" />
                        <span>{p.rating || 5.0}</span>
                      </div>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/products/${p.slug}`}
                          target="_blank"
                          className="p-2 text-[#6D6268] hover:text-[#701626] hover:bg-[#F7F4EE] rounded-xl transition-colors"
                          title="View on Storefront"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-2 text-[#6D6268] hover:text-[#701626] hover:bg-[#F7F4EE] rounded-xl transition-colors"
                          title="Edit Piece"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-2 text-[#6D6268] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Piece"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

    {/* ══════════════════════════════════════════════════════════════ */}
    {/* TAB 2: PATRON REVIEWS MODERATION (SUPABASE product_reviews)    */}
    {/* ══════════════════════════════════════════════════════════════ */}
    {activeTab === 'reviews' && (
      <div className="space-y-6">
        {/* Review KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-[#C5A059]/30 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D6268]">
              Total Testimonials
            </span>
            <p className="font-display text-2xl font-bold text-[#110B0E]">
              {reviews.length}
            </p>
            <p className="text-[11px] text-[#6D6268]">Across all active pieces</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#C5A059]/30 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D6268]">
              Average Score
            </span>
            <div className="flex items-center gap-2">
              <p className="font-display text-2xl font-bold text-[#C5A059]">
                {averageRating}
              </p>
              <div className="flex items-center gap-0.5 text-[#C5A059]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059]" />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-[#6D6268]">Patron satisfaction</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#C5A059]/30 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D6268]">
              Live on Storefront
            </span>
            <p className="font-display text-2xl font-bold text-emerald-700">
              {approvedReviewsCount}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">Published & visible</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#C5A059]/30 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D6268]">
              Pending Moderation
            </span>
            <p className="font-display text-2xl font-bold text-amber-700">
              {pendingReviewsCount}
            </p>
            <p className="text-[11px] text-amber-600 font-medium">Require approval</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-3xl p-5 border border-[#C5A059]/30 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={reviewSearchTerm}
                onChange={(e) => setReviewSearchTerm(e.target.value)}
                placeholder="Search by patron, piece, city, comment..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs text-[#110B0E] focus:outline-none focus:border-[#701626]"
              />
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
              <span className="text-[11px] font-bold text-[#6D6268] mr-1 hidden sm:inline">Status:</span>
              <button
                onClick={() => setReviewStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewStatusFilter === 'all'
                    ? 'bg-[#701626] text-white shadow-sm'
                    : 'bg-[#F7F4EE] text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/20'
                }`}
              >
                All ({reviews.length})
              </button>
              <button
                onClick={() => setReviewStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewStatusFilter === 'approved'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-[#F7F4EE] text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/20'
                }`}
              >
                Approved ({approvedReviewsCount})
              </button>
              <button
                onClick={() => setReviewStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewStatusFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-[#F7F4EE] text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/20'
                }`}
              >
                Pending ({pendingReviewsCount})
              </button>
            </div>

            {/* Star Rating Filter */}
            <div className="flex items-center gap-1.5 w-full lg:w-auto">
              <span className="text-[11px] font-bold text-[#6D6268] mr-1 hidden sm:inline">Rating:</span>
              <button
                onClick={() => setRatingFilter('all')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ratingFilter === 'all'
                    ? 'bg-[#C5A059] text-[#110B0E] shadow-sm'
                    : 'bg-[#F7F4EE] text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/20'
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setRatingFilter(stars)}
                  className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    ratingFilter === stars
                      ? 'bg-[#C5A059] text-[#110B0E] shadow-sm'
                      : 'bg-[#F7F4EE] text-[#6D6268] hover:text-[#110B0E] border border-[#C5A059]/20'
                  }`}
                >
                  <span>{stars}</span>
                  <Star className="w-3 h-3 fill-current" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#C5A059]/30 shadow-sm">
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F7F4EE] border border-[#C5A059]/30 flex items-center justify-center mx-auto text-[#701626]">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-base text-[#110B0E]">
                No Testimonials Found
              </h3>
              <p className="text-xs text-[#6D6268]">
                {reviewSearchTerm || reviewStatusFilter !== 'all' || ratingFilter !== 'all'
                  ? 'No customer reviews match your current filters.'
                  : 'Reviews submitted by patrons on product pages will appear here for moderation.'}
              </p>
              {(reviewSearchTerm || reviewStatusFilter !== 'all' || ratingFilter !== 'all') && (
                <button
                  onClick={() => {
                    setReviewSearchTerm('');
                    setReviewStatusFilter('all');
                    setRatingFilter('all');
                  }}
                  className="text-xs font-bold text-[#701626] hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#701626]/40 transition-colors"
              >
                {/* Review Header: Stars, Fit, Approval Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1 text-[#C5A059]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating ? 'fill-[#C5A059]' : 'text-gray-200'
                          }`}
                        />
                      ))}
                      <span className="font-bold text-xs text-[#110B0E] ml-1">
                        {rev.rating}.0
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {rev.fit && (
                        <span className="bg-[#F7F4EE] text-[#701626] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#C5A059]/20">
                          {rev.fit}
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          rev.is_approved
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {rev.is_approved ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live on Store
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" /> Pending Review
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Product Reference */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#6D6268] font-medium">Piece:</span>
                    <Link
                      to={rev.product_slug ? `/products/${rev.product_slug}` : '/collections'}
                      target="_blank"
                      className="font-bold text-[#701626] hover:underline flex items-center gap-1"
                    >
                      {rev.product_name}
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </Link>
                  </div>
                </div>

                {/* Review Title & Comment */}
                <div className="space-y-1.5 flex-1">
                  {rev.title && (
                    <h4 className="font-display font-bold text-sm text-[#110B0E] leading-snug">
                      "{rev.title}"
                    </h4>
                  )}
                  <p className="text-xs text-[#4A3F45] leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Review Footer: Author, Upvotes, Date & Actions */}
                <div className="pt-3 border-t border-[#C5A059]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#110B0E]">{rev.author_name}</span>
                      {rev.is_verified && (
                        <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold bg-[#F7F4EE] text-[#C5A059] px-1.5 py-0.2 rounded border border-[#C5A059]/30">
                          <ShieldCheck className="w-2.5 h-2.5" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#6D6268]">
                      {rev.location ? `${rev.location} • ` : ''}
                      {rev.created_at
                        ? new Date(rev.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Recent'}
                      {rev.likes !== undefined && rev.likes > 0 && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[#6D6268]">
                          <ThumbsUp className="w-2.5 h-2.5 text-[#C5A059]" /> {rev.likes}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleApproval(rev)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        rev.is_approved
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      }`}
                    >
                      {rev.is_approved ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Unpublish
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setReviewToDelete(rev)}
                      className="p-1.5 text-[#6D6268] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>

  {/* Add/Edit Product Modal */}
  <ProductModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onSave={handleSaveProduct}
    initialProduct={editingProduct}
  />

  {/* Product Delete Confirmation Modal */}
  <AnimatePresence>
    {deleteConfirmId !== null && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-6 max-w-sm w-full border border-rose-200 shadow-2xl space-y-4 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#110B0E]">Delete Creation?</h3>
          <p className="text-xs text-[#6D6268]">
            This will permanently remove this piece from the active catalog and collections.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#6D6268]"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirmId)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm cursor-pointer"
            >
              Confirm Delete
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>

  {/* Review Delete Confirmation Modal */}
  <AnimatePresence>
    {reviewToDelete !== null && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-6 max-w-sm w-full border border-rose-200 shadow-2xl space-y-4 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#110B0E]">Delete Review?</h3>
          <p className="text-xs text-[#6D6268]">
            Are you sure you want to permanently delete the review from{' '}
            <strong className="text-[#110B0E]">{reviewToDelete.author_name}</strong> for{' '}
            <strong className="text-[#110B0E]">{reviewToDelete.product_name}</strong>?
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setReviewToDelete(null)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#6D6268]"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteReview}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm cursor-pointer"
            >
              Delete Review
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
</AdminLayout>
  );
}
