import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ProtectedRoute from './components/admin/ProtectedRoute.jsx';
import AdminLogin from './components/admin/AdminLogin.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import AdminProducts from './components/admin/AdminProducts.jsx';
import AdminOrders from './components/admin/AdminOrders.jsx';
import AdminSettings from './components/admin/AdminSettings.jsx';
import AdminInventory from './components/admin/AdminInventory.jsx';
import AdminMessages from './components/admin/AdminMessages.jsx';
import AdminCatalogs from './components/admin/AdminCatalogs.jsx';
import AdminReports from './components/admin/AdminReports.jsx';
import AdminAccounting from './components/admin/AdminAccounting.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/inventory" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminInventory />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/messages" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminMessages />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/catalogs" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminCatalogs />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminReports />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/accounting" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminAccounting />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
