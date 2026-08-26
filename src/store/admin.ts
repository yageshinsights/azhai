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
  paymentStatus: 'paid' | 'pending_cod' | 'refunded';
  courierPartner?: 'PromptX' | 'Koombiyo' | 'Citypak' | 'Domex' | 'Atelier Express';
  trackingNumber?: string;
  adminNotes?: string;
  costPrice?: number;
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
  lastOrderDate: string;
  vipTier: 'Gold Patron' | 'Silver Patron' | 'Standard';
  notes?: string;
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
  atelierAddress: string;
  announcementTicker: {
    enabled: boolean;
    text: string;
    link?: string;
  };
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
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
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
    usageCount: 42,
    isActive: true,
    expiresAt: '2026-12-31',
  },
  {
    id: 'coup-2',
    code: 'CEYLON1000',
    discountType: 'fixed',
    value: 1000,
    minSpend: 15000,
    usageCount: 19,
    isActive: true,
    expiresAt: '2026-10-31',
  },
  {
    id: 'coup-3',
    code: 'AVURUDU2026',
    discountType: 'percentage',
    value: 15,
    minSpend: 25000,
    usageCount: 0,
    isActive: true,
    expiresAt: '2026-04-30',
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
  atelierAddress: '42/A Temple Road, Kollupitiya, Colombo 03, Sri Lanka',
  announcementTicker: {
    enabled: true,
    text: '✨ Festive Drop Live: Complimentary Island-wide Delivery on Orders over LKR 15,000 | Use Code AZHAI10',
    link: '/collections',
  },
};

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-1',
    fullName: 'Preethi',
    email: 'preethi@azhai.lk',
    phone: '+94 77 123 4567',
    district: 'Colombo',
    city: 'Colombo 03',
    totalOrders: 3,
    totalSpent: 84500,
    firstJoined: '2025-11-12T10:00:00.000Z',
    lastOrderDate: '2026-08-19T14:32:00.000Z',
    vipTier: 'Gold Patron',
    notes: 'Prefers same-day Colombo dispatch with gift wrapping.',
  },
  {
    id: 'cust-2',
    fullName: 'Ananya Senanayake',
    email: 'ananya.s@outlook.com',
    phone: '+94 71 889 2341',
    district: 'Colombo',
    city: 'Colombo 07',
    totalOrders: 2,
    totalSpent: 48000,
    firstJoined: '2026-01-15T12:00:00.000Z',
    lastOrderDate: '2026-08-14T09:15:00.000Z',
    vipTier: 'Silver Patron',
    notes: 'Bridal party client for October 2026 wedding.',
  },
  {
    id: 'cust-3',
    fullName: 'Tharushi Wickramasinghe',
    email: 'tharushi.w@gmail.com',
    phone: '+94 77 445 6789',
    district: 'Kandy',
    city: 'Kandy City',
    totalOrders: 1,
    totalSpent: 29500,
    firstJoined: '2026-07-20T16:45:00.000Z',
    lastOrderDate: '2026-07-20T16:45:00.000Z',
    vipTier: 'Standard',
  },
];

