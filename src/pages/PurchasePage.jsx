import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  Truck,
  Plus,
  Trash2,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';

const PurchasePage = () => {
  const [dealers, setDealers] = useState([]);
  const [items, setItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [isNewDealer, setIsNewDealer] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState('');
  const [newDealer, setNewDealer] = useState({
    name: '',
    businessName: '',
    phone: '',
    city: 'Darbhanga',
    state: 'Bihar',
    gstin: '',
  });

  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [orderLines, setOrderLines] = useState([
    { item: '', quantityKg: 500, bags: 50, ratePerKg: 750 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('BANK_TRANSFER');

  // Load Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [dealersRes, itemsRes, ordersRes] = await Promise.all([
        API.get('/parties?type=dealer'),
        API.get('/items'),
        API.get('/orders?orderType=BUY'),
      ]);
      setDealers(dealersRes.data);
      setItems(itemsRes.data.items);
      setPurchases(ordersRes.data.orders);

      if (dealersRes.data.length > 0 && !selectedDealerId) {
        setSelectedDealerId(dealersRes.data[0]._id);
      }
      if (itemsRes.data.items.length > 0 && !orderLines[0].item) {
        setOrderLines([
          {
            item: itemsRes.data.items[0]._id,
            quantityKg: 500,
            bags: 50,
            ratePerKg: itemsRes.data.items[0].avgPurchaseRate || 750,
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching purchase data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update line item
  const updateLine = (idx, field, value) => {
    const updated = [...orderLines];
    updated[idx][field] = value;

    if (field === 'item') {
      const selected = items.find((i) => i._id === value);
      if (selected) {
        if (selected.avgPurchaseRate) updated[idx].ratePerKg = selected.avgPurchaseRate;
        if (selected.bagWeightKg) {
          updated[idx].bags = Math.round((updated[idx].quantityKg / selected.bagWeightKg) * 10) / 10;
        }
      }
    }

    if (field === 'quantityKg') {
      const selected = items.find((i) => i._id === updated[idx].item);
      const bagWeight = selected?.bagWeightKg || 10;
      updated[idx].bags = Math.round((Number(value) / bagWeight) * 10) / 10;
    }

    setOrderLines(updated);
  };

  const addLine = () => {
    if (items.length === 0) return;
    setOrderLines([
      ...orderLines,
      {
        item: items[0]._id,
        quantityKg: 500,
        bags: 50,
        ratePerKg: items[0].avgPurchaseRate || 750,
      },
    ]);
  };

  const removeLine = (idx) => {
    if (orderLines.length === 1) return;
    setOrderLines(orderLines.filter((_, i) => i !== idx));
  };

  // Computations
  const subtotal = orderLines.reduce((sum, line) => {
    return sum + (Number(line.quantityKg) || 0) * (Number(line.ratePerKg) || 0);
  }, 0);
  const grandTotal = Math.max(0, subtotal - (Number(discount) || 0));
  const balanceDue = Math.max(0, grandTotal - (Number(paidAmount) || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (orderLines.some((l) => !l.item || Number(l.quantityKg) <= 0)) {
      alert('Please select valid item and quantity for all rows.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        orderType: 'BUY',
        orderDate,
        items: orderLines,
        discount: Number(discount) || 0,
        paidAmount: Number(paidAmount) || 0,
        paymentMode,
        vehicleNumber,
        notes,
      };

      if (isNewDealer) {
        payload.newParty = newDealer;
      } else {
        payload.partyId = selectedDealerId;
      }

      await API.post('/orders', payload);
      alert('Purchase order recorded! Inventory stock has been updated automatically.');
      
      // Reset form
      setNotes('');
      setVehicleNumber('');
      setPaidAmount(0);
      setIsNewDealer(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording purchase');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDealerObj = dealers.find((d) => d._id === selectedDealerId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Truck className="w-6 h-6 text-blue-600" />
          Makhana Purchase & Mandi Inflow (ખરીદી ઓર્ડર)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Record Makhana bought from Bihar Mandis & Suppliers. Automatically increments warehouse stock.
        </p>
      </div>

      {/* Main Grid: Order Form on Left, History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <h3 className="font-bold text-sm text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>New Makhana Purchase Entry (નવી ખરીદી એન્ટ્રી)</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Stock In (+KG)
            </span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Dealer Selection */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-slate-700">
                  Dealer / Mandi Supplier (વેપારી પસંદ કરો)
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewDealer(!isNewDealer)}
                  className="text-blue-600 hover:text-blue-800 font-bold text-[11px] cursor-pointer"
                >
                  {isNewDealer ? '← Select Existing Dealer' : '+ Add New Dealer (નવો વેપારી)'}
                </button>
              </div>

              {!isNewDealer ? (
                <div>
                  <select
                    value={selectedDealerId}
                    onChange={(e) => setSelectedDealerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
                  >
                    {dealers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.businessName || d.name} ({d.city}, {d.phone})
                      </option>
                    ))}
                  </select>

                  {selectedDealerObj && (
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                      <span>
                        City: <strong className="text-slate-700">{selectedDealerObj.city}</strong> | Phone: <strong className="text-slate-700">{selectedDealerObj.phone}</strong>
                      </span>
                      <span>
                        Current Balance: <strong className={selectedDealerObj.currentBalance < 0 ? 'text-rose-600' : 'text-slate-700'}>
                          ₹{Math.abs(selectedDealerObj.currentBalance).toLocaleString('en-IN')} {selectedDealerObj.currentBalance < 0 ? '(Payable)' : ''}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Add New Dealer on the fly */
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Supplier / Firm Name *"
                      value={newDealer.businessName}
                      onChange={(e) => setNewDealer({ ...newDealer, businessName: e.target.value, name: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number *"
                      value={newDealer.phone}
                      onChange={(e) => setNewDealer({ ...newDealer, phone: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="City (e.g. Darbhanga)"
                      value={newDealer.city}
                      onChange={(e) => setNewDealer({ ...newDealer, city: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      placeholder="State (e.g. Bihar)"
                      value={newDealer.state}
                      onChange={(e) => setNewDealer({ ...newDealer, state: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      placeholder="GSTIN (Optional)"
                      value={newDealer.gstin}
                      onChange={(e) => setNewDealer({ ...newDealer, gstin: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Date & Transport */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Order / Dispatch Date (તારીખ)
                </label>
                <input
                  type="date"
                  required
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Truck / Vehicle # (ગાડી નંબર)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BR-07-G-4589"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Items Table in Form */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-3 py-2 flex items-center justify-between font-bold text-slate-700">
                <span>Makhana Grades (ખરીદી આઈટમ્સ)</span>
                <button
                  type="button"
                  onClick={addLine}
                  className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Grade Row
                </button>
              </div>

              <div className="p-3 space-y-2 bg-white">
                {orderLines.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1">
                      <select
                        value={line.item}
                        onChange={(e) => updateLine(idx, 'item', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-md font-semibold text-slate-800"
                      >
                        {items.map((i) => (
                          <option key={i._id} value={i._id}>
                            {i.name} (Stock: {i.currentStockKg}kg)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        placeholder="KG"
                        value={line.quantityKg}
                        onChange={(e) => updateLine(idx, 'quantityKg', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-right font-bold"
                      />
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        min="0"
                        placeholder="Bags"
                        value={line.bags}
                        onChange={(e) => updateLine(idx, 'bags', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-right text-slate-600"
                      />
                    </div>

                    <div className="w-24">
                      <input
                        type="number"
                        min="0"
                        placeholder="₹/KG"
                        value={line.ratePerKg}
                        onChange={(e) => updateLine(idx, 'ratePerKg', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-right font-bold text-slate-900"
                      />
                    </div>

                    <div className="w-24 text-right font-black text-slate-900 pr-1">
                      ₹{((Number(line.quantityKg) || 0) * (Number(line.ratePerKg) || 0)).toLocaleString('en-IN')}
                    </div>

                    {orderLines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations & Payment */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Discount / Mandi Concession (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-32 px-2.5 py-1 border border-slate-300 rounded-md text-right"
                />
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Amount Paid Now (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-emerald-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (RTGS/NEFT)</option>
                    <option value="CASH">Cash (રોકડ)</option>
                    <option value="UPI">UPI</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
              </div>

              {balanceDue > 0 && (
                <div className="flex justify-between text-rose-700 font-bold text-xs pt-1">
                  <span>Balance Payable to Dealer:</span>
                  <span>₹{balanceDue.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Purchase Notes (નોંધ)
              </label>
              <input
                type="text"
                placeholder="e.g. Mandi Lot No 23, Bihar harvest, 10% moisture tested"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? 'Recording Purchase...' : 'Save Purchase Order (ખરીદી ઓર્ડર સેવ કરો)'}
            </button>
          </form>
        </div>

        {/* History List on Right */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="font-bold text-sm text-slate-800">
              Recent Purchases (ખરીદી યાદી)
            </h3>
            <span className="text-xs text-slate-400">{purchases.length} records</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[750px] pr-1">
            {purchases.map((po) => (
              <div
                key={po._id}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-blue-700">{po.orderNumber}</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {po.partyBusinessName || po.partyName}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      po.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {po.paymentStatus}
                  </span>
                </div>

                <div className="text-slate-600">
                  <p>
                    {po.totalQuantityKg} KG ({po.totalBags} bags) • Total: <strong className="text-slate-900">₹{po.grandTotal.toLocaleString('en-IN')}</strong>
                  </p>
                  {po.balanceAmount > 0 && (
                    <p className="text-rose-600 font-semibold mt-0.5">
                      Bal Due: ₹{po.balanceAmount.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Date: {new Date(po.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  {po.vehicleNumber && <span>Truck: {po.vehicleNumber}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;
