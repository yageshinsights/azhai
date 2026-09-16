/**
 * Custom Tailoring — TypeScript Interfaces, Seed Data & Helpers
 * Used by TailoringStudio (storefront), AdminTailoring (admin), cart, and checkout.
 */

// ═══════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════

export interface DressType {
  id: number;
  collectionId?: number;     // Links to Category / Collection ID
  collectionSlug: string;    // e.g. "kurties", "sarees", "tops", "lehengas", "salwar-suits"
  name: string;              // e.g. "Anarkali Flared Silhouette"
  slug: string;
  coverImage: string;        // WebP URL from Supabase Storage
  stitchingFee: number;      // LKR
  leadTime: string;          // e.g. "5–7 working days"
  description?: string;      // Styling & cut details
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
  collectionName?: string;
  collectionSlug?: string;
  dressTypeName: string;     // Silhouette / design name
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
  // ── Kurties Collection ──
  {
    id: 1,
    collectionSlug: 'kurties',
    name: 'Anarkali Flared Silhouette',
    slug: 'anarkali-flared-kurti',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85',
    stitchingFee: 3800,
    leadTime: '5–7 working days',
    description: 'Flowing 12-kali flared silhouette with deep pockets and tailored sweetheart neckline.',
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 2,
    collectionSlug: 'kurties',
    name: 'Straight-Cut Slit Kurti Set',
    slug: 'straight-cut-slit-kurti',
    coverImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85',
    stitchingFee: 3200,
    leadTime: '5–7 working days',
    description: 'Crisp contemporary straight cut with high side-slits, Mandarin collar, and cigarette pant pairing.',
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 3,
    collectionSlug: 'kurties',
    name: 'Corset Fitted Peplum Kurti',
    slug: 'corset-fitted-peplum-kurti',
    coverImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=85',
    stitchingFee: 4200,
    leadTime: '7–10 working days',
    description: 'Artisanal boned corset bodice tapering into a pleated peplum flare with silk churidar.',
    isActive: true,
    displayOrder: 3,
  },

  // ── Sarees & Blouses Collection ──
  {
    id: 4,
    collectionSlug: 'sarees',
    name: 'Sweetheart Padded Blouse',
    slug: 'sweetheart-padded-blouse',
    coverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85',
    stitchingFee: 2800,
    leadTime: '3–5 working days',
    description: 'Sculpted sweetheart neckline with lightweight breathable padded cups and gold piping.',
    isActive: true,
    displayOrder: 4,
  },
  {
    id: 5,
    collectionSlug: 'sarees',
    name: 'Princess Cut Deep-U Blouse',
    slug: 'princess-cut-deep-u-blouse',
    coverImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85',
    stitchingFee: 2500,
    leadTime: '3–5 working days',
    description: 'Classic contoured princess darting with an artisanal deep-U back and handmade latkan tassels.',
    isActive: true,
    displayOrder: 5,
  },
  {
    id: 6,
    collectionSlug: 'sarees',
    name: 'High-Neck Temple Border Blouse',
    slug: 'high-neck-temple-blouse',
    coverImage: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=85',
    stitchingFee: 3200,
    leadTime: '5–7 working days',
    description: 'Regal Mandarin high collar tailored with elbow-length sleeves and antique border accents.',
    isActive: true,
    displayOrder: 6,
  },

  // ── Tops & Bustiers Collection ──
  {
    id: 7,
    collectionSlug: 'tops',
    name: 'Structured Corset Bustier',
    slug: 'structured-corset-bustier',
    coverImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=85',
    stitchingFee: 2600,
    leadTime: '3–5 working days',
    description: 'Architectural boned bustier crafted for luxury evening wear and fusion saree drapes.',
    isActive: true,
    displayOrder: 7,
  },
  {
    id: 8,
    collectionSlug: 'tops',
    name: 'Balloon-Sleeve Organza Peplum',
    slug: 'balloon-sleeve-organza-peplum',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85',
    stitchingFee: 3100,
    leadTime: '5–7 working days',
    description: 'Dramatic sheer bishop sleeves with button cuffs and a cinched waistline.',
    isActive: true,
    displayOrder: 8,
  },

