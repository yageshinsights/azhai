/**
 * Custom Tailoring — TypeScript Interfaces, Seed Data & Helpers
 * Used by TailoringStudio (storefront), AdminTailoring (admin), cart, and checkout.
 */

// ═══════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════

export interface DressType {
  id: number;
  name: string;
  slug: string;
  coverImage: string;        // WebP URL from Supabase Storage
  stitchingFee: number;      // LKR
  leadTime: string;          // e.g. "5–7 working days"
  isActive: boolean;
  displayOrder: number;
}

export interface TailoringFabric {
  id: number;
  name: string;
  slug: string;
  swatchImage: string;       // WebP URL from Supabase Storage
  pricePerUnit: number;      // LKR
  unit: string;              // "meter", "piece", etc.
  weight: string;            // e.g. "85 GSM · Heavy Fall"
  compatibleDressTypeIds: number[];
  inStock: boolean;
  displayOrder: number;
}

export interface MeasurementField {
  id: number;
  dressTypeId: number;
  fieldName: string;         // "bust", "waist", etc.
  fieldLabel: string;        // "Bust / Chest"
  minValue: number;          // in inches (canonical unit)
  maxValue: number;          // in inches
  displayOrder: number;
}

export interface SizePreset {
  id: number;
  dressTypeId: number;
  sizeLabel: string;         // "S", "M", "L", "XL", "XXL"
  measurements: Record<string, number>; // { bust: 34, waist: 28, ... } in inches
}

/** Attached to CartItem.tailoring when a tailored item is added to bag */
export interface TailoringCartData {
  dressTypeName: string;
  dressTypeSlug: string;
  fabricName: string;
  fabricPrice: number;       // LKR
  stitchingFee: number;      // LKR
  sizeLabel: string;         // "M" or "Custom"
  measurements: Record<string, number>; // in inches (canonical)
  leadTime: string;
}


// ═══════════════════════════════════════════
// UNIT CONVERSION HELPERS
// ═══════════════════════════════════════════

const CM_PER_INCH = 2.54;

/** Convert inches to centimeters, rounded to 1 decimal */
export function inchesToCm(inches: number): number {
  return Math.round(inches * CM_PER_INCH * 10) / 10;
}

/** Convert centimeters to inches, rounded to 1 decimal */
export function cmToInches(cm: number): number {
  return Math.round((cm / CM_PER_INCH) * 10) / 10;
}

/** Format a measurement value with the appropriate unit suffix */
export function formatMeasurement(valueInInches: number, unit: 'inches' | 'cm'): string {
  if (unit === 'cm') {
    return `${inchesToCm(valueInInches)} cm`;
  }
  return `${valueInInches}"`;
}

