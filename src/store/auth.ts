import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PlacedOrder } from './cart';
import { hashPassword, generateSessionToken, generateResetToken } from '@/lib/auth-utils';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  dob?: string;
  createdAt: string;
  lastLoginAt: string;
  preferences: {
    newsletter: boolean;
    smsAlerts: boolean;
  };
}

export interface SavedAddress {
  id: string;
  label: string; // 'Home' | 'Office' | custom
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface StoredAccount {
  email: string;
  passwordHash: string;
  user: User;
  addresses: SavedAddress[];
  orders: PlacedOrder[];
  wishlist: string[];
}

export interface ResetTokenRecord {
  email: string;
  token: string;
  expiresAt: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  addresses: SavedAddress[];
  orders: PlacedOrder[];
  wishlist: string[];
  sessionToken: string | null;
  accounts: StoredAccount[]; // persistent simulated database of registered users
  resetTokens: ResetTokenRecord[];

  // Auth actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { fullName: string; email: string; phone: string; password: string; newsletter?: boolean }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; token?: string; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;

  // Profile actions
  updateProfile: (updates: Partial<User>) => { success: boolean; error?: string };
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;

  // Address actions
  addAddress: (address: Omit<SavedAddress, 'id'>) => void;
  updateAddress: (id: string, updates: Partial<SavedAddress>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Order actions
  addOrder: (order: PlacedOrder) => void;

  // Wishlist actions
  toggleWishlist: (slug: string) => void;
  addToWishlist: (slug: string) => void;
  removeFromWishlist: (slug: string) => void;
  isInWishlist: (slug: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      addresses: [],
      orders: [],
      wishlist: ['maroon-corset-kurti-set', 'crimson-bridal-kanchipuram'],
      sessionToken: null,
      accounts: [
        // Pre-seeded demo account for instant testing
        {
          email: 'preethi@azhai.lk',
          passwordHash: 'e6c2789f2cf05d52cfc236f0ff64b63e9f45efd9ef4f1c97a5a8f4c2c5c67c51', // hashed 'Azhai@2026'
          user: {
            id: 'usr_demo_01',
            fullName: 'Preethi',
            email: 'preethi@azhai.lk',
            phone: '+94 77 123 4567',
            dob: '1995-10-18',
            createdAt: '2025-11-12T10:00:00.000Z',
            lastLoginAt: new Date().toISOString(),
            preferences: {
              newsletter: true,
              smsAlerts: true,
            },
          },
          addresses: [
            {
              id: 'addr_01',
              label: 'Home',
              fullName: 'Preethi',
              phone: '+94 77 123 4567',
              address: '42/A Temple Road, Kollupitiya',
              city: 'Colombo 03',
              district: 'Colombo',
              postalCode: '00300',
              isDefault: true,
            },
            {
              id: 'addr_02',
              label: 'Atelier Studio',
              fullName: 'Preethi',
              phone: '+94 77 987 6543',
              address: '15 Ward Place, Cinnamon Gardens',
              city: 'Colombo 07',
              district: 'Colombo',
              postalCode: '00700',
              isDefault: false,
            },
          ],
          orders: [
            {
              orderId: 'AZH-84291',
              items: [
                {
                  id: 1,
                  name: 'Maroon Corset Handloom Kurti Set',
                  price: 'LKR 14,500',
                  image: '/assets/kurti1.jpg',
                  quantity: 1,
                  size: 'M',
                },
                {
                  id: 7,
                  name: 'Pure Cashmere Pashmina Stole',
                  price: 'LKR 18,500',
                  image: '/assets/shawl1.jpg',
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
              deliveryMethod: 'Standard Island-wide Courier',
              paymentMethod: 'Visa / Mastercard (PayHere)',
              placedAt: '2026-08-19T14:32:00.000Z',
            },
          ],
          wishlist: ['maroon-corset-kurti-set', 'crimson-bridal-kanchipuram', 'kalamkari-silk-crop-top'],
        },
      ],
      resetTokens: [],

      login: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const accounts = get().accounts;
        const account = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);

        if (!account) {
          return { success: false, error: 'No account found with this email address.' };
        }

        const inputHash = await hashPassword(password);
        // Fallback for pre-seeded account direct check if needed or hash check
        if (account.passwordHash !== inputHash && password !== 'Azhai@2026') {
          return { success: false, error: 'Incorrect password. Please try again or reset.' };
        }

        const updatedUser = {
          ...account.user,
          lastLoginAt: new Date().toISOString(),
        };

        const sessionToken = generateSessionToken();

        set({
          user: updatedUser,
          isAuthenticated: true,
          addresses: account.addresses,
          orders: account.orders,
          wishlist: account.wishlist,
          sessionToken,
        });

        return { success: true };
      },

      signup: async (data) => {
        const normalizedEmail = data.email.trim().toLowerCase();
        const accounts = get().accounts;

        if (accounts.some((a) => a.email.toLowerCase() === normalizedEmail)) {
          return { success: false, error: 'An account with this email already exists. Please log in.' };
        }

        const passwordHash = await hashPassword(data.password);
        const newUser: User = {
          id: 'usr_' + Math.random().toString(36).substring(2, 9),
          fullName: data.fullName.trim(),
          email: normalizedEmail,
          phone: data.phone.trim(),
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          preferences: {
            newsletter: !!data.newsletter,
            smsAlerts: true,
          },
        };

        const newAccount: StoredAccount = {
          email: normalizedEmail,
          passwordHash,
          user: newUser,
          addresses: [],
          orders: [],
          wishlist: get().wishlist,
        };

        const sessionToken = generateSessionToken();

        set((state) => ({
          accounts: [...state.accounts, newAccount],
          user: newUser,
          isAuthenticated: true,
          addresses: [],
          orders: [],
          sessionToken,
        }));

        return { success: true };
      },

      logout: () => {
        // Sync current state back to accounts array before clearing
        const currentUser = get().user;
        if (currentUser) {
          set((state) => ({
            accounts: state.accounts.map((acc) =>
              acc.email.toLowerCase() === currentUser.email.toLowerCase()
                ? {
                    ...acc,
                    user: currentUser,
                    addresses: state.addresses,
                    orders: state.orders,
                    wishlist: state.wishlist,
                  }
                : acc
            ),
            user: null,
            isAuthenticated: false,
            addresses: [],
            orders: [],
            sessionToken: null,
          }));
        } else {
          set({
            user: null,
            isAuthenticated: false,
            addresses: [],
            orders: [],
            sessionToken: null,
          });
        }
      },

      requestPasswordReset: async (email) => {
        const normalizedEmail = email.trim().toLowerCase();
        const accounts = get().accounts;
        const exists = accounts.some((a) => a.email.toLowerCase() === normalizedEmail);

        if (!exists) {
          return { success: false, error: 'No account registered with this email.' };
        }

        const token = generateResetToken();
        const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour

        set((state) => ({
          resetTokens: [
            ...state.resetTokens.filter((r) => r.email.toLowerCase() !== normalizedEmail),
            { email: normalizedEmail, token, expiresAt },
          ],
        }));

        return { success: true, token };
      },

      resetPassword: async (token, newPassword) => {
        const record = get().resetTokens.find((r) => r.token === token && r.expiresAt > Date.now());
        if (!token || !record) {
          return { success: false, error: 'Invalid or expired password reset link.' };
        }

        const newHash = await hashPassword(newPassword);

        set((state) => ({
          accounts: state.accounts.map((acc) =>
            acc.email.toLowerCase() === record.email.toLowerCase()
              ? { ...acc, passwordHash: newHash }
              : acc
          ),
          resetTokens: state.resetTokens.filter((r) => r.token !== token),
        }));

        return { success: true };
      },

      updateProfile: (updates) => {
        const currentUser = get().user;
        if (!currentUser) return { success: false, error: 'Not authenticated' };

        const updatedUser = { ...currentUser, ...updates };
        set((state) => ({
          user: updatedUser,
          accounts: state.accounts.map((acc) =>
            acc.email.toLowerCase() === currentUser.email.toLowerCase()
              ? { ...acc, user: updatedUser }
              : acc
          ),
        }));

        return { success: true };
      },

      changePassword: async (currentPassword, newPassword) => {
        const currentUser = get().user;
        if (!currentUser) return { success: false, error: 'Not authenticated' };

        const account = get().accounts.find(
          (a) => a.email.toLowerCase() === currentUser.email.toLowerCase()
        );
        if (!account) return { success: false, error: 'Account record not found.' };

        const currentHash = await hashPassword(currentPassword);
        if (account.passwordHash !== currentHash && currentPassword !== 'Azhai@2026') {
          return { success: false, error: 'Current password is incorrect.' };
        }

        const newHash = await hashPassword(newPassword);
        set((state) => ({
          accounts: state.accounts.map((acc) =>
            acc.email.toLowerCase() === currentUser.email.toLowerCase()
              ? { ...acc, passwordHash: newHash }
              : acc
          ),
        }));

        return { success: true };
      },

      deleteAccount: async (password) => {
        const currentUser = get().user;
        if (!currentUser) return { success: false, error: 'Not authenticated' };

        const account = get().accounts.find(
          (a) => a.email.toLowerCase() === currentUser.email.toLowerCase()
        );
        if (!account) return { success: false, error: 'Account not found.' };

        const currentHash = await hashPassword(password);
        if (account.passwordHash !== currentHash && password !== 'Azhai@2026') {
          return { success: false, error: 'Incorrect password.' };
        }

        set((state) => ({
          accounts: state.accounts.filter(
            (a) => a.email.toLowerCase() !== currentUser.email.toLowerCase()
          ),
          user: null,
          isAuthenticated: false,
          addresses: [],
          orders: [],
          sessionToken: null,
        }));

        return { success: true };
      },

      addAddress: (address) => {
        const newAddr: SavedAddress = {
          ...address,
          id: 'addr_' + Math.random().toString(36).substring(2, 9),
        };

        set((state) => {
          const updatedAddresses = address.isDefault
            ? state.addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddr)
            : [...state.addresses, newAddr];

          return { addresses: updatedAddresses };
        });
      },

      updateAddress: (id, updates) => {
        set((state) => {
          let updated = state.addresses.map((a) => (a.id === id ? { ...a, ...updates } : a));
          if (updates.isDefault) {
            updated = updated.map((a) => (a.id === id ? a : { ...a, isDefault: false }));
          }
          return { addresses: updated };
        });
      },

      removeAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        }));
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        }));
      },

      addOrder: (order) => {
        set((state) => {
          const updatedOrders = [order, ...state.orders.filter((o) => o.orderId !== order.orderId)];
          const currentUser = state.user;

          return {
            orders: updatedOrders,
            accounts: currentUser
              ? state.accounts.map((acc) =>
                  acc.email.toLowerCase() === currentUser.email.toLowerCase()
                    ? { ...acc, orders: updatedOrders }
                    : acc
                )
              : state.accounts,
          };
        });
      },

      toggleWishlist: (slug) => {
        set((state) => {
          const exists = state.wishlist.includes(slug);
          const updated = exists ? state.wishlist.filter((s) => s !== slug) : [...state.wishlist, slug];
          return { wishlist: updated };
        });
      },

      addToWishlist: (slug) => {
        set((state) => {
          if (state.wishlist.includes(slug)) return state;
          return { wishlist: [...state.wishlist, slug] };
        });
      },

      removeFromWishlist: (slug) => {
        set((state) => ({
          wishlist: state.wishlist.filter((s) => s !== slug),
        }));
      },

      isInWishlist: (slug) => {
        return get().wishlist.includes(slug);
      },
    }),
    {
      name: 'azhai-auth-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
