import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Plus, 
  Tag, 
  Layers, 
  Edit2, 
  Trash2, 
  Check, 
  ExternalLink, 
  Image as ImageIcon,
  FolderPlus
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStore } from '@/store/admin';
import type { Collection } from '@/lib/data';
import CategoryModal from '@/components/admin/CategoryModal';
import { Link } from 'react-router-dom';

export default function AdminCategories() {
  const { 
    categories, 
    products, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    toggleCategoryFeatured,
    tags, 
    addTag, 
    deleteTag 
  } = useAdminStore();
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Collection | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [deleteCatId, setDeleteCatId] = useState<number | null>(null);

  const handleOpenAddCat = () => {
    setEditingCategory(null);
    setIsCatModalOpen(true);
  };

  const handleOpenEditCat = (cat: Collection) => {
    setEditingCategory(cat);
    setIsCatModalOpen(true);
  };

  const handleSaveCat = (catData: any) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, catData);
    } else {
      addCategory(catData);
    }
  };

  const handleAddNewTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    addTag(newTagInput.trim());
    setNewTagInput('');
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#110B0E]">
              Categories & Marketing Tags
            </h1>
            <p className="text-xs text-[#6D6268] font-light">
              Manage boutique collection edits, hero carousel selections, and promotional badges.
            </p>
          </div>

          <button
            onClick={handleOpenAddCat}
            className="px-5 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" /> Add New Collection
          </button>
        </div>

        {/* ── 1. BOUTIQUE COLLECTIONS GRID ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#110B0E] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#701626]" /> Active Collections ({categories.length})
            </h2>
            <span className="text-[11px] text-[#6D6268] font-light">
              ✨ {categories.filter(c => c.isFeatured !== false).length} featured in Homepage Hero
            </span>
          </div>

          {categories.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-[#C5A059]/40 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F7F4EE] border border-[#C5A059]/30 flex items-center justify-center mx-auto text-[#701626]">
                <FolderPlus className="w-6 h-6" />
              </div>
              <p className="font-display font-bold text-base text-[#110B0E]">No collections created yet</p>
              <p className="text-xs text-[#6D6268] max-w-sm mx-auto">
                Create your first boutique category or seasonal edit to organize your creations.
              </p>
              <button
                onClick={handleOpenAddCat}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <FolderPlus className="w-4 h-4" /> Add New Collection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat) => {
              const productCount = products.filter((p) =>
                p.categories.some((c) => c.slug === cat.slug)
              ).length;
              const isHeroFeatured = cat.isFeatured !== false;

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl overflow-hidden border border-[#C5A059]/30 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    <img
                      src={cat.heroImage}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 bg-[#701626] text-[#DFBF77] font-bold text-[9.5px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#C5A059]/40 shadow-sm">
                      {cat.season || 'Core Edit'}
                    </div>

                    {/* Hero Featured Badge & Direct Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleCategoryFeatured(cat.id)}
                      className={`absolute top-3 right-3 text-[9.5px] font-bold px-2.5 py-0.5 rounded-full border shadow-md transition-all flex items-center gap-1 cursor-pointer ${
                        isHeroFeatured
                          ? 'bg-amber-500 text-white border-amber-300'
                          : 'bg-black/60 text-white/70 border-white/30 hover:bg-black/80'
                      }`}
                      title={isHeroFeatured ? 'Featured in Hero Carousel. Click to disable.' : 'Not in Hero Carousel. Click to feature.'}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{isHeroFeatured ? 'In Hero Carousel' : 'Hidden from Hero'}</span>
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-display text-lg font-bold">{cat.name}</h4>
                      <p className="text-[10.5px] text-white/80 line-clamp-1">{cat.tagline}</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-[#6D6268] line-clamp-2 leading-relaxed font-light">
                      {cat.description}
                    </p>

                    <div className="pt-2.5 border-t border-[#C5A059]/15 flex items-center justify-between text-xs">
                      <span className="font-bold text-[#701626]">
                        {productCount} pieces live
                      </span>

                      <div className="flex items-center gap-1">
                        <Link
                          to={`/collections/${cat.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-500 hover:text-[#701626] hover:bg-[#F7F4EE] rounded-lg transition-colors"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditCat(cat)}
                          className="p-1.5 text-gray-500 hover:text-[#701626] hover:bg-[#F7F4EE] rounded-lg transition-colors cursor-pointer"
                          title="Edit Category & Settings"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCatId(cat.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

        {/* ── 2. MARKETING TAGS & BADGES LIBRARY ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold text-[#110B0E] flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#701626]" /> Marketing Badges & Tag Library ({tags.length})
              </h3>
              <p className="text-xs text-[#6D6268] font-light">
                Badges selectable when creating products, rendered on cards across the storefront.
              </p>
            </div>

            {/* Quick Add Tag Form */}
            <form onSubmit={handleAddNewTag} className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="e.g. Celebrity Pick ⭐"
                className="px-3.5 py-2 text-xs rounded-xl bg-[#F7F4EE] border border-[#C5A059]/30 focus:border-[#701626] focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Badge
              </button>
            </form>
          </div>

          {/* Tag Pills */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            {tags.map((t) => (
              <div
                key={t}
                className="inline-flex items-center gap-2 bg-[#FCFBF8] border border-[#C5A059]/40 px-3.5 py-1.5 rounded-2xl shadow-sm text-xs font-bold text-[#701626]"
              >
                <span>{t}</span>
                <button
                  onClick={() => deleteTag(t)}
                  className="w-4 h-4 rounded-full hover:bg-rose-100 hover:text-rose-700 flex items-center justify-center transition-colors"
                  title="Delete Tag"
                >
                  <Trash2 className="w-3 h-3 text-gray-400 hover:text-rose-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        onSave={handleSaveCat}
        initialCategory={editingCategory}
      />

      {/* Delete Category Modal */}
      <AnimatePresence>
        {deleteCatId !== null && (
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
              <h3 className="font-display text-xl font-bold text-[#110B0E]">Delete Collection?</h3>
              <p className="text-xs text-[#6D6268]">
                This will remove the collection from the catalog and navigation menus.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteCatId(null)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#6D6268]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteCategory(deleteCatId);
                    setDeleteCatId(null);
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