/** Format LKR price */
export function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString('en-LK')}`;
}


// ═══════════════════════════════════════════
// DEFAULT SEED DATA
// ═══════════════════════════════════════════

export const DEFAULT_DRESS_TYPES: DressType[] = [
  {
    id: 1,
    name: 'Kurti Set',
    slug: 'kurti-set',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85',
    stitchingFee: 3500,
    leadTime: '5–7 working days',
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 2,
    name: 'Saree Blouse',
    slug: 'saree-blouse',
    coverImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85',
    stitchingFee: 2500,
    leadTime: '3–5 working days',
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 3,
    name: 'Salwar Suit',
    slug: 'salwar-suit',
    coverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85',
    stitchingFee: 4000,
    leadTime: '7–10 working days',
    isActive: true,
    displayOrder: 3,
  },
  {
    id: 4,
    name: 'Lehenga Choli',
    slug: 'lehenga-choli',
    coverImage: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=85',
    stitchingFee: 5000,
    leadTime: '10–14 working days',
    isActive: true,
    displayOrder: 4,
  },
  {
    id: 5,
    name: 'Top / Bustier',
    slug: 'top-bustier',
    coverImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=85',
    stitchingFee: 2000,
    leadTime: '3–5 working days',
    isActive: true,
    displayOrder: 5,
  },
];

export const DEFAULT_FABRICS: TailoringFabric[] = [
  {
    id: 1,
    name: 'Kanjivaram Mulberry Silk',
    slug: 'kanjivaram-mulberry-silk',
    swatchImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
    pricePerUnit: 4200,
    unit: 'meter',
    weight: '85 GSM · Heavy Fall',
    compatibleDressTypeIds: [1, 2, 3, 4],
    inStock: true,
    displayOrder: 1,
  },
  {
    id: 2,
    name: 'Featherlight Sheer Organza',
    slug: 'featherlight-sheer-organza',
    swatchImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
    pricePerUnit: 3200,
    unit: 'meter',
    weight: '28 GSM · Ultra Light',
    compatibleDressTypeIds: [1, 2, 4, 5],
    inStock: true,
    displayOrder: 2,
  },
  {
    id: 3,
    name: 'Zari-Embroidered Pure Silk',
    slug: 'zari-embroidered-pure-silk',
    swatchImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80',
    pricePerUnit: 5500,
    unit: 'meter',
    weight: '75 GSM · Fluid Wrap',
    compatibleDressTypeIds: [1, 2, 3, 4],
    inStock: true,
    displayOrder: 3,
  },
  {
    id: 4,
    name: 'Handloom Cotton-Silk Chanderi',
    slug: 'handloom-cotton-silk-chanderi',
    swatchImage: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=400&q=80',
    pricePerUnit: 2800,
    unit: 'meter',
    weight: '45 GSM · Breathable',
    compatibleDressTypeIds: [1, 3, 5],
    inStock: true,
    displayOrder: 4,
  },
];

export const DEFAULT_MEASUREMENT_FIELDS: MeasurementField[] = [
  // Kurti Set fields
  { id: 1, dressTypeId: 1, fieldName: 'bust', fieldLabel: 'Bust / Chest', minValue: 28, maxValue: 48, displayOrder: 1 },
  { id: 2, dressTypeId: 1, fieldName: 'waist', fieldLabel: 'Waist', minValue: 24, maxValue: 44, displayOrder: 2 },
  { id: 3, dressTypeId: 1, fieldName: 'hip', fieldLabel: 'Hip', minValue: 30, maxValue: 50, displayOrder: 3 },
  { id: 4, dressTypeId: 1, fieldName: 'length', fieldLabel: 'Kurti Length', minValue: 30, maxValue: 48, displayOrder: 4 },
  { id: 5, dressTypeId: 1, fieldName: 'sleeveLength', fieldLabel: 'Sleeve Length', minValue: 5, maxValue: 26, displayOrder: 5 },

  // Saree Blouse fields
  { id: 6, dressTypeId: 2, fieldName: 'bust', fieldLabel: 'Bust / Chest', minValue: 28, maxValue: 48, displayOrder: 1 },
  { id: 7, dressTypeId: 2, fieldName: 'underbust', fieldLabel: 'Underbust', minValue: 24, maxValue: 44, displayOrder: 2 },
  { id: 8, dressTypeId: 2, fieldName: 'shoulderWidth', fieldLabel: 'Shoulder Width', minValue: 12, maxValue: 20, displayOrder: 3 },
  { id: 9, dressTypeId: 2, fieldName: 'sleeveLength', fieldLabel: 'Sleeve Length', minValue: 4, maxValue: 24, displayOrder: 4 },
  { id: 10, dressTypeId: 2, fieldName: 'blouseLength', fieldLabel: 'Blouse Length', minValue: 12, maxValue: 22, displayOrder: 5 },
  { id: 11, dressTypeId: 2, fieldName: 'backNeckDepth', fieldLabel: 'Back Neck Depth', minValue: 4, maxValue: 14, displayOrder: 6 },

  // Salwar Suit fields
  { id: 12, dressTypeId: 3, fieldName: 'bust', fieldLabel: 'Bust / Chest', minValue: 28, maxValue: 48, displayOrder: 1 },
  { id: 13, dressTypeId: 3, fieldName: 'waist', fieldLabel: 'Waist', minValue: 24, maxValue: 44, displayOrder: 2 },
  { id: 14, dressTypeId: 3, fieldName: 'hip', fieldLabel: 'Hip', minValue: 30, maxValue: 50, displayOrder: 3 },
  { id: 15, dressTypeId: 3, fieldName: 'kameezLength', fieldLabel: 'Kameez Length', minValue: 32, maxValue: 50, displayOrder: 4 },
  { id: 16, dressTypeId: 3, fieldName: 'sleeveLength', fieldLabel: 'Sleeve Length', minValue: 5, maxValue: 26, displayOrder: 5 },
  { id: 17, dressTypeId: 3, fieldName: 'salwarLength', fieldLabel: 'Salwar Length', minValue: 34, maxValue: 44, displayOrder: 6 },

  // Lehenga Choli fields
  { id: 18, dressTypeId: 4, fieldName: 'bust', fieldLabel: 'Bust / Chest', minValue: 28, maxValue: 48, displayOrder: 1 },
  { id: 19, dressTypeId: 4, fieldName: 'waist', fieldLabel: 'Waist', minValue: 24, maxValue: 44, displayOrder: 2 },
  { id: 20, dressTypeId: 4, fieldName: 'hip', fieldLabel: 'Hip', minValue: 30, maxValue: 50, displayOrder: 3 },
  { id: 21, dressTypeId: 4, fieldName: 'lehengaLength', fieldLabel: 'Lehenga Length', minValue: 36, maxValue: 44, displayOrder: 4 },
  { id: 22, dressTypeId: 4, fieldName: 'choliLength', fieldLabel: 'Choli Length', minValue: 12, maxValue: 22, displayOrder: 5 },
  { id: 23, dressTypeId: 4, fieldName: 'sleeveLength', fieldLabel: 'Sleeve Length', minValue: 4, maxValue: 24, displayOrder: 6 },

  // Top / Bustier fields
  { id: 24, dressTypeId: 5, fieldName: 'bust', fieldLabel: 'Bust / Chest', minValue: 28, maxValue: 48, displayOrder: 1 },
  { id: 25, dressTypeId: 5, fieldName: 'waist', fieldLabel: 'Waist', minValue: 24, maxValue: 44, displayOrder: 2 },
  { id: 26, dressTypeId: 5, fieldName: 'shoulderWidth', fieldLabel: 'Shoulder Width', minValue: 12, maxValue: 20, displayOrder: 3 },
  { id: 27, dressTypeId: 5, fieldName: 'topLength', fieldLabel: 'Top Length', minValue: 14, maxValue: 28, displayOrder: 4 },
  { id: 28, dressTypeId: 5, fieldName: 'sleeveLength', fieldLabel: 'Sleeve Length', minValue: 0, maxValue: 26, displayOrder: 5 },
];

export const DEFAULT_SIZE_PRESETS: SizePreset[] = [
  // Kurti Set sizes
  { id: 1, dressTypeId: 1, sizeLabel: 'S', measurements: { bust: 34, waist: 28, hip: 36, length: 38, sleeveLength: 14 } },
  { id: 2, dressTypeId: 1, sizeLabel: 'M', measurements: { bust: 36, waist: 30, hip: 38, length: 39, sleeveLength: 14.5 } },
  { id: 3, dressTypeId: 1, sizeLabel: 'L', measurements: { bust: 38, waist: 32, hip: 40, length: 40, sleeveLength: 15 } },
  { id: 4, dressTypeId: 1, sizeLabel: 'XL', measurements: { bust: 40, waist: 34, hip: 42, length: 41, sleeveLength: 15.5 } },
  { id: 5, dressTypeId: 1, sizeLabel: 'XXL', measurements: { bust: 42, waist: 36, hip: 44, length: 42, sleeveLength: 16 } },

  // Saree Blouse sizes
  { id: 6, dressTypeId: 2, sizeLabel: 'S', measurements: { bust: 34, underbust: 30, shoulderWidth: 14, sleeveLength: 6, blouseLength: 15, backNeckDepth: 6 } },
  { id: 7, dressTypeId: 2, sizeLabel: 'M', measurements: { bust: 36, underbust: 32, shoulderWidth: 14.5, sleeveLength: 7, blouseLength: 15.5, backNeckDepth: 7 } },
  { id: 8, dressTypeId: 2, sizeLabel: 'L', measurements: { bust: 38, underbust: 34, shoulderWidth: 15, sleeveLength: 8, blouseLength: 16, backNeckDepth: 7.5 } },
  { id: 9, dressTypeId: 2, sizeLabel: 'XL', measurements: { bust: 40, underbust: 36, shoulderWidth: 15.5, sleeveLength: 9, blouseLength: 16.5, backNeckDepth: 8 } },
  { id: 10, dressTypeId: 2, sizeLabel: 'XXL', measurements: { bust: 42, underbust: 38, shoulderWidth: 16, sleeveLength: 10, blouseLength: 17, backNeckDepth: 8.5 } },

  // Salwar Suit sizes
  { id: 11, dressTypeId: 3, sizeLabel: 'S', measurements: { bust: 34, waist: 28, hip: 36, kameezLength: 38, sleeveLength: 22, salwarLength: 38 } },
  { id: 12, dressTypeId: 3, sizeLabel: 'M', measurements: { bust: 36, waist: 30, hip: 38, kameezLength: 39, sleeveLength: 23, salwarLength: 39 } },
  { id: 13, dressTypeId: 3, sizeLabel: 'L', measurements: { bust: 38, waist: 32, hip: 40, kameezLength: 40, sleeveLength: 23.5, salwarLength: 40 } },
  { id: 14, dressTypeId: 3, sizeLabel: 'XL', measurements: { bust: 40, waist: 34, hip: 42, kameezLength: 41, sleeveLength: 24, salwarLength: 41 } },
  { id: 15, dressTypeId: 3, sizeLabel: 'XXL', measurements: { bust: 42, waist: 36, hip: 44, kameezLength: 42, sleeveLength: 24.5, salwarLength: 42 } },

  // Lehenga Choli sizes
  { id: 16, dressTypeId: 4, sizeLabel: 'S', measurements: { bust: 34, waist: 28, hip: 36, lehengaLength: 40, choliLength: 15, sleeveLength: 6 } },
  { id: 17, dressTypeId: 4, sizeLabel: 'M', measurements: { bust: 36, waist: 30, hip: 38, lehengaLength: 40, choliLength: 15.5, sleeveLength: 7 } },
  { id: 18, dressTypeId: 4, sizeLabel: 'L', measurements: { bust: 38, waist: 32, hip: 40, lehengaLength: 41, choliLength: 16, sleeveLength: 8 } },
  { id: 19, dressTypeId: 4, sizeLabel: 'XL', measurements: { bust: 40, waist: 34, hip: 42, lehengaLength: 41, choliLength: 16.5, sleeveLength: 9 } },
  { id: 20, dressTypeId: 4, sizeLabel: 'XXL', measurements: { bust: 42, waist: 36, hip: 44, lehengaLength: 42, choliLength: 17, sleeveLength: 10 } },

  // Top / Bustier sizes
  { id: 21, dressTypeId: 5, sizeLabel: 'S', measurements: { bust: 34, waist: 28, shoulderWidth: 14, topLength: 18, sleeveLength: 6 } },
  { id: 22, dressTypeId: 5, sizeLabel: 'M', measurements: { bust: 36, waist: 30, shoulderWidth: 14.5, topLength: 19, sleeveLength: 7 } },
  { id: 23, dressTypeId: 5, sizeLabel: 'L', measurements: { bust: 38, waist: 32, shoulderWidth: 15, topLength: 20, sleeveLength: 8 } },
  { id: 24, dressTypeId: 5, sizeLabel: 'XL', measurements: { bust: 40, waist: 34, shoulderWidth: 15.5, topLength: 21, sleeveLength: 9 } },
  { id: 25, dressTypeId: 5, sizeLabel: 'XXL', measurements: { bust: 42, waist: 36, shoulderWidth: 16, topLength: 22, sleeveLength: 10 } },
];
