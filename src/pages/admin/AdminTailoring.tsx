import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler, Palette, Settings2, Trash2, Edit2, Plus, Scissors, ToggleLeft, ToggleRight, Link2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import PaymentLinkModal from '@/components/admin/PaymentLinkModal';
import { useAdminStore } from '@/store/admin';
import { COLLECTIONS } from '@/lib/data';
import { formatLKR } from '@/lib/tailoring';
import { DEFAULT_DRESS_TYPES, DEFAULT_FABRICS, DEFAULT_MEASUREMENT_FIELDS } from '@/lib/tailoring';
import { DressTypeModal, FabricModal, MeasurementFieldModal } from '@/components/admin/TailoringModals';
import type { DressType, TailoringFabric, MeasurementField } from '@/lib/tailoring';

export default function AdminTailoring() {
  const [activeTab, setActiveTab] = useState<'dressTypes' | 'fabrics' | 'fields'>('dressTypes');
  
  const {
    dressTypes: rawDressTypes,
    tailoringFabrics: rawFabrics,
    measurementFields: rawFields,
    categories: rawCategories,
    addDressType,
    updateDressType,
    deleteDressType,
    toggleDressTypeActive,
    addTailoringFabric,
    updateTailoringFabric,
    deleteTailoringFabric,
    toggleFabricStock,
    addMeasurementField,
    updateMeasurementField,
    deleteMeasurementField,
  } = useAdminStore();
  
  // Main Boutique Collections from Store
  const categories = Array.isArray(rawCategories) && rawCategories.length > 0 ? rawCategories : COLLECTIONS;

  const dressTypes = Array.isArray(rawDressTypes) && rawDressTypes.length > 0 ? rawDressTypes : DEFAULT_DRESS_TYPES;
  const fabrics = Array.isArray(rawFabrics) && rawFabrics.length > 0 ? rawFabrics : DEFAULT_FABRICS;
  const measurementFields = Array.isArray(rawFields) && rawFields.length > 0 ? rawFields : DEFAULT_MEASUREMENT_FIELDS;

  // Selected Category for Measurement Fields Tab
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(categories[0]?.slug || 'kurties');

  // Modals state
  const [isDressTypeModalOpen, setIsDressTypeModalOpen] = useState(false);
  const [editDressType, setEditDressType] = useState<DressType | null>(null);

  // Tab 1 Collection Filter
  const [collectionFilter, setCollectionFilter] = useState<string>('all');

  const [isFabricModalOpen, setIsFabricModalOpen] = useState(false);
  const [editFabric, setEditFabric] = useState<TailoringFabric | null>(null);

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editField, setEditField] = useState<MeasurementField | null>(null);

  // PayHere Bespoke Payment Link Modal
  const [isPaymentLinkModalOpen, setIsPaymentLinkModalOpen] = useState(false);

  // Filtered dress types for Tab 1
  const filteredDressTypes = collectionFilter === 'all'
    ? dressTypes
    : dressTypes.filter(d => (d.collectionSlug || '').toLowerCase() === collectionFilter.toLowerCase());

  // Filtered fields for Tab 3 (Category-level)
  const currentFields = measurementFields
    .filter(f => f.categorySlug === selectedCategorySlug)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const getCollectionBadge = (slug: string) => {
    const match = categories.find(c => c.slug === slug);
    return match?.name || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Collection');
  };

  const collectionTabs = [
    { slug: 'all', label: 'All Collections', count: dressTypes.length },
    ...categories.map(cat => ({
      slug: cat.slug,
      label: cat.name,
      count: dressTypes.filter(d => d.collectionSlug === cat.slug || d.collectionId === cat.id).length,
    })),
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#110B0E] flex items-center gap-3">
              <Scissors className="w-8 h-8 text-[#701626]" /> Custom Tailoring
            </h1>
            <p className="text-xs text-[#6D6268] font-light pt-1">
              Manage bespoke garment collections, silhouettes, fabric inventory, and category-level custom measurement fields.
            </p>
          </div>

          <button
            onClick={() => setIsPaymentLinkModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FCFBF8] hover:bg-[#DFBF77]/20 border border-[#C5A059]/40 text-[#701626] text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Link2 className="w-4 h-4 text-[#701626]" />
            <span>Generate Tailoring Payment Link</span>
          </button>
        </div>

        {/* Tabs (Horizontally Scrollable on Mobile) */}
        <div className="flex items-center gap-2 border-b border-[#C5A059]/20 pb-2 overflow-x-auto scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
          {[
            { id: 'dressTypes', label: 'Design Silhouettes', icon: Ruler },
            { id: 'fabrics', label: 'Fabrics Inventory', icon: Palette },
            { id: 'fields', label: 'Measurement Fields (By Category)', icon: Settings2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                  isActive ? 'border-[#701626] text-[#701626]' : 'border-transparent text-[#6D6268] hover:text-[#110B0E]'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Dress Types / Design Silhouettes */}
        {activeTab === 'dressTypes' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Collection Filter & Add Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-3xl border border-[#C5A059]/30 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0 scrollbar-none">
                {collectionTabs.map(tab => (
                  <button
                    key={tab.slug}
                    onClick={() => setCollectionFilter(tab.slug)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      collectionFilter.toLowerCase() === tab.slug.toLowerCase()
                        ? 'bg-[#701626] text-white shadow-xs'
                        : 'bg-[#F7F4EE] text-[#6D6268] hover:text-[#110B0E]'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => { setEditDressType(null); setIsDressTypeModalOpen(true); }}
                className="px-4 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer self-end sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Add Silhouette
              </button>
            </div>

            {/* Silhouettes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDressTypes.map(dt => (
                <div key={dt.id} className="bg-white rounded-3xl border border-[#C5A059]/30 overflow-hidden shadow-sm flex flex-col justify-between group">
                  <div className="aspect-[3/4] relative bg-[#110B0E] overflow-hidden">
                    <img src={dt.coverImage} alt={dt.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                        {getCollectionBadge(dt.collectionSlug)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dt.isActive ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'}`}>
                        {dt.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-display text-lg font-bold drop-shadow-md leading-snug">{dt.name}</h4>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      {dt.description && (
                        <p className="text-[11px] text-[#6D6268] line-clamp-2 leading-relaxed">
                          {dt.description}
                        </p>
                      )}
                      <p className="text-xs text-[#6D6268] font-medium flex justify-between pt-1">
                        <span>Stitching Fee:</span> <span className="text-[#110B0E] font-bold">{formatLKR(dt.stitchingFee)}</span>
                      </p>
                      <p className="text-xs text-[#701626] font-medium flex justify-between">
                        <span>Required Fabric:</span> <span className="font-bold">{dt.requiredMeters || 2.5} meters</span>
                      </p>
                      <p className="text-[11px] text-[#6D6268] flex justify-between">
                        <span>Lead Time:</span> <span>{dt.leadTime}</span>
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#C5A059]/15 flex justify-end gap-2">
                      <button
                        onClick={() => toggleDressTypeActive(dt.id)}
                        className="p-1.5 text-gray-500 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Toggle Status"
                      >
                        {dt.isActive ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditDressType(dt);
                          setIsDressTypeModalOpen(true);
                        }}
                        className="p-1.5 text-gray-500 hover:text-[#701626] hover:bg-[#F7F4EE] rounded-lg transition-colors cursor-pointer"
                        title="Edit Silhouette"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${dt.name}"?`)) {
                            deleteDressType(dt.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Silhouette"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab 2: Fabrics Inventory */}
        {activeTab === 'fabrics' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-[#C5A059]/30 shadow-sm">
              <span className="text-xs font-bold text-[#6D6268] uppercase tracking-wider">{fabrics.length} Handpicked Silk & Artisan Weaves</span>
              <button
                onClick={() => { setEditFabric(null); setIsFabricModalOpen(true); }}
                className="px-4 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Fabric
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {fabrics.map(fb => (
                <div key={fb.id} className="bg-white rounded-3xl border border-[#C5A059]/30 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="aspect-[4/3] relative bg-[#110B0E] overflow-hidden">
                    <img src={fb.swatchImage} alt={fb.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${fb.inStock ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {fb.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-display text-base font-bold text-[#110B0E]">{fb.name}</h4>
                      {fb.weight && <p className="text-[11px] text-[#6D6268] mt-0.5">{fb.weight}</p>}
                      <p className="text-xs text-[#701626] font-bold mt-2">
                        {formatLKR(fb.pricePerUnit)} <span className="text-[10px] text-[#6D6268] font-normal">/ {fb.unit}</span>
                      </p>
                      <p className="text-[10px] text-[#6D6268] mt-1">
                        Compatible with {fb.compatibleDressTypeIds?.length || 0} silhouettes
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#C5A059]/15 flex justify-end gap-2">
                      <button
                        onClick={() => toggleFabricStock(fb.id)}
                        className="p-1.5 text-gray-500 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Toggle Stock"
                      >
                        {fb.inStock ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditFabric(fb);
                          setIsFabricModalOpen(true);
                        }}
                        className="p-1.5 text-gray-500 hover:text-[#701626] hover:bg-[#F7F4EE] rounded-lg transition-colors cursor-pointer"
                        title="Edit Fabric"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${fb.name}"?`)) {
                            deleteTailoringFabric(fb.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Fabric"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab 3: Measurement Fields (Organized by Garment Category) */}
        {activeTab === 'fields' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-3xl border border-[#C5A059]/30 shadow-sm">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-[#110B0E] uppercase tracking-wider">Garment Category:</label>
                <select
                  value={selectedCategorySlug}
                  onChange={(e) => setSelectedCategorySlug(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#F7F4EE] border border-[#C5A059]/30 text-xs font-bold text-[#701626] focus:outline-none focus:border-[#701626] cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat.id || cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => { setEditField(null); setIsFieldModalOpen(true); }}
                className="px-4 py-2 bg-[#701626] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Field to {getCollectionBadge(selectedCategorySlug)}
              </button>
            </div>
            
            <div className="bg-white rounded-3xl overflow-hidden border border-[#C5A059]/30 shadow-sm">
              <div className="p-4 bg-[#FCFBF8] border-b border-[#C5A059]/20 text-xs text-[#6D6268]">
                <span>All designs within <strong>{getCollectionBadge(selectedCategorySlug)}</strong> share this measurement matrix.</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F4EE] border-b border-[#C5A059]/30 text-[#110B0E] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 font-bold">Order</th>
                    <th className="px-6 py-3 font-bold">Display Label</th>
                    <th className="px-6 py-3 font-bold">Field ID</th>
                    <th className="px-6 py-3 font-bold">Safe Range (inches)</th>
                    <th className="px-6 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5A059]/10">
                  {currentFields.length > 0 ? currentFields.map(f => (
                    <tr key={f.id} className="hover:bg-[#FCFBF8]">
                      <td className="px-6 py-3 font-medium text-[#6D6268]">{f.displayOrder}</td>
                      <td className="px-6 py-3 font-bold text-[#110B0E]">{f.fieldLabel}</td>
                      <td className="px-6 py-3 font-mono text-[#701626] bg-[#F7F4EE]/50 rounded">{f.fieldName}</td>
                      <td className="px-6 py-3 text-[#6D6268]">{f.minValue}" – {f.maxValue}"</td>
                      <td className="px-6 py-3 flex justify-end gap-2">
                        <button onClick={() => { setEditField(f); setIsFieldModalOpen(true); }} className="p-1.5 text-gray-500 hover:text-[#701626] hover:bg-[#F7F4EE] rounded-lg cursor-pointer" title="Edit Field"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { if (window.confirm(`Delete field "${f.fieldLabel}"?`)) deleteMeasurementField(f.id); }} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer" title="Delete Field"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-[#6D6268]">No measurement fields defined for this category yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <DressTypeModal
        isOpen={isDressTypeModalOpen}
        onClose={() => {
          setIsDressTypeModalOpen(false);
          setEditDressType(null);
        }}
        initial={editDressType}
        onSave={(data) => {
          if (editDressType) {
            updateDressType(editDressType.id, data);
          } else {
            addDressType(data);
          }
          setEditDressType(null);
        }}
      />
      
      <FabricModal
        isOpen={isFabricModalOpen}
        onClose={() => {
          setIsFabricModalOpen(false);
          setEditFabric(null);
        }}
        initial={editFabric}
        dressTypes={dressTypes}
        onSave={(data) => {
          if (editFabric) {
            updateTailoringFabric(editFabric.id, data);
          } else {
            addTailoringFabric(data);
          }
          setEditFabric(null);
        }}
      />

      <MeasurementFieldModal
        isOpen={isFieldModalOpen}
        onClose={() => {
          setIsFieldModalOpen(false);
          setEditField(null);
        }}
        initial={editField}
        categorySlug={selectedCategorySlug}
        onSave={(data) => {
          if (editField) {
            updateMeasurementField(editField.id, data);
          } else {
            addMeasurementField(data);
          }
          setEditField(null);
        }}
      />

      <PaymentLinkModal
        isOpen={isPaymentLinkModalOpen}
        onClose={() => setIsPaymentLinkModalOpen(false)}
      />
    </AdminLayout>
  );
}
