import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Bell, PlusCircle, ShoppingBag, Truck, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white font-black text-xl shadow-sm">
            M
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              Makhana Wholesale Portal
            </h1>
            <p className="text-xs text-amber-700 font-medium">JD Makhana Trading ERP</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick New Order Actions */}
        <Link
          to="/sell"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>New Sell (વેચાણ)</span>
        </Link>

        <Link
          to="/purchase"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>New Buy (ખરીદી)</span>
        </Link>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-slate-800">{user?.name || 'User'}</p>
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-100 text-amber-800">
              {user?.role || 'Staff'}
            </span>
          </div>

          <Link
            to="/settings"
            title="Settings (સેટિંગ્સ)"
            className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>

          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
