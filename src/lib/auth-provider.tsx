import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { useAdminStore } from '@/store/admin';

interface AuthContextType {
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  supabaseUser: null,
  session: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Auto-fetch products, categories, settings from Supabase
    useAdminStore.getState().fetchSupabaseData();

    // Fetch initial active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        syncProfileToStore(session.user);
      }
      setLoading(false);
    });

    // Listen to real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);

      if (session?.user) {
        syncProfileToStore(session.user);
      } else {
        // Reset auth store on logout
        useAuthStore.getState().logout();
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function syncProfileToStore(user: SupabaseUser) {
    try {
      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        useAuthStore.setState({
          user: {
            id: profile.id,
            fullName: profile.full_name,
            email: profile.email,
            phone: profile.phone || '',
            avatar: profile.avatar_url || undefined,
            dob: profile.dob || undefined,
            createdAt: profile.created_at,
            lastLoginAt: profile.last_login_at || new Date().toISOString(),
            preferences: profile.preferences || { newsletter: true, smsAlerts: true },
          },
          isAuthenticated: true,
        });
      }

      // 2. Fetch User Addresses
      const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id);

      if (addresses) {
        useAuthStore.setState({
          addresses: addresses.map((a) => ({
            id: a.id,
            label: a.label,
            fullName: a.full_name,
            phone: a.phone,
            address: a.address,
            city: a.city,
            district: a.district,
            postalCode: a.postal_code || undefined,
            isDefault: a.is_default,
          })),
        });
      }

      // 3. Fetch User Wishlist
      const { data: wishlist } = await supabase
        .from('wishlist')
        .select('product_slug')
        .eq('user_id', user.id);

      if (wishlist) {
        useAuthStore.setState({
          wishlist: wishlist.map((w) => w.product_slug),
        });
      }
    } catch (err) {
      console.error('[AuthProvider Sync Error]:', err);
    }
  }

  return (
    <AuthContext.Provider value={{ supabaseUser, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  return useContext(AuthContext);
}
