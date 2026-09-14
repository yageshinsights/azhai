import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Search, 
  Filter, 
  Truck, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Printer, 
  MessageCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStore, type AdminOrder, type OrderStatus } from '@/store/admin';
import OrderDetailDrawer from '@/components/admin/OrderDetailDrawer';
import PrintablePackingSlip from '@/components/admin/PrintablePackingSlip';

export default function AdminOrders() {
  const { orders } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [printOrder, setPrintOrder] = useState<AdminOrder | null>(null);

  // Filtering Logic
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.phone.includes(searchTerm) ||
      o.customer.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;

    return matchSearch && matchStatus && matchPayment;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold text-[10.5px] whitespace-nowrap inline-block">Confirmed</span>;
      case 'processing':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-bold text-[10.5px] whitespace-nowrap inline-block">Atelier Packing</span>;
      case 'shipped':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full font-bold text-[10.5px] whitespace-nowrap inline-block">In Courier Transit</span>;
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full font-bold text-[10.5px] whitespace-nowrap inline-block">Delivered</span>;
      case 'cancelled':
        return <span className="bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-full font-bold text-[10.5px] whitespace-nowrap inline-block">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-bold text-[10.5px] whitespace-nowrap inline-block">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                Order Fulfillment
              </span>
              <span className="text-[10px] bg-[#C5A059]/20 text-[#701626] font-bold px-2 py-0.5 rounded-full">
                {orders.length} Total
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold text-[#110B0E] pt-1">
              Customer Orders & Dispatch
            </h1>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#C5A059]/30 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-[#6D6268] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Order ID, Patron name, phone, city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs text-[#110B0E] focus:outline-none focus:border-[#701626]"
              />
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs text-[#110B0E] font-medium focus:outline-none focus:border-[#701626]"
              >
                <option value="all">All Statuses ({orders.length})</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Atelier Packing</option>
                <option value="shipped">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div className="sm:col-span-3">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs text-[#110B0E] font-medium focus:outline-none focus:border-[#701626]"
              >
                <option value="all">All Payment Types</option>
                <option value="paid">Paid (Card / Bank Verified)</option>
                <option value="pending_bank">Pending Bank Slip Verification</option>
                <option value="pending_cod">Pending COD Collection</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-[#C5A059]/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[880px]">
              <thead className="bg-[#701626] text-[#F3E8CE] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4 whitespace-nowrap min-w-[110px]">Order ID</th>
                  <th className="p-4 whitespace-nowrap min-w-[160px]">Patron &amp; Contact</th>
                  <th className="p-4 whitespace-nowrap min-w-[130px]">Destination</th>
                  <th className="p-4 whitespace-nowrap min-w-[120px]">Items</th>
                  <th className="p-4 whitespace-nowrap min-w-[130px]">Total Amount</th>
                  <th className="p-4 whitespace-nowrap min-w-[150px]">Courier Partner</th>
                  <th className="p-4 whitespace-nowrap min-w-[140px]">Status</th>
                  <th className="p-4 text-right whitespace-nowrap min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A059]/15">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, idx) => (
                    <tr
                      key={order.orderId}
                      className={`hover:bg-[#F7F4EE]/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#FCFBF8]'
                      }`}
                    >
                      <td className="p-4 font-display text-sm font-bold text-[#701626] whitespace-nowrap">
                        #{order.orderId}
                        <p className="text-[10px] font-sans font-normal text-[#6D6268] pt-0.5">
                          {new Date(order.placedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <p className="font-bold text-[#110B0E]">{order.customer.fullName}</p>
                        <p className="text-[10.5px] text-[#6D6268]">{order.customer.phone}</p>
                      </td>

                      <td className="p-4 text-[#110B0E] whitespace-nowrap">
                        <p className="font-medium">{order.customer.city}</p>
                        <p className="text-[10px] text-[#6D6268]">{order.customer.district}</p>
                      </td>

                      <td className="p-4 text-[#6D6268] whitespace-nowrap">
                        <span className="font-bold text-[#110B0E]">{order.items.length} pieces</span>
                        <p className="text-[10px] truncate max-w-[130px]">{order.items[0]?.name}</p>
                      </td>

                      <td className="p-4 font-display text-sm font-bold text-[#701626] whitespace-nowrap">
                        LKR {order.total.toLocaleString()}
                        <div className="pt-1">
                          {order.paymentStatus === 'paid' ? (
                            <span className="text-[9.5px] font-sans font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase">
                              Paid
                            </span>
                          ) : order.paymentStatus === 'pending_bank' ? (
                            order.bankTransferDetails?.slipUrl ? (
                              <span className="text-[9.5px] font-sans font-bold text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                Slip Attached
                              </span>
                            ) : (
                              <span className="text-[9.5px] font-sans font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Bank Slip Pending
                              </span>
                            )
                          ) : (
                            <span className="text-[9.5px] font-sans font-bold text-orange-800 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded uppercase">
                              COD Due
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className="bg-[#F7F4EE] px-2.5 py-1 rounded-lg font-bold text-[#110B0E] text-[10.5px] border border-[#C5A059]/20 inline-block whitespace-nowrap">
                          {order.courierPartner || 'Sri Lanka Post'}
                        </span>
                        {order.trackingNumber && (
                          <p className="text-[9.5px] text-[#6D6268] pt-0.5 font-mono">
                            {order.trackingNumber}
                          </p>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPrintOrder(order)}
                            className="p-2 text-[#6D6268] hover:text-[#701626] hover:bg-[#F7F4EE] rounded-xl transition-colors"
                            title="Print Waybill"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 bg-[#701626] text-white hover:bg-[#8E1E34] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm whitespace-nowrap"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-[#6D6268]">
                      No orders found matching your search and filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail & Dispatch Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      {/* Printable Slip Modal */}
      <PrintablePackingSlip
        order={printOrder}
        isOpen={!!printOrder}
        onClose={() => setPrintOrder(null)}
      />
    </AdminLayout>
  );
}
