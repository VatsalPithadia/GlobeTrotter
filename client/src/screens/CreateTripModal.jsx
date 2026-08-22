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
  Users,
  Heart,
  User,
  Crown,
  Backpack,
  ArrowRight
} from 'lucide-react';

const COVER_PRESETS = [
  { label: 'Jaipur Fort', url: 'https://images.unsplash.com/photo-1603258849062-817c1817c72f?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Udaipur Lakes', url: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Goa Beaches', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Kerala Backwaters', url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Manali Mountains', url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Taj Mahal Sunrise', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80' }
];

const STYLES = [
  { id: 'Family', label: 'Family Vacation', icon: Users },
  { id: 'Couple', label: 'Couple Getaway', icon: Heart },
  { id: 'Friends', label: 'Friends Group', icon: Users },
  { id: 'Solo', label: 'Solo Traveler', icon: User },
  { id: 'Luxury', label: 'Heritage Luxury', icon: Crown },
  { id: 'Backpacker', label: 'Backpacker Budget', icon: Backpack }
];

export default function CreateTripModal({ isOpen, onClose, onTripCreated, initialCity = null }) {
  const notify = useNotification();

  const [title, setTitle] = useState(initialCity ? `Journey to ${initialCity.name}` : '');
  const [description, setDescription] = useState(initialCity ? `Exploring the best palaces, cuisine, and culture of ${initialCity.name}.` : '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [budget, setBudget] = useState('30000');
  const [currency, setCurrency] = useState('INR');
  const [travelStyle, setTravelStyle] = useState('Family');
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

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });

      notify.success('Trip created successfully!');
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
    <Modal isOpen={isOpen} onClose={onClose} title="Plan a New Travel Itinerary" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Trip Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Royal Rajasthan Tour or Kerala Backwaters Escape"
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
          />
        </div>

        {/* Travel Style */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Travel Style
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
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Start Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              End Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
          <span>
            Total Days: <strong className="text-indigo-700">{calculateDays()} Days</strong>
          </span>
          <span className="text-slate-500">
            {startDate} ➔ {endDate}
          </span>
        </div>

        {/* Budget & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Budget (₹)
            </label>
            <div className="relative">
              <span className="text-xs font-bold text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2">₹</span>
              <input
                type="number"
                min="0"
                step="500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="30000"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-8 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>

        {/* Cover Photo Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Select Cover Destination
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2.5">
            {COVER_PRESETS.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCoverImage(preset.url);
                  setCustomCoverUrl('');
                }}
                className={`relative h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                  coverImage === preset.url && !customCoverUrl
                    ? 'border-indigo-600 ring-2 ring-indigo-200 scale-102'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Notes / Overview
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key highlights, packing notes, monument references..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition active:scale-98"
          >
            <span>{loading ? 'Saving...' : 'Create & Build Itinerary'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </Modal>
  );
}
