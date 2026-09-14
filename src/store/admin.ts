import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PRODUCTS, COLLECTIONS, type Product, type Collection } from '@/lib/data';
import type { PlacedOrder } from './cart';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  type DressType,
  type TailoringFabric,
  type MeasurementField,
  type SizePreset,
  DEFAULT_DRESS_TYPES,
  DEFAULT_FABRICS,
  DEFAULT_MEASUREMENT_FIELDS,
  DEFAULT_SIZE_PRESETS,
} from '@/lib/tailoring';

export type AdminRole = 'owner' | 'manager' | 'dispatch';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface AdminOrder extends PlacedOrder {
  status: OrderStatus;
  paymentStatus: 'paid' | 'pending_cod' | 'pending_bank' | 'refunded';
  courierPartner?: 'Sri Lanka Post' | 'PromptX' | 'Koombiyo' | 'Citypak' | 'Domex' | 'Atelier Express' | string;
  trackingNumber?: string;
  adminNotes?: string;
  costPrice?: number;
  weightGrams?: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10% or 1000 for LKR 1000
  minSpend?: number;
  maxDiscount?: number;
  usageCount: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface CustomerRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  district: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  firstJoined: string;
  lastOrderDate?: string;
  vipTier: 'Gold Patron' | 'Silver Patron' | 'Standard';
  notes?: string;
}

/**
 * Utility to convert any human-formatted phone number to clean international digits for wa.me/ links.
 * e.g., '+94 77 123 4567' -> '94771234567', '0771234567' -> '94771234567'
 */
export function cleanWhatsAppDigits(phone?: string): string {
  if (!phone) return '94771234567';
  let digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    digits = '94' + digits.slice(1);
  } else if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1'))) {
    digits = '94' + digits;
  }
  return digits || '94771234567';
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  targetKeywords: string;
}

export interface SocialLinksSettings {
  instagram: string;
  facebook: string;
  tiktok?: string;
}

export interface StudioSettings {
  email: string;
  supportEmail: string;
  openingHours: string;
  googleMapsUrl?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  branchName: string;
  bankLogo?: string; // Image URL or preset identifier: 'combank' | 'hnb' | 'sampath' | 'boc' | 'ntb' | 'seylan' | 'peoples'
  swiftCode?: string;
  isActive: boolean;
  instructions?: string;
  displayOrder?: number;
}

export interface ComingSoonSettings {
  enabled: boolean;
  headline?: string;
  subheadline?: string;
  targetLaunchDate?: string;
  secretPasscode?: string;
  privilegeDiscountCode?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  enableCOD: boolean;
  maxCODAmount: number;
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  whatsappNumber: string;
  phoneNumber: string;
  atelierAddress: string;
  announcementTicker: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  seo: SEOSettings;
  socialLinks: SocialLinksSettings;
  studio: StudioSettings;
  bankAccounts?: BankAccount[];
  comingSoonMode?: ComingSoonSettings;
}

interface AdminState {
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  orders: AdminOrder[];
  products: Product[];
  categories: Collection[];
  tags: string[];
  coupons: Coupon[];
  customers: CustomerRecord[];
  settings: StoreSettings;

  // Tailoring State
  dressTypes: DressType[];
  tailoringFabrics: TailoringFabric[];
  measurementFields: MeasurementField[];
  sizePresets: SizePreset[];

  // Actions
  fetchSupabaseData: () => Promise<void>;
  adminLogin: (email: string, password: string, role?: AdminRole) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    courierPartner?: AdminOrder['courierPartner'],
    trackingNumber?: string,
    notes?: string
  ) => void;
  syncNewOrder: (placedOrder: PlacedOrder) => void;
  syncCustomerFromAuth: (user: { fullName: string; email: string; phone?: string; district?: string; city?: string; createdAt?: string }) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  updateProductStock: (id: number, stockQuantity: number) => void;
  deleteProduct: (id: number) => void;
  addCategory: (category: Omit<Collection, 'id' | 'count'>) => void;
  updateCategory: (id: number, updates: Partial<Collection>) => void;
  toggleCategoryFeatured: (id: number) => void;
  deleteCategory: (id: number) => void;
  addTag: (tag: string) => void;
  deleteTag: (tag: string) => void;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => void;
  toggleCoupon: (id: string) => void;
  deleteCoupon: (id: string) => void;
  updateSettings: (settings: Partial<StoreSettings>) => void;
  toggleCOD: (enabled: boolean) => void;

  // Bank Accounts & Direct Deposit Actions
  addBankAccount: (account: Omit<BankAccount, 'id'>) => void;
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;
  toggleBankAccountActive: (id: string) => void;
  uploadOrderBankSlip: (orderId: string, slipUrl: string, reference?: string) => void;
  verifyBankTransferPayment: (orderId: string, adminNotes?: string) => Promise<void>;

  // Tailoring Actions
  addDressType: (dt: Omit<DressType, 'id'>) => void;
  updateDressType: (id: number, updates: Partial<DressType>) => void;
  deleteDressType: (id: number) => void;
  toggleDressTypeActive: (id: number) => void;
  addTailoringFabric: (f: Omit<TailoringFabric, 'id'>) => void;
  updateTailoringFabric: (id: number, updates: Partial<TailoringFabric>) => void;
  deleteTailoringFabric: (id: number) => void;
  toggleFabricStock: (id: number) => void;
  addMeasurementField: (f: Omit<MeasurementField, 'id'>) => void;
  updateMeasurementField: (id: number, updates: Partial<MeasurementField>) => void;
  deleteMeasurementField: (id: number) => void;
  addSizePreset: (p: Omit<SizePreset, 'id'>) => void;
  updateSizePreset: (id: number, updates: Partial<SizePreset>) => void;
  deleteSizePreset: (id: number) => void;
}

const INITIAL_TAGS: string[] = [
  'Viral on Reels ✨',
  'New Festive Drop',
  'Bestseller',
  'Silk Mark Certified',
  'Artisan Heirloom',
  'Limited Edition',
  'Pre-Order Only',
  'Avurudu Special 🪷',
];

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'AZHAI10',
    discountType: 'percentage',
    value: 10,
    minSpend: 10000,
    usageCount: 0,
    isActive: true,
    expiresAt: '2026-12-31',
  },
  {
    id: 'coup-2',
    code: 'CEYLON1000',
    discountType: 'fixed',
    value: 1000,
    minSpend: 15000,
    usageCount: 0,
    isActive: true,
    expiresAt: '2026-12-31',
  },
];

