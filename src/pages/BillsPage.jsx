import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  Receipt,
  Search,
  Filter,
  Printer,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  X,
  CreditCard,
} from 'lucide-react';
import InvoiceModal from '../components/common/InvoiceModal';

const BillsPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [paymentStatus, setPaymentStatus] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [invoiceToPay, setInvoiceToPay] = useState(null);
  const [addPaymentAmount, setAddPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('BANK_TRANSFER');
  const [processingPayment, setProcessingPayment] = useState(false);

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

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (paymentStatus) params.paymentStatus = paymentStatus;
      if (search) params.search = search;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await API.get('/invoices', { params });
      setInvoices(res.data.invoices);
      setStats(res.data.stats);
    } catch (err) {
      console.error('Error fetching invoices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [paymentStatus, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!invoiceToPay || !addPaymentAmount || Number(addPaymentAmount) <= 0) return;

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

    setProcessingPayment(true);
    try {
      await API.put(`/invoices/${invoiceToPay._id}/payment`, {
        addPaidAmount: Number(addPaymentAmount),
        paymentMode,
        paymentNotes,
      });
      alert('Payment recorded successfully with transaction notes!');
      setShowPaymentModal(false);
      setInvoiceToPay(null);
      setAddPaymentAmount('');
      setBankDetails({ bankName: '', accountNumber: '', transactionId: '' });
      setUpiDetails({ transactionId: '', upiPersonName: '' });
      setChequeDetails({ chequeNumber: '', bankName: '', bankAccountNumber: '' });
      setCashDetails({ receivedBy: '' });
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-500" />
            Bill & Invoice Records (બિલ યાદી અને પ્રિન્ટ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View, print, and track payments for all generated Tax Invoices & Bills
          </p>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Invoices</p>
          <h4 className="text-xl font-black text-slate-900 mt-1">{stats?.count || 0} Bills</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Invoiced Amount</p>
          <h4 className="text-xl font-black text-slate-900 mt-1">
            ₹{(stats?.totalInvoiceAmount || 0).toLocaleString('en-IN')}
          </h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Collected (ચૂકવાયેલ)</p>
          <h4 className="text-xl font-black text-emerald-700 mt-1">
            ₹{(stats?.totalCollected || 0).toLocaleString('en-IN')}
          </h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Pending Receivable (બાકી)</p>
          <h4 className="text-xl font-black text-rose-600 mt-1">
            ₹{(stats?.totalPending || 0).toLocaleString('en-IN')}
          </h4>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search invoice #, customer name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="">All Payment Status</option>
              <option value="PAID">Fully Paid (સંપૂર્ણ ચૂકવાયેલ)</option>
              <option value="PARTIAL">Partially Paid (અંશતઃ ચૂકવાયેલ)</option>
              <option value="PENDING">Pending (બાકી રકમ)</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700"
            />
          </div>

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
              onClick={() => {
                setPaymentStatus('');
                setSearch('');
                setStartDate('');
                setEndDate('');
              }}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              title="Reset"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4 text-right">Items & Bags</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">GST</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-8 text-center text-slate-400 font-medium">
                    No bill records found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(inv.invoiceDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">
                        {inv.partyDetails?.businessName || inv.partyDetails?.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {inv.partyDetails?.phone} {inv.partyDetails?.city && `• ${inv.partyDetails.city}`}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {inv.totalBoxes ? (
                        <>
                          <p className="font-bold text-slate-800">{inv.totalBoxes} Boxes</p>
                          <p className="text-[11px] text-slate-500">Box Sale</p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-slate-800">{inv.totalQuantityKg} kg</p>
                          <p className="text-[11px] text-slate-500">{inv.totalBags} bags</p>
                        </>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right text-slate-700 font-medium">
                      ₹{inv.subtotal?.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right text-slate-600 font-medium">
                      ₹{inv.totalGst?.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      ₹{inv.grandTotal?.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                      ₹{inv.paidAmount?.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-rose-600">
                      ₹{inv.balanceAmount > 0 ? inv.balanceAmount.toLocaleString('en-IN') : '0'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.paymentStatus === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => setActiveInvoice(inv)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Bill
                      </button>

                      {inv.balanceAmount > 0 && (
                        <button
                          onClick={() => {
                            setInvoiceToPay(inv);
                            setShowPaymentModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer"
                          title="Record Payment"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
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

      {/* Payment Entry Modal */}
      {showPaymentModal && invoiceToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Collect Invoice Payment
                </h3>
                <p className="text-amber-700 font-mono text-[11px]">{invoiceToPay.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-slate-600">
                  Party: <strong className="text-slate-900">{invoiceToPay.partyDetails?.businessName || invoiceToPay.partyDetails?.name}</strong>
                </p>
                <p className="text-slate-600">
                  Grand Total: <strong>₹{invoiceToPay.grandTotal.toLocaleString('en-IN')}</strong>
                </p>
                <p className="text-rose-600 font-bold">
                  Pending Due: ₹{invoiceToPay.balanceAmount.toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max={invoiceToPay.balanceAmount}
                  required
                  placeholder={`Max ₹${invoiceToPay.balanceAmount}`}
                  value={addPaymentAmount}
                  onChange={(e) => setAddPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Mode (ચૂકવણી પદ્ધતિ)
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold bg-white"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (RTGS/NEFT)</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CASH">Cash (રોકડ)</option>
                </select>
              </div>

              {/* Dynamic Transaction Fields based on selected Payment Mode */}
              {paymentMode === 'BANK_TRANSFER' && (
                <div className="bg-blue-50/70 border border-blue-200/80 p-3 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-blue-900 block">
                    Bank Transfer Details:
                  </span>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank, SBI, ICICI"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 50100234567890"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Transaction ID / UTR No.</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFCN26102600124"
                      value={bankDetails.transactionId}
                      onChange={(e) => setBankDetails({ ...bankDetails, transactionId: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {paymentMode === 'UPI' && (
                <div className="bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-emerald-900 block">
                    UPI Payment Details:
                  </span>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">UPI Transaction ID / Ref No.</label>
                    <input
                      type="text"
                      placeholder="e.g. 429812093812"
                      value={upiDetails.transactionId}
                      onChange={(e) => setUpiDetails({ ...upiDetails, transactionId: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">UPI Person Name / VPA ID</label>
                    <input
                      type="text"
                      placeholder="e.g. patel@okaxis or Ramesh Patel"
                      value={upiDetails.upiPersonName}
                      onChange={(e) => setUpiDetails({ ...upiDetails, upiPersonName: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                    />
                  </div>
                </div>
              )}

              {paymentMode === 'CHEQUE' && (
                <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-amber-900 block">
                    Cheque Details:
                  </span>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Cheque Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 000456"
                      value={chequeDetails.chequeNumber}
                      onChange={(e) => setChequeDetails({ ...chequeDetails, chequeNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Bank of Baroda"
                      value={chequeDetails.bankName}
                      onChange={(e) => setChequeDetails({ ...chequeDetails, bankName: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 102938475612"
                      value={chequeDetails.bankAccountNumber}
                      onChange={(e) => setChequeDetails({ ...chequeDetails, bankAccountNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {paymentMode === 'CASH' && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-slate-800 block">
                    Cash Details:
                  </span>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Received By / Handed Over To</label>
                    <input
                      type="text"
                      placeholder="e.g. Counter Cashier / Sales Executive Name"
                      value={cashDetails.receivedBy}
                      onChange={(e) => setCashDetails({ ...cashDetails, receivedBy: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingPayment}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {processingPayment ? 'Saving...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal for Viewing / Printing */}
      {activeInvoice && (
        <InvoiceModal
          invoice={activeInvoice}
          onClose={() => setActiveInvoice(null)}
        />
      )}
    </div>
  );
};

export default BillsPage;
