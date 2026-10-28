import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Truck,
  ShoppingBag,
  Receipt,
  Users2,
  Building2,
  FileText,
  UserCog,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigationItems = [
  { name: 'Dashboard (ડેશબોર્ડ)', path: '/', icon: LayoutDashboard },
  { name: 'Stock / Inventory (સ્ટોક)', path: '/stock', icon: Boxes },
  { name: 'Purchase / Buy (ખરીદી)', path: '/purchase', icon: Truck },
  { name: 'Sell Orders (વેચાણ)', path: '/sell', icon: ShoppingBag },
  { name: 'All Orders (ઓર્ડર લિસ્ટ)', path: '/orders', icon: TrendingUp },
  { name: 'Bill Records (બિલ યાદી)', path: '/bills', icon: Receipt },
  { name: 'Dealers / Suppliers (વેપારી)', path: '/dealers', icon: Building2 },
  { name: 'Customers (ગ્રાહકો / Wholesalers)', path: '/customers', icon: Users2 },
  { name: 'Users & Staff (વપરાશકર્તા)', path: '/users', icon: UserCog, adminOnly: true },
  { name: 'Settings (સેટિંગ્સ)', path: '/settings', icon: Settings },
];

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="no-print w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen">
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
          JD
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">MAKHANA ERP</h2>
          <p className="text-[11px] text-amber-400 font-medium">Wholesale Portal</p>
        </div>
      </div>

      <div className="px-3 py-4 flex-1 overflow-y-auto space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Operations
        </div>

        {navigationItems.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') return null;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Business Status footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 m-2 rounded-lg text-[11px]">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span>Connected DB</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Atlas Live
          </span>
        </div>
        <p className="text-slate-500 text-[10px] truncate">makhana_jd</p>
      </div>
    </aside>
  );
};

export default Sidebar;