const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Azhai Clothing by Preethi',
  tagline: 'Handcrafted Festive & Bridal Silk Couture',
  enableCOD: true,
  maxCODAmount: 45000,
  freeShippingThreshold: 15000,
  standardShippingFee: 450,
  expressShippingFee: 850,
  whatsappNumber: '+94 77 123 4567',
  phoneNumber: '+94 77 123 4567',
  atelierAddress: '42/A Temple Road, Kollupitiya, Colombo 03, Sri Lanka',
  announcementTicker: {
    enabled: true,
    text: '✨ Festive Drop Live: Complimentary Island-wide Delivery on Orders over LKR 15,000 | Use Code AZHAI10',
    link: '/collections',
  },
  seo: {
    metaTitle: 'Azhai Clothing by Preethi | Handcrafted Luxury Silk Kurties & Sarees Sri Lanka',
    metaDescription: 'Discover heirloom handloom kurti sets, cloud-light organza sarees, and tailored corset tops. Island-wide Sri Lanka delivery & bespoke sizing in Colombo.',
    targetKeywords: 'silk kurties sri lanka, bridal saree colombo, handloom clothing boutique, preethi silk couture',
  },
  socialLinks: {
    instagram: 'https://www.instagram.com/azhaiclothing',
    facebook: 'https://www.facebook.com/azhaiclothing',
    tiktok: 'https://www.tiktok.com/@azhaiclothing',
  },
  studio: {
    email: 'orders@azhaiclothing.lk',
    supportEmail: 'hello@azhaiclothing.lk',
    openingHours: 'Mon – Sat: 10:00 AM – 7:00 PM (Closed on Poya)',
    googleMapsUrl: 'https://maps.google.com/?q=Kollupitiya+Colombo+03',
  },
  bankAccounts: [
    {
      id: 'bank-1',
      bankName: 'Commercial Bank of Ceylon',
      accountNumber: '8001234567',
      accountName: 'Azhai Clothing (Pvt) Ltd',
      branchName: 'Kollupitiya Branch',
      bankLogo: 'combank',
      swiftCode: 'CCEYLKX',
      isActive: true,
      instructions: 'Please include your Order ID (#AZH-XXXXX) as the deposit remark/reference.',
      displayOrder: 1,
    },
    {
      id: 'bank-2',
      bankName: 'Hatton National Bank (HNB)',
      accountNumber: '023010098765',
      accountName: 'Preethi Jayasinghe',
      branchName: 'Cinnamon Gardens Branch',
      bankLogo: 'hnb',
      swiftCode: 'HBLILKLX',
      isActive: true,
      instructions: 'Online banking or CDM deposit accepted. Please send the transfer slip for fast dispatch.',
      displayOrder: 2,
    },
  ],
  comingSoonMode: {
    enabled: false,
    headline: 'Something Rare & Sacred Is Unfolding.',
    subheadline: 'A sanctuary dedicated to the art of dressing women. Thoughtfully handcrafted silhouettes, timeless heirloom drapes, and bespoke made-to-measure creations designed to celebrate your individuality and grace.',
    targetLaunchDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    secretPasscode: 'azhai2026',
    privilegeDiscountCode: 'AZHAI-VIP10',
  },
};

function getInitialSettings(): StoreSettings {
  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem('azhai_store_settings_custom');
      if (custom) {
        return { ...INITIAL_SETTINGS, ...JSON.parse(custom) };
      }
    } catch {
      // fallback
    }
  }
  return INITIAL_SETTINGS;
}

const INITIAL_CUSTOMERS: CustomerRecord[] = [];

