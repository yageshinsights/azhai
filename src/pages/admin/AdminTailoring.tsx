import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler, Palette, Settings2, Trash2, Edit2, Plus, Scissors, ToggleLeft, ToggleRight, Check } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStore } from '@/store/admin';
import { formatLKR } from '@/lib/tailoring';
import { DEFAULT_DRESS_TYPES, DEFAULT_FABRICS, DEFAULT_MEASUREMENT_FIELDS, DEFAULT_SIZE_PRESETS } from '@/lib/tailoring';
import { DressTypeModal, FabricModal, MeasurementFieldModal, SizePresetModal } from '@/components/admin/TailoringModals';
import type { DressType, TailoringFabric, MeasurementField, SizePreset } from '@/lib/tailoring';

export default function AdminTailoring() {
  const [activeTab, setActiveTab] = useState<'dressTypes' | 'fabrics' | 'fields' | 'presets'>('dressTypes');
  
  // Try to read from store, fallback to default seed data if undefined or empty
  const store = useAdminStore((s) => s);
  
  const dressTypes = (store.dressTypes && store.dressTypes.length > 0) ? store.dressTypes : DEFAULT_DRESS_TYPES;
  const fabrics = (store.tailoringFabrics && store.tailoringFabrics.length > 0) ? store.tailoringFabrics : DEFAULT_FABRICS;
  const measurementFields = (store.measurementFields && store.measurementFields.length > 0) ? store.measurementFields : DEFAULT_MEASUREMENT_FIELDS;
  const sizePresets = (store.sizePresets && store.sizePresets.length > 0) ? store.sizePresets : DEFAULT_SIZE_PRESETS;

  // Selected dress type for sub-tabs
  const [selectedDressTypeId, setSelectedDressTypeId] = useState<number>(dressTypes[0]?.id || 1);

  // Modals state
  const [isDressTypeModalOpen, setIsDressTypeModalOpen] = useState(false);
  const [editDressType, setEditDressType] = useState<DressType | null>(null);

  const [isFabricModalOpen, setIsFabricModalOpen] = useState(false);
  const [editFabric, setEditFabric] = useState<TailoringFabric | null>(null);

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editField, setEditField] = useState<MeasurementField | null>(null);

  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [editPreset, setEditPreset] = useState<SizePreset | null>(null);

  // Filtered fields/presets for sub-tabs
  const currentFields = measurementFields.filter(f => f.dressTypeId === selectedDressTypeId).sort((a, b) => a.displayOrder - b.displayOrder);
  const currentPresets = sizePresets.filter(p => p.dressTypeId === selectedDressTypeId);

  const safeCall = (fn: any, ...args: any[]) => {
    if (typeof fn === 'function') {
      fn(...args);
    } else {
      console.warn('Action not implemented yet in useAdminStore');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#110B0E] flex items-center gap-3">
              <Scissors className="w-8 h-8 text-[#701626]" /> Custom Tailoring
            </h1>
            <p className="text-xs text-[#6D6268] font-light pt-1">
              Manage bespoke dress types, fabric inventory, measurements, and size charts.
            </p>
          </div>
        </div>

        {/* Tabs (Horizontally Scrollable on Mobile) */}
        <div className="flex items-center gap-2 border-b border-[#C5A059]/20 pb-2 overflow-x-auto scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
          {[
            { id: 'dressTypes', label: 'Dress Types', icon: Ruler },
            { id: 'fabrics', label: 'Fabrics Inventory', icon: Palette },
            { id: 'fields', label: 'Measurement Fields', icon: Settings2 },
            { id: 'presets', label: 'Size Charts', icon: Check }
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

        {/* Tab 1: Dress Types */}
        {activeTab === 'dressTypes' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => { setEditDressType(null); setIsDressTypeModalOpen(true); }}
                className="px-5 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Dress Type
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {dressTypes.map(dt => (
                <div key={dt.id} className="bg-white rounded-3xl overflow-hidden border border-[#C5A059]/30 shadow-sm flex flex-col group">
                  <div className="relative aspect-[3/4] w-full bg-gray-100">
                    <img src={dt.coverImage} alt={dt.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${dt.isActive ? 'bg-emerald-500 text-white border-emerald-300' : 'bg-gray-500 text-white border-gray-400'}`}>
                        {dt.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-display text-lg font-bold drop-shadow-md">{dt.name}</h4>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-[#6D6268] font-medium flex justify-between"><span>Fee:</span> <span className="text-[#110B0E]">{formatLKR(dt.stitchingFee)}</span></p>
                      <p className="text-[11px] text-[#6D6268] flex justify-between"><span>Lead:</span> <span>{dt.leadTime}</span></p>
                    </div>
                    <div className="pt-3 border-t border-[#C5A059]/15 flex justify-end gap-2">
                      <button onClick={() => safeCall(store.toggleDressTypeActive, dt.id)} className="p-1.5 text-gray-500 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 rounded-lg transition-colors" title="Toggle Status">
                        {dt.isActive ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => { setEditDressType(dt); setIsDressTypeModalOpen(true); }} className="p-1.5 text-gray-500 hover:text-[#701626] hover:bg-[#F7F4EE] rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => safeCall(store.deleteDressType, dt.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab 2: Fabrics */}
        {activeTab === 'fabrics' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => { setEditFabric(null); setIsFabricModalOpen(true); }}
                className="px-5 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Fabric
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {fabrics.map(fabric => (
                <div key={fabric.id} className="bg-white rounded-3xl p-4 border border-[#C5A059]/30 shadow-sm flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-[#C5A059]/20">
                      <img src={fabric.swatchImage} alt={fabric.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-display text-sm font-bold text-[#110B0E] leading-tight line-clamp-2">{fabric.name}</h4>
                      <p className="text-xs font-bold text-[#701626] pt-1">{formatLKR(fabric.pricePerUnit)} / {fabric.unit}</p>
                      <p className="text-[10px] text-[#6D6268] pt-1">{fabric.weight}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#C5A059]/15">
                    <p className="text-[10px] font-bold text-[#6D6268] uppercase tracking-wider mb-1.5">For:</p>
                    <div className="flex flex-wrap gap-1">
                      {fabric.compatibleDressTypeIds.map(id => {
                        const dtName = dressTypes.find(d => d.id === id)?.name || id;
                        return <span key={id} className="text-[9px] px-1.5 py-0.5 bg-[#F7F4EE] text-[#701626] rounded-md border border-[#C5A059]/20">{dtName}</span>;
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fabric.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {fabric.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => safeCall(store.toggleFabricStock, fabric.id)} className="p-1 text-gray-500 hover:text-emerald-600 transition-colors" title="Toggle Stock">
                         {fabric.inStock ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => { setEditFabric(fabric); setIsFabricModalOpen(true); }} className="p-1 text-gray-500 hover:text-[#701626] transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => safeCall(store.deleteTailoringFabric, fabric.id)} className="p-1 text-gray-400 hover:text-rose-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab 3: Measurement Fields */}
        {activeTab === 'fields' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-3xl border border-[#C5A059]/30 shadow-sm">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-[#110B0E] uppercase tracking-wider">Select Dress Type:</label>
                <select value={selectedDressTypeId} onChange={(e) => setSelectedDressTypeId(Number(e.target.value))} className="px-3 py-2 rounded-xl bg-[#F7F4EE] border border-[#C5A059]/30 text-xs font-medium focus:outline-none focus:border-[#701626]">
                  {dressTypes.map(dt => <option key={dt.id} value={dt.id}>{dt.name}</option>)}
                </select>
              </div>
              <button
                onClick={() => { setEditField(null); setIsFieldModalOpen(true); }}
                className="px-4 py-2 bg-[#701626] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" /> Add Field
              </button>
            </div>
            
            <div className="bg-white rounded-3xl overflow-hidden border border-[#C5A059]/30 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F4EE] border-b border-[#C5A059]/30 text-[#110B0E] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 font-bold">Order</th>
                    <th className="px-6 py-3 font-bold">Label</th>
                    <th className="px-6 py-3 font-bold">ID Name</th>
                    <th className="px-6 py-3 font-bold">Range (in)</th>
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
                        <button onClick={() => { setEditField(f); setIsFieldModalOpen(true); }} className="p-1.5 text-gray-500 hover:text-[#701626] hover:bg-[#F7F4EE] rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => safeCall(store.deleteMeasurementField, f.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-[#6D6268]">No measurement fields defined.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Size Charts */}
        {activeTab === 'presets' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-3xl border border-[#C5A059]/30 shadow-sm">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-[#110B0E] uppercase tracking-wider">Select Dress Type:</label>
                <select value={selectedDressTypeId} onChange={(e) => setSelectedDressTypeId(Number(e.target.value))} className="px-3 py-2 rounded-xl bg-[#F7F4EE] border border-[#C5A059]/30 text-xs font-medium focus:outline-none focus:border-[#701626]">
                  {dressTypes.map(dt => <option key={dt.id} value={dt.id}>{dt.name}</option>)}
                </select>
              </div>
              <button
                onClick={() => { setEditPreset(null); setIsPresetModalOpen(true); }}
                className="px-4 py-2 bg-[#701626] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" /> Add Size Preset
              </button>
            </div>
            
            <div className="bg-white rounded-3xl overflow-hidden border border-[#C5A059]/30 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#F7F4EE] border-b border-[#C5A059]/30 text-[#110B0E] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 font-bold w-20">Size</th>
                    {currentFields.map(f => (
                      <th key={f.id} className="px-4 py-3 font-bold">{f.fieldLabel}</th>
                    ))}
                    <th className="px-6 py-3 font-bold text-right sticky right-0 bg-[#F7F4EE] shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5A059]/10">
                  {currentPresets.length > 0 ? currentPresets.map(preset => (
                    <tr key={preset.id} className="hover:bg-[#FCFBF8]">
                      <td className="px-6 py-3 font-bold text-[#701626] text-sm">{preset.sizeLabel}</td>
                      {currentFields.map(f => (
                        <td key={f.id} className="px-4 py-3 text-[#6D6268]">
                          {preset.measurements[f.fieldName] ? `${preset.measurements[f.fieldName]}"` : '-'}
                        </td>
                      ))}
                      <td className="px-6 py-3 flex justify-end gap-2 sticky right-0 bg-white group-hover:bg-[#FCFBF8]">
                        <button onClick={() => { setEditPreset(preset); setIsPresetModalOpen(true); }} className="p-1.5 text-gray-500 hover:text-[#701626] hover:bg-[#F7F4EE] rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => safeCall(store.deleteSizePreset, preset.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={currentFields.length + 2} className="px-6 py-8 text-center text-[#6D6268]">No size presets defined.</td></tr>
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
        onClose={() => setIsDressTypeModalOpen(false)}
        initial={editDressType}
        onSave={(data) => {
          if (editDressType) safeCall(store.updateDressType, editDressType.id, data);
          else safeCall(store.addDressType, { id: Date.now(), ...data });
        }}
      />
      
      <FabricModal
        isOpen={isFabricModalOpen}
        onClose={() => setIsFabricModalOpen(false)}
        initial={editFabric}
        dressTypes={dressTypes}
        onSave={(data) => {
          if (editFabric) safeCall(store.updateTailoringFabric, editFabric.id, data);
          else safeCall(store.addTailoringFabric, { id: Date.now(), ...data });
        }}
      />
      
      <MeasurementFieldModal
        isOpen={isFieldModalOpen}
        onClose={() => setIsFieldModalOpen(false)}
        initial={editField}
        onSave={(data) => {
          if (editField) safeCall(store.updateMeasurementField, editField.id, data);
          else safeCall(store.addMeasurementField, { id: Date.now(), dressTypeId: selectedDressTypeId, ...data });
        }}
      />
      
      <SizePresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        initial={editPreset}
        measurementFields={currentFields}
        onSave={(data) => {
          if (editPreset) safeCall(store.updateSizePreset, editPreset.id, data);
          else safeCall(store.addSizePreset, { id: Date.now(), dressTypeId: selectedDressTypeId, ...data });
        }}
      />

    </AdminLayout>
  );
}
