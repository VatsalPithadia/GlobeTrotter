import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import {
  User,
  Settings,
  Heart,
  Globe,
  DollarSign,
  Mail,
  Shield,
  Download,
  Trash2,
  Sparkles,
  MapPin,
  Plus,
  ArrowRight,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
];

export default function UserProfileScreen({ onOpenNewTripWithCity, onNavigate }) {
  const { user, stats, updateProfile } = useAuth();
  const notify = useNotification();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'wishlist' | 'preferences'
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [saving, setSaving] = useState(false);

  // Wishlist
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatar_url || '');
      setCurrency(user.currency || 'USD');
      setLanguage(user.language || 'en');
    }
    loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    setLoadingWishlist(true);
    try {
      const res = await api.getWishlist();
      setWishlist(res.wishlist || []);
    } catch (e) {
      setWishlist([]);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name,
        bio,
        avatar_url: avatarUrl,
        currency,
        language
      });
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveWishlist = async (cityId) => {
    try {
      await api.toggleWishlist(cityId);
      notify.info('Destination removed from wishlist');
      setWishlist((prev) => prev.filter((c) => c.id !== cityId));
    } catch (e) {
      notify.error('Failed to update wishlist');
    }
  };

  const handleExportData = async () => {
    try {
      const tripsRes = await api.getTrips();
      const exportObject = {
        user,
        stats,
        wishlist,
        trips: tripsRes.trips || [],
        exported_at: new Date().toISOString()
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `globetrotter-backup-${user?.id || 'traveler'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      notify.success('All travel data exported as JSON!');
    } catch (e) {
      notify.error('Failed to export data');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in">
      {/* User Header Profile Card */}
      <div className="rounded-3xl glass-panel p-8 border border-slate-700/70 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`}
              alt={name}
              className="w-20 h-20 rounded-3xl object-cover ring-4 ring-indigo-500/30 shadow-2xl bg-slate-800"
            />
            {user?.role === 'admin' && (
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase shadow">
                Admin
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{name}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              {user?.email}
            </p>
            {bio && <p className="text-xs text-slate-300 max-w-md mt-1">{bio}</p>}
          </div>
        </div>

        {/* Lifetime Travel Stats */}
        <div className="grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 text-center">
          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Trips</span>
            <p className="text-xl font-black text-white">{stats?.total_trips || 0}</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Cities</span>
            <p className="text-xl font-black text-indigo-400">{stats?.total_cities || 0}</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Wishlist</span>
            <p className="text-xl font-black text-rose-400">{wishlist.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'profile' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Bio</span>
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'wishlist' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-400" />
          <span>Saved Wishlist ({wishlist.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'preferences' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 text-purple-400" />
          <span>Preferences & Data</span>
        </button>
      </div>

      {/* TAB 1: PROFILE EDIT */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="rounded-3xl glass-panel p-8 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Personal Information</h3>
            <p className="text-xs text-slate-400">Manage how you appear across GlobeTrotter itineraries.</p>
          </div>

          {/* Avatar Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Choose Profile Avatar
            </label>
            <div className="flex flex-wrap gap-3 mb-3">
              {AVATAR_PRESETS.map((p, i) => (
                <img
                  key={i}
                  src={p}
                  alt={`Preset ${i}`}
                  onClick={() => setAvatarUrl(p)}
                  className={`w-14 h-14 rounded-2xl object-cover cursor-pointer border-2 transition ${
                    avatarUrl === p
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Or paste custom image URL..."
              className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-900 border border-slate-800 text-slate-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Travel Bio & Motto
            </label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about your travel style, favorite countries, photography passions..."
              className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition hover:scale-102"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SAVED WISHLIST */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Your Dream Destinations</h3>
              <p className="text-xs text-slate-400">
                Cities you've saved to explore in future itineraries.
              </p>
            </div>
          </div>

          {loadingWishlist ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-3xl bg-slate-800/40 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : wishlist.length === 0 ? (
            <div className="p-12 rounded-3xl glass-card text-center space-y-3">
              <Heart className="w-8 h-8 text-rose-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Wishlist is Empty</h4>
              <p className="text-xs text-slate-400">
                Browse our curated destinations catalog and hit the heart icon to save your favorites!
              </p>
              <button
                onClick={() => onNavigate('explore-cities')}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
              >
                Browse Cities
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((city) => (
                <div
                  key={city.id}
                  className="rounded-3xl glass-card overflow-hidden border border-slate-800 flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                    <img
                      src={city.image_url}
                      alt={city.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                    <button
                      onClick={() => handleRemoveWishlist(city.id)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-600/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="text-base font-bold text-white">{city.name}</h4>
                      <p className="text-xs text-slate-300">{city.country} • {city.continent}</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-300 line-clamp-2">{city.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-xs font-bold text-emerald-400">${city.avg_daily_cost}/day</span>
                      <button
                        onClick={() => onOpenNewTripWithCity(city)}
                        className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                      >
                        <span>Plan Trip</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PREFERENCES & DATA */}
      {activeTab === 'preferences' && (
        <div className="rounded-3xl glass-panel p-8 border border-slate-800 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-white">System Preferences & Data Portability</h3>
            <p className="text-xs text-slate-400">Configure global currency, language, and export your personal travel records.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="en">English (US)</option>
                <option value="fr">Français (French)</option>
                <option value="es">Español (Spanish)</option>
                <option value="de">Deutsch (German)</option>
                <option value="ja">日本語 (Japanese)</option>
              </select>
            </div>
          </div>

          {/* Export Data Button */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Export Full Travel Portfolio</h4>
              <p className="text-xs text-slate-400">
                Download a clean JSON archive containing all your itineraries, scheduled activities, and logged expenses.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Download JSON Backup</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
