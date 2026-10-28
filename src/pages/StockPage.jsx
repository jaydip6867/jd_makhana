import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  Boxes,
  Plus,
  AlertTriangle,
  History,
  TrendingUp,
  SlidersHorizontal,
  X,
  Check,
  PackageCheck,
  Scale,
} from 'lucide-react';

const StockPage = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'logs'
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState(null);

  // New Item Form
  const [newItem, setNewItem] = useState({
    name: '',
    grade: '6 Suta (Jumbo Bold)',
    sutaSize: '6 Suta',
    bagWeightKg: 10,
    currentStockKg: 0,
    minStockAlertKg: 150,
    avgPurchaseRate: 0,
    wholesalerRate: 0,
    resellerRate: 0,
    description: '',
  });

  // Adjustment Form
  const [adjustment, setAdjustment] = useState({
    adjustmentType: 'ADD', // 'ADD', 'SUBTRACT', 'SET'
    quantityKg: '',
    reason: '',
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await API.get('/items');
      setItems(res.data.items);
      setStats(res.data.stats);
    } catch (err) {
      console.error('Error fetching stock items', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await API.get('/items/logs/history');
      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching logs', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchLogs();
  }, []);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await API.post('/items', newItem);
      setShowAddModal(false);
      setNewItem({
        name: '',
        grade: '6 Suta (Jumbo Bold)',
        sutaSize: '6 Suta',
        bagWeightKg: 10,
        currentStockKg: 0,
        minStockAlertKg: 150,
        avgPurchaseRate: 0,
        wholesalerRate: 0,
        resellerRate: 0,
        description: '',
      });
      fetchItems();
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating item');
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!selectedItemForAdjust) return;
    try {
      await API.post(`/items/${selectedItemForAdjust._id}/adjust-stock`, adjustment);
      setShowAdjustModal(false);
      setSelectedItemForAdjust(null);
      setAdjustment({ adjustmentType: 'ADD', quantityKg: '', reason: '' });
      fetchItems();
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adjusting stock');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Makhana Stock & Inventory (સ્ટોક વ્યવસ્થાપન)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time Makhana grades, bag counts, weight tracking & movements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'inventory' ? 'logs' : 'inventory')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>{activeTab === 'inventory' ? 'View Movement Ledger' : 'View Stock Items'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Grade (નવો ગ્રેડ)</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Weight in Warehouse</p>
          <h4 className="text-xl font-black text-slate-900 mt-1">
            {(stats?.totalStockKg || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">KG</span>
          </h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Bags Available</p>
          <h4 className="text-xl font-black text-amber-700 mt-1">
            {(stats?.totalStockBags || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Bags</span>
          </h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Estimated Stock Valuation</p>
          <h4 className="text-xl font-black text-emerald-700 mt-1">
            ₹{(stats?.totalInventoryValue || 0).toLocaleString('en-IN')}
          </h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Low Stock Alerts</p>
          <h4 className="text-xl font-black text-rose-600 mt-1">
            {stats?.lowStockCount || 0} <span className="text-xs font-bold text-slate-500">Grades</span>
          </h4>
        </div>
      </div>

      {/* Main Content: Items Table or Logs */}
      {activeTab === 'inventory' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">
              Makhana Inventory by Grade & Suta
            </h3>
            <span className="text-xs text-slate-400">
              Showing {items.length} items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Item & Grade</th>
                  <th className="py-3 px-4">Suta Size</th>
                  <th className="py-3 px-4 text-right">Available Stock</th>
                  <th className="py-3 px-4 text-right">Box Selling Rate</th>
                  <th className="py-3 px-4 text-right">Avg Cost / KG</th>
                  <th className="py-3 px-4 text-right">Wholesale Rate</th>
                  <th className="py-3 px-4 text-right">Reseller Rate</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const isLow = item.currentStockKg <= item.minStockAlertKg;
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500">{item.grade}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.sutaSize || 'Standard'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="font-black text-slate-900 text-sm">
                          {item.currentStockBoxes || 0} Boxes
                        </p>
                        <p className="text-[11px] font-medium text-amber-700">
                          {item.currentStockKg} kg ({item.currentStockBags} bags)
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                          ₹{item.boxSellingRate || 160} / Box
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">
                        ₹{item.avgPurchaseRate}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        ₹{item.wholesalerRate || item.standardSellingRate}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-700">
                        ₹{item.resellerRate || item.standardSellingRate}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3" />
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedItemForAdjust(item);
                            setShowAdjustModal(true);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Stock Logs Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                Stock Movement Ledger (સ્ટોક આવક-જાવક હિસાબ)
              </h3>
              <p className="text-xs text-slate-400">
                Automatic audit trail of purchases, sales, and manual adjustments
              </p>
            </div>
            <span className="text-xs text-slate-400">{logs.length} movement records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Makhana Item</th>
                  <th className="py-3 px-4">Party / Reason</th>
                  <th className="py-3 px-4 text-right">In / Out Qty</th>
                  <th className="py-3 px-4 text-right">Prev Stock</th>
                  <th className="py-3 px-4 text-right">New Stock</th>
                  <th className="py-3 px-4">Ref #</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.date || log.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {log.movementType === 'IN' ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          + IN (Purchase)
                        </span>
                      ) : log.movementType === 'OUT' ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          - OUT (Sale)
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          Audit Adjust
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.itemName}</td>
                    <td className="py-3 px-4 text-slate-700">
                      <p className="font-medium">{log.partyName || log.notes || '-'}</p>
                      {log.partyName && log.notes && (
                        <p className="text-[10px] text-slate-400">{log.notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-black">
                      <span className={log.movementType === 'IN' ? 'text-emerald-700' : 'text-rose-700'}>
                        {log.movementType === 'IN' ? '+' : '-'}{log.quantityKg} kg
                      </span>
                      {log.bags > 0 && <span className="text-[10px] text-slate-400 block font-normal">({log.bags} bags)</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">{log.previousStockKg} kg</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{log.newStockKg} kg</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{log.referenceNumber || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add New Grade */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                Add New Makhana Grade (નવો ગ્રેડ ઉમેરો)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Item / Grade Name (ગ્રેડનું નામ)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6 Suta Jumbo Export Quality"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Suta / Size
                  </label>
                  <select
                    value={newItem.sutaSize}
                    onChange={(e) => setNewItem({ ...newItem, sutaSize: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="6 Suta">6 Suta (Jumbo)</option>
                    <option value="5.5 Suta">5.5 Suta</option>
                    <option value="5 Suta">5 Suta (Super Bold)</option>
                    <option value="4 Suta">4 Suta (Regular)</option>
                    <option value="3 Suta">3 Suta / Tukda</option>
                    <option value="Flavored">Flavored / Processed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Standard Bag Weight (KG)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.bagWeightKg}
                    onChange={(e) => setNewItem({ ...newItem, bagWeightKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Opening Stock (KG)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.currentStockKg}
                    onChange={(e) => setNewItem({ ...newItem, currentStockKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Min Stock Reorder Alert (KG)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.minStockAlertKg}
                    onChange={(e) => setNewItem({ ...newItem, minStockAlertKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Avg Buy Rate (₹/kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.avgPurchaseRate}
                    onChange={(e) => setNewItem({ ...newItem, avgPurchaseRate: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Wholesaler (₹/kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.wholesalerRate}
                    onChange={(e) => setNewItem({ ...newItem, wholesalerRate: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Reseller (₹/kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.resellerRate}
                    onChange={(e) => setNewItem({ ...newItem, resellerRate: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description / Quality Notes
                </label>
                <textarea
                  rows="2"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="White bold crisp makhana directly from Darbhanga mandi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xs cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Stock */}
      {showAdjustModal && selectedItemForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Stock Audit / Adjustment
                </h3>
                <p className="text-xs text-amber-700 font-medium">
                  {selectedItemForAdjust.name} (Current: {selectedItemForAdjust.currentStockKg} kg)
                </p>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Adjustment Action
                </label>
                <select
                  value={adjustment.adjustmentType}
                  onChange={(e) => setAdjustment({ ...adjustment, adjustmentType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="ADD">Add Stock (+ KG)</option>
                  <option value="SUBTRACT">Subtract Stock / Wastage (- KG)</option>
                  <option value="SET">Directly Set Total (Set KG)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity (KG)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={adjustment.quantityKg}
                  onChange={(e) => setAdjustment({ ...adjustment, quantityKg: e.target.value })}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Adjustment
                </label>
                <input
                  type="text"
                  required
                  value={adjustment.reason}
                  onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                  placeholder="e.g. Warehouse count audit / moisture loss / bag count"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xs cursor-pointer"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPage;