const INITIAL_ORDERS: AdminOrder[] = [];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      adminUser: null,
      isAdminAuthenticated: false,
      orders: INITIAL_ORDERS,
      products: PRODUCTS,
      categories: COLLECTIONS,
      tags: INITIAL_TAGS,
      coupons: INITIAL_COUPONS,
      customers: INITIAL_CUSTOMERS,
      settings: getInitialSettings(),

      // Tailoring initial state
      dressTypes: DEFAULT_DRESS_TYPES,
      tailoringFabrics: DEFAULT_FABRICS,
      measurementFields: DEFAULT_MEASUREMENT_FIELDS,
      sizePresets: DEFAULT_SIZE_PRESETS,

      fetchSupabaseData: async () => {
        if (!isSupabaseConfigured()) return;
        try {
          // 1. Fetch Categories
          const { data: dbCategories } = await supabase.from('categories').select('*').order('id', { ascending: true });
          if (dbCategories && dbCategories.length > 0) {
            const currentCats = get().categories || [];
            set({
              categories: dbCategories.map((c) => {
                const existing = currentCats.find((ec) => ec.id === c.id || ec.slug === c.slug);
                const isFeaturedVal = 
                  c.is_featured !== undefined && c.is_featured !== null 
                    ? Boolean(c.is_featured) 
                    : (existing?.isFeatured !== undefined ? existing.isFeatured : true);

                return {
                  id: c.id,
                  name: c.name,
                  slug: c.slug,
                  description: c.description || '',
                  heroImage: c.hero_image || '',
                  count: c.count || 0,
                  season: c.season || undefined,
                  tagline: c.tagline || undefined,
                  isFeatured: isFeaturedVal,
                };
              }),
            });
          }

          // 2. Fetch Products
          const { data: dbProducts } = await supabase.from('products').select('*').order('id', { ascending: true });
          if (dbProducts && dbProducts.length > 0) {
            set({
              products: dbProducts.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: p.price,
                regularPrice: p.regular_price,
                salePrice: p.sale_price || undefined,
                description: p.description,
                shortDescription: p.short_description,
                stylingTip: p.styling_tip || undefined,
                fabricYarn: p.fabric_yarn || undefined,
                craftedFor: p.crafted_for || undefined,
                careGuide: p.care_guide || undefined,
                shippingNote: p.shipping_note || undefined,
                pairingProductIds: p.pairing_product_ids || undefined,
                images: p.images || [],
                categories: p.categories || [],
                attributes: p.attributes || [],
                isFeatured: p.is_featured,
                tag: p.tag || undefined,
                stockQuantity: p.stock_quantity !== undefined && p.stock_quantity !== null ? Number(p.stock_quantity) : 15,
                weightGrams: p.weight_grams !== undefined && p.weight_grams !== null ? Number(p.weight_grams) : 400,
                rating: Number(p.rating) || 5.0,
                reviewsCount: p.reviews_count || 0,
              })),
            });
          }

          // 3. Fetch Tags
          const { data: dbTags } = await supabase.from('tags').select('*').order('id', { ascending: true });
          if (dbTags && dbTags.length > 0) {
            set({ tags: dbTags.map((t) => t.name) });
          }

          // 4. Fetch Coupons
          const { data: dbCoupons } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
          if (dbCoupons && dbCoupons.length > 0) {
            set({
              coupons: dbCoupons.map((c) => ({
                id: c.id,
                code: c.code,
                discountType: c.discount_type,
                value: Number(c.value),
                minSpend: c.min_spend ? Number(c.min_spend) : undefined,
                maxDiscount: c.max_discount ? Number(c.max_discount) : undefined,
                usageCount: c.usage_count || 0,
                isActive: c.is_active,
                expiresAt: c.expires_at || undefined,
              })),
            });
          }

          // 5. Fetch Store Settings
          const { data: dbSettings } = await supabase.from('store_settings').select('*').eq('id', 1).single();
          if (dbSettings) {
            const current = get().settings;
            let localCustom: Partial<StoreSettings> | null = null;
            if (typeof window !== 'undefined') {
              try {
                const raw = localStorage.getItem('azhai_store_settings_custom');
                if (raw) localCustom = JSON.parse(raw);
              } catch {
                // ignore
              }
            }

            set({
              settings: {
                ...current,
                storeName: localCustom?.storeName || dbSettings.store_name || current.storeName,
                tagline: localCustom?.tagline || dbSettings.tagline || current.tagline,
                enableCOD: localCustom?.enableCOD ?? (dbSettings.enable_cod ?? current.enableCOD),
                maxCODAmount: Number(localCustom?.maxCODAmount ?? (dbSettings.max_cod_amount ?? current.maxCODAmount)),
                freeShippingThreshold: Number(localCustom?.freeShippingThreshold ?? (dbSettings.free_shipping_threshold ?? current.freeShippingThreshold)),
                standardShippingFee: Number(localCustom?.standardShippingFee ?? (dbSettings.standard_shipping_fee ?? current.standardShippingFee)),
                expressShippingFee: Number(localCustom?.expressShippingFee ?? (dbSettings.express_shipping_fee ?? current.expressShippingFee)),
                whatsappNumber: localCustom?.whatsappNumber || dbSettings.whatsapp_number || current.whatsappNumber,
                phoneNumber: localCustom?.phoneNumber || dbSettings.phone_number || current.phoneNumber,
                atelierAddress: localCustom?.atelierAddress || dbSettings.atelier_address || current.atelierAddress,
                announcementTicker: localCustom?.announcementTicker || dbSettings.announcement_ticker || current.announcementTicker,
                seo: localCustom?.seo || dbSettings.seo || current.seo,
                socialLinks: localCustom?.socialLinks || dbSettings.social_links || current.socialLinks,
                studio: localCustom?.studio || dbSettings.studio || current.studio,
                bankAccounts: localCustom?.bankAccounts || dbSettings.bank_accounts || current.bankAccounts || INITIAL_SETTINGS.bankAccounts,
              },
            });
          }

          // 6. Fetch Orders
          const { data: dbOrders, error: ordersFetchErr } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false });

          if (ordersFetchErr) {
            console.error('[Supabase Fetch Orders Error]:', ordersFetchErr);
          } else if (dbOrders) {
            const mappedOrders: AdminOrder[] = dbOrders.map((o: any) => ({
              orderId: o.order_code,
              items: (o.order_items || []).map((item: any) => ({
                id: item.product_id || 0,
                name: item.product_name,
                price: item.price,
                image: item.image_url || '',
                quantity: item.quantity,
                size: item.size,
              })),
              subtotal: Number(o.subtotal),
              discount: Number(o.discount || 0),
              shipping: Number(o.shipping || 0),
              total: Number(o.total),
              coupon: o.coupon_code || undefined,
              giftNote: o.gift_note || undefined,
              customer: o.customer_details,
              deliveryMethod: o.delivery_method,
              paymentMethod: o.payment_method,
              placedAt: o.created_at,
              status: o.status as OrderStatus,
              paymentStatus: o.payment_status,
              courierPartner: o.courier_partner || undefined,
              trackingNumber: o.tracking_number || undefined,
              adminNotes: o.admin_notes || undefined,
              bankTransferDetails: o.bank_transfer_details || undefined,
              costPrice: o.cost_price ? Number(o.cost_price) : Math.round(Number(o.subtotal) * 0.45),
            }));

            // Merge Supabase orders with local orders so nothing is lost
            const currentOrders = get().orders || [];
            const mergedMap = new Map<string, AdminOrder>();

            mappedOrders.forEach((o) => mergedMap.set(o.orderId, o));
            currentOrders.forEach((o) => {
              if (!mergedMap.has(o.orderId)) {
                mergedMap.set(o.orderId, o);
              }
            });

            set({ orders: Array.from(mergedMap.values()) });
          }

          // 7. Fetch Tailoring Tables (Safe with fallback)
          try {
            const { data: dbDressTypes } = await supabase.from('tailoring_dress_types').select('*').order('display_order', { ascending: true });
            if (dbDressTypes && dbDressTypes.length > 0) {
              set({
                dressTypes: dbDressTypes.map((dt: any) => ({
                  id: dt.id,
                  name: dt.name,
                  slug: dt.slug,
                  coverImage: dt.cover_image || dt.icon || '',
                  stitchingFee: Number(dt.stitching_fee || 0),
                  leadTime: dt.lead_time || '5–7 working days',
                  isActive: dt.is_active !== false,
                  displayOrder: Number(dt.display_order || 0),
                })),
              });
            }

            const { data: dbFabrics } = await supabase.from('tailoring_fabrics').select('*').order('display_order', { ascending: true });
            if (dbFabrics && dbFabrics.length > 0) {
              set({
                tailoringFabrics: dbFabrics.map((f: any) => ({
                  id: f.id,
                  name: f.name,
                  slug: f.slug,
                  swatchImage: f.swatch_image || '',
                  pricePerUnit: Number(f.price_per_unit || 0),
                  unit: f.unit || 'meter',
                  weight: f.weight || '',
                  compatibleDressTypeIds: Array.isArray(f.compatible_dress_type_ids) ? f.compatible_dress_type_ids : [1, 2, 3, 4, 5],
                  inStock: f.in_stock !== false,
                  displayOrder: Number(f.display_order || 0),
                })),
              });
            }

            const { data: dbFields } = await supabase.from('tailoring_measurement_fields').select('*').order('display_order', { ascending: true });
            if (dbFields && dbFields.length > 0) {
              set({
                measurementFields: dbFields.map((mf: any) => ({
                  id: mf.id,
                  dressTypeId: Number(mf.dress_type_id),
                  fieldName: mf.field_name,
                  fieldLabel: mf.field_label,
                  minValue: Number(mf.min_value || 0),
                  maxValue: Number(mf.max_value || 100),
                  displayOrder: Number(mf.display_order || 0),
                })),
              });
            }

            const { data: dbPresets } = await supabase.from('tailoring_size_presets').select('*');
            if (dbPresets && dbPresets.length > 0) {
              set({
                sizePresets: dbPresets.map((sp: any) => ({
                  id: sp.id,
                  dressTypeId: Number(sp.dress_type_id),
                  sizeLabel: sp.size_label,
                  measurements: sp.measurements || {},
                })),
              });
            }
          } catch (tailoringErr) {
            console.warn('[Tailoring Supabase Fetch]: Using local defaults', tailoringErr);
          }
        } catch (err) {
          console.error('[AdminStore Fetch Supabase Error]:', err);
        }
      },

      adminLogin: async (email, password, role = 'owner') => {
        const cleanEmail = email.trim().toLowerCase();
        const expectedEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@azhai.lk').trim().toLowerCase();
        const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'AzhaiAdmin@2026';
        if (cleanEmail === expectedEmail && password === expectedPassword) {
          const user: AdminUser = {
            id: 'adm_01',
            name: role === 'owner' ? 'Preethi' : 'Atelier Manager',
            email: cleanEmail,
            role,
          };
          set({ adminUser: user, isAdminAuthenticated: true });
          return { success: true };
        }
        return { success: false, error: 'Invalid admin credentials. Please verify your email and password.' };
      },

      adminLogout: () => {
        set({ adminUser: null, isAdminAuthenticated: false });
      },

      updateOrderStatus: async (orderId, status, courierPartner, trackingNumber, notes) => {
        set((state) => ({
          orders: state.orders.map((ord) => {
            if (ord.orderId !== orderId) return ord;
            return {
              ...ord,
              status,
              courierPartner: courierPartner || ord.courierPartner,
              trackingNumber: trackingNumber !== undefined ? trackingNumber : ord.trackingNumber,
              adminNotes: notes !== undefined ? notes : ord.adminNotes,
              paymentStatus: status === 'delivered' && ord.paymentStatus === 'pending_cod' ? 'paid' : ord.paymentStatus,
            };
          }),
        }));

        // Synchronize updated order status, tracking, and notes to localStorage auth store
        try {
          const authKey = 'azhai-auth-store-v2';
          const storedAuth = localStorage.getItem(authKey);
          if (storedAuth) {
            const parsed = JSON.parse(storedAuth);
            if (parsed?.state) {
              if (Array.isArray(parsed.state.orders)) {
                parsed.state.orders = parsed.state.orders.map((ord: any) => {
                  if (ord.orderId !== orderId) return ord;
                  return {
                    ...ord,
                    status,
                    courierPartner: courierPartner || ord.courierPartner,
                    trackingNumber: trackingNumber !== undefined ? trackingNumber : ord.trackingNumber,
                    adminNotes: notes !== undefined ? notes : ord.adminNotes,
                    paymentStatus: status === 'delivered' && ord.paymentStatus === 'pending_cod' ? 'paid' : ord.paymentStatus,
                  };
                });
              }

              if (Array.isArray(parsed.state.accounts)) {
                parsed.state.accounts = parsed.state.accounts.map((acc: any) => ({
                  ...acc,
                  orders: (acc.orders || []).map((ord: any) => {
                    if (ord.orderId !== orderId) return ord;
                    return {
                      ...ord,
                      status,
                      courierPartner: courierPartner || ord.courierPartner,
                      trackingNumber: trackingNumber !== undefined ? trackingNumber : ord.trackingNumber,
                      adminNotes: notes !== undefined ? notes : ord.adminNotes,
                      paymentStatus: status === 'delivered' && ord.paymentStatus === 'pending_cod' ? 'paid' : ord.paymentStatus,
                    };
                  }),
                }));
              }

              localStorage.setItem(authKey, JSON.stringify(parsed));
            }
          }
        } catch (syncErr) {
          console.warn('[Admin to Auth Order Sync Notice]:', syncErr);
        }

        if (isSupabaseConfigured()) {
          try {
            await supabase
              .from('orders')
              .update({
                status,
                courier_partner: courierPartner,
                tracking_number: trackingNumber,
                admin_notes: notes,
                payment_status: status === 'delivered' ? 'paid' : undefined,
                updated_at: new Date().toISOString(),
              })
              .eq('order_code', orderId);
          } catch (err) {
            console.error('[Supabase Order Update Error]:', err);
          }
        }
      },

      syncCustomerFromAuth: (user) => {
        set((state) => {
          const emailLower = user.email.toLowerCase().trim();
          const existingIndex = state.customers.findIndex((c) => c.email.toLowerCase().trim() === emailLower);
          
          if (existingIndex >= 0) {
            const updated = [...state.customers];
            updated[existingIndex] = {
              ...updated[existingIndex],
              fullName: user.fullName || updated[existingIndex].fullName,
              phone: user.phone || updated[existingIndex].phone,
              district: user.district || updated[existingIndex].district,
              city: user.city || updated[existingIndex].city,
            };
            return { customers: updated };
          }

          const newCustomer: CustomerRecord = {
            id: 'cust-' + Math.random().toString(36).substring(2, 8),
            fullName: user.fullName,
            email: emailLower,
            phone: user.phone || '',
            district: user.district || 'Colombo',
            city: user.city || 'Colombo',
            totalOrders: 0,
            totalSpent: 0,
            firstJoined: user.createdAt || new Date().toISOString(),
            vipTier: 'Standard',
            notes: 'Registered online patron account.',
          };

          return {
            customers: [newCustomer, ...state.customers],
          };
        });
      },

      syncNewOrder: (placedOrder) => {
        const isCOD = placedOrder.paymentMethod.toLowerCase().includes('cash on delivery') || placedOrder.paymentMethod.toLowerCase().includes('cod');
        const newAdminOrder: AdminOrder = {
          ...placedOrder,
          status: 'confirmed',
          paymentStatus: isCOD ? 'pending_cod' : 'paid',
          courierPartner: placedOrder.courierPartner || 'Sri Lanka Post',
          trackingNumber: placedOrder.trackingNumber,
          weightGrams: placedOrder.weightGrams,
          costPrice: Math.round(placedOrder.subtotal * 0.45),
        };

        set((state) => {
          const existing = state.orders.some((o) => o.orderId === placedOrder.orderId);
          if (existing) return state;

          const customerEmail = placedOrder.customer.email?.toLowerCase();
          const existingCustomer = state.customers.find((c) => c.email.toLowerCase() === customerEmail);
          let updatedCustomers = [...state.customers];

          if (existingCustomer) {
            updatedCustomers = updatedCustomers.map((c) =>
              c.id === existingCustomer.id
                ? {
                    ...c,
                    totalOrders: c.totalOrders + 1,
                    totalSpent: c.totalSpent + placedOrder.total,
                    lastOrderDate: new Date().toISOString(),
                    vipTier: c.totalSpent + placedOrder.total > 75000 ? 'Gold Patron' : 'Silver Patron',
                  }
                : c
            );
          } else if (placedOrder.customer.fullName) {
            updatedCustomers.push({
              id: 'cust-' + Math.random().toString(36).substring(2, 8),
              fullName: placedOrder.customer.fullName,
              email: placedOrder.customer.email || 'guest@azhai.lk',
              phone: placedOrder.customer.phone || '',
              district: placedOrder.customer.district || 'Colombo',
              city: placedOrder.customer.city || '',
              totalOrders: 1,
              totalSpent: placedOrder.total,
              firstJoined: new Date().toISOString(),
              lastOrderDate: new Date().toISOString(),
              vipTier: 'Standard',
            });
          }

          return {
            orders: [newAdminOrder, ...state.orders],
            customers: updatedCustomers,
          };
        });
      },

      addProduct: async (productData) => {
        const newId = Math.max(...get().products.map((p) => p.id), 100) + 1;
        const initialStock = productData.stockQuantity !== undefined ? Number(productData.stockQuantity) : 15;
        const initialWeight = productData.weightGrams !== undefined ? Number(productData.weightGrams) : 400;
        const newProduct: Product = {
          ...productData,
          stockQuantity: initialStock,
          quantity: initialStock,
          weightGrams: initialWeight,
          id: newId,
        };
        set((state) => ({ products: [newProduct, ...state.products] }));

        if (isSupabaseConfigured()) {
          try {
            await supabase.from('products').insert({
              id: newId,
              name: productData.name,
              slug: productData.slug,
              price: productData.price,
              regular_price: productData.regularPrice,
              sale_price: productData.salePrice || null,
              stock_quantity: initialStock,
              weight_grams: initialWeight,
              description: productData.description,
              short_description: productData.shortDescription,
              styling_tip: productData.stylingTip || null,
              fabric_yarn: productData.fabricYarn || null,
              crafted_for: productData.craftedFor || null,
              care_guide: productData.careGuide || null,
              shipping_note: productData.shippingNote || null,
              pairing_product_ids: productData.pairingProductIds || null,
              images: productData.images,
              attributes: productData.attributes,
              is_featured: productData.isFeatured || false,
              tag: productData.tag || null,
              occasion: productData.occasion || null,
              rating: productData.rating || 5.0,
              reviews_count: productData.reviewsCount || 0,
            });
          } catch (err) {
            console.error('[Supabase Product Insert Error]:', err);
          }
        }
      },

      updateProduct: async (id, updates) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));

        if (isSupabaseConfigured()) {
          try {
            const dbPayload: any = {};
            if (updates.name !== undefined) dbPayload.name = updates.name;
            if (updates.slug !== undefined) dbPayload.slug = updates.slug;
            if (updates.price !== undefined) dbPayload.price = updates.price;
            if (updates.regularPrice !== undefined) dbPayload.regular_price = updates.regularPrice;
            if (updates.salePrice !== undefined) dbPayload.sale_price = updates.salePrice;
            if (updates.stockQuantity !== undefined) dbPayload.stock_quantity = updates.stockQuantity;
            if (updates.weightGrams !== undefined) dbPayload.weight_grams = updates.weightGrams;
            if (updates.description !== undefined) dbPayload.description = updates.description;
            if (updates.shortDescription !== undefined) dbPayload.short_description = updates.shortDescription;
            if (updates.stylingTip !== undefined) dbPayload.styling_tip = updates.stylingTip;
            if (updates.fabricYarn !== undefined) dbPayload.fabric_yarn = updates.fabricYarn;
            if (updates.craftedFor !== undefined) dbPayload.crafted_for = updates.craftedFor;
            if (updates.careGuide !== undefined) dbPayload.care_guide = updates.careGuide;
            if (updates.shippingNote !== undefined) dbPayload.shipping_note = updates.shippingNote;
            if (updates.pairingProductIds !== undefined) dbPayload.pairing_product_ids = updates.pairingProductIds;
            if (updates.images !== undefined) dbPayload.images = updates.images;
            if (updates.attributes !== undefined) dbPayload.attributes = updates.attributes;
            if (updates.isFeatured !== undefined) dbPayload.is_featured = updates.isFeatured;
            if (updates.tag !== undefined) dbPayload.tag = updates.tag;
            if (updates.occasion !== undefined) dbPayload.occasion = updates.occasion;

            await supabase.from('products').update(dbPayload).eq('id', id);
          } catch (err) {
            console.error('[Supabase Product Update Error]:', err);
          }
        }
      },

      updateProductStock: (id, stockQuantity) => {
        const cleanQty = Math.max(0, Number(stockQuantity) || 0);
        get().updateProduct(id, { stockQuantity: cleanQty, quantity: cleanQty });
      },

      deleteProduct: async (id) => {
        set((state) => ({
          products: state.products.filter(
            (p) => Number(p.id) !== Number(id) && String(p.id) !== String(id)
          ),
        }));

        if (isSupabaseConfigured()) {
          try {
            await supabase.from('products').delete().eq('id', id);
          } catch (err) {
            console.error('[Supabase Product Delete Error]:', err);
          }
        }
      },

      // Category CRUD
      addCategory: async (categoryData) => {
        const newId = Math.max(...get().categories.map((c) => c.id), 0) + 1;
        const isFeatured = categoryData.isFeatured !== undefined ? categoryData.isFeatured : true;
        const newCat: Collection = {
          ...categoryData,
          id: newId,
          count: 0,
          isFeatured,
        };
        set((state) => ({ categories: [...state.categories, newCat] }));

        if (isSupabaseConfigured()) {
          try {
            await supabase.from('categories').insert({
              id: newId,
              name: categoryData.name,
              slug: categoryData.slug,
              description: categoryData.description,
              hero_image: categoryData.heroImage,
              count: 0,
              season: categoryData.season || 'Core Edit',
              tagline: categoryData.tagline || '',
              is_featured: isFeatured,
            });
          } catch (err) {
            console.error('[Supabase Category Insert Error]:', err);
          }
        }
      },

      updateCategory: async (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));

        if (isSupabaseConfigured()) {
          try {
            const dbPayload: any = {};
            if (updates.name !== undefined) dbPayload.name = updates.name;
            if (updates.slug !== undefined) dbPayload.slug = updates.slug;
            if (updates.description !== undefined) dbPayload.description = updates.description;
            if (updates.heroImage !== undefined) dbPayload.hero_image = updates.heroImage;
            if (updates.season !== undefined) dbPayload.season = updates.season;
            if (updates.tagline !== undefined) dbPayload.tagline = updates.tagline;
            if (updates.isFeatured !== undefined) dbPayload.is_featured = updates.isFeatured;

            await supabase.from('categories').update(dbPayload).eq('id', id);
          } catch (err) {
            console.error('[Supabase Category Update Error]:', err);
          }
        }
      },

      toggleCategoryFeatured: async (id) => {
        const target = get().categories.find((c) => c.id === id);
        if (!target) return;
        const newStatus = target.isFeatured !== undefined ? !target.isFeatured : false;

        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, isFeatured: newStatus } : c)),
        }));

        if (isSupabaseConfigured()) {
          try {
            await supabase.from('categories').update({ is_featured: newStatus }).eq('id', id);
          } catch (err) {
            console.error('[Supabase Toggle Category Featured Error]:', err);
          }
        }
      },

      deleteCategory: async (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));

        if (isSupabaseConfigured()) {
          try {
            await supabase.from('categories').delete().eq('id', id);
          } catch (err) {
            console.error('[Supabase Category Delete Error]:', err);
          }
        }
      },

      // Tag CRUD
      addTag: async (newTag) => {
        const trimmed = newTag.trim();
        if (!trimmed || get().tags.includes(trimmed)) return;
        set((state) => ({ tags: [...state.tags, trimmed] }));

        if (isSupabaseConfigured()) {
          try {
            const { data: currentTags } = await supabase.from('tags').select('id');
            const maxId = currentTags && currentTags.length > 0 ? Math.max(...currentTags.map(t => t.id)) : 0;
            await supabase.from('tags').insert({ id: maxId + 1, name: trimmed });
          } catch (err) {
            console.error('[Supabase Tag Insert Error]:', err);
          }
        }
      },

      deleteTag: async (tagToDelete) => {
        set((state) => ({
          tags: state.tags.filter((t) => t !== tagToDelete),
        }));

        if (isSupabaseConfigured()) {
          try {
            await supabase.from('tags').delete().eq('name', tagToDelete);
          } catch (err) {
            console.error('[Supabase Tag Delete Error]:', err);
          }
        }
      },

      addCoupon: async (couponData) => {
        const newCoupon: Coupon = {
          ...couponData,
          id: 'coup-' + Date.now(),
          usageCount: 0,
        };
        set((state) => ({ coupons: [newCoupon, ...state.coupons] }));

        if (isSupabaseConfigured()) {
          try {
            await supabase.from('coupons').insert({
              code: couponData.code.toUpperCase(),
              discount_type: couponData.discountType,
              value: couponData.value,
              min_spend: couponData.minSpend || null,
              max_discount: couponData.maxDiscount || null,
              is_active: couponData.isActive !== false,
              expires_at: couponData.expiresAt || null,
            });
          } catch (err) {
            console.error('[Supabase Coupon Insert Error]:', err);
          }
        }
      },

      toggleCoupon: async (id) => {
        const target = get().coupons.find((c) => c.id === id);
        const newStatus = target ? !target.isActive : true;

        set((state) => ({
          coupons: state.coupons.map((c) => (c.id === id ? { ...c, isActive: newStatus } : c)),
        }));

        if (isSupabaseConfigured() && target) {
          try {
            await supabase.from('coupons').update({ is_active: newStatus }).eq('code', target.code);
          } catch (err) {
            console.error('[Supabase Coupon Toggle Error]:', err);
          }
        }
      },

      deleteCoupon: async (id) => {
        const target = get().coupons.find((c) => c.id === id);
        set((state) => ({
          coupons: state.coupons.filter((c) => c.id !== id),
        }));

        if (isSupabaseConfigured() && target) {
          try {
            await supabase.from('coupons').delete().eq('code', target.code);
          } catch (err) {
            console.error('[Supabase Coupon Delete Error]:', err);
          }
        }
      },

      updateSettings: async (newSettings) => {
        let updated: StoreSettings;
        set((state) => {
          updated = { ...state.settings, ...newSettings };
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('azhai_store_settings_custom', JSON.stringify(updated));
              window.dispatchEvent(new CustomEvent('azhai:settings-updated', { detail: updated }));
            } catch (storageErr) {
              console.warn('LocalStorage save error:', storageErr);
            }
          }
          return { settings: updated };
        });

        if (isSupabaseConfigured()) {
          try {
            const dbPayload: any = {};
            if (newSettings.storeName !== undefined) dbPayload.store_name = newSettings.storeName;
            if (newSettings.tagline !== undefined) dbPayload.tagline = newSettings.tagline;
            if (newSettings.enableCOD !== undefined) dbPayload.enable_cod = newSettings.enableCOD;
            if (newSettings.maxCODAmount !== undefined) dbPayload.max_cod_amount = newSettings.maxCODAmount;
            if (newSettings.freeShippingThreshold !== undefined) dbPayload.free_shipping_threshold = newSettings.freeShippingThreshold;
            if (newSettings.standardShippingFee !== undefined) dbPayload.standard_shipping_fee = newSettings.standardShippingFee;
            if (newSettings.expressShippingFee !== undefined) dbPayload.express_shipping_fee = newSettings.expressShippingFee;
            if (newSettings.whatsappNumber !== undefined) dbPayload.whatsapp_number = newSettings.whatsappNumber;
            if (newSettings.phoneNumber !== undefined) dbPayload.phone_number = newSettings.phoneNumber;
            if (newSettings.atelierAddress !== undefined) dbPayload.atelier_address = newSettings.atelierAddress;
            if (newSettings.announcementTicker !== undefined) dbPayload.announcement_ticker = newSettings.announcementTicker;
            if (newSettings.seo !== undefined) dbPayload.seo = newSettings.seo;
            if (newSettings.socialLinks !== undefined) dbPayload.social_links = newSettings.socialLinks;
            if (newSettings.studio !== undefined) dbPayload.studio = newSettings.studio;
            if (newSettings.bankAccounts !== undefined) dbPayload.bank_accounts = newSettings.bankAccounts;

            const { error } = await supabase.from('store_settings').update(dbPayload).eq('id', 1);
            if (error) {
              // If unknown column in Supabase, update basic columns only
              const basicPayload: any = {};
              if (newSettings.storeName !== undefined) basicPayload.store_name = newSettings.storeName;
              if (newSettings.tagline !== undefined) basicPayload.tagline = newSettings.tagline;
              if (newSettings.enableCOD !== undefined) basicPayload.enable_cod = newSettings.enableCOD;
              if (newSettings.maxCODAmount !== undefined) basicPayload.max_cod_amount = newSettings.maxCODAmount;
              if (newSettings.freeShippingThreshold !== undefined) basicPayload.free_shipping_threshold = newSettings.freeShippingThreshold;
              if (newSettings.standardShippingFee !== undefined) basicPayload.standard_shipping_fee = newSettings.standardShippingFee;
              if (newSettings.expressShippingFee !== undefined) basicPayload.express_shipping_fee = newSettings.expressShippingFee;
              if (newSettings.whatsappNumber !== undefined) basicPayload.whatsapp_number = newSettings.whatsappNumber;
              if (newSettings.atelierAddress !== undefined) basicPayload.atelier_address = newSettings.atelierAddress;
              await supabase.from('store_settings').update(basicPayload).eq('id', 1);
            }
          } catch (err) {
            console.warn('[Supabase Settings Update]: Local store updated successfully', err);
          }
        }
      },

      toggleCOD: async (enabled) => {
        set((state) => ({
          settings: { ...state.settings, enableCOD: enabled },
        }));

        if (isSupabaseConfigured()) {
          try {
            await supabase.from('store_settings').update({ enable_cod: enabled }).eq('id', 1);
          } catch (err) {
            console.error('[Supabase Toggle COD Error]:', err);
          }
        }
      },

      // ── Tailoring Actions ──
      addDressType: async (dt) => {
        const newId = Date.now();
        const newDt: DressType = { ...dt, id: newId };
        set((state) => ({
          dressTypes: [...state.dressTypes, newDt],
        }));

        if (isSupabaseConfigured()) {
          try {
            const { data } = await supabase.from('tailoring_dress_types').insert({
              name: dt.name,
              slug: dt.slug,
              cover_image: dt.coverImage,
              stitching_fee: dt.stitchingFee,
              lead_time: dt.leadTime,
              is_active: dt.isActive,
              display_order: dt.displayOrder,
            }).select().single();

            if (data?.id) {
              set((state) => ({
                dressTypes: state.dressTypes.map((item) => (item.id === newId ? { ...item, id: data.id } : item)),
              }));
            }
          } catch (err) {
            console.error('[Supabase Dress Type Insert Error]:', err);
          }
        }
      },

      updateDressType: async (id, updates) => {
        set((state) => ({
          dressTypes: state.dressTypes.map((dt) => (dt.id === id ? { ...dt, ...updates } : dt)),
        }));

        if (isSupabaseConfigured()) {
          try {
            const dbPayload: any = {};
            if (updates.name !== undefined) dbPayload.name = updates.name;
            if (updates.slug !== undefined) dbPayload.slug = updates.slug;
            if (updates.coverImage !== undefined) dbPayload.cover_image = updates.coverImage;
            if (updates.stitchingFee !== undefined) dbPayload.stitching_fee = updates.stitchingFee;
            if (updates.leadTime !== undefined) dbPayload.lead_time = updates.leadTime;
            if (updates.isActive !== undefined) dbPayload.is_active = updates.isActive;
            if (updates.displayOrder !== undefined) dbPayload.display_order = updates.displayOrder;

            await supabase.from('tailoring_dress_types').update(dbPayload).eq('id', id);
          } catch (err) {
            console.error('[Supabase Dress Type Update Error]:', err);
          }
        }
      },

      deleteDressType: async (id) => {
        set((state) => ({
          dressTypes: state.dressTypes.filter((dt) => dt.id !== id),
        }));

        if (isSupabaseConfigured()) {
          try {
            await supabase.from('tailoring_dress_types').delete().eq('id', id);
          } catch (err) {
            console.error('[Supabase Dress Type Delete Error]:', err);
          }
        }
      },

      toggleDressTypeActive: async (id) => {
        const target = get().dressTypes.find((dt) => dt.id === id);
        if (!target) return;
        const newStatus = !target.isActive;

        set((state) => ({
          dressTypes: state.dressTypes.map((dt) => (dt.id === id ? { ...dt, isActive: newStatus } : dt)),
        }));

        if (isSupabaseConfigured()) {
          try {
            await supabase.from('tailoring_dress_types').update({ is_active: newStatus }).eq('id', id);
          } catch (err) {
            console.error('[Supabase Toggle Dress Type Error]:', err);
          }
        }
      },

      addTailoringFabric: async (fabric) => {
        const newId = Date.now();
        const newFabric: TailoringFabric = { ...fabric, id: newId };
        set((state) => ({
          tailoringFabrics: [...state.tailoringFabrics, newFabric],
        }));

        if (isSupabaseConfigured()) {
          try {
            const { data } = await supabase.from('tailoring_fabrics').insert({
              name: fabric.name,
              slug: fabric.slug,
              swatch_image: fabric.swatchImage,
              price_per_unit: fabric.pricePerUnit,
              unit: fabric.unit,
              weight: fabric.weight,
              compatible_dress_type_ids: fabric.compatibleDressTypeIds,
              in_stock: fabric.inStock,
              display_order: fabric.displayOrder,
            }).select().single();

            if (data?.id) {
              set((state) => ({
                tailoringFabrics: state.tailoringFabrics.map((item) => (item.id === newId ? { ...item, id: data.id } : item)),
              }));
            }
          } catch (err) {
            console.error('[Supabase Fabric Insert Error]:', err);
          }
        }
      },

      updateTailoringFabric: async (id, updates) => {
        set((state) => ({
          tailoringFabrics: state.tailoringFabrics.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        }));

        if (isSupabaseConfigured()) {
          try {
            const dbPayload: any = {};
            if (updates.name !== undefined) dbPayload.name = updates.name;
            if (updates.slug !== undefined) dbPayload.slug = updates.slug;
            if (updates.swatchImage !== undefined) dbPayload.swatch_image = updates.swatchImage;
            if (updates.pricePerUnit !== undefined) dbPayload.price_per_unit = updates.pricePerUnit;
            if (updates.unit !== undefined) dbPayload.unit = updates.unit;
            if (updates.weight !== undefined) dbPayload.weight = updates.weight;
            if (updates.compatibleDressTypeIds !== undefined) dbPayload.compatible_dress_type_ids = updates.compatibleDressTypeIds;
            if (updates.inStock !== undefined) dbPayload.in_stock = updates.inStock;
            if (updates.displayOrder !== undefined) dbPayload.display_order = updates.displayOrder;

            await supabase.from('tailoring_fabrics').update(dbPayload).eq('id', id);
          } catch (err) {
            console.error('[Supabase Fabric Update Error]:', err);
          }
        }
      },

      deleteTailoringFabric: async (id) => {
        set((state) => ({
          tailoringFabrics: state.tailoringFabrics.filter((f) => f.id !== id),
        }));

        if (isSupabaseConfigured()) {
          try {
            await supabase.from('tailoring_fabrics').delete().eq('id', id);
          } catch (err) {
            console.error('[Supabase Fabric Delete Error]:', err);
          }
        }
      },

      toggleFabricStock: async (id) => {
        const target = get().tailoringFabrics.find((f) => f.id === id);
        if (!target) return;
        const newStock = !target.inStock;

        set((state) => ({
          tailoringFabrics: state.tailoringFabrics.map((f) => (f.id === id ? { ...f, inStock: newStock } : f)),
        }));

        if (isSupabaseConfigured()) {
          try {
            await supabase.from('tailoring_fabrics').update({ in_stock: newStock }).eq('id', id);
          } catch (err) {
            console.error('[Supabase Toggle Fabric Stock Error]:', err);
          }
        }
      },

      addMeasurementField: async (field) => {
        const newId = Date.now();
        const newField: MeasurementField = { ...field, id: newId };
        set((state) => ({
          measurementFields: [...state.measurementFields, newField],
        }));

        if (isSupabaseConfigured()) {
          try {
            const { data } = await supabase.from('tailoring_measurement_fields').insert({
              dress_type_id: field.dressTypeId,
              field_name: field.fieldName,
              field_label: field.fieldLabel,
              min_value: field.minValue,
              max_value: field.maxValue,
              display_order: field.displayOrder,
            }).select().single();

            if (data?.id) {
              set((state) => ({
                measurementFields: state.measurementFields.map((item) => (item.id === newId ? { ...item, id: data.id } : item)),
              }));
            }
          } catch (err) {
            console.error('[Supabase Field Insert Error]:', err);
          }
        }
      },

      updateMeasurementField: async (id, updates) => {
        set((state) => ({
          measurementFields: state.measurementFields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        }));

        if (isSupabaseConfigured()) {
          try {
            const dbPayload: any = {};
            if (updates.fieldName !== undefined) dbPayload.field_name = updates.fieldName;
            if (updates.fieldLabel !== undefined) dbPayload.field_label = updates.fieldLabel;
            if (updates.minValue !== undefined) dbPayload.min_value = updates.minValue;
            if (updates.maxValue !== undefined) dbPayload.max_value = updates.maxValue;
            if (updates.displayOrder !== undefined) dbPayload.display_order = updates.displayOrder;

            await supabase.from('tailoring_measurement_fields').update(dbPayload).eq('id', id);
          } catch (err) {
            console.error('[Supabase Field Update Error]:', err);
          }
        }
      },

      deleteMeasurementField: async (id) => {
        set((state) => ({
          measurementFields: state.measurementFields.filter((f) => f.id !== id),
        }));

        if (isSupabaseConfigured()) {
          try {
            await supabase.from('tailoring_measurement_fields').delete().eq('id', id);
          } catch (err) {
            console.error('[Supabase Field Delete Error]:', err);
          }
        }
      },

      addSizePreset: async (preset) => {
        const newId = Date.now();
        const newPreset: SizePreset = { ...preset, id: newId };
        set((state) => ({
          sizePresets: [...state.sizePresets, newPreset],
        }));

        if (isSupabaseConfigured()) {
          try {
            const { data } = await supabase.from('tailoring_size_presets').insert({
              dress_type_id: preset.dressTypeId,
              size_label: preset.sizeLabel,
              measurements: preset.measurements,
            }).select().single();

            if (data?.id) {
              set((state) => ({
                sizePresets: state.sizePresets.map((item) => (item.id === newId ? { ...item, id: data.id } : item)),
              }));
            }
          } catch (err) {
            console.error('[Supabase Size Preset Insert Error]:', err);
          }
        }
      },

      updateSizePreset: async (id, updates) => {
        set((state) => ({
          sizePresets: state.sizePresets.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));

        if (isSupabaseConfigured()) {
          try {
            const dbPayload: any = {};
            if (updates.sizeLabel !== undefined) dbPayload.size_label = updates.sizeLabel;
            if (updates.measurements !== undefined) dbPayload.measurements = updates.measurements;

            await supabase.from('tailoring_size_presets').update(dbPayload).eq('id', id);
          } catch (err) {
            console.error('[Supabase Size Preset Update Error]:', err);
          }
        }
      },

      deleteSizePreset: async (id) => {
        set((state) => ({
          sizePresets: state.sizePresets.filter((p) => p.id !== id),
        }));

        if (isSupabaseConfigured()) {
          try {
            await supabase.from('tailoring_size_presets').delete().eq('id', id);
          } catch (err) {
            console.error('[Supabase Size Preset Delete Error]:', err);
          }
        }
      },

      // ── BANK ACCOUNTS & DIRECT DEPOSIT ACTIONS ──
      addBankAccount: (account) => {
        const newAccount: BankAccount = {
          ...account,
          id: `bank-${Date.now()}`,
          displayOrder: (get().settings.bankAccounts?.length || 0) + 1,
        };
        const updatedAccounts = [...(get().settings.bankAccounts || []), newAccount];
        get().updateSettings({ bankAccounts: updatedAccounts });
      },

      updateBankAccount: (id, updates) => {
        const updatedAccounts = (get().settings.bankAccounts || []).map((acc) =>
          acc.id === id ? { ...acc, ...updates } : acc
        );
        get().updateSettings({ bankAccounts: updatedAccounts });
      },

      deleteBankAccount: (id) => {
        const updatedAccounts = (get().settings.bankAccounts || []).filter((acc) => acc.id !== id);
        get().updateSettings({ bankAccounts: updatedAccounts });
      },

      toggleBankAccountActive: (id) => {
        const updatedAccounts = (get().settings.bankAccounts || []).map((acc) =>
          acc.id === id ? { ...acc, isActive: !acc.isActive } : acc
        );
        get().updateSettings({ bankAccounts: updatedAccounts });
      },

      uploadOrderBankSlip: (orderId, slipUrl, reference) => {
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.orderId === orderId) {
              return {
                ...o,
                bankTransferDetails: {
                  ...(o.bankTransferDetails as any),
                  slipUrl,
                  referenceNumber: reference || o.bankTransferDetails?.referenceNumber,
                  submittedAt: new Date().toISOString(),
                },
              };
            }
            return o;
          }),
        }));

        // Also update in auth store local storage if patron has order stored
        try {
          const authKey = 'azhai-auth-store-v2';
          const raw = localStorage.getItem(authKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.state?.orders) {
              parsed.state.orders = parsed.state.orders.map((ord: any) => {
                if (ord.orderId === orderId) {
                  return {
                    ...ord,
                    bankTransferDetails: {
                      ...(ord.bankTransferDetails || {}),
                      slipUrl,
                      referenceNumber: reference || ord.bankTransferDetails?.referenceNumber,
                      submittedAt: new Date().toISOString(),
                    },
                  };
                }
                return ord;
              });
              localStorage.setItem(authKey, JSON.stringify(parsed));
            }
          }
        } catch {
          // ignore
        }
      },

      verifyBankTransferPayment: async (orderId, adminNotes) => {
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.orderId === orderId) {
              return {
                ...o,
                status: o.status === 'pending' ? 'confirmed' : o.status,
                paymentStatus: 'paid',
                adminNotes: adminNotes || o.adminNotes,
                bankTransferDetails: {
                  ...(o.bankTransferDetails as any),
                  verifiedAt: new Date().toISOString(),
                  verifiedBy: state.adminUser?.name || 'Preethi (Owner)',
                },
              };
            }
            return o;
          }),
        }));

        if (isSupabaseConfigured()) {
          try {
            await supabase
              .from('orders')
              .update({
                payment_status: 'paid',
                status: 'confirmed',
                admin_notes: adminNotes,
              })
              .eq('order_code', orderId);
          } catch (err) {
            console.error('[Supabase Verify Bank Payment Error]:', err);
          }
        }

        try {
          const authKey = 'azhai-auth-store-v2';
          const raw = localStorage.getItem(authKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.state?.orders) {
              parsed.state.orders = parsed.state.orders.map((ord: any) => {
                if (ord.orderId === orderId) {
                  return {
                    ...ord,
                    paymentStatus: 'paid',
                    status: ord.status === 'pending' ? 'confirmed' : ord.status,
                    bankTransferDetails: {
                      ...(ord.bankTransferDetails || {}),
                      verifiedAt: new Date().toISOString(),
                      verifiedBy: 'Atelier Admin',
                    },
                  };
                }
                return ord;
              });
              localStorage.setItem(authKey, JSON.stringify(parsed));
            }
          }
        } catch {
          // ignore
        }
      },
    }),
    {
      name: 'azhai-admin-store-v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Cross-tab synchronization so storefront tabs instantly reflect Admin updates
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'azhai-admin-store-v3') {
      useAdminStore.persist?.rehydrate();
    }
  });
}

