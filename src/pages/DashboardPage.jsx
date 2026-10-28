import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Boxes,
  Truck,
  ShoppingBag,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Building2,
  Calendar,
  Eye,
  FileText,
} from 'lucide-react';
import InvoiceModal from '../components/common/InvoiceModal';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dashboard/stats');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const openInvoiceForOrder = async (order) => {
    if (order.invoiceId) {
      try {
        const id = typeof order.invoiceId === 'object' ? order.invoiceId._id : order.invoiceId;
        const res = await API.get(`/invoices/${id}`);
        setSelectedInvoice(res.data);
      } catch (err) {
        console.error('Error fetching invoice', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { summary, salesBreakdown, lowStockAlerts, recentOrders } = data || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-700/50">
        <div>
          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            Makhana Wholesale Hub
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Business Overview & Inventory
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Real-time track of Makhana purchases from mandi suppliers, sales to wholesalers & resellers, and stock status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/sell"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>New Sell (વેચાણ કરો)</span>
          </Link>
          <Link
            to="/purchase"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>New Buy (ખરીદી કરો)</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Sales (કુલ વેચાણ)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">
              ₹{(summary?.totalSalesAmount || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5">
              <span className="font-bold text-emerald-700">{(summary?.totalSalesKg || 0).toLocaleString()} KG</span>
              <span>sold in wholesale</span>
            </p>
          </div>
        </div>

        {/* Total Purchases */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Purchases (કુલ ખરીદી)
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">
              ₹{(summary?.totalPurchasesAmount || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5">
              <span className="font-bold text-blue-700">{(summary?.totalPurchasesKg || 0).toLocaleString()} KG</span>
              <span>bought from Mandi</span>
            </p>
          </div>
        </div>

        {/* Warehouse Stock */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Warehouse Stock (હાજર સ્ટોક)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">
              {(summary?.totalStockKg || 0).toLocaleString()} <span className="text-sm font-semibold text-slate-500">KG</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5">
              <span className="font-bold text-amber-700">{summary?.totalStockBags || 0} Bags</span>
              <span>(Val: ₹{(summary?.stockValuation || 0).toLocaleString('en-IN')})</span>
            </p>
          </div>
        </div>

        {/* Pending Receivables & Payables */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ledger Balances (બાકી રકમ)
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">To Receive (ગ્રાહક પાસેથી):</span>
              <span className="font-bold text-emerald-600">₹{(summary?.totalReceivables || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">To Pay (વેપારીને આપવાની):</span>
              <span className="font-bold text-rose-600">₹{(summary?.totalPayables || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockAlerts && lowStockAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Low Stock Warning (ઓછો સ્ટોક અલર્ટ)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {lowStockAlerts.length} Makhana grades are below safe threshold: {' '}
                <span className="font-semibold">
                  {lowStockAlerts.map(i => `${i.name} (${i.currentStockKg}kg)`).join(', ')}
                </span>
              </p>
            </div>
          </div>
          <Link
            to="/purchase"
            className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Order Stock Now
          </Link>
        </div>
      )}

      {/* Middle Grid: Category Breakdown & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Customer Type */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
            <span>Wholesale vs Reseller Sales</span>
            <span className="text-xs text-slate-400 font-normal">Customer Split</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 font-bold">Wholesalers (જથ્થાબંધ)</span>
                <span className="font-bold text-slate-900">₹{(salesBreakdown?.wholesaler || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full"
                  style={{
                    width: `${
                      summary?.totalSalesAmount > 0
                        ? Math.round(((salesBreakdown?.wholesaler || 0) / summary.totalSalesAmount) * 100)
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 font-bold">Resellers / Semi-Wholesale</span>
                <span className="font-bold text-slate-900">₹{(salesBreakdown?.reseller || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full"
                  style={{
                    width: `${
                      summary?.totalSalesAmount > 0
                        ? Math.round(((salesBreakdown?.reseller || 0) / summary.totalSalesAmount) * 100)
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[11px] text-slate-500 font-medium">Wholesalers & Resellers</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{summary?.totalCustomers || 0}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[11px] text-slate-500 font-medium">Mandi Dealers</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{summary?.totalDealers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Makhana Grade Sales Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Sales by Makhana Grade (ગ્રેડ મુજબ વેચાણ)
              </h3>
              <p className="text-xs text-slate-400">Demand breakdown by suta & size</p>
            </div>
            <Link to="/stock" className="text-xs text-amber-600 hover:text-amber-700 font-bold">
              View Inventory →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="pb-2">Grade</th>
                  <th className="pb-2 text-right">Volume (KG)</th>
                  <th className="pb-2 text-right">Revenue (₹)</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(salesBreakdown?.byGrade || []).map((grade, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-bold text-slate-800">{grade.name}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-700">
                      {grade.totalKg.toLocaleString()} kg
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      ₹{grade.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        In Demand
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Transactions (તાજેતરના ઓર્ડર)
            </h3>
            <p className="text-xs text-slate-400">Latest buy & sell orders</p>
          </div>
          <Link to="/orders" className="text-xs text-amber-600 hover:text-amber-700 font-bold">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] bg-slate-50/80">
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Party (ગ્રાહક / વેપારી)</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                <th className="py-2.5 px-3 text-center">Payment</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(recentOrders || []).map((order) => (
                <tr key={order._id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3">
                    {order.orderType === 'BUY' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        <ArrowDownLeft className="w-3 h-3" />
                        BUY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        <ArrowUpRight className="w-3 h-3" />
                        SELL
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                    {order.orderNumber}
                  </td>
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-slate-900">{order.partyBusinessName || order.partyName}</p>
                    <span className="text-[11px] text-slate-400 capitalize">{order.partyCategory}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-medium">
                    {new Date(order.orderDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                    {order.totalQuantityKg} kg <span className="text-[11px] font-normal text-slate-400">({order.totalBags} bags)</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900">
                    ₹{order.grandTotal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.paymentStatus === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {order.invoiceGenerated ? (
                      <button
                        onClick={() => openInvoiceForOrder(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold transition-colors cursor-pointer"
                        title="View & Print Bill"
                      >
                        <FileText className="w-3 h-3 text-amber-600" />
                        Bill
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal for Viewing / Printing */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
