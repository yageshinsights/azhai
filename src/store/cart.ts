import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TailoringCartData } from '@/lib/tailoring';

export interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
  size?: string;
  tailoring?: TailoringCartData; // Present only for custom tailored items
}

export interface PlacedOrder {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon?: string;
  giftNote?: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    postalCode: string;
  };
  deliveryMethod: string;
  paymentMethod: string;
  placedAt: string;
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  courierPartner?: string;
  trackingNumber?: string;
  weightGrams?: number;
  shippingBreakdown?: {
    postageFee?: number;
    moneyOrderCommission?: number;
    serviceCharge?: number;
    totalShippingFee?: number;
    isCOD?: boolean;
    totalWeightGrams?: number;
    deliveryTimeline?: string;
  };
  adminNotes?: string;
  paymentStatus?: 'paid' | 'pending_cod' | 'pending_bank' | 'refunded';
  bankTransferDetails?: {
    bankId?: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    branchName?: string;
    bankLogo?: string;
    swiftCode?: string;
    slipUrl?: string;
    referenceNumber?: string;
    depositedAt?: string;
    submittedAt?: string;
    verifiedAt?: string;
    verifiedBy?: string;
    notes?: string;
  };
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  lastOrder: PlacedOrder | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: number, size?: string) => void;
  updateQuantity: (id: number, size: string | undefined, qty: number) => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  clearCart: () => void;
  setLastOrder: (order: PlacedOrder) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      lastOrder: null,
      addItem: (item) => {
        const qtyToAdd = Math.max(1, Math.round(item.quantity || 1));
        const cleanItem = { ...item, quantity: qtyToAdd };

        const existing = get().items.find((i) => {
          // For tailored items, match by dress type + fabric + size label + measurements
          if (cleanItem.tailoring && i.tailoring) {
            if (cleanItem.tailoring.sizeLabel !== 'Custom') {
              return (
                i.tailoring.dressTypeSlug === cleanItem.tailoring.dressTypeSlug &&
                i.tailoring.fabricName === cleanItem.tailoring.fabricName &&
                i.tailoring.sizeLabel === cleanItem.tailoring.sizeLabel
              );
            }
            return (
              i.tailoring.dressTypeSlug === cleanItem.tailoring.dressTypeSlug &&
              i.tailoring.fabricName === cleanItem.tailoring.fabricName &&
              i.tailoring.sizeLabel === cleanItem.tailoring.sizeLabel &&
              JSON.stringify(i.tailoring.measurements) === JSON.stringify(cleanItem.tailoring.measurements)
            );
          }
          // For regular items, match by id + size
          return i.id === cleanItem.id && i.size === cleanItem.size && !i.tailoring;
        });

        if (existing) {
          set((state) => ({
            items: state.items.map((i) => {
              if (cleanItem.tailoring && i.tailoring) {
                const isMatch =
                  cleanItem.tailoring.sizeLabel !== 'Custom'
                    ? i.tailoring.dressTypeSlug === cleanItem.tailoring.dressTypeSlug &&
                      i.tailoring.fabricName === cleanItem.tailoring.fabricName &&
                      i.tailoring.sizeLabel === cleanItem.tailoring.sizeLabel
                    : i.tailoring.dressTypeSlug === cleanItem.tailoring.dressTypeSlug &&
                      i.tailoring.fabricName === cleanItem.tailoring.fabricName &&
                      i.tailoring.sizeLabel === cleanItem.tailoring.sizeLabel &&
                      JSON.stringify(i.tailoring.measurements) === JSON.stringify(cleanItem.tailoring.measurements);
                return isMatch ? { ...i, quantity: i.quantity + qtyToAdd } : i;
              }
              return i.id === cleanItem.id && i.size === cleanItem.size && !i.tailoring
                ? { ...i, quantity: i.quantity + qtyToAdd }
                : i;
            }),
            isOpen: true,
          }));
        } else {
          set((state) => ({ items: [...state.items, cleanItem], isOpen: true }));
        }
      },
      removeItem: (id, size) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && (size === undefined || i.size === size))),
        })),
      updateQuantity: (id, size, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && (size === undefined || i.size === size)
              ? { ...i, quantity: Math.max(1, Math.round(qty)) }
              : i
          ),
        })),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (open) => set({ isOpen: open }),
      clearCart: () => set({ items: [] }),
      setLastOrder: (order) => set({ lastOrder: order }),
      totalItems: () => get().items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => {
          // For tailored items, use fabricPrice + stitchingFee
          if (i.tailoring) {
            const tailoringPrice =
              (Number(i.tailoring.fabricPrice) || 0) + (Number(i.tailoring.stitchingFee) || 0);
            return sum + tailoringPrice * (Number(i.quantity) || 1);
          }
          // For regular items, parse from price string safely without inflating decimals
          const cleanPriceStr = (i.price || '').replace(/[^0-9.]/g, '');
          const num = Math.round(parseFloat(cleanPriceStr)) || 0;
          return sum + num * (Number(i.quantity) || 1);
        }, 0),
    }),
    {
      name: 'azhai-cart-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        lastOrder: state.lastOrder,
      }),
    }
  )
);
