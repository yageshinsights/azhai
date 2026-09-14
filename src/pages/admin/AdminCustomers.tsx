import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Crown, 
  MessageCircle, 
  Mail, 
  Phone, 
  ShoppingBag, 
  MapPin, 
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStore, type CustomerRecord } from '@/store/admin';
import { useAuthStore } from '@/store/auth';

export default function AdminCustomers() {
  const { customers, syncCustomerFromAuth } = useAdminStore();
  const authAccounts = useAuthStore((s) => s.accounts);
  const currentAuthUser = useAuthStore((s) => s.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVipTier, setSelectedVipTier] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  // Auto-sync any registered online patron accounts to the Admin CRM Registry
  useEffect(() => {
    if (Array.isArray(authAccounts)) {
      authAccounts.forEach((acc) => {
        if (acc?.user?.email) {
          syncCustomerFromAuth({
            fullName: acc.user.fullName,
            email: acc.user.email,
            phone: acc.user.phone || '',
            district: acc.addresses?.[0]?.district || 'Colombo',
            city: acc.addresses?.[0]?.city || 'Colombo',
            createdAt: acc.user.createdAt,
          });
        }
      });
    }

    if (currentAuthUser?.email) {
      syncCustomerFromAuth({
        fullName: currentAuthUser.fullName,
        email: currentAuthUser.email,
        phone: currentAuthUser.phone || '',
        createdAt: currentAuthUser.createdAt,
      });
    }
  }, [authAccounts, currentAuthUser, syncCustomerFromAuth]);

  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTier = selectedVipTier === 'all' || c.vipTier === selectedVipTier;

    return matchSearch && matchTier;
  });

  const getVipBadge = (tier: CustomerRecord['vipTier']) => {
    if (tier === 'Gold Patron') {
      return (
        <span className="inline-flex items-center gap-1 bg-[#701626] text-[#DFBF77] font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-[#C5A059]/40 shadow-sm">
          <Crown className="w-3 h-3" /> Gold Patron
        </span>
      );
    }
    if (tier === 'Silver Patron') {
      return (
        <span className="inline-flex items-center gap-1 bg-[#F7F4EE] text-[#701626] font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-[#C5A059]/30">
          <Award className="w-3 h-3 text-[#C5A059]" /> Silver Patron
        </span>
      );
    }
    return <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Standard</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#110B0E]">
              Patron CRM & VIP Registry
            </h1>
            <p className="text-xs text-[#6D6268] font-light">
              Manage boutique client relationships, lifetime value, and personalized concierge chats.
            </p>
          </div>

          <span className="text-xs font-bold text-[#701626] bg-[#701626]/10 px-3.5 py-1.5 rounded-full border border-[#C5A059]/30">
            {customers.length} Patrons Registered
          </span>
        </div>

        {/* Search & VIP Filters */}
        <div className="bg-white rounded-3xl p-5 border border-[#C5A059]/30 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Patron name, phone, email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs text-[#110B0E] focus:outline-none focus:border-[#701626]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {['all', 'Gold Patron', 'Silver Patron', 'Standard'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedVipTier(tier)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedVipTier === tier
                      ? 'bg-[#701626] text-white shadow-sm'
                      : 'bg-[#F7F4EE] text-[#6D6268] hover:text-[#110B0E]'
                  }`}
                >
                  {tier === 'all' ? 'All Patrons' : tier}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-3xl border border-[#C5A059]/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[800px]">
              <thead className="bg-[#701626] text-[#F3E8CE] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4 whitespace-nowrap min-w-[180px]">Patron Name</th>
                  <th className="p-4 whitespace-nowrap min-w-[150px]">Contact Info</th>
                  <th className="p-4 whitespace-nowrap min-w-[120px]">Location</th>
                  <th className="p-4 whitespace-nowrap min-w-[110px]">Orders Placed</th>
                  <th className="p-4 whitespace-nowrap min-w-[120px]">Lifetime Spend</th>
                  <th className="p-4 whitespace-nowrap min-w-[130px]">VIP Tier</th>
                  <th className="p-4 text-right whitespace-nowrap min-w-[150px]">Concierge Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A059]/15">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#6D6268]">
                      No patrons found. Registered customers will appear here automatically.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c, idx) => {
                  const cleanPhone = c.phone.replace(/[^0-9]/g, '');
                  const waMsg = encodeURIComponent(`Vanakkam ${c.fullName}! Preethi here from Azhai Boutique. I wanted to share our exclusive new silk drop with you.`);

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-[#F7F4EE]/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#FCFBF8]'
                      }`}
                    >
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#701626]/10 text-[#701626] flex items-center justify-center font-bold font-display text-xs shrink-0">
                            {c.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#110B0E]">{c.fullName}</p>
                            <p className="text-[10px] text-[#6D6268]">
                              Joined {new Date(c.firstJoined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 space-y-0.5 whitespace-nowrap">
                        <p className="font-medium text-[#110B0E]">{c.phone || 'No phone'}</p>
                        <p className="text-[10.5px] text-[#6D6268]">{c.email}</p>
                      </td>

                      <td className="p-4 text-[#110B0E] whitespace-nowrap">
                        <p className="font-medium">{c.city || 'Colombo'}</p>
                        <p className="text-[10px] text-[#6D6268]">{c.district}</p>
                      </td>

                      <td className="p-4 font-bold text-[#110B0E] whitespace-nowrap">
                        {c.totalOrders} purchases
                      </td>

                      <td className="p-4 font-display text-sm font-bold text-[#701626] whitespace-nowrap">
                        LKR {c.totalSpent.toLocaleString()}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {getVipBadge(c.vipTier)}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        {cleanPhone ? (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] hover:text-white text-[#128C7E] font-bold text-xs transition-colors whitespace-nowrap"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp VIP</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-[#6D6268] italic">—</span>
                        )}
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
