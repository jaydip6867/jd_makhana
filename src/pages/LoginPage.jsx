import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail('admin@makhana.com');
    setPassword('admin123');
  };

  const fillManager = () => {
    setEmail('manager@makhana.com');
    setPassword('manager123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-linear-to-tr from-amber-400 to-amber-600 items-center justify-center text-slate-950 font-black text-3xl shadow-xl shadow-amber-500/20 mb-3">
            JD
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Makhana Wholesale Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            B2B Buy & Sell Inventory & Billing Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-6">
            Sign In to your account (લોગિન)
          </h2>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@makhana.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Sign In (પ્રવેશ કરો)'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-xs text-slate-400 mb-2 font-medium">
              Demo Credentials (1-Click Fill):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillAdmin}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] text-amber-300 font-semibold text-center border border-slate-700 transition-colors"
              >
                Admin (Jaydip Sir)
              </button>
              <button
                type="button"
                onClick={fillManager}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] text-slate-300 font-semibold text-center border border-slate-700 transition-colors"
              >
                Manager (Ramesh)
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-amber-400 hover:underline font-semibold">
            Register here (નવું એકાઉન્ટ બનાવો)
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
