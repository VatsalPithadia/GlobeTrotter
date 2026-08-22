import React, { useState } from 'react';
import Modal from '../components/common/Modal';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import {
  Calendar,
  DollarSign,
  Image as ImageIcon,
  Compass,
  Sparkles,
  Plane,
  Users,
  Heart,
  User,
  Crown,
  Backpack,
  ArrowRight
} from 'lucide-react';

const COVER_PRESETS = [
  { label: 'Paris & Europe', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Kyoto & Japan', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Rome Heritage', url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Tropical Bali', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80' },
  { label: 'New York Skyline', url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Taj Mahal Sunset', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80' }
];

const STYLES = [
  { id: 'Solo', label: 'Solo Traveler', icon: User },
  { id: 'Couple', label: 'Couple Getaway', icon: Heart },
  { id: 'Family', label: 'Family Vacation', icon: Users },
  { id: 'Friends', label: 'Friends Group', icon: Users },
  { id: 'Luxury', label: 'Luxury & Comfort', icon: Crown },
  { id: 'Backpacker', label: 'Backpacker Budget', icon: Backpack }
];

export default function CreateTripModal({ isOpen, onClose, onTripCreated, initialCity = null }) {
  const notify = useNotification();

  const [title, setTitle] = useState(initialCity ? `Journey to ${initialCity.name}` : '');
  const [description, setDescription] = useState(initialCity ? `Exploring the best highlights, culture, and cuisine of ${initialCity.name}, ${initialCity.country}.` : '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [budget, setBudget] = useState('2000');
  const [currency, setCurrency] = useState('USD');
  const [travelStyle, setTravelStyle] = useState('Couple');
  const [visibility, setVisibility] = useState('public');
  const [coverImage, setCoverImage] = useState(
    initialCity?.image_url || COVER_PRESETS[0].url
  );
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 1 : diffDays;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      notify.error('Please provide a trip title');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      notify.error('End date cannot be earlier than start date');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        start_date: startDate,
        end_date: endDate,
        cover_image: customCoverUrl.trim() || coverImage,
        total_budget: Number(budget) || 0,
        currency,
        visibility,
        travel_style: travelStyle,
        initial_stops: initialCity
          ? [
              {
                city_id: initialCity.id,
                city_name: initialCity.name,
                country: initialCity.country,
                arrival_date: startDate,
                departure_date: endDate,
                lat: initialCity.lat,
                lng: initialCity.lng
              }
            ]
          : []
      };

      const res = await api.createTrip(payload);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      notify.success('🎉 Trip created successfully! Opening Itinerary Builder...');
      onClose();
      if (onTripCreated) {
        onTripCreated(res.trip);
      }
    } catch (err) {
      notify.error(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plan a New Adventure" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Travel Style */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Trip Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer in Southern Italy & Amalfi Coast"
              className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Travel Style & Vibe
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STYLES.map((st) => {
                const Icon = st.icon;
                const isSelected = travelStyle === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setTravelStyle(st.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition text-left ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Date Ranges & Duration Indicator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Start Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              End Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs font-medium text-slate-300">
          <span>
            Total Duration: <strong className="text-indigo-400">{calculateDays()} Days</strong>
          </span>
          <span className="text-slate-400">
            {startDate} ➔ {endDate}
          </span>
        </div>

        {/* Target Budget & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Estimated Total Budget
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="0"
                step="50"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="2000"
                className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        </div>

        {/* Cover Photo Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
            Choose Cover Photo
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
            {COVER_PRESETS.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCoverImage(preset.url);
                  setCustomCoverUrl('');
                }}
                className={`relative h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                  coverImage === preset.url && !customCoverUrl
                    ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-102'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <div className="relative">
            <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={customCoverUrl}
              onChange={(e) => setCustomCoverUrl(e.target.value)}
              placeholder="Or paste custom image URL..."
              className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
            Description & Notes (Optional)
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key travel goals, must-see landmarks, packing notes..."
            className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
        </div>

        {/* Visibility */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
          <div>
            <span className="text-xs font-bold text-white block">Community Visibility</span>
            <span className="text-[11px] text-slate-400">
              Allow others to view and copy this itinerary
            </span>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setVisibility('public')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                visibility === 'public' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Public
            </button>
            <button
              type="button"
              onClick={() => setVisibility('private')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                visibility === 'private' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Private
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-600/30 transition hover:scale-102 active:scale-98"
          >
            <span>{loading ? 'Creating...' : 'Save & Build Itinerary'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </Modal>
  );
}