  // ── Lehengas Collection ──
  {
    id: 9,
    collectionSlug: 'lehengas',
    name: 'Flared Royal Kalidar Lehenga',
    slug: 'flared-royal-kalidar-lehenga',
    coverImage: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=85',
    stitchingFee: 5500,
    leadTime: '10–14 working days',
    description: 'Full 16-kali sweeping circle skirt with double cancan under-lining and heavy waistband.',
    isActive: true,
    displayOrder: 9,
  },

  // ── Salwar Suits Collection ──
  {
    id: 10,
    collectionSlug: 'salwar-suits',
    name: 'Patiala Royal Salwar Suit',
    slug: 'patiala-royal-salwar-suit',
    coverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85',
    stitchingFee: 4000,
    leadTime: '7–10 working days',
    description: 'Full pleated traditional Patiala bottom paired with a knee-length tailored tunic.',
    isActive: true,
    displayOrder: 10,
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
    compatibleDressTypeIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
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
    compatibleDressTypeIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
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
    compatibleDressTypeIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
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
    compatibleDressTypeIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    inStock: true,
    displayOrder: 4,
  },
];

export const DEFAULT_MEASUREMENT_FIELDS: MeasurementField[] = [
  // Kurties Collection (Dress Types 1, 2, 3)
  ...[1, 2, 3].flatMap((dtId, idx) => [
    { id: idx * 5 + 1, dressTypeId: dtId, fieldName: 'bust', fieldLabel: 'Bust / Chest', minValue: 28, maxValue: 48, displayOrder: 1 },
    { id: idx * 5 + 2, dressTypeId: dtId, fieldName: 'waist', fieldLabel: 'Waist', minValue: 24, maxValue: 44, displayOrder: 2 },
    { id: idx * 5 + 3, dressTypeId: dtId, fieldName: 'hip', fieldLabel: 'Hip', minValue: 30, maxValue: 50, displayOrder: 3 },
    { id: idx * 5 + 4, dressTypeId: dtId, fieldName: 'length', fieldLabel: 'Kurti Length', minValue: 30, maxValue: 48, displayOrder: 4 },
    { id: idx * 5 + 5, dressTypeId: dtId, fieldName: 'sleeveLength', fieldLabel: 'Sleeve Length', minValue: 5, maxValue: 26, displayOrder: 5 },
  ]),

  // Saree Blouses Collection (Dress Types 4, 5, 6)
  ...[4, 5, 6].flatMap((dtId, idx) => [
    { id: 20 + idx * 6 + 1, dressTypeId: dtId, fieldName: 'bust', fieldLabel: 'Bust / Chest', minValue: 28, maxValue: 48, displayOrder: 1 },
    { id: 20 + idx * 6 + 2, dressTypeId: dtId, fieldName: 'underbust', fieldLabel: 'Underbust', minValue: 24, maxValue: 44, displayOrder: 2 },
    { id: 20 + idx * 6 + 3, dressTypeId: dtId, fieldName: 'shoulderWidth', fieldLabel: 'Shoulder Width', minValue: 12, maxValue: 20, displayOrder: 3 },
    { id: 20 + idx * 6 + 4, dressTypeId: dtId, fieldName: 'sleeveLength', fieldLabel: 'Sleeve Length', minValue: 4, maxValue: 24, displayOrder: 4 },
    { id: 20 + idx * 6 + 5, dressTypeId: dtId, fieldName: 'blouseLength', fieldLabel: 'Blouse Length', minValue: 12, maxValue: 22, displayOrder: 5 },
    { id: 20 + idx * 6 + 6, dressTypeId: dtId, fieldName: 'backNeckDepth', fieldLabel: 'Back Neck Depth', minValue: 4, maxValue: 14, displayOrder: 6 },
  ]),

  // Tops & Bustiers Collection (Dress Types 7, 8)
  ...[7, 8].flatMap((dtId, idx) => [
    { id: 40 + idx * 5 + 1, dressTypeId: dtId, fieldName: 'bust', fieldLabel: 'Bust / Chest', minValue: 28, maxValue: 48, displayOrder: 1 },
    { id: 40 + idx * 5 + 2, dressTypeId: dtId, fieldName: 'waist', fieldLabel: 'Waist', minValue: 24, maxValue: 44, displayOrder: 2 },
    { id: 40 + idx * 5 + 3, dressTypeId: dtId, fieldName: 'shoulderWidth', fieldLabel: 'Shoulder Width', minValue: 12, maxValue: 20, displayOrder: 3 },
    { id: 40 + idx * 5 + 4, dressTypeId: dtId, fieldName: 'topLength', fieldLabel: 'Top Length', minValue: 14, maxValue: 28, displayOrder: 4 },
    { id: 40 + idx * 5 + 5, dressTypeId: dtId, fieldName: 'sleeveLength', fieldLabel: 'Sleeve Length', minValue: 0, maxValue: 26, displayOrder: 5 },
  ]),

  // Lehenga Choli (Dress Type 9)
  { id: 60, dressTypeId: 9, fieldName: 'bust', fieldLabel: 'Bust / Chest', minValue: 28, maxValue: 48, displayOrder: 1 },
  { id: 61, dressTypeId: 9, fieldName: 'waist', fieldLabel: 'Waist', minValue: 24, maxValue: 44, displayOrder: 2 },
  { id: 62, dressTypeId: 9, fieldName: 'hip', fieldLabel: 'Hip', minValue: 30, maxValue: 50, displayOrder: 3 },
  { id: 63, dressTypeId: 9, fieldName: 'lehengaLength', fieldLabel: 'Lehenga Length', minValue: 36, maxValue: 44, displayOrder: 4 },
  { id: 64, dressTypeId: 9, fieldName: 'choliLength', fieldLabel: 'Choli Length', minValue: 12, maxValue: 22, displayOrder: 5 },
  { id: 65, dressTypeId: 9, fieldName: 'sleeveLength', fieldLabel: 'Sleeve Length', minValue: 4, maxValue: 24, displayOrder: 6 },

  // Salwar Suit (Dress Type 10)
  { id: 70, dressTypeId: 10, fieldName: 'bust', fieldLabel: 'Bust / Chest', minValue: 28, maxValue: 48, displayOrder: 1 },
  { id: 71, dressTypeId: 10, fieldName: 'waist', fieldLabel: 'Waist', minValue: 24, maxValue: 44, displayOrder: 2 },
  { id: 72, dressTypeId: 10, fieldName: 'hip', fieldLabel: 'Hip', minValue: 30, maxValue: 50, displayOrder: 3 },
  { id: 73, dressTypeId: 10, fieldName: 'kameezLength', fieldLabel: 'Kameez Length', minValue: 32, maxValue: 50, displayOrder: 4 },
  { id: 74, dressTypeId: 10, fieldName: 'sleeveLength', fieldLabel: 'Sleeve Length', minValue: 5, maxValue: 26, displayOrder: 5 },
  { id: 75, dressTypeId: 10, fieldName: 'salwarLength', fieldLabel: 'Salwar Length', minValue: 34, maxValue: 44, displayOrder: 6 },
];

