import { create } from 'zustand';
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

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  lastOrder: null,
  addItem: (item) => {
    const existing = get().items.find(i => {
      // For tailored items, match by dress type + fabric + size label
      if (item.tailoring && i.tailoring) {
        return (
          i.tailoring.dressTypeSlug === item.tailoring.dressTypeSlug &&
          i.tailoring.fabricName === item.tailoring.fabricName &&
          i.tailoring.sizeLabel === item.tailoring.sizeLabel
        );
      }
      // For regular items, match by id + size
      return i.id === item.id && i.size === item.size && !i.tailoring;
    });
    if (existing) {
      set(state => ({
        items: state.items.map(i => {
          if (item.tailoring && i.tailoring) {
            return (
              i.tailoring.dressTypeSlug === item.tailoring.dressTypeSlug &&
              i.tailoring.fabricName === item.tailoring.fabricName &&
              i.tailoring.sizeLabel === item.tailoring.sizeLabel
            ) ? { ...i, quantity: i.quantity + item.quantity } : i;
          }
          return (i.id === item.id && i.size === item.size && !i.tailoring)
            ? { ...i, quantity: i.quantity + item.quantity }
            : i;
        }),
        isOpen: true,
      }));
    } else {
      set(state => ({ items: [...state.items, item], isOpen: true }));
    }
  },
  removeItem: (id, size) =>
    set(state => ({ items: state.items.filter(i => !(i.id === id && i.size === size)) })),
  updateQuantity: (id, size, qty) =>
    set(state => ({
      items: state.items.map(i =>
        i.id === id && i.size === size ? { ...i, quantity: Math.max(1, qty) } : i
      ),
    })),
  toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
  setCartOpen: (open) => set({ isOpen: open }),
  clearCart: () => set({ items: [] }),
  setLastOrder: (order) => set({ lastOrder: order }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () =>
    get().items.reduce((sum, i) => {
      // For tailored items, use fabricPrice + stitchingFee
      if (i.tailoring) {
        return sum + (i.tailoring.fabricPrice + i.tailoring.stitchingFee) * i.quantity;
      }
      // For regular items, parse from price string
      const num = parseInt(i.price.replace(/[^0-9]/g, '')) || 0;
      return sum + num * i.quantity;
    }, 0),
}));

