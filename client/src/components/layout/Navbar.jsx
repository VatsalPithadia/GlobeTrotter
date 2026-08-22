import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Plus,
  LogOut,
  User,
  Settings,
  Shield,
  Heart,
  ChevronDown,
  Globe
} from 'lucide-react';

export default function Navbar({ activeTab, onNavigate, onOpenNewTrip }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'my-trips', label: 'My Trips' },
    { id: 'explore-cities', label: 'Destinations' },
    { id: 'activity-catalog', label: 'Experiences' },
    { id: 'community', label: 'Community Feed' },
    { id: 'wishlist', label: 'Wishlist' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:bg-indigo-700 transition">
            <Compass className="w-5 h-5 text-white group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-slate-900">
              GlobeTrotter
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
              Odoo Edition
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === item.id
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
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
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Plan Trip</span>
            </button>
          )}

          {/* User Menu / Auth Buttons */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
              >
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover bg-slate-200 ring-1 ring-slate-300"
                />
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Profile Dropdown */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl white-dropdown z-50 py-2">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Shield className="w-3 h-3 text-amber-600" /> Admin Access
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('profile');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
                      >
                        <User className="w-4 h-4 text-indigo-600" />
                        My Profile & Settings
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('wishlist');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        Saved Wishlist
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onNavigate('admin');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-800 hover:bg-amber-50/50 transition"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          Admin Dashboard
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
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
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sub-nav */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-200 bg-white overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap rounded-lg ${
              activeTab === item.id ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}
