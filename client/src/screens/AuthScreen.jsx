import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Sparkles, Shield, KeyRound, Mail, Lock, User as UserIcon, ArrowRight, PlaneTakeoff, Globe2 } from 'lucide-react';

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
      // Handled in context toast
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl glass-panel shadow-2xl border border-slate-700/60 overflow-hidden">
        {/* Left Side: Travel Inspiration Hero */}
        <div className="lg:col-span-6 relative p-8 md:p-12 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950">
          <div
            className="absolute inset-0 opacity-25 mix-blend-overlay bg-cover bg-center"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/40">
                <Compass className="w-7 h-7 text-white animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">GlobeTrotter</h1>
                <p className="text-xs font-semibold text-indigo-400">Personalized Travel Intelligence</p>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mt-6">
              Dream, Plan, and Experience Global Journeys.
            </h2>
            <p className="text-sm text-slate-300 mt-4 leading-relaxed max-w-md">
              Construct multi-city itineraries, estimate real-time trip budgets, explore 50+ curated global destinations, and share public itineraries with ease.
            </p>
          </div>

          {/* Bottom Highlights */}
          <div className="relative z-10 mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <p className="text-lg font-bold text-white">50+</p>
              <p className="text-[11px] text-slate-400">Curated Cities</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <p className="text-lg font-bold text-indigo-400">100%</p>
              <p className="text-[11px] text-slate-400">Budget Precision</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <p className="text-lg font-bold text-purple-400">Multi-City</p>
              <p className="text-[11px] text-slate-400">Day Plans</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center bg-slate-900/90">
          {/* Quick 1-Click Demo Buttons for Hackathon Judges & Evaluators */}
          <div className="mb-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                Instant Demo Logins (1-Click)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemo('user')}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow transition active:scale-98"
              >
                <PlaneTakeoff className="w-3.5 h-3.5" />
                <span>Traveler Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-amber-200 bg-amber-600/30 hover:bg-amber-600/40 border border-amber-500/40 rounded-xl shadow transition active:scale-98"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Manager</span>
              </button>
            </div>
          </div>

          {/* Form Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">
                {isForgot ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isForgot
                  ? 'Enter your email to receive recovery instructions'
                  : isLogin
                  ? 'Access your saved trips and customized itineraries'
                  : 'Start planning your dream journeys today'}
              </p>
            </div>

            {!isForgot && (
              <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    isLogin ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    !isLogin ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Vance"
                    className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@globetrotter.io"
                  className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            {!isForgot && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsForgot(true)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
                  />
                </div>
              </div>
            )}

            {!isLogin && !isForgot && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
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
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
                ✅ Demo recovery code generated: <strong>GT-884920</strong>. You may now return to login.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>{loading ? 'Authenticating...' : isForgot ? 'Send Instructions' : isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {isForgot && (
              <button
                type="button"
                onClick={() => {
                  setIsForgot(false);
                  setForgotSent(false);
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition pt-2"
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
