import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PlacedOrder } from './cart';
import { hashPassword, generateSessionToken, generateResetToken } from '@/lib/auth-utils';
import { useAdminStore } from './admin';

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

export interface FamilyMeasurementProfile {
  id: string;
  name: string; // e.g. "My Silhouette", "Amma's Saree Blouse", "Sister Priya"
  relationship: 'Self' | 'Mother' | 'Sister' | 'Daughter' | 'Friend' | 'Other';
  unit: 'inches' | 'cm';
  dressTypeSlug?: string;
  measurements: Record<string, number>; // in inches (canonical)
  notes?: string;
  isDefault?: boolean;
  updatedAt: string;
}

export interface StoredAccount {
  email: string;
  passwordHash: string;
  user: User;
  addresses: SavedAddress[];
  orders: PlacedOrder[];
  wishlist: string[];
  familyProfiles?: FamilyMeasurementProfile[];
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
  familyProfiles: FamilyMeasurementProfile[];
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

  // Family Measurement Fitting Vault actions
  addFamilyProfile: (profile: Omit<FamilyMeasurementProfile, 'id' | 'updatedAt'>) => void;
  updateFamilyProfile: (id: string, updates: Partial<FamilyMeasurementProfile>) => void;
  deleteFamilyProfile: (id: string) => void;
  setDefaultFamilyProfile: (id: string) => void;

  // Order actions
  addOrder: (order: PlacedOrder) => void;

  // Wishlist actions
  toggleWishlist: (slug: string) => void;
  addToWishlist: (slug: string) => void;
  removeFromWishlist: (slug: string) => void;
  cleanWishlist: (validSlugs: string[]) => void;
  isInWishlist: (slug: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      addresses: [],
      orders: [],
      wishlist: [],
      familyProfiles: [],
      sessionToken: null,
      accounts: [],
      resetTokens: [],

      login: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const accounts = get().accounts;
        const account = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);

        if (!account) {
          return { success: false, error: 'No account found with this email address.' };
        }

        const inputHash = await hashPassword(password);
        if (account.passwordHash !== inputHash) {
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
          addresses: account.addresses || [],
          orders: account.orders || [],
          wishlist: account.wishlist || [],
          familyProfiles: account.familyProfiles || [],
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
          familyProfiles: [],
        };

        const sessionToken = generateSessionToken();

        set((state) => ({
          accounts: [...state.accounts, newAccount],
          user: newUser,
          isAuthenticated: true,
          addresses: [],
          orders: [],
          familyProfiles: [],
          sessionToken,
        }));

