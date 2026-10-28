import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Building2,
  Mail,
  Phone,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  CreditCard,
  MapPin,
  FileText,
} from 'lucide-react';

const SettingsPage = () => {
  const { user, login } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'business'

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Business & Billing Header Settings (Saved in LocalStorage for print bills)
  const [businessSettings, setBusinessSettings] = useState(() => {
    const saved = localStorage.getItem('makhana_business_settings');
    return saved
      ? JSON.parse(saved)
      : {
          firmName: 'JD MAKHANA TRADERS',
          tagline: 'Wholesale Makhana Direct Mandi Suppliers & Processors',
          address: 'APMC Market Yard, Ring Road',
          city: 'Surat',
          state: 'Gujarat',
          pincode: '395002',
          gstin: '24AABCJ1098K1ZT',
          phone: '+91 98765 43210',
          bankName: 'State Bank of India',
          accountNumber: '389012457891',
          ifscCode: 'SBIN0001245',
          upiId: 'makhana.jd@sbi',
        };
  });
  const [businessSaved, setBusinessSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      const res = await API.put('/auth/profile', {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
      });

      // Update local storage user info
      localStorage.setItem('makhana_user', JSON.stringify(res.data));
      setProfileSuccess('Profile details updated successfully! (પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ)');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Error updating profile details');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and Confirm password do not match!');
      return;
    }

    setPasswordLoading(true);
    try {
      await API.put('/auth/profile', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordSuccess('Password changed successfully! (પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો)');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Check current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Business Settings Save
  const handleBusinessSave = (e) => {
    e.preventDefault();
    localStorage.setItem('makhana_business_settings', JSON.stringify(businessSettings));
    setBusinessSaved(true);
    setTimeout(() => setBusinessSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-amber-500" />
          Settings & Account (સેટિંગ્સ & એકાઉન્ટ)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your personal profile, change security password, and configure business billing details
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'border-amber-500 text-slate-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Profile Details (પ્રોફાઇલ)
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'border-amber-500 text-slate-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Security & Password (પાસવર્ડ બદલો)
        </button>

        <button
          onClick={() => setActiveTab('business')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'business'
              ? 'border-amber-500 text-slate-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Firm & Invoice Info (પેઢી અને બિલ વિગત)
        </button>
      </div>

      {/* Tab 1: Profile Details */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl">
          <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-500" />
            Update Profile Information (વ્યક્તિગત માહિતી અપડેટ કરો)
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Your name, email address and contact number used in portal records
          </p>

          {profileSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name (નામ) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address (ઇમેઇલ) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number (મોબાઇલ)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Account Role (હોદ્દો)
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-black uppercase tracking-wider">
                  {user?.role || 'Staff'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  (Assigned by Super Admin)
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{profileLoading ? 'Updating...' : 'Save Profile Details (સેવ કરો)'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Security & Change Password */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl">
          <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            Change Password (પાસવર્ડ બદલો)
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Ensure your account is using a strong password for security
          </p>

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Current Password (હાલનો પાસવર્ડ) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Password (નવો પાસવર્ડ) *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Confirm New Password (નવો પાસવર્ડ ફરીથી લખો) *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{passwordLoading ? 'Changing...' : 'Update Password (પાસવર્ડ બદલો)'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Business & Invoice Info */}
      {activeTab === 'business' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl">
          <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            Business & Invoice Details (પેઢી અને બિલ સેટિંગ્સ)
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            These firm details and bank account numbers are printed on your Tax Invoices & Bills
          </p>

          {businessSaved && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Business & Bank details saved! Bills will now reflect this header.</span>
            </div>
          )}

          <form onSubmit={handleBusinessSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Firm Name (પેઢીનું નામ) *
                </label>
                <input
                  type="text"
                  required
                  value={businessSettings.firmName}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, firmName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  GSTIN
                </label>
                <input
                  type="text"
                  value={businessSettings.gstin}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, gstin: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-sm font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contact Phone (ફોન)
                </label>
                <input
                  type="text"
                  value={businessSettings.phone}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  City & State
                </label>
                <input
                  type="text"
                  value={`${businessSettings.city}, ${businessSettings.state}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    setBusinessSettings({
                      ...businessSettings,
                      city: parts[0]?.trim() || businessSettings.city,
                      state: parts[1]?.trim() || businessSettings.state,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Market / Yard Address
              </label>
              <input
                type="text"
                value={businessSettings.address}
                onChange={(e) => setBusinessSettings({ ...businessSettings, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            {/* Bank details for bills */}
            <div className="pt-3 border-t border-slate-100">
              <span className="font-bold text-slate-900 text-xs block mb-3 uppercase tracking-wider text-amber-800">
                Bank & UPI Details for Invoice Printing:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={businessSettings.bankName}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={businessSettings.accountNumber}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={businessSettings.ifscCode}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, ifscCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">UPI ID</label>
                  <input
                    type="text"
                    value={businessSettings.upiId}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, upiId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Business Information</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
