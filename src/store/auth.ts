import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PlacedOrder } from './cart';
import { hashPassword, generateSessionToken, generateResetToken, isUUID } from '@/lib/auth-utils';
import { useAdminStore } from './admin';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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

        // 1. Attempt Supabase Auth login if configured
        if (isSupabaseConfigured()) {
          try {
            const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            });

            if (sbData?.user && !sbError) {
              const su = sbData.user;
              // Fetch user profile from Supabase
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', su.id)
                .single();

              // Fetch user addresses from Supabase
              const { data: addresses } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', su.id);

              // Fetch user wishlist from Supabase
              const { data: wishlist } = await supabase
                .from('wishlist')
                .select('product_slug')
                .eq('user_id', su.id);

              const userObj: User = {
                id: su.id,
                fullName: profile?.full_name || su.user_metadata?.full_name || 'Valued Patron',
                email: normalizedEmail,
                phone: profile?.phone || su.user_metadata?.phone || '',
                avatar: profile?.avatar_url || undefined,
                dob: profile?.dob || undefined,
                createdAt: profile?.created_at || su.created_at || new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                preferences: profile?.preferences || { newsletter: true, smsAlerts: true },
              };

              const mappedAddresses: SavedAddress[] = (addresses || []).map((a: any) => ({
                id: a.id,
                label: a.label || 'Home',
                fullName: a.full_name,
                phone: a.phone,
                address: a.address,
                city: a.city,
                district: a.district,
                postalCode: a.postal_code || undefined,
                isDefault: !!a.is_default,
              }));

              const mappedWishlist: string[] = (wishlist || []).map((w: any) => w.product_slug);

              const sessionToken = sbData.session?.access_token || generateSessionToken();

              // Merge into local accounts list
              const existingAccounts = get().accounts;
              const accountIdx = existingAccounts.findIndex((a) => a.email.toLowerCase() === normalizedEmail);
              const passwordHash = await hashPassword(password);

              let updatedAccounts = [...existingAccounts];
              if (accountIdx >= 0) {
                updatedAccounts[accountIdx] = {
                  ...updatedAccounts[accountIdx],
                  user: userObj,
                  addresses: mappedAddresses.length > 0 ? mappedAddresses : updatedAccounts[accountIdx].addresses,
                  wishlist: mappedWishlist.length > 0 ? mappedWishlist : updatedAccounts[accountIdx].wishlist,
                  passwordHash,
                };
              } else {
                updatedAccounts.push({
                  email: normalizedEmail,
                  passwordHash,
                  user: userObj,
                  addresses: mappedAddresses,
                  orders: get().orders || [],
                  wishlist: mappedWishlist,
                  familyProfiles: get().familyProfiles || [],
                });
              }

              const existingAccount = accountIdx >= 0 ? existingAccounts[accountIdx] : null;
              set({
                user: userObj,
                isAuthenticated: true,
                addresses: mappedAddresses.length > 0 ? mappedAddresses : (existingAccount?.addresses || get().addresses),
                wishlist: mappedWishlist,
                sessionToken,
                accounts: updatedAccounts,
                orders: existingAccount?.orders || get().orders || [],
                familyProfiles: existingAccount?.familyProfiles || get().familyProfiles || [],
              });

              return { success: true };
            }
          } catch (sbEx) {
            console.warn('[Supabase Login Notice]: Falling back to local vault', sbEx);
          }
        }

        // 2. Fallback to local accounts simulation
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

        // 1. Register with Supabase Auth if configured
        let supabaseUserId: string | null = null;
        if (isSupabaseConfigured()) {
          try {
            const { data: sbData, error: sbErr } = await supabase.auth.signUp({
              email: normalizedEmail,
              password: data.password,
              options: {
                data: {
                  full_name: data.fullName.trim(),
                  phone: data.phone.trim(),
                },
              },
            });

            if (sbData?.user) {
              supabaseUserId = sbData.user.id;
            } else if (sbErr) {
              console.warn('[Supabase Auth Signup Notice]:', sbErr.message);
              if (sbErr.message.toLowerCase().includes('already registered')) {
                return { success: false, error: 'An account with this email already exists. Please log in.' };
              }
            }
          } catch (sbEx) {
            console.warn('[Supabase Signup Exception]:', sbEx);
          }
        }

        const passwordHash = await hashPassword(data.password);
        const newUserId = supabaseUserId || (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'usr_' + Math.random().toString(36).substring(2, 9));

        const newUser: User = {
          id: newUserId,
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
        // Sign out of Supabase session if configured
        if (isSupabaseConfigured()) {
          supabase.auth.signOut().catch(() => {});
        }

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

        // Synchronize to Supabase profiles table if configured
        if (isSupabaseConfigured() && isUUID(updatedUser.id)) {
          (async () => {
            try {
              const dbPayload: any = {
                full_name: updatedUser.fullName,
                phone: updatedUser.phone || '',
              };
              if (updatedUser.avatar !== undefined) dbPayload.avatar_url = updatedUser.avatar;
              if (updatedUser.dob !== undefined) dbPayload.dob = updatedUser.dob;
              if (updatedUser.preferences !== undefined) dbPayload.preferences = updatedUser.preferences;

              await supabase
                .from('profiles')
                .update(dbPayload)
                .eq('id', updatedUser.id);
            } catch (err) {
              console.warn('[Supabase Profile Sync Exception]:', err);
            }
          })();
        }

        return { success: true };
      },

      changePassword: async (currentPassword, newPassword) => {
        const currentUser = get().user;
        if (!currentUser) return { success: false, error: 'Not authenticated' };

        const account = get().accounts.find(
          (a) => a.email.toLowerCase() === currentUser.email.toLowerCase()
        );

        if (account) {
          const currentHash = await hashPassword(currentPassword);
          if (account.passwordHash !== currentHash) {
            return { success: false, error: 'Current password is incorrect.' };
          }
        }

        // Sync password with Supabase Auth if configured
        if (isSupabaseConfigured()) {
          try {
            const { error: sbErr } = await supabase.auth.updateUser({ password: newPassword });
            if (sbErr && !account) {
              return { success: false, error: sbErr.message };
            }
          } catch (err: any) {
            console.error('[Supabase changePassword Error]:', err);
            if (!account) {
              return { success: false, error: err?.message || 'Failed to update password.' };
            }
          }
        } else if (!account) {
          return { success: false, error: 'Account record not found.' };
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

        if (account) {
          const currentHash = await hashPassword(password);
          if (account.passwordHash !== currentHash) {
            return { success: false, error: 'Incorrect password.' };
          }
        }

        // Sign out and invalidate Supabase session so user is not restored on refresh
        if (isSupabaseConfigured()) {
          try {
            await supabase.auth.signOut();
          } catch (err) {
            console.error('[Supabase deleteAccount signOut Error]:', err);
          }
        }

        set((state) => ({
          accounts: state.accounts.filter(
            (a) => a.email.toLowerCase() !== currentUser.email.toLowerCase()
          ),
          user: null,
          isAuthenticated: false,
          addresses: [],
          orders: [],
          wishlist: [],
          familyProfiles: [],
          sessionToken: null,
        }));

        return { success: true };
      },

      addAddress: (address) => {
        const addrId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
          ? crypto.randomUUID()
          : 'addr_' + Math.random().toString(36).substring(2, 9);

        const newAddr: SavedAddress = {
          ...address,
          id: addrId,
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

        const currentUser = get().user;
        if (isSupabaseConfigured() && currentUser && isUUID(currentUser.id)) {
          (async () => {
            try {
              if (address.isDefault) {
                await supabase
                  .from('addresses')
                  .update({ is_default: false })
                  .eq('user_id', currentUser.id);
              }

              await supabase
                .from('addresses')
                .insert({
                  id: isUUID(addrId) ? addrId : undefined,
                  user_id: currentUser.id,
                  label: address.label || 'Home',
                  full_name: address.fullName,
                  phone: address.phone,
                  address: address.address,
                  city: address.city,
                  district: address.district,
                  postal_code: address.postalCode || null,
                  is_default: !!address.isDefault,
                });
            } catch (err) {
              console.warn('[Supabase Insert Address Exception]:', err);
            }
          })();
        }
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

        const currentUser = get().user;
        if (isSupabaseConfigured() && currentUser && isUUID(currentUser.id) && isUUID(id)) {
          (async () => {
            try {
              if (updates.isDefault) {
                await supabase
                  .from('addresses')
                  .update({ is_default: false })
                  .eq('user_id', currentUser.id);
              }

              const dbPayload: any = {};
              if (updates.label !== undefined) dbPayload.label = updates.label;
              if (updates.fullName !== undefined) dbPayload.full_name = updates.fullName;
              if (updates.phone !== undefined) dbPayload.phone = updates.phone;
              if (updates.address !== undefined) dbPayload.address = updates.address;
              if (updates.city !== undefined) dbPayload.city = updates.city;
              if (updates.district !== undefined) dbPayload.district = updates.district;
              if (updates.postalCode !== undefined) dbPayload.postal_code = updates.postalCode;
              if (updates.isDefault !== undefined) dbPayload.is_default = updates.isDefault;

              await supabase
                .from('addresses')
                .update(dbPayload)
                .eq('id', id)
                .eq('user_id', currentUser.id);
            } catch (err) {
              console.warn('[Supabase Update Address Exception]:', err);
            }
          })();
        }
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

        const currentUser = get().user;
        if (isSupabaseConfigured() && currentUser && isUUID(currentUser.id) && isUUID(id)) {
          (async () => {
            try {
              await supabase
                .from('addresses')
                .delete()
                .eq('id', id)
                .eq('user_id', currentUser.id);
            } catch (err) {
              console.warn('[Supabase Delete Address Exception]:', err);
            }
          })();
        }
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

        const currentUser = get().user;
        if (isSupabaseConfigured() && currentUser && isUUID(currentUser.id)) {
          (async () => {
            try {
              await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', currentUser.id);

              if (isUUID(id)) {
                await supabase
                  .from('addresses')
                  .update({ is_default: true })
                  .eq('id', id)
                  .eq('user_id', currentUser.id);
              }
            } catch (err) {
              console.warn('[Supabase Set Default Address Exception]:', err);
            }
          })();
        }
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
        const exists = get().wishlist.includes(slug);
        const updated = exists ? get().wishlist.filter((s) => s !== slug) : [...get().wishlist, slug];
        const currentUser = get().user;

        set((state) => ({ 
          wishlist: updated,
          accounts: currentUser
            ? state.accounts.map((acc) =>
                acc.email.toLowerCase() === currentUser.email.toLowerCase()
                  ? { ...acc, wishlist: updated }
                  : acc
              )
            : state.accounts,
        }));

        if (isSupabaseConfigured() && currentUser && isUUID(currentUser.id)) {
          (async () => {
            try {
              if (exists) {
                await supabase
                  .from('wishlist')
                  .delete()
                  .eq('user_id', currentUser.id)
                  .eq('product_slug', slug);
              } else {
                await supabase
                  .from('wishlist')
                  .insert({
                    user_id: currentUser.id,
                    product_slug: slug,
                  });
              }
            } catch (err) {
              console.warn('[Supabase Wishlist Sync Exception]:', err);
            }
          })();
        }
      },

      addToWishlist: (slug) => {
        if (get().wishlist.includes(slug)) return;
        const updated = [...get().wishlist, slug];
        const currentUser = get().user;

        set((state) => ({ 
          wishlist: updated,
          accounts: currentUser
            ? state.accounts.map((acc) =>
                acc.email.toLowerCase() === currentUser.email.toLowerCase()
                  ? { ...acc, wishlist: updated }
                  : acc
              )
            : state.accounts,
        }));

        if (isSupabaseConfigured() && currentUser && isUUID(currentUser.id)) {
          (async () => {
            try {
              await supabase
                .from('wishlist')
                .insert({
                  user_id: currentUser.id,
                  product_slug: slug,
                });
            } catch (err) {
              console.warn('[Supabase Add Wishlist Exception]:', err);
            }
          })();
        }
      },

      removeFromWishlist: (slug) => {
        const updated = get().wishlist.filter((s) => s !== slug);
        const currentUser = get().user;

        set((state) => ({ 
          wishlist: updated,
          accounts: currentUser
            ? state.accounts.map((acc) =>
                acc.email.toLowerCase() === currentUser.email.toLowerCase()
                  ? { ...acc, wishlist: updated }
                  : acc
              )
            : state.accounts,
        }));

        if (isSupabaseConfigured() && currentUser && isUUID(currentUser.id)) {
          (async () => {
            try {
              await supabase
                .from('wishlist')
                .delete()
                .eq('user_id', currentUser.id)
                .eq('product_slug', slug);
            } catch (err) {
              console.warn('[Supabase Remove Wishlist Exception]:', err);
            }
          })();
        }
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
