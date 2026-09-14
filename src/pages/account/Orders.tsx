import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useAdminStore } from '@/store/admin';
import OrderDetail from './OrderDetail';

export default function Orders() {
  const { orders: authOrders, user } = useAuthStore();
  const adminOrders = useAdminStore((s) => s.orders);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedOrderId = searchParams.get('order');

  // Reactively synchronize user orders with live updates from admin panel & stores
  const orders = useMemo(() => {
    const combined = [...authOrders];

    // Include any orders from AdminStore placed with the user's email
    if (user?.email) {
      const userEmailLower = user.email.toLowerCase().trim();
      const matchingAdminOrders = adminOrders.filter(
        (ao) =>
          ao.customer.email?.toLowerCase().trim() === userEmailLower &&
          !combined.some((co) => co.orderId === ao.orderId)
      );
      combined.push(...matchingAdminOrders);
    }

    // Merge the latest status, courier, tracking, and notes from admin store
    return combined.map((ord) => {
      const adminMatch = adminOrders.find((ao) => ao.orderId === ord.orderId);
      if (adminMatch) {
        return {
          ...ord,
          status: adminMatch.status,
          courierPartner: adminMatch.courierPartner,
          trackingNumber: adminMatch.trackingNumber,
          adminNotes: adminMatch.adminNotes,
          paymentStatus: adminMatch.paymentStatus,
        };
      }
      return ord;
    });
  }, [authOrders, adminOrders, user?.email]);

  const selectedOrder = orders.find((o) => o.orderId === selectedOrderId);

  if (selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        onBack={() => {
          searchParams.delete('order');
          setSearchParams(searchParams);
        }}
      />
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#C5A059]/30 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-[#701626]/8 text-[#701626] flex items-center justify-center mx-auto border border-[#C5A059]/30">
          <Package className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="font-display text-2xl font-bold text-[#110B0E]">No Orders Placed Yet</h3>
          <p className="text-xs text-[#6D6268] font-light">
            When you purchase our artisan handloom sarees, kurties or pure cashmere shawls, your order tracking will appear here.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" /> Explore Collections
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'processing':
        return (
          <span className="text-[10px] bg-amber-50 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
            Atelier Crafting
          </span>
        );
      case 'shipped':
        return (
          <span className="text-[10px] bg-blue-50 text-blue-900 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
            In Transit / Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="text-[10px] bg-purple-50 text-purple-900 font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[10px] bg-rose-50 text-rose-900 font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
            Cancelled
          </span>
        );
      case 'confirmed':
      default:
        return (
          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
            Confirmed
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#110B0E]">Order History</h2>
          <p className="text-xs text-[#6D6268] font-light">
            Track your bespoke dispatches and review previous purchases.
          </p>
        </div>
        <span className="text-xs font-bold text-[#701626] bg-[#701626]/10 px-3 py-1 rounded-full border border-[#C5A059]/25">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      <div className="space-y-3.5">
        {orders.map((order) => {
          const formattedDate = order.placedAt
            ? new Date(order.placedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Recently';

          return (
            <div
              key={order.orderId}
              onClick={() => {
                setSearchParams({ tab: 'orders', order: order.orderId });
              }}
              className="bg-white hover:bg-[#FCFBF8] rounded-3xl p-5 sm:p-6 border border-[#C5A059]/30 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Order Meta & Thumbnails */}
              <div className="space-y-3 w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-[#110B0E] group-hover:text-[#701626] transition-colors">
                    #{order.orderId}
                  </span>
                  {getStatusBadge(order.status)}
                  <span className="text-xs text-[#6D6268]">· {formattedDate}</span>
                </div>

                {/* Thumbnails Row */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.image}
                      alt={item.name}
                      title={item.name}
                      className="w-12 h-14 object-cover rounded-xl border border-[#C5A059]/25 bg-[#F7F4EE] shrink-0"
                    />
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-12 h-14 rounded-xl bg-[#F7F4EE] border border-[#C5A059]/25 flex items-center justify-center text-[10px] font-bold text-[#701626] shrink-0">
                      +{order.items.length - 4}
                    </div>
                  )}
                  <span className="text-xs text-[#6D6268] pl-1">
                    {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                  </span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#C5A059]/15">
                <div className="sm:text-right">
                  <p className="text-[10px] uppercase tracking-wider text-[#6D6268]">Total Paid</p>
                  <p className="font-display text-lg sm:text-xl font-bold text-[#701626]">
                    LKR {order.total.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-[#701626] group-hover:text-[#C5A059] transition-colors sm:pt-1">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
