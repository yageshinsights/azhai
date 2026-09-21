import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import ScrollToTop from '@/components/ScrollToTop';
import AuthGuard from '@/components/AuthGuard';
import AdminGuard from '@/components/admin/AdminGuard';
import AtelierLoader from '@/components/AtelierLoader';
import ErrorBoundary from '@/components/ErrorBoundary';
import WhatsAppConcierge from '@/components/WhatsAppConcierge';
import NewsletterModal from '@/components/NewsletterModal';
import A2HSPrompt from '@/components/A2HSPrompt';

// ── Customer Storefront Pages (Lazy Loaded) ──
const Home = lazy(() => import('@/pages/Home'));
const Collections = lazy(() => import('@/pages/Collections'));
const CollectionDetail = lazy(() => import('@/pages/CollectionDetail'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Story = lazy(() => import('@/pages/Story'));
const Tailoring = lazy(() => import('@/pages/Tailoring'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Account = lazy(() => import('@/pages/Account'));
const Contact = lazy(() => import('@/pages/Contact'));
const ShippingPolicy = lazy(() => import('@/pages/ShippingPolicy'));
const ReturnsExchanges = lazy(() => import('@/pages/ReturnsExchanges'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('@/pages/TermsConditions'));
const ComingSoon = lazy(() => import('@/pages/ComingSoon'));
const NotFound = lazy(() => import('@/pages/NotFound'));
import { useAdminStore } from '@/store/admin';

// ── Master Admin Portal Pages (Lazy Loaded) ──
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminTailoring = lazy(() => import('@/pages/admin/AdminTailoring'));
const AdminFinance = lazy(() => import('@/pages/admin/AdminFinance'));
const AdminShipping = lazy(() => import('@/pages/admin/AdminShipping'));
const AdminMarketing = lazy(() => import('@/pages/admin/AdminMarketing'));
const AdminCustomers = lazy(() => import('@/pages/admin/AdminCustomers'));
const AdminSEO = lazy(() => import('@/pages/admin/AdminSEO'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));

const pageVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
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
        <Suspense fallback={<AtelierLoader />}>
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
            <Route path="/returns" element={<Navigate to="/returns-exchanges" replace />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/coming-soon" element={<ComingSoon />} />

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
              path="/admin/inquiries"
              element={
                <AdminGuard>
                  <AdminCustomers />
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
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function MainLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isComingSoonRoute = location.pathname === '/coming-soon';
  const comingSoonEnabled = useAdminStore((s) => s.settings?.comingSoonMode?.enabled);
  const isPreviewUnlocked = typeof window !== 'undefined' && sessionStorage.getItem('azhai_preview_unlocked') === 'true';
  const showComingSoon = isComingSoonRoute || (comingSoonEnabled && !isAdminRoute && !isPreviewUnlocked);

  if (showComingSoon && !isAdminRoute) {
    return (
      <main className="overflow-x-hidden min-h-screen bg-[#0F080A]">
        <Suspense fallback={<AtelierLoader />}>
          <ComingSoon />
        </Suspense>
      </main>
    );
  }

  return (
    <>
      {/* Grain overlay */}
      <div className="grain fixed inset-0 pointer-events-none z-[9998]" />
      
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <CartDrawer />}
      
      <main className={`overflow-x-hidden min-h-screen bg-[#FCFBF8] ${!isAdminRoute ? 'pb-16 lg:pb-0' : ''}`}>
        <AnimatedRoutes />
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <MobileBottomNav />}
      <WhatsAppConcierge />
      {!isAdminRoute && <NewsletterModal />}
      {!isAdminRoute && <A2HSPrompt />}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <MainLayout />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
