import { create } from 'zustand';

export interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
  size?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: number, size?: string) => void;
  updateQuantity: (id: number, size: string | undefined, qty: number) => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  addItem: (item) => {
    const existing = get().items.find(i => i.id === item.id && i.size === item.size);
    if (existing) {
      set(state => ({
        items: state.items.map(i =>
          i.id === item.id && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
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
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () =>
    get().items.reduce((sum, i) => {
      const num = parseInt(i.price.replace(/[^0-9]/g, '')) || 0;
      return sum + num * i.quantity;
    }, 0),
}));
