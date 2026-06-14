import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ProtectedRoute from './components/admin/ProtectedRoute.jsx';
import AdminLogin from './components/admin/AdminLogin.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';

const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard.jsx'));
const AdminProducts = lazy(() => import('./components/admin/AdminProducts.jsx'));
const AdminOrders = lazy(() => import('./components/admin/AdminOrders.jsx'));
const AdminSettings = lazy(() => import('./components/admin/AdminSettings.jsx'));
const AdminInventory = lazy(() => import('./components/admin/AdminInventory.jsx'));
const AdminSiteDesign = lazy(() => import('./components/admin/AdminSiteDesign.jsx'));

const AdminMessages = lazy(() => import('./components/admin/AdminMessages.jsx'));
const AdminCatalogs = lazy(() => import('./components/admin/AdminCatalogs.jsx'));
const AdminReports = lazy(() => import('./components/admin/AdminReports.jsx'));
const AdminAccounting = lazy(() => import('./components/admin/AdminAccounting.jsx'));
const AdminImport = lazy(() => import('./components/admin/AdminImport.jsx'));

function SuspenseWrapper({ children }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[var(--color-warm-gray)] border-t-[var(--color-gold)] rounded-full animate-spin" />
          <span className="font-inter text-[11px] uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Cargando</span>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={
              <CartProvider>
                <LandingPage />
              </CartProvider>
            } />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout>
                  <SuspenseWrapper><AdminDashboard /></SuspenseWrapper>
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute>
                <AdminLayout>
                  <SuspenseWrapper><AdminProducts /></SuspenseWrapper>
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute>
                <AdminLayout>
                  <SuspenseWrapper><AdminOrders /></SuspenseWrapper>
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/inventory" element={
              <ProtectedRoute>
                <AdminLayout>
                  <SuspenseWrapper><AdminInventory /></SuspenseWrapper>
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/messages" element={
              <ProtectedRoute>
                <AdminLayout>
                  <SuspenseWrapper><AdminMessages /></SuspenseWrapper>
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/catalogs" element={
              <ProtectedRoute>
                <AdminLayout>
                  <SuspenseWrapper><AdminCatalogs /></SuspenseWrapper>
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute>
                <AdminLayout>
                  <SuspenseWrapper><AdminReports /></SuspenseWrapper>
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/accounting" element={
              <ProtectedRoute>
                <AdminLayout>
                  <SuspenseWrapper><AdminAccounting /></SuspenseWrapper>
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/import" element={
              <ProtectedRoute>
                <AdminLayout>
                  <SuspenseWrapper><AdminImport /></SuspenseWrapper>
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/site-design" element={
              <ProtectedRoute>
                <AdminLayout>
                  <SuspenseWrapper><AdminSiteDesign /></SuspenseWrapper>
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <AdminLayout>
                  <SuspenseWrapper><AdminSettings /></SuspenseWrapper>
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
