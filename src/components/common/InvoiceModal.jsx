import React from 'react';
import { X, Printer, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const InvoiceModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatWeight = (kg) => {
    const num = Number(kg) || 0;
    if (num === 0.25) return '250 gm (0.25 kg)';
    if (num === 0.5) return '500 gm (0.50 kg)';
    if (num === 0.75) return '750 gm (0.75 kg)';
    if (num < 1) return `${Math.round(num * 1000)} gm`;
    if (num % 1 !== 0) {
      const whole = Math.floor(num);
      const remGm = Math.round((num - whole) * 1000);
      return `${whole} kg ${remGm} gm (${num} kg)`;
    }
    return `${num} kg`;
  };

  const customBiz = (() => {
    try {
      const saved = localStorage.getItem('makhana_business_settings');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  const bizName = customBiz?.firmName || 'JD MAKHANA TRADERS';
  const bizTagline = customBiz?.tagline || 'Wholesale Makhana Direct Mandi Suppliers & Processors';
  const bizAddress = customBiz?.address ? `${customBiz.address}, ${customBiz.city || ''} ${customBiz.state ? ', ' + customBiz.state : ''}` : 'APMC Market Yard, Ring Road, Surat - 395002, Gujarat';
  const bizGstin = customBiz?.gstin || '24AABCJ1098K1ZT';
  const bizPhone = customBiz?.phone || '+91 98765 43210';
  const bankName = customBiz?.bankName || 'State Bank of India';
  const bankAccount = customBiz?.accountNumber || '389012457891';
  const bankIfsc = customBiz?.ifscCode || 'SBIN0001245';
  const bankUpi = customBiz?.upiId || 'makhana.jd@sbi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden print-shadow-none">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">Tax Invoice Preview</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
              {invoice.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill (પ્રિન્ટ કરો)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 sm:p-10 text-slate-800 bg-white" id="printable-bill">
          {/* Company Header */}
          <div className="flex justify-between items-start border-b-2 border-amber-500 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center text-white font-black text-lg">
                  {bizName.charAt(0) || 'M'}
                </span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {bizName}
                </h1>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {bizTagline}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {bizAddress}
              </p>
              <p className="text-xs text-slate-500">
                GSTIN: <span className="font-semibold text-slate-700">{bizGstin}</span> | Phone: {bizPhone}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider rounded">
                {invoice.invoiceType || 'TAX INVOICE'}
              </span>
              <p className="text-sm font-mono font-bold text-slate-900 mt-2">
                {invoice.invoiceNumber}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Date: {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    invoice.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : invoice.paymentStatus === 'PARTIAL'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {invoice.paymentStatus === 'PAID' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : invoice.paymentStatus === 'PARTIAL' ? (
                    <Clock className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {invoice.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Billed To / Party Details */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Bill To / Buyer Information (ગ્રાહકની વિગત)
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-bold text-sm text-slate-900">
                  {invoice.partyDetails?.businessName || invoice.partyDetails?.name}
                </p>
                {invoice.partyDetails?.businessName && invoice.partyDetails?.name !== invoice.partyDetails?.businessName && (
                  <p className="text-slate-600 font-medium">Attn: {invoice.partyDetails.name}</p>
                )}
                <p className="text-slate-600 mt-1">{invoice.partyDetails?.address || 'Market Yard / Retail Center'}</p>
                <p className="text-slate-600">
                  {invoice.partyDetails?.city && `${invoice.partyDetails.city}, `}
                  {invoice.partyDetails?.state || 'Gujarat'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-600">
                  Phone: <span className="font-bold text-slate-800">{invoice.partyDetails?.phone}</span>
                </p>
                {invoice.partyDetails?.gstin && (
                  <p className="text-slate-600 mt-1">
                    GSTIN: <span className="font-mono font-bold text-slate-800">{invoice.partyDetails.gstin}</span>
                  </p>
                )}
                <p className="text-slate-600 mt-1">
                  Type: <span className="capitalize font-semibold text-amber-700">{invoice.partyDetails?.category || 'Wholesaler'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Makhana Grade / Description</th>
                  <th className="py-2.5 px-3 text-right">Quantity (Boxes / Qty)</th>
                  <th className="py-2.5 px-3 text-right">Rate / Unit (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(invoice.items || []).map((it, idx) => {
                  const qty = it.quantityBoxes !== undefined ? it.quantityBoxes : (it.boxes !== undefined ? it.boxes : (it.quantityKg || it.quantity || 1));
                  const isBox = it.quantityBoxes !== undefined || it.boxes !== undefined || (!it.quantityKg && !it.bags);
                  const unitLabel = isBox ? 'Boxes' : (it.unit || (it.quantityKg ? 'KG' : 'Boxes'));
                  const rate = it.ratePerBox !== undefined ? it.ratePerBox : (it.ratePerKg !== undefined ? it.ratePerKg : (it.rate || 160));
                  const itemTotal = Number(it.totalAmount) || Number(it.amount) || (Number(qty) * Number(rate));
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-slate-900">{it.itemName}</p>
                        {it.grade && <p className="text-[11px] text-slate-500">Grade: {it.grade}</p>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                        {qty} <span className="text-[10px] font-semibold text-amber-800">({unitLabel})</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                        ₹{Number(rate).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Calculation Summary */}
          <div className="flex justify-between items-start gap-6 mb-8 text-xs">
            <div className="flex-1 bg-amber-50/50 border border-amber-100 rounded-xl p-4">
              <h4 className="font-bold text-amber-900 uppercase text-[11px] mb-2">
                Bank & Payment Details
              </h4>
              <p className="text-slate-600">Bank Name: <span className="font-bold text-slate-800">{bankName}</span></p>
              <p className="text-slate-600">A/C No: <span className="font-mono font-bold text-slate-800">{bankAccount}</span></p>
              <p className="text-slate-600">IFSC Code: <span className="font-mono font-bold text-slate-800">{bankIfsc}</span></p>
              <p className="text-slate-600">UPI ID: <span className="font-mono font-bold text-slate-800">{bankUpi}</span></p>
            </div>

            <div className="w-64 space-y-1.5 text-right">
              <div className="flex justify-between text-slate-600 py-0.5">
                <span>Subtotal:</span>
                <span className="font-medium">₹{invoice.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600 py-0.5">
                  <span>Discount:</span>
                  <span>-₹{invoice.discount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              {invoice.totalGst > 0 && (
                <>
                  <div className="flex justify-between text-slate-600 py-0.5">
                    <span>CGST ({invoice.gstRate / 2}%):</span>
                    <span>₹{invoice.cgstAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 py-0.5">
                    <span>SGST ({invoice.gstRate / 2}%):</span>
                    <span>₹{invoice.sgstAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}
              <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Grand Total:</span>
                <span>₹{invoice.grandTotal?.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-emerald-700 pt-1 font-semibold">
                <span>Paid Amount:</span>
                <span>₹{invoice.paidAmount?.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-rose-700 pt-0.5 font-bold">
                <span>Balance Due:</span>
                <span>₹{invoice.balanceAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Terms & Signature */}
          <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-700 mb-1">Terms & Conditions:</p>
              <p>1. Goods once sold will not be returned or exchanged.</p>
              <p>2. Payment strictly as agreed on delivery.</p>
              <p>3. Standard moisture level & quality guaranteed at delivery time.</p>
            </div>

            <div className="text-center">
              <div className="w-40 border-b border-slate-400 mb-2"></div>
              <p className="font-bold text-slate-800">For JD MAKHANA TRADERS</p>
              <p className="text-[11px] text-slate-500">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