export const DEFAULT_SIZE_PRESETS: SizePreset[] = [
  // Kurties Collection Presets (Dress Types 1, 2, 3)
  ...[1, 2, 3].flatMap((dtId, idx) => [
    { id: idx * 5 + 1, dressTypeId: dtId, sizeLabel: 'S', measurements: { bust: 34, waist: 28, hip: 36, length: 38, sleeveLength: 14 } },
    { id: idx * 5 + 2, dressTypeId: dtId, sizeLabel: 'M', measurements: { bust: 36, waist: 30, hip: 38, length: 39, sleeveLength: 14.5 } },
    { id: idx * 5 + 3, dressTypeId: dtId, sizeLabel: 'L', measurements: { bust: 38, waist: 32, hip: 40, length: 40, sleeveLength: 15 } },
    { id: idx * 5 + 4, dressTypeId: dtId, sizeLabel: 'XL', measurements: { bust: 40, waist: 34, hip: 42, length: 41, sleeveLength: 15.5 } },
    { id: idx * 5 + 5, dressTypeId: dtId, sizeLabel: 'XXL', measurements: { bust: 42, waist: 36, hip: 44, length: 42, sleeveLength: 16 } },
  ]),

  // Saree Blouses Collection Presets (Dress Types 4, 5, 6)
  ...[4, 5, 6].flatMap((dtId, idx) => [
    { id: 20 + idx * 5 + 1, dressTypeId: dtId, sizeLabel: 'S', measurements: { bust: 34, underbust: 30, shoulderWidth: 14, sleeveLength: 6, blouseLength: 15, backNeckDepth: 6 } },
    { id: 20 + idx * 5 + 2, dressTypeId: dtId, sizeLabel: 'M', measurements: { bust: 36, underbust: 32, shoulderWidth: 14.5, sleeveLength: 7, blouseLength: 15.5, backNeckDepth: 7 } },
    { id: 20 + idx * 5 + 3, dressTypeId: dtId, sizeLabel: 'L', measurements: { bust: 38, underbust: 34, shoulderWidth: 15, sleeveLength: 8, blouseLength: 16, backNeckDepth: 7.5 } },
    { id: 20 + idx * 5 + 4, dressTypeId: dtId, sizeLabel: 'XL', measurements: { bust: 40, underbust: 36, shoulderWidth: 15.5, sleeveLength: 9, blouseLength: 16.5, backNeckDepth: 8 } },
    { id: 20 + idx * 5 + 5, dressTypeId: dtId, sizeLabel: 'XXL', measurements: { bust: 42, underbust: 38, shoulderWidth: 16, sleeveLength: 10, blouseLength: 17, backNeckDepth: 8.5 } },
  ]),

  // Tops & Bustiers Collection Presets (Dress Types 7, 8)
  ...[7, 8].flatMap((dtId, idx) => [
    { id: 40 + idx * 5 + 1, dressTypeId: dtId, sizeLabel: 'S', measurements: { bust: 34, waist: 28, shoulderWidth: 14, topLength: 18, sleeveLength: 6 } },
    { id: 40 + idx * 5 + 2, dressTypeId: dtId, sizeLabel: 'M', measurements: { bust: 36, waist: 30, shoulderWidth: 14.5, topLength: 19, sleeveLength: 7 } },
    { id: 40 + idx * 5 + 3, dressTypeId: dtId, sizeLabel: 'L', measurements: { bust: 38, waist: 32, shoulderWidth: 15, topLength: 20, sleeveLength: 8 } },
    { id: 40 + idx * 5 + 4, dressTypeId: dtId, sizeLabel: 'XL', measurements: { bust: 40, waist: 34, shoulderWidth: 15.5, topLength: 21, sleeveLength: 9 } },
    { id: 40 + idx * 5 + 5, dressTypeId: dtId, sizeLabel: 'XXL', measurements: { bust: 42, waist: 36, shoulderWidth: 16, topLength: 22, sleeveLength: 10 } },
  ]),

  // Lehenga Choli Presets (Dress Type 9)
  { id: 60, dressTypeId: 9, sizeLabel: 'S', measurements: { bust: 34, waist: 28, hip: 36, lehengaLength: 40, choliLength: 15, sleeveLength: 6 } },
  { id: 61, dressTypeId: 9, sizeLabel: 'M', measurements: { bust: 36, waist: 30, hip: 38, lehengaLength: 40, choliLength: 15.5, sleeveLength: 7 } },
  { id: 62, dressTypeId: 9, sizeLabel: 'L', measurements: { bust: 38, waist: 32, hip: 40, lehengaLength: 41, choliLength: 16, sleeveLength: 8 } },
  { id: 63, dressTypeId: 9, sizeLabel: 'XL', measurements: { bust: 40, waist: 34, hip: 42, lehengaLength: 41, choliLength: 16.5, sleeveLength: 9 } },
  { id: 64, dressTypeId: 9, sizeLabel: 'XXL', measurements: { bust: 42, waist: 36, hip: 44, lehengaLength: 42, choliLength: 17, sleeveLength: 10 } },

  // Salwar Suit Presets (Dress Type 10)
  { id: 70, dressTypeId: 10, sizeLabel: 'S', measurements: { bust: 34, waist: 28, hip: 36, kameezLength: 38, sleeveLength: 22, salwarLength: 38 } },
  { id: 71, dressTypeId: 10, sizeLabel: 'M', measurements: { bust: 36, waist: 30, hip: 38, kameezLength: 39, sleeveLength: 23, salwarLength: 39 } },
  { id: 72, dressTypeId: 10, sizeLabel: 'L', measurements: { bust: 38, waist: 32, hip: 40, kameezLength: 40, sleeveLength: 23.5, salwarLength: 40 } },
  { id: 73, dressTypeId: 10, sizeLabel: 'XL', measurements: { bust: 40, waist: 34, hip: 42, kameezLength: 41, sleeveLength: 24, salwarLength: 41 } },
  { id: 74, dressTypeId: 10, sizeLabel: 'XXL', measurements: { bust: 42, waist: 36, hip: 44, kameezLength: 42, sleeveLength: 24.5, salwarLength: 42 } },
];
