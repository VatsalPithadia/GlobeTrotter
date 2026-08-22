import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Sparkles, Shield, Mail, Lock, User as UserIcon, ArrowRight, PlaneTakeoff, Globe2 } from 'lucide-react';

export default function AuthScreen({ onSuccess }) {
  const { login, register, demoLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isForgot) {
        setForgotSent(true);
      } else if (isLogin) {
        await login(email, password);
        if (onSuccess) onSuccess();
      } else {
        await register(name, email, password, currency);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setLoading(true);
    try {
      await demoLogin(role);
      if (onSuccess) onSuccess();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        {/* Left Side: Travel Inspiration Banner */}
        <div className="lg:col-span-5 relative p-8 sm:p-10 flex flex-col justify-between overflow-hidden bg-slate-900 text-white">
          <div
            className="absolute inset-0 opacity-30 bg-cover bg-center"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">GlobeTrotter</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug mt-4">
              Your Personal Travel Planning Studio
            </h2>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Construct multi-city itineraries, estimate real-time budgets, and discover curated global destinations.
            </p>
          </div>

          {/* Bottom Highlights */}
          <div className="relative z-10 mt-8 pt-6 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <p className="text-base font-bold text-white">50+</p>
              <p className="text-[10px] text-slate-400">Cities</p>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <p className="text-base font-bold text-indigo-400">100%</p>
              <p className="text-[10px] text-slate-400">Precision</p>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <p className="text-base font-bold text-emerald-400">Smart</p>
              <p className="text-[10px] text-slate-400">Routes</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
          {/* Quick 1-Click Demo Section */}
          <div className="mb-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                Instant Demo Access (1-Click)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemo('user')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-indigo-900 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl shadow-xs transition active:scale-98"
              >
                <PlaneTakeoff className="w-3.5 h-3.5 text-indigo-600" />
                <span>Traveler Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-amber-900 bg-white hover:bg-amber-50 border border-amber-200 rounded-xl shadow-xs transition active:scale-98"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin Manager</span>
              </button>
            </div>
          </div>

          {/* Form Header & Tabs */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {isForgot ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isForgot
                  ? 'Enter your email to receive recovery instructions'
                  : isLogin
                  ? 'Access your saved trips and customized itineraries'
                  : 'Start planning your dream journeys today'}
              </p>
            </div>

            {!isForgot && (
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    isLogin ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    !isLogin ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isForgot && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Vance"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@globetrotter.io"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {!isForgot && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsForgot(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            )}

            {!isLogin && !isForgot && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                  <option value="AUD">AUD ($) - Australian Dollar</option>
                </select>
              </div>
            )}

            {isForgot && forgotSent && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                ✅ Demo recovery code generated: <strong>GT-884920</strong>. You may now return to login.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
            >
              <span>{loading ? 'Authenticating...' : isForgot ? 'Send Instructions' : isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {isForgot && (
              <button
                type="button"
                onClick={() => {
                  setIsForgot(false);
                  setForgotSent(false);
                }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-900 transition pt-1 font-semibold"
              >
                ← Back to Login
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
