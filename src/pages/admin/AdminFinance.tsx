import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Download, 
  TrendingUp, 
  Banknote, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Sparkles,
  PieChart
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStore } from '@/store/admin';

export default function AdminFinance() {
  const { orders } = useAdminStore();
  const [dateRange, setDateRange] = useState('all');

  // Calculations
  const grossSales = orders.reduce((acc, o) => acc + o.subtotal, 0);
  const totalDiscounts = orders.reduce((acc, o) => acc + o.discount, 0);
  const shippingCollected = orders.reduce((acc, o) => acc + o.shipping, 0);
  const netRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((acc, o) => acc + o.total, 0);

  const codPendingOrders = orders.filter((o) => o.paymentStatus === 'pending_cod' && o.status !== 'cancelled');
  const codPendingAmount = codPendingOrders.reduce((acc, o) => acc + o.total, 0);

  const onlinePaidOrders = orders.filter((o) => o.paymentStatus === 'paid');
  const onlinePaidAmount = onlinePaidOrders.reduce((acc, o) => acc + o.total, 0);

  // Delivered/settled COD orders (remitted by post office)
  const codRemittedOrders = orders.filter(
    (o) =>
      (o.paymentMethod.toLowerCase().includes('cod') || o.paymentMethod.toLowerCase().includes('cash')) &&
      (o.status === 'delivered' || o.paymentStatus === 'paid')
  );
  const codRemittedAmount = codRemittedOrders.reduce((acc, o) => acc + o.total, 0);

  // Dynamic Payment Channels Breakdown
  const paymentChannels = useMemo(() => {
    let cardTotal = 0;
    let codTotal = 0;
    let bankTotal = 0;

    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((o) => {
        const meth = (o.paymentMethod || '').toLowerCase();
        if (meth.includes('card') || meth.includes('payhere') || meth.includes('visa')) {
          cardTotal += o.total;
        } else if (meth.includes('cod') || meth.includes('cash')) {
          codTotal += o.total;
        } else {
          bankTotal += o.total;
        }
      });

    const total = (cardTotal + codTotal + bankTotal) || 1;

    return [
      {
        name: 'Online Card & LankaQR (Payments.lk / Payable)',
        amount: `LKR ${cardTotal.toLocaleString()}`,
        percent: Math.round((cardTotal / total) * 100),
        color: 'bg-emerald-700',
      },
      {
        name: 'Cash on Delivery (Island-wide COD)',
        amount: `LKR ${codTotal.toLocaleString()}`,
        percent: Math.round((codTotal / total) * 100),
        color: 'bg-amber-600',
      },
      {
        name: 'Direct Bank Transfer / Deposit',
        amount: `LKR ${bankTotal.toLocaleString()}`,
        percent: Math.round((bankTotal / total) * 100),
        color: 'bg-[#701626]',
      },
    ];
  }, [orders]);

  // Approximate COGS / gross margin
  const estimatedCost = Math.round(grossSales * 0.42);
  const grossProfit = netRevenue - estimatedCost;
  const marginPercent = netRevenue > 0 ? Math.round((grossProfit / netRevenue) * 100) : 0;

  // Export to CSV Function
  const exportToCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'District', 'Payment Method', 'Payment Status', 'Subtotal', 'Discount', 'Shipping', 'Total LKR'];
    const rows = orders.map((o) => [
      o.orderId,
      new Date(o.placedAt).toISOString().split('T')[0],
      `"${o.customer.fullName}"`,
      `"${o.customer.phone}"`,
      o.customer.district,
      `"${o.paymentMethod}"`,
      o.paymentStatus,
      o.subtotal,
      o.discount,
      o.shipping,
      o.total,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Azhai_Sales_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#110B0E]">
              Financial Ledger & Cash Flow
            </h1>
            <p className="text-xs text-[#6D6268] font-light">
              Reconcile online payments, COD courier remittances, and boutique profit margins.
            </p>
          </div>

          <button
            onClick={exportToCSV}
            className="px-5 py-2.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV for Audit
          </button>
        </div>

        {/* ── 4 KEY FINANCIAL SCORECARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-2">
            <span className="text-[10.5px] uppercase tracking-wider text-[#6D6268] font-bold">
              Net Billed Sales
            </span>
            <p className="font-display text-3xl font-bold text-[#701626]">
              LKR {netRevenue.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#6D6268]">
              Gross: LKR {grossSales.toLocaleString()} · Disc: LKR {totalDiscounts.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-2">
            <span className="text-[10.5px] uppercase tracking-wider text-[#6D6268] font-bold">
              Settled Online (Card/Bank)
            </span>
            <p className="font-display text-3xl font-bold text-emerald-800">
              LKR {onlinePaidAmount.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {onlinePaidOrders.length} orders settled
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-2">
            <span className="text-[10.5px] uppercase tracking-wider text-[#6D6268] font-bold">
              Pending COD with Couriers
            </span>
            <p className="font-display text-3xl font-bold text-amber-800">
              LKR {codPendingAmount.toLocaleString()}
            </p>
            <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {codPendingOrders.length} parcels in transit
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#C5A059]/30 shadow-sm space-y-2">
            <span className="text-[10.5px] uppercase tracking-wider text-[#6D6268] font-bold">
              Gross Profit & Margin
            </span>
            <p className="font-display text-3xl font-bold text-[#110B0E]">
              LKR {grossProfit.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#701626] font-bold">
              ~{marginPercent}% Atelier Silk Margin
            </p>
          </div>
        </div>

        {/* ── PAYMENT METHODS & COD RECONCILIATION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Gateways Breakdown */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-4">
            <h3 className="font-display text-xl font-bold text-[#110B0E]">
              Payment Channels Distribution
            </h3>

            <div className="space-y-3 pt-1">
              {paymentChannels.map((item) => (
                <div key={item.name} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-[#110B0E]">{item.name}</span>
                    <span className="font-semibold text-[#701626]">{item.amount} ({item.percent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-[#F7F4EE] rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COD Remittance Tracking Box */}
          <div className="bg-[#FCFBF8] rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#701626]">
              <Banknote className="w-5 h-5" />
              <h3 className="font-display text-xl font-bold text-[#110B0E]">
                Courier COD Cash Remittance
              </h3>
            </div>
            <p className="text-xs text-[#6D6268] font-light leading-relaxed">
              Track collected cash pending post office Money Order remittance from Sri Lanka Post COD merchant accounts:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-[#C5A059]/25 text-xs space-y-1">
                <span className="font-bold text-[#110B0E]">Sri Lanka Post COD (Speed Post)</span>
                <p className="text-base font-bold text-[#701626] font-display">LKR {codPendingAmount.toLocaleString()}</p>
                <p className="text-[10px] text-amber-700 font-bold">
                  {codPendingOrders.length} order{codPendingOrders.length === 1 ? '' : 's'} pending courier delivery & money order
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#C5A059]/25 text-xs space-y-1">
                <span className="font-bold text-[#110B0E]">SL Post Remitted / Delivered</span>
                <p className="text-base font-bold text-emerald-800 font-display">LKR {codRemittedAmount.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-700 font-bold">
                  {codRemittedOrders.length} order{codRemittedOrders.length === 1 ? '' : 's'} successfully settled via Postal MO
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── TRANSACTION REVENUE TABLE ── */}
        <div className="bg-white rounded-3xl border border-[#C5A059]/30 shadow-sm overflow-hidden space-y-3 p-4 sm:p-6">
          <h3 className="font-display text-xl font-bold text-[#110B0E]">Itemized Sales Ledger</h3>

          <div className="overflow-x-auto rounded-2xl border border-[#C5A059]/25">
            <table className="w-full text-xs text-left min-w-[800px]">
              <thead className="bg-[#701626] text-[#F3E8CE] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 whitespace-nowrap min-w-[100px]">Order ID</th>
                  <th className="p-3.5 whitespace-nowrap min-w-[90px]">Date</th>
                  <th className="p-3.5 whitespace-nowrap min-w-[150px]">Patron Name</th>
                  <th className="p-3.5 whitespace-nowrap min-w-[140px]">Payment Method</th>
                  <th className="p-3.5 whitespace-nowrap min-w-[100px]">Subtotal</th>
                  <th className="p-3.5 whitespace-nowrap min-w-[90px]">Discount</th>
                  <th className="p-3.5 whitespace-nowrap min-w-[110px]">Net Paid</th>
                  <th className="p-3.5 text-right whitespace-nowrap min-w-[90px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A059]/15">
                {orders.map((o, idx) => (
                  <tr
                    key={o.orderId}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FCFBF8]'}
                  >
                    <td className="p-3.5 font-bold text-[#701626] font-display whitespace-nowrap">#{o.orderId}</td>
                    <td className="p-3.5 text-[#6D6268] whitespace-nowrap">
                      {new Date(o.placedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-3.5 font-bold text-[#110B0E] whitespace-nowrap">{o.customer.fullName}</td>
                    <td className="p-3.5 text-[#6D6268] whitespace-nowrap">{o.paymentMethod}</td>
                    <td className="p-3.5 text-[#110B0E] whitespace-nowrap">LKR {o.subtotal.toLocaleString()}</td>
                    <td className="p-3.5 text-emerald-700 font-medium whitespace-nowrap">
                      {o.discount > 0 ? `-LKR ${o.discount.toLocaleString()}` : '—'}
                    </td>
                    <td className="p-3.5 font-bold text-[#701626] font-display text-sm whitespace-nowrap">
                      LKR {o.total.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase inline-block whitespace-nowrap ${
                        o.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {o.paymentStatus === 'paid' ? 'Paid' : 'COD Due'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
