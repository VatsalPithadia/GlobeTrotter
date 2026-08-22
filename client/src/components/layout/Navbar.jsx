import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  PlusCircle,
  LogOut,
  User,
  Settings,
  Shield,
  Heart,
  ChevronDown,
  Globe,
  DollarSign
} from 'lucide-react';

export default function Navbar({ activeTab, onNavigate, onOpenNewTrip }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'my-trips', label: 'My Trips' },
    { id: 'explore-cities', label: 'Explore Destinations' },
    { id: 'activity-catalog', label: 'Activities' },
    { id: 'community', label: 'Community Feed' },
    { id: 'wishlist', label: 'Wishlist' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition">
            <Compass className="w-6 h-6 text-white group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              GlobeTrotter
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
              Odoo Edition
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/60">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Action Hub */}
        <div className="flex items-center gap-3">
          {/* Plan New Trip CTA Button */}
          {user && (
            <button
              onClick={onOpenNewTrip}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-102 active:scale-98 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Plan Trip</span>
            </button>
          )}

          {/* User Menu / Auth Buttons */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition group"
              >
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover bg-slate-700 ring-2 ring-indigo-500/30"
                />
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition" />
              </button>

              {/* Profile Dropdown */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-dropdown z-50 py-2 animate-scale-up">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                          <Shield className="w-3 h-3" /> Admin Access
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('profile');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                      >
                        <User className="w-4 h-4 text-indigo-400" />
                        My Profile & Settings
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('wishlist');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                      >
                        <Heart className="w-4 h-4 text-rose-400" />
                        Saved Wishlist
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onNavigate('admin');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-300 hover:bg-slate-800/70 transition"
                        >
                          <Shield className="w-4 h-4 text-amber-400" />
                          Admin Dashboard
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('auth')}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sub-navigation */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-800 bg-slate-950/90 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap rounded-lg ${
              activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}
