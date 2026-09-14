import { useState } from 'react';
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
  Package
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStore } from '@/store/admin';
import type { Product } from '@/lib/data';
import ProductModal from '@/components/admin/ProductModal';
import { Link } from 'react-router-dom';

export default function AdminProducts() {
  const { products, categories, addProduct, updateProduct, updateProductStock, deleteProduct } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat =
      selectedCategory === 'all' || p.categories.some((c) => c.slug === selectedCategory);
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#110B0E]">
              Atelier Catalog & Inventory
            </h1>
            <p className="text-xs text-[#6D6268] font-light">
              Manage handcrafted silk collections, sizes, and pricing.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Creation
          </button>
        </div>

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
                        {p.categories[0]?.name}
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

      {/* Add/Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />

      {/* Delete Confirmation Modal */}
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
    </AdminLayout>
  );
}