const INITIAL_ORDERS: AdminOrder[] = [
  {
    orderId: 'AZH-84291',
    items: [
      {
        id: 101,
        name: 'Maroon Corset Handloom Kurti Set',
        price: 'LKR 14,500',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=90',
        quantity: 1,
        size: 'M',
      },
      {
        id: 301,
        name: 'Pure Cashmere Pashmina Stole',
        price: 'LKR 18,500',
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=90',
        quantity: 1,
        size: 'Free Size',
      },
    ],
    subtotal: 33000,
    discount: 3300,
    shipping: 0,
    total: 29700,
    coupon: 'AZHAI10',
    customer: {
      fullName: 'Preethi',
      email: 'preethi@azhai.lk',
      phone: '+94 77 123 4567',
      address: '42/A Temple Road, Kollupitiya',
      city: 'Colombo 03',
      district: 'Colombo',
      postalCode: '00300',
    },
    deliveryMethod: 'Island-wide Standard Courier (1-3 Days)',
    paymentMethod: 'Visa / Mastercard (PayHere)',
    placedAt: '2026-08-19T14:32:00.000Z',
    status: 'processing',
    paymentStatus: 'paid',
    courierPartner: 'PromptX',
    trackingNumber: 'PRX-849201LK',
    adminNotes: 'Packed in signature gold keepsake box.',
    costPrice: 14500,
  },
  {
    orderId: 'AZH-91823',
    items: [
      {
        id: 201,
        name: 'Crimson Bridal Kanchipuram Silk Saree',
        price: 'LKR 45,000',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=90',
        quantity: 1,
        size: 'Free Size',
      },
    ],
    subtotal: 45000,
    discount: 0,
    shipping: 0,
    total: 45000,
    customer: {
      fullName: 'Ananya Senanayake',
      email: 'ananya.s@outlook.com',
      phone: '+94 71 889 2341',
      address: 'No. 18, Ward Place',
      city: 'Colombo 07',
      district: 'Colombo',
      postalCode: '00700',
    },
    deliveryMethod: 'Express Same-Day Colombo',
    paymentMethod: 'Cash on Delivery (COD)',
    placedAt: '2026-08-21T11:20:00.000Z',
    status: 'confirmed',
    paymentStatus: 'pending_cod',
    courierPartner: 'Atelier Express',
    adminNotes: 'Customer requested 4:00 PM evening delivery window.',
    costPrice: 22000,
  },
  {
    orderId: 'AZH-77412',
    items: [
      {
        id: 401,
        name: 'Kalamkari Hand-Embroidered Silk Crop Top',
        price: 'LKR 9,500',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=90',
        quantity: 2,
        size: 'S',
      },
    ],
    subtotal: 19000,
    discount: 1000,
    shipping: 0,
    total: 18000,
    coupon: 'CEYLON1000',
    customer: {
      fullName: 'Tharushi Wickramasinghe',
      email: 'tharushi.w@gmail.com',
      phone: '+94 77 445 6789',
      address: '24 Hill Street',
      city: 'Kandy',
      district: 'Kandy',
      postalCode: '20000',
    },
    deliveryMethod: 'Island-wide Standard Courier (1-3 Days)',
    paymentMethod: 'Direct Bank Deposit',
    placedAt: '2026-08-22T17:40:00.000Z',
    status: 'shipped',
    paymentStatus: 'paid',
    courierPartner: 'Koombiyo',
    trackingNumber: 'KMB-77412LK',
    costPrice: 8200,
  },
];

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
      settings: INITIAL_SETTINGS,

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
                occasion: p.occasion || undefined,
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
            set({
              settings: {
                storeName: dbSettings.store_name,
                tagline: dbSettings.tagline,
                enableCOD: dbSettings.enable_cod,
                maxCODAmount: Number(dbSettings.max_cod_amount),
                freeShippingThreshold: Number(dbSettings.free_shipping_threshold),
                standardShippingFee: Number(dbSettings.standard_shipping_fee),
                expressShippingFee: Number(dbSettings.express_shipping_fee),
                whatsappNumber: dbSettings.whatsapp_number,
                atelierAddress: dbSettings.atelier_address,
                announcementTicker: dbSettings.announcement_ticker || {
                  enabled: true,
                  text: '✨ Complimentary Keepsake Box & Silk Pouch on Orders over LKR 15,000 | Island-wide Express Delivery',
                  link: '/collections',
                },
              },
            });
          }

          // 6. Fetch Orders
          const { data: dbOrders } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
          if (dbOrders && dbOrders.length > 0) {
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
              costPrice: o.cost_price ? Number(o.cost_price) : Math.round(Number(o.subtotal) * 0.45),
            }));

            set({ orders: mappedOrders });
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
        if (cleanEmail === 'admin@azhai.lk' && password === 'AzhaiAdmin@2026') {
          const user: AdminUser = {
            id: 'adm_01',
            name: role === 'owner' ? 'Preethi' : 'Atelier Manager',
            email: cleanEmail,
            role,
          };
          set({ adminUser: user, isAdminAuthenticated: true });
          return { success: true };
        }
        return { success: false, error: 'Invalid admin credentials. Please use admin@azhai.lk / AzhaiAdmin@2026' };
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

      syncNewOrder: (placedOrder) => {
        const isCOD = placedOrder.paymentMethod.toLowerCase().includes('cash on delivery') || placedOrder.paymentMethod.toLowerCase().includes('cod');
        const newAdminOrder: AdminOrder = {
          ...placedOrder,
          status: 'confirmed',
          paymentStatus: isCOD ? 'pending_cod' : 'paid',
          courierPartner: 'PromptX',
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
        const newProduct: Product = {
          ...productData,
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

      deleteProduct: async (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
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
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));

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
            if (newSettings.atelierAddress !== undefined) dbPayload.atelier_address = newSettings.atelierAddress;
            if (newSettings.announcementTicker !== undefined) dbPayload.announcement_ticker = newSettings.announcementTicker;

            await supabase.from('store_settings').update(dbPayload).eq('id', 1);
          } catch (err) {
            console.error('[Supabase Settings Update Error]:', err);
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
            await supabase.from('tailoring_dress_types').insert({
              name: dt.name,
              slug: dt.slug,
              cover_image: dt.coverImage,
              stitching_fee: dt.stitchingFee,
              lead_time: dt.leadTime,
              is_active: dt.isActive,
              display_order: dt.displayOrder,
            });
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
            await supabase.from('tailoring_fabrics').insert({
              name: fabric.name,
              slug: fabric.slug,
              swatch_image: fabric.swatchImage,
              price_per_unit: fabric.pricePerUnit,
              unit: fabric.unit,
              weight: fabric.weight,
              compatible_dress_type_ids: fabric.compatibleDressTypeIds,
              in_stock: fabric.inStock,
              display_order: fabric.displayOrder,
            });
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
            await supabase.from('tailoring_measurement_fields').insert({
              dress_type_id: field.dressTypeId,
              field_name: field.fieldName,
              field_label: field.fieldLabel,
              min_value: field.minValue,
              max_value: field.maxValue,
              display_order: field.displayOrder,
            });
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
            await supabase.from('tailoring_size_presets').insert({
              dress_type_id: preset.dressTypeId,
              size_label: preset.sizeLabel,
              measurements: preset.measurements,
            });
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
    }),
    {
      name: 'azhai-admin-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
