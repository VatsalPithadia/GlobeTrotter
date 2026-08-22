import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import {
  User,
  Mail,
  Coins,
  Globe,
  Heart,
  Download,
  Check,
  Save,
  Compass,
  Sparkles,
  MapPin,
  Trash2,
  Share2,
  Calendar
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'
];

export default function UserProfileScreen({ onNavigate, onOpenNewTripWithCity }) {
  const { user, stats, refreshUser } = useAuth();
  const notify = useNotification();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar_url || AVATAR_PRESETS[0]);
  const [currency, setCurrency] = useState(user?.currency_preference || 'USD');
  const [saving, setSaving] = useState(false);

  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoadingWishlist(true);
    try {
      const res = await api.getWishlist();
      setWishlist(res.saved || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatar_url: avatar,
        currency_preference: currency
      });
      await refreshUser();
      notify.success('Profile preferences updated successfully');
    } catch (err) {
      notify.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveWishlist = async (cityId) => {
    try {
      await api.toggleWishlist(cityId);
      notify.success('Destination removed from wishlist');
      setWishlist((prev) => prev.filter((item) => item.id !== cityId));
    } catch (err) {
      notify.error('Failed to update wishlist');
    }
  };

  const handleExportData = async () => {
    try {
      const tripsRes = await api.getTrips();
      const exportBlob = new Blob(
        [
          JSON.stringify(
            {
              exported_at: new Date().toISOString(),
              user: { name: user.name, email: user.email, currency: user.currency_preference },
              trips: tripsRes.trips,
              wishlist
            },
            null,
            2
          )
        ],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(exportBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `globetrotter-backup-${user.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      notify.success('Portfolio backup exported as JSON!');
    } catch (err) {
      notify.error('Export failed');
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal travel profile, regional currency settings, and saved dream destinations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card & Settings Form */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleSaveProfile} className="rounded-3xl white-card p-6 space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <img
                src={avatar}
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/20 shrink-0"
              />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{name || 'Traveler'}</h3>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Choose Profile Avatar
              </label>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {AVATAR_PRESETS.map((p, idx) => (
                  <img
                    key={idx}
                    src={p}
                    alt="preset"
                    onClick={() => setAvatar(p)}
                    className={`w-11 h-11 rounded-xl object-cover cursor-pointer border-2 transition ${
                      avatar === p ? 'border-indigo-600 ring-2 ring-indigo-200 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Travel Bio & Motto
              </label>
              <textarea
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Passionate globe-trotter exploring historic European architecture and Asian food markets..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Default Currency
                </label>
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
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role Status
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.role === 'admin' ? 'Administrator' : 'Verified Traveler'}
                  className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl px-3 py-2 text-xs cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleExportData}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Wishlist Destinations */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-extrabold text-slate-900">
                Saved Wishlist Destinations ({wishlist.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('explore-cities')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              + Browse More
            </button>
          </div>

          {loadingWishlist ? (
            <div className="h-60 rounded-3xl bg-slate-100 animate-pulse" />
          ) : wishlist.length === 0 ? (
            <div className="p-10 rounded-3xl white-card text-center space-y-3">
              <Heart className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-xs text-slate-500">Your destination wishlist is empty.</p>
              <button
                onClick={() => onNavigate('explore-cities')}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Explore Destinations
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {wishlist.map((w) => (
                <div
                  key={w.id}
                  className="rounded-2xl white-card p-3.5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={w.image_url}
                      alt={w.name}
                      className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900">{w.name}</h4>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {w.cost_index}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {w.country} • ${w.avg_daily_cost}/day
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenNewTripWithCity(w)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition"
                    >
                      Plan Trip
                    </button>
                    <button
                      onClick={() => handleRemoveWishlist(w.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
