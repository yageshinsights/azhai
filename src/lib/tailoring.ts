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
  requiredMeters: number;    // Fabric meterage required for this silhouette
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
  pricePerUnit: number;      // LKR (per meter)
  unit: string;              // "meter", "piece", etc.
  weight: string;            // e.g. "85 GSM · Heavy Fall"
  compatibleDressTypeIds: number[];
  inStock: boolean;
  displayOrder: number;
}

export interface MeasurementField {
  id: number;
  categorySlug: string;      // Links to Category / Collection slug (e.g. "kurties", "sarees")
  fieldName: string;         // "bust", "waist", etc.
  fieldLabel: string;        // "Bust / Chest"
  minValue: number;          // in inches (canonical unit)
  maxValue: number;          // in inches
  displayOrder: number;
}

/** Attached to CartItem.tailoring when a tailored item is added to bag */
export interface TailoringCartData {
  collectionName?: string;
  collectionSlug?: string;
  dressTypeName: string;     // Silhouette / design name
  dressTypeSlug: string;
  fabricName: string;
  fabricPricePerMeter: number; // LKR
  requiredMeters: number;    // Fabric meterage consumed
  fabricTotal: number;       // LKR (fabricPricePerMeter * requiredMeters)
  stitchingFee: number;      // LKR
  sizeLabel: string;         // Always "Custom Fit"
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
  return `LKR ${Math.round(amount).toLocaleString('en-LK')}`;
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
    requiredMeters: 2.5,
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
    requiredMeters: 2.5,
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
    requiredMeters: 2.0,
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
    requiredMeters: 1.2,
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
    requiredMeters: 1.0,
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
    requiredMeters: 1.2,
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
    requiredMeters: 1.5,
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
    requiredMeters: 1.8,
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
    requiredMeters: 5.5,
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
    requiredMeters: 4.0,
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
  // ── Kurties (All Kurti designs share these fields) ──
  { id: 1, categorySlug: 'kurties', fieldName: 'bust', fieldLabel: 'Bust / Chest', minValue: 28, maxValue: 48, displayOrder: 1 },
  { id: 2, categorySlug: 'kurties', fieldName: 'waist', fieldLabel: 'Waist', minValue: 24, maxValue: 44, displayOrder: 2 },
  { id: 3, categorySlug: 'kurties', fieldName: 'hip', fieldLabel: 'Hip', minValue: 30, maxValue: 50, displayOrder: 3 },
  { id: 4, categorySlug: 'kurties', fieldName: 'length', fieldLabel: 'Kurti Length', minValue: 30, maxValue: 48, displayOrder: 4 },
  { id: 5, categorySlug: 'kurties', fieldName: 'sleeveLength', fieldLabel: 'Sleeve Length', minValue: 0, maxValue: 26, displayOrder: 5 },

  // ── Sarees & Blouses (All Blouse designs share these fields) ──
  { id: 6, categorySlug: 'sarees', fieldName: 'bust', fieldLabel: 'Bust / Chest', minValue: 28, maxValue: 48, displayOrder: 1 },
  { id: 7, categorySlug: 'sarees', fieldName: 'underbust', fieldLabel: 'Underbust', minValue: 24, maxValue: 44, displayOrder: 2 },
  { id: 8, categorySlug: 'sarees', fieldName: 'shoulderWidth', fieldLabel: 'Shoulder Width', minValue: 12, maxValue: 20, displayOrder: 3 },
  { id: 9, categorySlug: 'sarees', fieldName: 'sleeveLength', fieldLabel: 'Sleeve Length', minValue: 0, maxValue: 24, displayOrder: 4 },
  { id: 10, categorySlug: 'sarees', fieldName: 'blouseLength', fieldLabel: 'Blouse Length', minValue: 12, maxValue: 22, displayOrder: 5 },
  { id: 11, categorySlug: 'sarees', fieldName: 'backNeckDepth', fieldLabel: 'Back Neck Depth', minValue: 4, maxValue: 14, displayOrder: 6 },

  // ── Tops & Bustiers (All Tops share these fields) ──
  { id: 12, categorySlug: 'tops', fieldName: 'bust', fieldLabel: 'Bust / Chest', minValue: 28, maxValue: 48, displayOrder: 1 },
  { id: 13, categorySlug: 'tops', fieldName: 'waist', fieldLabel: 'Waist', minValue: 24, maxValue: 44, displayOrder: 2 },
  { id: 14, categorySlug: 'tops', fieldName: 'shoulderWidth', fieldLabel: 'Shoulder Width', minValue: 12, maxValue: 20, displayOrder: 3 },
  { id: 15, categorySlug: 'tops', fieldName: 'topLength', fieldLabel: 'Top Length', minValue: 14, maxValue: 28, displayOrder: 4 },
  { id: 16, categorySlug: 'tops', fieldName: 'sleeveLength', fieldLabel: 'Sleeve Length', minValue: 0, maxValue: 26, displayOrder: 5 },

  // ── Lehengas ──
  { id: 17, categorySlug: 'lehengas', fieldName: 'bust', fieldLabel: 'Bust / Chest', minValue: 28, maxValue: 48, displayOrder: 1 },
  { id: 18, categorySlug: 'lehengas', fieldName: 'waist', fieldLabel: 'Waist', minValue: 24, maxValue: 44, displayOrder: 2 },
  { id: 19, categorySlug: 'lehengas', fieldName: 'hip', fieldLabel: 'Hip', minValue: 30, maxValue: 50, displayOrder: 3 },
  { id: 20, categorySlug: 'lehengas', fieldName: 'lehengaLength', fieldLabel: 'Lehenga Length', minValue: 36, maxValue: 44, displayOrder: 4 },
  { id: 21, categorySlug: 'lehengas', fieldName: 'choliLength', fieldLabel: 'Choli Length', minValue: 12, maxValue: 22, displayOrder: 5 },
  { id: 22, categorySlug: 'lehengas', fieldName: 'sleeveLength', fieldLabel: 'Sleeve Length', minValue: 0, maxValue: 24, displayOrder: 6 },

  // ── Salwar Suits ──
  { id: 23, categorySlug: 'salwar-suits', fieldName: 'bust', fieldLabel: 'Bust / Chest', minValue: 28, maxValue: 48, displayOrder: 1 },
  { id: 24, categorySlug: 'salwar-suits', fieldName: 'waist', fieldLabel: 'Waist', minValue: 24, maxValue: 44, displayOrder: 2 },
  { id: 25, categorySlug: 'salwar-suits', fieldName: 'hip', fieldLabel: 'Hip', minValue: 30, maxValue: 50, displayOrder: 3 },
  { id: 26, categorySlug: 'salwar-suits', fieldName: 'kameezLength', fieldLabel: 'Kameez Length', minValue: 32, maxValue: 50, displayOrder: 4 },
  { id: 27, categorySlug: 'salwar-suits', fieldName: 'sleeveLength', fieldLabel: 'Sleeve Length', minValue: 0, maxValue: 26, displayOrder: 5 },
  { id: 28, categorySlug: 'salwar-suits', fieldName: 'salwarLength', fieldLabel: 'Salwar Length', minValue: 34, maxValue: 44, displayOrder: 6 },
];
