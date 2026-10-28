import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Eye,
  FileText,
  Printer,
  X,
  CreditCard,
  Download,
} from 'lucide-react';
import InvoiceModal from '../components/common/InvoiceModal';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [orderType, setOrderType] = useState(''); // '' (All), 'BUY', 'SELL'
  const [customerCategory, setCustomerCategory] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentInput, setPaymentInput] = useState('');
  const [paymentMode, setPaymentMode] = useState('BANK_TRANSFER');
  const [updatingPayment, setUpdatingPayment] = useState(false);

  // Dynamic Payment Method Details State
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    transactionId: '',
  });
  const [upiDetails, setUpiDetails] = useState({
    transactionId: '',
    upiPersonName: '',
  });
  const [chequeDetails, setChequeDetails] = useState({
    chequeNumber: '',
    bankName: '',
    bankAccountNumber: '',
  });
  const [cashDetails, setCashDetails] = useState({
    receivedBy: '',
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (orderType) params.orderType = orderType;
      if (customerCategory) params.customerCategory = customerCategory;
      if (paymentStatus) params.paymentStatus = paymentStatus;
      if (search) params.search = search;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await API.get('/orders', { params });
      setOrders(res.data.orders);
      setSummary(res.data.summary);
    } catch (err) {
      console.error('Error fetching orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [orderType, customerCategory, paymentStatus, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleResetFilters = () => {
    setOrderType('');
    setCustomerCategory('');
    setPaymentStatus('');
    setSearch('');
    setStartDate('');
    setEndDate('');
  };

  const openInvoiceForOrder = async (order) => {
    if (order.invoiceId) {
      try {
        const id = typeof order.invoiceId === 'object' ? order.invoiceId._id : order.invoiceId;
        const res = await API.get(`/invoices/${id}`);
        setSelectedInvoice(res.data);
      } catch (err) {
        alert('Could not open bill.');
      }
    }
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !paymentInput || Number(paymentInput) <= 0) return;

    let paymentNotes = '';
    if (paymentMode === 'BANK_TRANSFER') {
      paymentNotes = `Bank: ${bankDetails.bankName || 'N/A'} | A/C: ${bankDetails.accountNumber || 'N/A'} | Txn ID: ${bankDetails.transactionId || 'N/A'}`;
    } else if (paymentMode === 'UPI') {
      paymentNotes = `UPI Txn ID: ${upiDetails.transactionId || 'N/A'} | Payer: ${upiDetails.upiPersonName || 'N/A'}`;
    } else if (paymentMode === 'CHEQUE') {
      paymentNotes = `Cheque No: ${chequeDetails.chequeNumber || 'N/A'} | Bank: ${chequeDetails.bankName || 'N/A'} | A/C: ${chequeDetails.bankAccountNumber || 'N/A'}`;
    } else if (paymentMode === 'CASH') {
      paymentNotes = `Cash Received By: ${cashDetails.receivedBy || 'Counter'}`;
    }

    setUpdatingPayment(true);
    try {
      await API.put(`/orders/${selectedOrder._id}/payment`, {
        addPaidAmount: Number(paymentInput),
        paymentMode,
        paymentNotes,
      });
      alert('Payment recorded successfully with transaction notes!');
      setPaymentInput('');
      setBankDetails({ bankName: '', accountNumber: '', transactionId: '' });
      setUpiDetails({ transactionId: '', upiPersonName: '' });
      setChequeDetails({ chequeNumber: '', bankName: '', bankAccountNumber: '' });
      setCashDetails({ receivedBy: '' });
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating payment');
    } finally {
      setUpdatingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Orders Master (બધા ઓર્ડર અને ફિલ્ટર્સ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Complete records of buy & sell transactions with instant filters
          </p>
        </div>

        {/* Tab-style Type Switcher */}
        <div className="inline-flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setOrderType('')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              orderType === '' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Orders ({summary?.totalOrders || 0})
          </button>
          <button
            onClick={() => setOrderType('SELL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              orderType === 'SELL' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Sell Orders
          </button>
          <button
            onClick={() => setOrderType('BUY')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              orderType === 'BUY' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Buy Orders
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search party, phone, order #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={customerCategory}
              onChange={(e) => setCustomerCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="">All Categories</option>
              <option value="wholesaler">Wholesalers (જથ્થાબંધ)</option>
              <option value="reseller">Resellers (રિસેલર)</option>
              <option value="dealer_supplier">Mandi Suppliers (વેપારી)</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="">All Payment Status</option>
              <option value="PAID">Paid (ચૂકવાયેલ)</option>
              <option value="PARTIAL">Partial (અંશતઃ ચૂકવાયેલ)</option>
              <option value="PENDING">Pending (બાકી)</option>
            </select>
          </div>

          {/* Date from */}
          <div>
            <input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700"
            />
          </div>

          {/* Date to & Reset */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700"
            />
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 shrink-0 cursor-pointer"
              title="Reset Filters"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Dynamic Summary Strip for Current Filters */}
        {summary && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Orders Count</span>
              <p className="font-black text-slate-900">{summary.totalOrders}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Volume (KG)</span>
              <p className="font-black text-slate-900">{summary.totalVolumeKg.toLocaleString()} kg</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Bags</span>
              <p className="font-black text-amber-800">{summary.totalBags}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Value</span>
              <p className="font-black text-slate-900">₹{summary.totalAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Paid</span>
              <p className="font-black text-emerald-700">₹{summary.totalPaid.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Balance</span>
              <p className="font-black text-rose-600">₹{summary.totalPendingBalance.toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Party / Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Items & Qty</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400 font-medium">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      {order.orderType === 'BUY' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          <ArrowDownLeft className="w-3 h-3" />
                          BUY (ખરીદી)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          <ArrowUpRight className="w-3 h-3" />
                          SELL (વેચાણ)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {order.orderNumber}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">
                        {order.partyBusinessName || order.partyName}
                      </p>
                      <p className="text-[11px] text-slate-400 capitalize">
                        {order.partyCategory} • {order.partyPhone}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(order.orderDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {order.totalBoxes ? (
                        <>
                          <p className="font-bold text-slate-900">{order.totalBoxes} Boxes</p>
                          <p className="text-[11px] text-amber-800 font-medium">Box Order</p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-slate-900">{order.totalQuantityKg} kg</p>
                          <p className="text-[11px] text-amber-800 font-medium">{order.totalBags} bags</p>
                        </>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      ₹{order.grandTotal.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                      ₹{order.paidAmount?.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-rose-600">
                      ₹{order.balanceAmount > 0 ? order.balanceAmount.toLocaleString('en-IN') : '0'}
                    </td>

                    <td className="py-3 px-4 text-center">
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

                    <td className="py-3 px-4 text-center whitespace-nowrap space-x-1">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {order.invoiceGenerated && (
                        <button
                          onClick={() => openInvoiceForOrder(order)}
                          className="p-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                          title="View & Print Bill"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Payment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {selectedOrder.orderNumber}
                </span>
                <p className="text-[11px] text-slate-500">
                  {selectedOrder.orderType === 'BUY' ? 'Purchase from Dealer' : 'Sale Order to Customer'}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-900 text-sm">
                  {selectedOrder.partyBusinessName || selectedOrder.partyName}
                </p>
                <p className="text-slate-500">Phone: {selectedOrder.partyPhone}</p>
                <p className="text-slate-500">
                  Date: {new Date(selectedOrder.orderDate).toLocaleDateString('en-IN')}
                </p>
                {selectedOrder.vehicleNumber && (
                  <p className="text-slate-500">Vehicle: {selectedOrder.vehicleNumber}</p>
                )}
              </div>

              {/* Items List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                    <tr>
                      <th className="p-2">Item Grade</th>
                      <th className="p-2 text-right">Quantity</th>
                      <th className="p-2 text-right">Rate</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedOrder.items || []).map((it, idx) => {
                      const qty = it.quantityBoxes !== undefined ? it.quantityBoxes : (it.boxes !== undefined ? it.boxes : (it.quantityKg || 1));
                      const unit = it.quantityBoxes !== undefined || it.boxes !== undefined ? 'Boxes' : (it.quantityKg ? 'kg' : 'Boxes');
                      const rate = it.ratePerBox !== undefined ? it.ratePerBox : (it.ratePerKg || 160);
                      const amt = Number(it.totalAmount) || Number(it.amount) || (Number(qty) * Number(rate));
                      return (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{it.itemName}</td>
                          <td className="p-2 text-right font-bold text-slate-800">{qty} {unit}</td>
                          <td className="p-2 text-right">₹{rate}</td>
                          <td className="p-2 text-right font-bold">₹{amt.toLocaleString('en-IN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-1 text-right pt-2 border-t border-slate-100 font-medium">
                <p className="text-slate-500">Subtotal: ₹{selectedOrder.subtotal?.toLocaleString('en-IN')}</p>
                {selectedOrder.discount > 0 && <p className="text-emerald-600">Discount: -₹{selectedOrder.discount}</p>}
                {selectedOrder.taxAmount > 0 && <p className="text-slate-500">GST: +₹{selectedOrder.taxAmount}</p>}
                <p className="text-base font-black text-slate-900">Grand Total: ₹{selectedOrder.grandTotal?.toLocaleString('en-IN')}</p>
                <p className="text-emerald-700 font-bold">Paid: ₹{selectedOrder.paidAmount?.toLocaleString('en-IN')}</p>
                <p className="text-rose-700 font-bold">Balance: ₹{selectedOrder.balanceAmount?.toLocaleString('en-IN')}</p>
              </div>

              {/* Quick Update Payment Form if Balance > 0 */}
              {selectedOrder.balanceAmount > 0 && (
                <form onSubmit={handleUpdatePayment} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2 mt-2">
                  <p className="font-bold text-amber-900 text-xs">
                    Receive / Make Payment (બાકી રકમ જમા કરો)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      required
                      min="1"
                      max={selectedOrder.balanceAmount}
                      placeholder={`Max ₹${selectedOrder.balanceAmount}`}
                      value={paymentInput}
                      onChange={(e) => setPaymentInput(e.target.value)}
                      className="px-3 py-1.5 border border-amber-300 bg-white rounded-lg font-bold"
                    />
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="px-2 py-1.5 border border-amber-300 bg-white rounded-lg font-semibold"
                    >
                      <option value="BANK_TRANSFER">Bank Transfer (RTGS/NEFT)</option>
                      <option value="UPI">UPI</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="CASH">Cash (રોકડ)</option>
                    </select>
                  </div>

                  {paymentMode === 'BANK_TRANSFER' && (
                    <div className="bg-white border border-blue-200 p-2.5 rounded-lg space-y-1.5 text-left">
                      <input
                        type="text"
                        placeholder="Bank Name (e.g. HDFC/SBI)"
                        value={bankDetails.bankName}
                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Account Number"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Transaction ID / UTR No."
                        value={bankDetails.transactionId}
                        onChange={(e) => setBankDetails({ ...bankDetails, transactionId: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                  )}

                  {paymentMode === 'UPI' && (
                    <div className="bg-white border border-emerald-200 p-2.5 rounded-lg space-y-1.5 text-left">
                      <input
                        type="text"
                        placeholder="UPI Txn ID / Reference No."
                        value={upiDetails.transactionId}
                        onChange={(e) => setUpiDetails({ ...upiDetails, transactionId: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="UPI Person Name / VPA ID"
                        value={upiDetails.upiPersonName}
                        onChange={(e) => setUpiDetails({ ...upiDetails, upiPersonName: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  )}

                  {paymentMode === 'CHEQUE' && (
                    <div className="bg-white border border-amber-200 p-2.5 rounded-lg space-y-1.5 text-left">
                      <input
                        type="text"
                        placeholder="Cheque Number"
                        value={chequeDetails.chequeNumber}
                        onChange={(e) => setChequeDetails({ ...chequeDetails, chequeNumber: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Bank Name"
                        value={chequeDetails.bankName}
                        onChange={(e) => setChequeDetails({ ...chequeDetails, bankName: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Bank Account Number"
                        value={chequeDetails.bankAccountNumber}
                        onChange={(e) => setChequeDetails({ ...chequeDetails, bankAccountNumber: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                  )}

                  {paymentMode === 'CASH' && (
                    <div className="bg-white border border-slate-200 p-2.5 rounded-lg text-left">
                      <input
                        type="text"
                        placeholder="Received By / Handed Over To"
                        value={cashDetails.receivedBy}
                        onChange={(e) => setCashDetails({ ...cashDetails, receivedBy: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={updatingPayment}
                    className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    {updatingPayment ? 'Updating...' : 'Record Payment'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

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

export default OrdersPage;
