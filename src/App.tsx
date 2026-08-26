import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import AuthGuard from '@/components/AuthGuard';
import AdminGuard from '@/components/admin/AdminGuard';

// Customer Storefront Pages
import Home from '@/pages/Home';
import Collections from '@/pages/Collections';
import CollectionDetail from '@/pages/CollectionDetail';
import ProductDetail from '@/pages/ProductDetail';
import Story from '@/pages/Story';
import Tailoring from '@/pages/Tailoring';
import Checkout from '@/pages/Checkout';
import OrderSuccess from '@/pages/OrderSuccess';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Account from '@/pages/Account';
import Contact from '@/pages/Contact';
import ShippingPolicy from '@/pages/ShippingPolicy';
import ReturnsExchanges from '@/pages/ReturnsExchanges';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import NotFound from '@/pages/NotFound';

// Master Admin Portal Pages
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminTailoring from '@/pages/admin/AdminTailoring';
import AdminFinance from '@/pages/admin/AdminFinance';
import AdminShipping from '@/pages/admin/AdminShipping';
import AdminMarketing from '@/pages/admin/AdminMarketing';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminSEO from '@/pages/admin/AdminSEO';
import AdminSettings from '@/pages/admin/AdminSettings';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location}>
          {/* Storefront Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:slug" element={<CollectionDetail />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/story" element={<Story />} />
          <Route path="/tailoring" element={<Tailoring />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          
          {/* Customer Auth & Account Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/account"
            element={
              <AuthGuard>
                <Account />
              </AuthGuard>
            }
          />

          {/* Customer Care & Policies */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/returns-exchanges" element={<ReturnsExchanges />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* ── MASTER ADMIN PORTAL ROUTES ── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminGuard>
                <AdminOrders />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminGuard>
                <AdminProducts />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminGuard>
                <AdminCategories />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/tailoring"
            element={
              <AdminGuard>
                <AdminTailoring />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/finance"
            element={
              <AdminGuard requiredRole="owner">
                <AdminFinance />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/shipping"
            element={
              <AdminGuard>
                <AdminShipping />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/marketing"
            element={
              <AdminGuard requiredRole="owner">
                <AdminMarketing />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <AdminGuard>
                <AdminCustomers />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/seo"
            element={
              <AdminGuard requiredRole="owner">
                <AdminSEO />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminGuard requiredRole="owner">
                <AdminSettings />
              </AdminGuard>
            }
          />

          {/* 404 Wildcard Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function MainLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Grain overlay */}
      <div className="grain fixed inset-0 pointer-events-none z-[9998]" />
      
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <CartDrawer />}
      
      <main>
        <AnimatedRoutes />
      </main>

      {!isAdminRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}
