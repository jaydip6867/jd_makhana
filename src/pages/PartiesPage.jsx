import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  Users2,
  Building2,
  Phone,
  MapPin,
  FileSpreadsheet,
  Plus,
  Search,
  ExternalLink,
  X,
  TrendingUp,
  Receipt,
  Truck,
  ShoppingBag,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PartiesPage = ({ initialType = 'customer' }) => {
  const [activeType, setActiveType] = useState(initialType); // 'customer' or 'dealer'
  const [parties, setParties] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected party for ledger view
  const [selectedPartyLedger, setSelectedPartyLedger] = useState(null);
  const [partyOrders, setPartyOrders] = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // Modal: Add New Party
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParty, setNewParty] = useState({
    type: initialType,
    customerCategory: initialType === 'dealer' ? 'dealer_supplier' : 'wholesaler',
    name: '',
    businessName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Surat',
    state: 'Gujarat',
    gstin: '',
    openingBalance: 0,
    notes: '',
  });

  const fetchParties = async () => {
    try {
      setLoading(true);
      const params = { type: activeType };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const res = await API.get('/parties', { params });
      setParties(res.data);
    } catch (err) {
      console.error('Error fetching parties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, [activeType, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchParties();
  };

  const openPartyLedger = async (party) => {
    try {
      setLoadingLedger(true);
      setSelectedPartyLedger(party);
      const res = await API.get(`/parties/${party._id}`);
      setSelectedPartyLedger(res.data.party);
      setPartyOrders(res.data.orders);
    } catch (err) {
      alert('Could not fetch party order history.');
    } finally {
      setLoadingLedger(false);
    }
  };

  const handleCreateParty = async (e) => {
    e.preventDefault();
    try {
      await API.post('/parties', newParty);
      setShowAddModal(false);
      setNewParty({
        type: activeType,
        customerCategory: activeType === 'dealer' ? 'dealer_supplier' : 'wholesaler',
        name: '',
        businessName: '',
        phone: '',
        email: '',
        address: '',
        city: 'Surat',
        state: 'Gujarat',
        gstin: '',
        openingBalance: 0,
        notes: '',
      });
      fetchParties();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating party');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {activeType === 'dealer' ? (
              <>
                <Building2 className="w-6 h-6 text-blue-600" />
                Mandi Suppliers & Dealers (વેપારી ડિરેક્ટરી)
              </>
            ) : (
              <>
                <Users2 className="w-6 h-6 text-emerald-600" />
                Wholesalers & Resellers Directory (ગ્રાહક યાદી)
              </>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage contact profiles, outstanding balances, and order transaction ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch tab */}
          <div className="inline-flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                setActiveType('customer');
                setCategoryFilter('');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeType === 'customer'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customers (Wholesale/Reseller)
            </button>
            <button
              onClick={() => {
                setActiveType('dealer');
                setCategoryFilter('');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeType === 'dealer'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mandi Suppliers (Dealers)
            </button>
          </div>

          <button
            onClick={() => {
              setNewParty({
                ...newParty,
                type: activeType,
                customerCategory: activeType === 'dealer' ? 'dealer_supplier' : 'wholesaler',
              });
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New {activeType === 'dealer' ? 'Dealer' : 'Customer'}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={`Search ${activeType === 'dealer' ? 'supplier' : 'customer'} by name, business, phone, city...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-amber-500"
          />
        </form>

        {activeType === 'customer' && (
          <div className="w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs font-semibold text-slate-700"
            >
              <option value="">All Categories</option>
              <option value="wholesaler">Wholesalers</option>
              <option value="reseller">Resellers</option>
            </select>
          </div>
        )}
      </div>

      {/* Parties Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parties.map((party) => {
          const isDealer = party.type === 'dealer';
          return (
            <div
              key={party._id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {party.businessName || party.name}
                    </h3>
                    {party.businessName && party.name !== party.businessName && (
                      <p className="text-xs text-slate-500 font-medium">Contact: {party.name}</p>
                    )}
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      party.customerCategory === 'wholesaler'
                        ? 'bg-emerald-100 text-emerald-800'
                        : party.customerCategory === 'reseller'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {party.customerCategory}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">{party.phone}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{party.city}, {party.state}</span>
                  </p>
                  {party.gstin && (
                    <p className="text-[11px] font-mono text-slate-500 mt-1">
                      GSTIN: <span className="font-semibold text-slate-700">{party.gstin}</span>
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total Volume</p>
                    <p className="font-black text-slate-900 mt-0.5">
                      {(party.totalVolumeKg || 0).toLocaleString()} kg
                    </p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total Business</p>
                    <p className="font-black text-slate-900 mt-0.5">
                      ₹{(party.totalBusinessValue || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    {isDealer ? 'We Owe (Payable)' : 'Receivable Due'}
                  </span>
                  <span
                    className={`font-black text-sm ${
                      party.currentBalance === 0
                        ? 'text-slate-600'
                        : isDealer
                        ? 'text-rose-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    ₹{Math.abs(party.currentBalance || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openPartyLedger(party)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Ledger
                  </button>

                  <Link
                    to={isDealer ? '/purchase' : '/sell'}
                    className={`px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow-xs cursor-pointer ${
                      isDealer ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    + Order
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Party Transaction Ledger Modal */}
      {selectedPartyLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 text-xs max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {selectedPartyLedger.customerCategory}
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-1">
                  {selectedPartyLedger.businessName || selectedPartyLedger.name}
                </h3>
                <p className="text-slate-500">
                  Phone: {selectedPartyLedger.phone} • {selectedPartyLedger.city}, {selectedPartyLedger.state}
                </p>
              </div>

              <div className="text-right">
                <button
                  onClick={() => setSelectedPartyLedger(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Outstanding Balance
                  </span>
                  <span className="text-base font-black text-slate-900">
                    ₹{Math.abs(selectedPartyLedger.currentBalance || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Orders history */}
            <div className="mt-4 flex-1 overflow-y-auto">
              <h4 className="font-bold text-slate-800 text-xs mb-2">
                Transaction History ({partyOrders.length} orders recorded)
              </h4>

              {loadingLedger ? (
                <div className="py-12 text-center text-slate-400">Loading ledger...</div>
              ) : partyOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-400">No transactions recorded yet.</div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Order #</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5 text-right">Qty (KG)</th>
                        <th className="p-2.5 text-right">Total (₹)</th>
                        <th className="p-2.5 text-right">Paid (₹)</th>
                        <th className="p-2.5 text-right">Balance</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {partyOrders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-500 whitespace-nowrap">
                            {new Date(ord.orderDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="p-2.5 font-mono font-bold">{ord.orderNumber}</td>
                          <td className="p-2.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                ord.orderType === 'BUY'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {ord.orderType}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-medium">{ord.totalQuantityKg} kg</td>
                          <td className="p-2.5 text-right font-bold">₹{ord.grandTotal.toLocaleString('en-IN')}</td>
                          <td className="p-2.5 text-right text-emerald-700">₹{ord.paidAmount.toLocaleString('en-IN')}</td>
                          <td className="p-2.5 text-right font-bold text-rose-600">₹{ord.balanceAmount.toLocaleString('en-IN')}</td>
                          <td className="p-2.5 text-center">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {ord.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Party */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Add New {activeType === 'dealer' ? 'Supplier / Mandi Dealer' : 'Customer'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParty} className="mt-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Business / Firm Name (પેઢીનું નામ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gujarat Supermart Hub"
                  value={newParty.businessName}
                  onChange={(e) => setNewParty({ ...newParty, businessName: e.target.value, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    placeholder="Contact person"
                    value={newParty.name}
                    onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone Number (મોબાઇલ) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={newParty.phone}
                    onChange={(e) => setNewParty({ ...newParty, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category (કેટેગરી)
                  </label>
                  <select
                    value={newParty.customerCategory}
                    onChange={(e) => setNewParty({ ...newParty, customerCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                  >
                    {activeType === 'dealer' ? (
                      <option value="dealer_supplier">Mandi Supplier / Dealer</option>
                    ) : (
                      <>
                        <option value="wholesaler">Wholesaler (જથ્થાબંધ)</option>
                        <option value="reseller">Reseller (રિસેલર)</option>
                        <option value="retailer">Retailer</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    placeholder="24AAAAA0000A1Z5"
                    value={newParty.gstin}
                    onChange={(e) => setNewParty({ ...newParty, gstin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City (શહેર)
                  </label>
                  <input
                    type="text"
                    placeholder="Surat / Ahmedabad / Darbhanga"
                    value={newParty.city}
                    onChange={(e) => setNewParty({ ...newParty, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    State (રાજ્ય)
                  </label>
                  <input
                    type="text"
                    placeholder="Gujarat / Bihar"
                    value={newParty.state}
                    onChange={(e) => setNewParty({ ...newParty, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Address / Market Yard
                </label>
                <input
                  type="text"
                  placeholder="Shop No. 45, APMC Market Yard"
                  value={newParty.address}
                  onChange={(e) => setNewParty({ ...newParty, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartiesPage;
