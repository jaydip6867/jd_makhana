import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import StockPage from './pages/StockPage';
import PurchasePage from './pages/PurchasePage';
import SellPage from './pages/SellPage';
import OrdersPage from './pages/OrdersPage';
import BillsPage from './pages/BillsPage';
import PartiesPage from './pages/PartiesPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="purchase" element={<PurchasePage />} />
            <Route path="sell" element={<SellPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="bills" element={<BillsPage />} />
            <Route path="dealers" element={<PartiesPage initialType="dealer" />} />
            <Route path="customers" element={<PartiesPage initialType="customer" />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