        // Auto-sync new patron account to Admin CRM Registry
        try {
          useAdminStore.getState().syncCustomerFromAuth({
            fullName: newUser.fullName,
            email: newUser.email,
            phone: newUser.phone,
            createdAt: newUser.createdAt,
          });
        } catch (crmErr) {
          console.warn('[Admin CRM Sync Notice]:', crmErr);
        }

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
                    familyProfiles: state.familyProfiles,
                  }
                : acc
            ),
            user: null,
            isAuthenticated: false,
            addresses: [],
            orders: [],
            wishlist: [],
            familyProfiles: [],
            sessionToken: null,
          }));
        } else {
          set({
            user: null,
            isAuthenticated: false,
            addresses: [],
            orders: [],
            wishlist: [],
            familyProfiles: [],
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

        try {
          useAdminStore.getState().syncCustomerFromAuth({
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            createdAt: updatedUser.createdAt,
          });
        } catch (err) {
          console.warn('[Admin CRM Profile Sync Warning]:', err);
        }

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
        if (account.passwordHash !== currentHash) {
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
        if (account.passwordHash !== currentHash) {
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

          const currentUser = state.user;
          return { 
            addresses: updatedAddresses,
            accounts: currentUser
              ? state.accounts.map((acc) =>
                  acc.email.toLowerCase() === currentUser.email.toLowerCase()
                    ? { ...acc, addresses: updatedAddresses }
                    : acc
                )
              : state.accounts,
          };
        });
      },

      updateAddress: (id, updates) => {
        set((state) => {
          let updated = state.addresses.map((a) => (a.id === id ? { ...a, ...updates } : a));
          if (updates.isDefault) {
            updated = updated.map((a) => (a.id === id ? a : { ...a, isDefault: false }));
          }
          const currentUser = state.user;
          return { 
            addresses: updated,
            accounts: currentUser
              ? state.accounts.map((acc) =>
                  acc.email.toLowerCase() === currentUser.email.toLowerCase()
                    ? { ...acc, addresses: updated }
                    : acc
                )
              : state.accounts,
          };
        });
      },

      removeAddress: (id) => {
        set((state) => {
          const updated = state.addresses.filter((a) => a.id !== id);
          const currentUser = state.user;
          return {
            addresses: updated,
            accounts: currentUser
              ? state.accounts.map((acc) =>
                  acc.email.toLowerCase() === currentUser.email.toLowerCase()
                    ? { ...acc, addresses: updated }
                    : acc
                )
              : state.accounts,
          };
        });
      },

      setDefaultAddress: (id) => {
        set((state) => {
          const updated = state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }));
          const currentUser = state.user;
          return {
            addresses: updated,
            accounts: currentUser
              ? state.accounts.map((acc) =>
                  acc.email.toLowerCase() === currentUser.email.toLowerCase()
                    ? { ...acc, addresses: updated }
                    : acc
                )
              : state.accounts,
          };
        });
      },

      addFamilyProfile: (profile) => {
        const newProf: FamilyMeasurementProfile = {
          ...profile,
          id: 'prof_' + Math.random().toString(36).substring(2, 9),
          updatedAt: new Date().toISOString(),
        };

        set((state) => {
          const updatedProfiles: FamilyMeasurementProfile[] = profile.isDefault
            ? [...state.familyProfiles.map((p) => ({ ...p, isDefault: false })), newProf]
            : [...state.familyProfiles, newProf];

          const currentUser = state.user;
          return {
            familyProfiles: updatedProfiles,
            accounts: currentUser
              ? state.accounts.map((acc) =>
                  acc.email.toLowerCase() === currentUser.email.toLowerCase()
                    ? { ...acc, familyProfiles: updatedProfiles }
                    : acc
                )
              : state.accounts,
          };
        });
      },

      updateFamilyProfile: (id, updates) => {
        set((state) => {
          let updated = state.familyProfiles.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          );
          if (updates.isDefault) {
            updated = updated.map((p) => (p.id === id ? p : { ...p, isDefault: false }));
          }
          const currentUser = state.user;
          return {
            familyProfiles: updated,
            accounts: currentUser
              ? state.accounts.map((acc) =>
                  acc.email.toLowerCase() === currentUser.email.toLowerCase()
                    ? { ...acc, familyProfiles: updated }
                    : acc
                )
              : state.accounts,
          };
        });
      },

      deleteFamilyProfile: (id) => {
        set((state) => {
          const updated = state.familyProfiles.filter((p) => p.id !== id);
          const currentUser = state.user;
          return {
            familyProfiles: updated,
            accounts: currentUser
              ? state.accounts.map((acc) =>
                  acc.email.toLowerCase() === currentUser.email.toLowerCase()
                    ? { ...acc, familyProfiles: updated }
                    : acc
                )
              : state.accounts,
          };
        });
      },

      setDefaultFamilyProfile: (id) => {
        set((state) => {
          const updated = state.familyProfiles.map((p) => ({
            ...p,
            isDefault: p.id === id,
          }));
          const currentUser = state.user;
          return {
            familyProfiles: updated,
            accounts: currentUser
              ? state.accounts.map((acc) =>
                  acc.email.toLowerCase() === currentUser.email.toLowerCase()
                    ? { ...acc, familyProfiles: updated }
                    : acc
                )
              : state.accounts,
          };
        });
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
          const currentUser = state.user;
          return { 
            wishlist: updated,
            accounts: currentUser
              ? state.accounts.map((acc) =>
                  acc.email.toLowerCase() === currentUser.email.toLowerCase()
                    ? { ...acc, wishlist: updated }
                    : acc
                )
              : state.accounts,
          };
        });
      },

      addToWishlist: (slug) => {
        set((state) => {
          if (state.wishlist.includes(slug)) return state;
          const updated = [...state.wishlist, slug];
          const currentUser = state.user;
          return { 
            wishlist: updated,
            accounts: currentUser
              ? state.accounts.map((acc) =>
                  acc.email.toLowerCase() === currentUser.email.toLowerCase()
                    ? { ...acc, wishlist: updated }
                    : acc
                )
              : state.accounts,
          };
        });
      },

      removeFromWishlist: (slug) => {
        set((state) => {
          const updated = state.wishlist.filter((s) => s !== slug);
          const currentUser = state.user;
          return { 
            wishlist: updated,
            accounts: currentUser
              ? state.accounts.map((acc) =>
                  acc.email.toLowerCase() === currentUser.email.toLowerCase()
                    ? { ...acc, wishlist: updated }
                    : acc
                )
              : state.accounts,
          };
        });
      },

      cleanWishlist: (validSlugs) => {
        set((state) => {
          const updated = state.wishlist.filter((s) => validSlugs.includes(s));
          const currentUser = state.user;
          return {
            wishlist: updated,
            accounts: currentUser
              ? state.accounts.map((acc) =>
                  acc.email.toLowerCase() === currentUser.email.toLowerCase()
                    ? { ...acc, wishlist: updated }
                    : acc
                )
              : state.accounts,
          };
        });
      },

      isInWishlist: (slug) => {
        return get().wishlist.includes(slug);
      },
    }),
    {
      name: 'azhai-auth-store-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
