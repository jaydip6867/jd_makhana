import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Users2,
  Calendar,
  Check,
  Printer,
  Sparkles,
  PackageCheck,
  Package,
} from 'lucide-react';
import InvoiceModal from '../components/common/InvoiceModal';

const SellPage = () => {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState(null);

  // Customer State
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    businessName: '',
    phone: '',
    customerCategory: 'wholesaler',
    city: 'Surat',
    state: 'Gujarat',
    address: '',
    gstin: '',
  });

  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));

  // Selected Items Map: itemId -> { item, itemName, grade, boxes, ratePerBox }
  const [selectedItemsMap, setSelectedItemsMap] = useState({});

  const [discount, setDiscount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(5); // 5% GST
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('BANK_TRANSFER');
  const [notes, setNotes] = useState('');
  const [autoGenerateInvoice, setAutoGenerateInvoice] = useState(true);

  // Dynamic Payment Details State
  const [bankDetails, setBankDetails] = useState({ bankName: '', accountNumber: '', transactionId: '' });
  const [upiDetails, setUpiDetails] = useState({ transactionId: '', upiPersonName: '' });
  const [chequeDetails, setChequeDetails] = useState({ chequeNumber: '', bankName: '', bankAccountNumber: '' });
  const [cashDetails, setCashDetails] = useState({ receivedBy: '' });

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [custRes, itemsRes, ordersRes] = await Promise.all([
        API.get('/parties?type=customer'),
        API.get('/items'),
        API.get('/orders?orderType=SELL'),
      ]);
      setCustomers(custRes.data);
      setItems(itemsRes.data.items);
      setSalesOrders(ordersRes.data.orders);

      if (custRes.data.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(custRes.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching sales data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedCustomerObj = customers.find((c) => c._id === selectedCustomerId);

  // Toggle Item in Selection (Starts with 1 Box at ₹160)
  const toggleItemSelection = (item) => {
    setSelectedItemsMap((prev) => {
      const copy = { ...prev };
      if (copy[item._id]) {
        // Uncheck / Remove
        delete copy[item._id];
      } else {
        // Check / Add: Start with exactly 1 Box at base selling rate ₹160
        const defaultRate = item.boxSellingRate || 160;
        copy[item._id] = {
          item: item._id,
          itemName: item.name,
          grade: item.grade,
          boxes: 1, // Starting from 1 Box
          ratePerBox: defaultRate, // Minimum/default ₹160 per box
        };
      }
      return copy;
    });
  };

  // Update Boxes count for a particular item
  const updateItemBoxes = (itemId, newBoxes) => {
    const rawVal = Number(newBoxes);
    if (isNaN(rawVal)) return;
    const boxes = Math.max(1, Math.floor(rawVal));

    setSelectedItemsMap((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      return {
        ...prev,
        [itemId]: {
          ...existing,
          boxes,
        },
      };
    });
  };

  const adjustBoxes = (itemId, delta) => {
    const existing = selectedItemsMap[itemId];
    if (!existing) return;
    const current = existing.boxes || 1;
    const newBoxes = Math.max(1, current + delta);
    updateItemBoxes(itemId, newBoxes);
  };

  // Update Rate per Box for a particular item (user can adjust higher or lower)
  const updateItemRate = (itemId, newRate) => {
    const rate = Number(newRate) || 0;
    setSelectedItemsMap((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      return {
        ...prev,
        [itemId]: {
          ...existing,
          ratePerBox: rate,
        },
      };
    });
  };

  // Convert selected map to array for real-time reactivity
  const cartItemsList = Object.values(selectedItemsMap);

  // Real-time reactive totals
  const totalBoxes = cartItemsList.reduce((sum, line) => sum + (Number(line.boxes) || 0), 0);
  const subtotal = cartItemsList.reduce((sum, line) => {
    return sum + (Number(line.boxes) || 0) * (Number(line.ratePerBox) || 0);
  }, 0);

  const taxable = Math.max(0, subtotal - (Number(discount) || 0));
  const taxAmount = Math.round((taxable * (Number(taxPercent) || 0) / 100) * 100) / 100;
  const grandTotal = Math.round((taxable + taxAmount) * 100) / 100;
  const balanceDue = Math.max(0, grandTotal - (Number(paidAmount) || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItemsList.length === 0) {
      alert('Please select at least one Makhana grade box to sell.');
      return;
    }

    // Build payment notes if any
    let paymentNotes = '';
    if (paidAmount > 0) {
      if (paymentMode === 'BANK_TRANSFER') {
        paymentNotes = `Bank: ${bankDetails.bankName || 'N/A'} | A/C: ${bankDetails.accountNumber || 'N/A'} | Txn ID: ${bankDetails.transactionId || 'N/A'}`;
      } else if (paymentMode === 'UPI') {
        paymentNotes = `UPI Txn ID: ${upiDetails.transactionId || 'N/A'} | Payer: ${upiDetails.upiPersonName || 'N/A'}`;
      } else if (paymentMode === 'CHEQUE') {
        paymentNotes = `Cheque No: ${chequeDetails.chequeNumber || 'N/A'} | Bank: ${chequeDetails.bankName || 'N/A'} | A/C: ${chequeDetails.bankAccountNumber || 'N/A'}`;
      } else if (paymentMode === 'CASH') {
        paymentNotes = `Cash Received By: ${cashDetails.receivedBy || 'Counter'}`;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        orderType: 'SELL',
        orderDate,
        items: cartItemsList.map((l) => ({
          item: l.item,
          itemName: l.itemName,
          grade: l.grade,
          quantityBoxes: l.boxes,
          ratePerBox: l.ratePerBox,
          quantityKg: 0,
          bags: 0,
          ratePerKg: 0,
          amount: Math.round(l.boxes * l.ratePerBox * 100) / 100,
          totalAmount: Math.round(l.boxes * l.ratePerBox * 100) / 100,
        })),
        discount: Number(discount) || 0,
        taxPercent: Number(taxPercent) || 0,
        paidAmount: Number(paidAmount) || 0,
        paymentMode,
        notes: notes ? `${notes}${paymentNotes ? ' | ' + paymentNotes : ''}` : paymentNotes,
        autoGenerateInvoice,
      };

      if (isNewCustomer) {
        payload.newParty = newCustomer;
      } else {
        payload.partyId = selectedCustomerId;
      }

      const res = await API.post('/orders', payload);
      const createdOrder = res.data.order;

      // If invoice was generated, immediately fetch and show printable bill!
      if (createdOrder.invoiceId) {
        try {
          const invRes = await API.get(`/invoices/${createdOrder.invoiceId}`);
          setSelectedInvoiceForModal(invRes.data);
        } catch (err) {
          console.error(err);
        }
      } else {
        alert('Sale order created successfully! Boxes deducted from inventory.');
      }

      // Reset form
      setSelectedItemsMap({});
      setNotes('');
      setPaidAmount(0);
      setIsNewCustomer(false);
      setBankDetails({ bankName: '', accountNumber: '', transactionId: '' });
      setUpiDetails({ transactionId: '', upiPersonName: '' });
      setChequeDetails({ chequeNumber: '', bankName: '', bankAccountNumber: '' });
      setCashDetails({ receivedBy: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording sale');
    } finally {
      setSubmitting(false);
    }
  };

  const openInvoice = async (invoiceId) => {
    try {
      const id = typeof invoiceId === 'object' ? invoiceId._id : invoiceId;
      const res = await API.get(`/invoices/${id}`);
      setSelectedInvoiceForModal(res.data);
    } catch (err) {
      alert('Could not fetch invoice details.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-500" />
            Makhana Box Billing (માત્ર બોક્સ વેચાણ પોર્ટલ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Makhana Box order starting at minimum ₹160 per box (adjustable up & down). Real-time per-item and grand total calculations.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer + Box Menu + Selected Boxes Tray */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Customer Selection Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-amber-600" />
                Customer / Buyer (ગ્રાહક પસંદ કરો)
              </span>
              <button
                type="button"
                onClick={() => setIsNewCustomer(!isNewCustomer)}
                className="text-amber-700 hover:text-amber-900 font-bold text-xs cursor-pointer"
              >
                {isNewCustomer ? '← Select Existing Customer' : '+ Add New Customer (નવો ગ્રાહક)'}
              </button>
            </div>

            {!isNewCustomer ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 text-xs focus:outline-hidden focus:border-amber-500"
                    >
                      {customers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.businessName || c.name} [{c.customerCategory.toUpperCase()}] ({c.city}, {c.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold text-slate-700"
                    />
                  </div>
                </div>

                {selectedCustomerObj && (
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-amber-100 text-amber-900">
                        {selectedCustomerObj.customerCategory}
                      </span>
                      <span>Phone: <strong className="text-slate-700">{selectedCustomerObj.phone}</strong></span>
                      <span>City: <strong className="text-slate-700">{selectedCustomerObj.city}</strong></span>
                    </span>
                    <span>
                      Receivable Balance: <strong className="text-emerald-700">₹{selectedCustomerObj.currentBalance?.toLocaleString('en-IN') || 0}</strong>
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Add New Customer Inline */
              <div className="space-y-2 pt-1 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Customer / Shop Name *"
                    value={newCustomer.businessName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, businessName: e.target.value, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number *"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newCustomer.customerCategory}
                    onChange={(e) => setNewCustomer({ ...newCustomer, customerCategory: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="wholesaler">Wholesaler (જથ્થાબંધ)</option>
                    <option value="reseller">Reseller (રિસેલર)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="City (e.g. Surat)"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="GSTIN (Optional)"
                    value={newCustomer.gstin}
                    onChange={(e) => setNewCustomer({ ...newCustomer, gstin: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Makhana Grade Box Menu (Checkbox style) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  1. Select Makhana Box Items (મખાના બોક્સ પસંદ કરો)
                </h3>
                <p className="text-xs text-slate-400">
                  Click on card to check/uncheck • Base selling price ₹160 per box (Adjustable)
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
                {cartItemsList.length} Item(s) Selected
              </span>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => {
                const isSelected = !!selectedItemsMap[item._id];
                const boxRate = item.boxSellingRate || 160;

                return (
                  <div
                    key={item._id}
                    onClick={() => toggleItemSelection(item)}
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Top Row: Suta Tag & Checkbox */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.sutaSize || 'Box Grade'}
                      </span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0"></div>
                      )}
                    </div>

                    {/* Item Name */}
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                        <Package className="w-3.5 h-3.5 text-amber-600" />
                        <span>Unit: Premium Makhana Box</span>
                      </p>
                    </div>

                    {/* Bottom: Stock & Price */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        Stock: {item.currentStockBoxes || 200} Boxes
                      </span>
                      <span className="font-black text-slate-900 text-sm">
                        ₹{boxRate}
                        <span className="text-[10px] font-normal text-slate-400">/box</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Selected Boxes Order Tray (Interactive Live Steppers) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-black text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  2. Selected Boxes & Price Adjustment (બોક્સ જથ્થો અને ભાવ)
                </h3>
                <p className="text-xs text-slate-400">
                  Adjust box quantity with + / - • Edit rate per box above or below ₹160 • Live Item Total
                </p>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Total: {totalBoxes} Boxes
              </span>
            </div>

            {cartItemsList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Package className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-sm font-bold text-slate-600">
                  હાલમાં કોઈ મખાના બોક્સ સિલેક્ટ કરેલ નથી
                </p>
                <p className="text-xs font-medium text-slate-400">
                  (ઓર્ડર શરૂ કરવા ઉપરના કાર્ડ પર ક્લિક કરો • બોક્સ દીઠ ન્યૂનતમ ₹160 થી શરૂઆત)
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {cartItemsList.map((item) => {
                  // Real-time particular item total calculation
                  const itemTotal = Math.round((Number(item.boxes) * Number(item.ratePerBox)) * 100) / 100;

                  return (
                    <div
                      key={item.item}
                      className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all space-y-3 text-xs"
                    >
                      {/* Top Row: Name, Box Badge, and Particular Item Total */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">{item.itemName}</span>
                            <span className="inline-block px-2.5 py-0.5 rounded-full font-black text-[11px] bg-amber-100 text-amber-900 border border-amber-300/80">
                              {item.boxes} {item.boxes === 1 ? 'Box' : 'Boxes'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Grade: {item.grade} • Rate: ₹{item.ratePerBox} / Box
                          </p>
                        </div>

                        {/* Particular Item Total (Reactive) */}
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">
                              Particular Item Total
                            </span>
                            <span className="font-black text-slate-900 text-base">
                              ₹{itemTotal.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleItemSelection({ _id: item.item })}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Middle: Quick Box Presets (1, 2, 5, 10, 20, 50, 100 Boxes) */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">
                          Quick Box Count:
                        </span>
                        {[1, 2, 5, 10, 20, 50, 100].map((presetBox) => {
                          const isActive = item.boxes === presetBox;
                          return (
                            <button
                              key={presetBox}
                              type="button"
                              onClick={() => updateItemBoxes(item.item, presetBox)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                                  : 'bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-300'
                              }`}
                            >
                              {presetBox} {presetBox === 1 ? 'Box' : 'Boxes'}
                            </button>
                          );
                        })}
                      </div>

                      {/* Bottom Controls: Steppers & Price Up/Down Editor */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
                        {/* Box Quantity Stepper */}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-600 text-[11px]">Boxes (જથ્થો):</span>
                          <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => adjustBoxes(item.item, -1)}
                              className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 font-black cursor-pointer text-xs"
                              title="Minus 1 Box"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.boxes}
                              onChange={(e) => updateItemBoxes(item.item, e.target.value)}
                              className="w-16 text-center font-black text-slate-900 text-xs border-x border-slate-200 focus:outline-hidden py-1"
                            />
                            <button
                              type="button"
                              onClick={() => adjustBoxes(item.item, +1)}
                              className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 font-black cursor-pointer text-xs"
                              title="Add 1 Box"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick +5 and +10 jumps */}
                          <button
                            type="button"
                            onClick={() => adjustBoxes(item.item, +5)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-md font-bold text-[10px] text-slate-700 cursor-pointer"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustBoxes(item.item, +10)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-md font-bold text-[10px] text-slate-700 cursor-pointer"
                          >
                            +10
                          </button>
                        </div>

                        {/* Rate / Box Editor (Default ₹160, adjustable upper & lower) */}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-600 text-[11px]">Price / Box (ભાવ):</span>
                          <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
                            <span className="text-[11px] text-slate-400 font-bold mr-1">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={item.ratePerBox}
                              onChange={(e) => updateItemRate(item.item, e.target.value)}
                              className="w-20 font-black text-slate-900 text-xs text-right focus:outline-hidden"
                              title="Price per Box (Adjustable higher or lower)"
                            />
                            <span className="text-[10px] text-slate-400 ml-1">/box</span>
                          </div>

                          {/* Quick price adjustment buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateItemRate(item.item, Math.max(0, (item.ratePerBox || 160) - 5))}
                              className="px-1.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded font-bold text-[10px] text-rose-600 cursor-pointer"
                              title="Decrease price by ₹5"
                            >
                              -₹5
                            </button>
                            <button
                              type="button"
                              onClick={() => updateItemRate(item.item, (item.ratePerBox || 160) + 5)}
                              className="px-1.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded font-bold text-[10px] text-emerald-700 cursor-pointer"
                              title="Increase price by ₹5"
                            >
                              +₹5
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout & Billing Sidebar (Real-time Totals) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs sticky top-20 text-xs">
          <h3 className="font-black text-sm text-slate-900 tracking-tight pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Bill Summary (બિલ સમરી)</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
              TAX INVOICE
            </span>
          </h3>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {/* Calculation Breakdown */}
            <div className="space-y-2 py-2">
              <div className="flex justify-between text-slate-600">
                <span>Items Selected:</span>
                <span className="font-bold text-slate-800">{cartItemsList.length} Item(s)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Boxes:</span>
                <span className="font-black text-amber-900 text-sm">{totalBoxes} Boxes</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (કુલ રકમ):</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600">Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-28 px-2.5 py-1 border border-slate-300 rounded-lg text-right font-bold"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600">GST Rate (%):</span>
                <select
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="w-28 px-2 py-1 border border-slate-300 rounded-lg text-right font-bold bg-white"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={5}>5% (Standard 5% GST)</option>
                  <option value={12}>12% (12% GST)</option>
                </select>
              </div>

              {taxAmount > 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>GST Amount:</span>
                  <span>₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-black text-slate-900 text-sm">Grand Total (આખરી રકમ):</span>
                <span className="font-black text-xl text-amber-600">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Section */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                Payment Collection (ચૂકવણી)
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Amount Paid Now (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Transaction Fields */}
              {paidAmount > 0 && paymentMode === 'BANK_TRANSFER' && (
                <div className="space-y-1.5 pt-1 border-t border-slate-200 text-[11px]">
                  <input
                    type="text"
                    placeholder="Bank Name (e.g. HDFC)"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Transaction / UTR ID"
                    value={bankDetails.transactionId}
                    onChange={(e) => setBankDetails({ ...bankDetails, transactionId: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
              )}

              {paidAmount > 0 && paymentMode === 'UPI' && (
                <div className="space-y-1.5 pt-1 border-t border-slate-200 text-[11px]">
                  <input
                    type="text"
                    placeholder="UPI Txn ID / Ref No."
                    value={upiDetails.transactionId}
                    onChange={(e) => setUpiDetails({ ...upiDetails, transactionId: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="UPI Person Name / VPA ID"
                    value={upiDetails.upiPersonName}
                    onChange={(e) => setUpiDetails({ ...upiDetails, upiPersonName: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                  />
                </div>
              )}

              {paidAmount > 0 && paymentMode === 'CHEQUE' && (
                <div className="space-y-1.5 pt-1 border-t border-slate-200 text-[11px]">
                  <input
                    type="text"
                    placeholder="Cheque Number"
                    value={chequeDetails.chequeNumber}
                    onChange={(e) => setChequeDetails({ ...chequeDetails, chequeNumber: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={chequeDetails.bankName}
                    onChange={(e) => setChequeDetails({ ...chequeDetails, bankName: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                  />
                </div>
              )}

              {paidAmount > 0 && paymentMode === 'CASH' && (
                <div className="space-y-1.5 pt-1 border-t border-slate-200 text-[11px]">
                  <input
                    type="text"
                    placeholder="Received By / Cashier Name"
                    value={cashDetails.receivedBy}
                    onChange={(e) => setCashDetails({ ...cashDetails, receivedBy: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                  />
                </div>
              )}

              {balanceDue > 0 && (
                <div className="flex justify-between text-rose-700 font-bold text-xs pt-1">
                  <span>Balance Due:</span>
                  <span>₹{balanceDue.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Auto Print Invoice Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autoPrintCheck"
                checked={autoGenerateInvoice}
                onChange={(e) => setAutoGenerateInvoice(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded"
              />
              <label htmlFor="autoPrintCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                Generate Tax Invoice & Open Printable Bill
              </label>
            </div>

            {/* Big POS Action Button */}
            <button
              type="submit"
              disabled={submitting || cartItemsList.length === 0}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{submitting ? 'Creating Bill...' : 'Complete Sale & Print Bill (ઓર્ડર & બિલ બનાવો)'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Recent Sales History */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <h3 className="font-bold text-sm text-slate-800">
            Recent Box Sales (તાજેતરના બોક્સ વેચાણ ઓર્ડર)
          </h3>
          <span className="text-xs text-slate-400">{salesOrders.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Grand Total</th>
                <th className="py-2.5 px-3 text-right">Paid</th>
                <th className="py-2.5 px-3 text-right">Balance</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Bill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesOrders.slice(0, 10).map((so) => (
                <tr key={so._id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-700">{so.orderNumber}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{so.partyBusinessName || so.partyName}</td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {new Date(so.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900">
                    {so.totalBoxes ? `${so.totalBoxes} Boxes` : `${so.totalQuantityKg || 1} Box`}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900">₹{so.grandTotal?.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">₹{so.paidAmount?.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600">₹{so.balanceAmount?.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        so.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : so.paymentStatus === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {so.paymentStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {so.invoiceId && (
                      <button
                        onClick={() => openInvoice(so.invoiceId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer"
                        title="Print Bill"
                      >
                        <Printer className="w-3 h-3" />
                        Print Bill
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal for Immediate Print / View */}
      {selectedInvoiceForModal && (
        <InvoiceModal
          invoice={selectedInvoiceForModal}
          onClose={() => setSelectedInvoiceForModal(null)}
        />
      )}
    </div>
  );
};

export default SellPage;
