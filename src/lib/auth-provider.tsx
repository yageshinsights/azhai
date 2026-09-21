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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);

      if (session?.user) {
        syncProfileToStore(session.user);
      } else if (event === 'SIGNED_OUT') {
        // Only reset auth store on an explicit sign out event
        useAuthStore.getState().logout();
      }
      setLoading(false);
    });

    // Listen to real-time store settings updates (e.g. Coming Soon mode toggle, announcement changes)
    const settingsChannel = supabase
      .channel('public:store_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        () => {
          useAdminStore.getState().fetchSupabaseData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(settingsChannel);
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
          ...(profile.family_profiles && Array.isArray(profile.family_profiles)
            ? { familyProfiles: profile.family_profiles }
            : {}),
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

      // 4. Fetch Customer Orders
      if (user.id || user.email) {
        const emailFilter = user.email ? `,customer_details->>email.ilike.${user.email}` : '';
        const { data: dbOrders, error: ordersErr } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .or(`user_id.eq.${user.id}${emailFilter}`)
          .order('created_at', { ascending: false });

        if (ordersErr) {
          console.warn('[AuthProvider Sync Orders Warning]:', ordersErr.message);
        } else if (dbOrders) {
          const mappedOrders = dbOrders.map((o: any) => ({
            orderId: o.order_code,
            items: (o.order_items || []).map((item: any) => ({
              id: item.product_id || 0,
              name: item.product_name,
              price: item.price,
              image: item.image_url || '',
              quantity: item.quantity,
              size: item.size,
              tailoring: item.tailoring_details || undefined,
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
            status: o.status,
            paymentStatus: o.payment_status,
            courierPartner: o.courier_partner || undefined,
            trackingNumber: o.tracking_number || undefined,
            adminNotes: o.admin_notes || undefined,
            bankTransferDetails:
              o.customer_details?.bank_transfer_details || o.bank_transfer_details || undefined,
            shippingBreakdown: o.shipping_breakdown || undefined,
          }));

          useAuthStore.setState({ orders: mappedOrders });
        }
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
