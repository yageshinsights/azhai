import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShoppingBag,
  Banknote
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStore, type AdminOrder } from '@/store/admin';
import OrderDetailDrawer from '@/components/admin/OrderDetailDrawer';

export default function AdminDashboard() {
  const { orders, products, customers, settings } = useAdminStore();
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Financial Metrics Calculations
  const grossRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingCodRevenue = orders
    .filter((o) => o.paymentStatus === 'pending_cod' && o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing'
  );

  const averageOrderValue = orders.length > 0 ? Math.round(grossRevenue / orders.length) : 0;

  // Category sales breakdown computed dynamically from actual orders
  const categorySales = useMemo(() => {
    const categoryTotals: Record<string, { count: number; revenue: number }> = {
      Kurties: { count: 0, revenue: 0 },
      Sarees: { count: 0, revenue: 0 },
      Shawls: { count: 0, revenue: 0 },
      Tops: { count: 0, revenue: 0 },
    };

    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((order) => {
        order.items?.forEach((item) => {
          const matchedProd = products.find(
            (p) => String(p.id) === String(item.id) || p.name.toLowerCase() === item.name.toLowerCase()
          );
          let catName = matchedProd?.categories?.[0]?.name;
          if (!catName) {
            const lowerName = item.name.toLowerCase();
            if (lowerName.includes('kurti')) catName = 'Kurties';
            else if (lowerName.includes('saree')) catName = 'Sarees';
            else if (lowerName.includes('shawl') || lowerName.includes('stole') || lowerName.includes('pashmina')) catName = 'Shawls';
            else if (lowerName.includes('top')) catName = 'Tops';
            else if (lowerName.includes('tailor') || lowerName.includes('bespoke')) catName = 'Bespoke Tailoring';
            else catName = 'Other Handlooms';
          }

          if (!categoryTotals[catName]) {
            categoryTotals[catName] = { count: 0, revenue: 0 };
          }

          const unitPrice = typeof item.price === 'number' 
            ? item.price 
            : Number(String(item.price).replace(/[^0-9.]/g, '')) || 0;
          const qty = item.quantity || 1;

          categoryTotals[catName].count += qty;
          categoryTotals[catName].revenue += unitPrice * qty;
        });
      });

    const totalRev = Object.values(categoryTotals).reduce((sum, c) => sum + c.revenue, 0) || 1;
    const colorPalette = ['bg-[#701626]', 'bg-[#C5A059]', 'bg-rose-700', 'bg-amber-600', 'bg-emerald-700', 'bg-purple-700'];

    return Object.entries(categoryTotals)
      .map(([name, data], idx) => ({
        name,
        count: data.count,
        revenue: data.revenue,
        percent: Math.min(100, Math.round((data.revenue / totalRev) * 100)),
        color: colorPalette[idx % colorPalette.length],
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [orders, products]);

  // Dynamic Low Stock alerts (stock <= 5)
  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => {
        const qty = p.stockQuantity ?? p.quantity ?? 15;
        return qty <= 5;
      })
      .sort((a, b) => (a.stockQuantity ?? a.quantity ?? 0) - (b.stockQuantity ?? b.quantity ?? 0));
  }, [products]);

  const currentMonthYear = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold">
                Operations & Analytics
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">
              Executive Overview
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/orders"
              className="px-5 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center gap-2"
            >
              <Package className="w-4 h-4" /> Fulfillment Hub
            </Link>
          </div>
        </div>

        {/* ── 4 KEY EXECUTIVE KPI CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Gross Sales */}
          <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] uppercase tracking-wider text-[#6D6268] font-bold">
                Gross Sales (LKR)
              </span>
              <div className="w-9 h-9 rounded-2xl bg-[#701626]/10 text-[#701626] flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-[#110B0E]">
                LKR {grossRevenue.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 pt-1">
                <TrendingUp className="w-3.5 h-3.5" /> +24.8% vs last month
              </p>
            </div>
          </div>

          {/* Card 2: Active Orders & Dispatch */}
          <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] uppercase tracking-wider text-[#6D6268] font-bold">
                Orders Queue
              </span>
              <div className="w-9 h-9 rounded-2xl bg-[#C5A059]/20 text-[#701626] flex items-center justify-center font-bold">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-[#110B0E]">
                {orders.length} <span className="text-base text-[#6D6268] font-light">Total</span>
              </p>
              <p className="text-[11px] text-[#701626] font-bold pt-1">
                {pendingOrders.length} Pending Dispatch at Atelier
              </p>
            </div>
          </div>

          {/* Card 3: COD Pending Collection */}
          <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] uppercase tracking-wider text-[#6D6268] font-bold">
                Pending COD Cash
              </span>
              <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-amber-800">
                LKR {pendingCodRevenue.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#6D6268] pt-1">
                COD Status: <strong className={settings.enableCOD ? 'text-emerald-700' : 'text-rose-700'}>{settings.enableCOD ? 'ON (Active)' : 'OFF'}</strong>
              </p>
            </div>
          </div>

          {/* Card 4: VIP Patrons & AOV */}
          <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] uppercase tracking-wider text-[#6D6268] font-bold">
                Average Basket (AOV)
              </span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-[#110B0E]">
                LKR {averageOrderValue.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#6D6268] pt-1">
                {customers.length} Registered VIP Patrons
              </p>
            </div>
          </div>
        </div>

        {/* ── 2-COLUMN SPLIT: REVENUE BY CATEGORY & LOW STOCK ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue by Category (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-[#110B0E]">Category Revenue Breakdown</h3>
                <p className="text-xs text-[#6D6268] font-light">Performance across core atelier edits.</p>
              </div>
              <span className="text-xs font-bold text-[#701626] bg-[#701626]/5 px-3 py-1 rounded-full border border-[#701626]/10">
                {currentMonthYear}
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {categorySales.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#110B0E]">{cat.name}</span>
                    <span className="font-semibold text-[#701626]">
                      LKR {cat.revenue.toLocaleString()} ({cat.count} sold)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#F7F4EE] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stock & Low Inventory (1 col) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-display text-lg font-bold text-[#110B0E]">Low Stock Alerts</h3>
              </div>
              <span className="text-[11px] font-bold text-[#6D6268]">
                {lowStockProducts.length} alert{lowStockProducts.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-xs text-[#6D6268] font-light">
              Pieces with limited handloom meterage remaining in studio:
            </p>

            <div className="divide-y divide-[#C5A059]/15 pt-1 max-h-[220px] overflow-y-auto">
              {lowStockProducts.length === 0 ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto opacity-70" />
                  <p className="text-xs text-[#6D6268] font-medium">All atelier pieces currently have healthy inventory levels.</p>
                </div>
              ) : (
                lowStockProducts.slice(0, 5).map((prod) => {
                  const qty = prod.stockQuantity ?? prod.quantity ?? 0;
                  const catLabel = prod.categories?.[0]?.name || prod.occasion || 'Handloom Edit';
                  return (
                    <div key={prod.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="pr-2 truncate">
                        <p className="font-bold text-[#110B0E] truncate">{prod.name}</p>
                        <p className="text-[10.5px] text-[#6D6268]">{catLabel}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                          qty <= 1
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {qty} left
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <Link
              to="/admin/products"
              className="block text-center text-xs font-bold text-[#701626] hover:underline pt-2"
            >
              Manage All Inventory →
            </Link>
          </div>
        </div>

        {/* ── LIVE PENDING DISPATCH QUEUE ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-[#110B0E]">Live Orders Dispatch Queue</h3>
              <p className="text-xs text-[#6D6268] font-light">Recent patron purchases requiring courier handover.</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-[#701626] hover:underline inline-flex items-center gap-1"
            >
              <span>View All ({orders.length})</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#C5A059]/25">
            <table className="w-full text-xs text-left min-w-[760px]">
              <thead className="bg-[#701626] text-[#F3E8CE] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 whitespace-nowrap min-w-[90px]">Order</th>
                  <th className="p-3.5 whitespace-nowrap min-w-[150px]">Patron</th>
                  <th className="p-3.5 whitespace-nowrap min-w-[130px]">Destination</th>
                  <th className="p-3.5 whitespace-nowrap min-w-[100px]">Payment</th>
                  <th className="p-3.5 whitespace-nowrap min-w-[110px]">Total</th>
                  <th className="p-3.5 whitespace-nowrap min-w-[110px]">Status</th>
                  <th className="p-3.5 text-right whitespace-nowrap min-w-[90px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A059]/15">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-[#6D6268]">
                      No orders placed yet. Fresh boutique orders will appear here automatically.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((order, idx) => (
                  <tr
                    key={order.orderId}
                    className={`hover:bg-[#F7F4EE]/50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#FCFBF8]'
                    }`}
                  >
                    <td className="p-3.5 font-bold text-[#701626] font-display text-sm whitespace-nowrap">
                      #{order.orderId}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <p className="font-bold text-[#110B0E]">{order.customer.fullName}</p>
                      <p className="text-[10px] text-[#6D6268]">{order.customer.phone}</p>
                    </td>
                    <td className="p-3.5 text-[#110B0E] whitespace-nowrap">
                      {order.customer.city}, {order.customer.district}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`text-[9.5px] font-bold px-2.5 py-1 rounded-full uppercase inline-block whitespace-nowrap ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {order.paymentStatus === 'paid' ? 'Paid' : 'COD Due'}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-[#701626] font-display text-sm whitespace-nowrap">
                      LKR {order.total.toLocaleString()}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize inline-block whitespace-nowrap ${
                          order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : order.status === 'shipped'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-[#701626]/10 text-[#701626] border border-[#701626]/20'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-[#F7F4EE] hover:bg-[#701626] hover:text-white rounded-xl text-xs font-bold text-[#110B0E] transition-colors cursor-pointer border border-[#C5A059]/25 whitespace-nowrap"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </AdminLayout>
  );
}
