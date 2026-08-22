import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/common/Modal';
import {
  Compass,
  Search,
  Filter,
  DollarSign,
  Clock,
  Star,
  MapPin,
  Plus,
  Sparkles,
  Camera,
  Utensils,
  Landmark,
  Palmtree,
  Car
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Experiences', icon: Compass },
  { id: 'sightseeing', label: 'Sightseeing', icon: Camera },
  { id: 'food', label: 'Food & Dining', icon: Utensils },
  { id: 'culture', label: 'Culture & Art', icon: Landmark },
  { id: 'adventure', label: 'Adventure', icon: Palmtree },
  { id: 'transport', label: 'Transit & Tours', icon: Car }
];

export default function ActivitySearchScreen({ onSelectTrip }) {
  const notify = useNotification();

  const [activities, setActivities] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCityId, setSelectedCityId] = useState('all');
  const [maxPrice, setMaxPrice] = useState(250);

  const [targetActivity, setTargetActivity] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedStopId, setSelectedStopId] = useState('');
  const [actDate, setActDate] = useState('');
  const [actTime, setActTime] = useState('10:00');
  const [addingAct, setAddingAct] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, [selectedCategory, selectedCityId]);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [actRes, cityRes] = await Promise.all([
        api.getCatalogActivities({
          category: selectedCategory,
          city_id: selectedCityId,
          max_cost: maxPrice,
          search
        }),
        api.getCities({ limit: 50 })
      ]);
      setActivities(actRes.activities || []);
      setCities(cityRes.cities || []);
    } catch (err) {
      notify.error('Failed to load activity catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCatalog();
  };

  const handleOpenAddModal = async (act) => {
    setTargetActivity(act);
    try {
      const res = await api.getTrips();
      setUserTrips(res.trips || []);
      if (res.trips && res.trips.length > 0) {
        const firstTrip = res.trips[0];
        const fullTrip = await api.getTrip(firstTrip.id);
        setSelectedTrip(fullTrip);
        if (fullTrip.stops && fullTrip.stops.length > 0) {
          setSelectedStopId(fullTrip.stops[0].id);
          setActDate(fullTrip.stops[0].arrival_date);
        }
      }
    } catch (e) {
      notify.error('Please sign in to schedule activities');
    }
  };

  const handleTripChange = async (tripId) => {
    try {
      const fullTrip = await api.getTrip(tripId);
      setSelectedTrip(fullTrip);
      if (fullTrip.stops && fullTrip.stops.length > 0) {
        setSelectedStopId(fullTrip.stops[0].id);
        setActDate(fullTrip.stops[0].arrival_date);
      }
    } catch (e) {}
  };

  const handleSaveActivityToStop = async (e) => {
    e.preventDefault();
    if (!selectedStopId || !actDate) {
      notify.error('Please select a destination stop and scheduled date');
      return;
    }

    setAddingAct(true);
    try {
      await api.addActivity(selectedStopId, {
        title: targetActivity.name,
        description: targetActivity.description || '',
        category: targetActivity.category || 'sightseeing',
        cost: targetActivity.cost || 0,
        duration_mins: targetActivity.duration_mins || 90,
        scheduled_date: actDate,
        scheduled_time: actTime,
        location_name: targetActivity.city_name || '',
        image_url: targetActivity.image_url || ''
      });

      notify.success(`"${targetActivity.name}" scheduled to your itinerary!`);
      setTargetActivity(null);
    } catch (err) {
      notify.error(err.message || 'Failed to add activity');
    } finally {
      setAddingAct(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Activity & Experience Catalog
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Browse authentic global experiences, museum tours, culinary walks, and sunset excursions.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3.5">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search experiences (e.g. Louvre, Sunset Cruise, Pasta Workshop, Temples)..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl pl-11 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
          />
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Filter City:</span>
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
            >
              <option value="all">All Global Cities</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">Max Cost: ${maxPrice}</span>
            <input
              type="range"
              min="10"
              max="250"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              onMouseUp={loadCatalog}
              onTouchEnd={loadCatalog}
              className="w-36 accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="p-12 rounded-3xl white-card text-center space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Activities Match Filter</h3>
          <p className="text-xs text-slate-500">Try loosening your budget limit or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => (
            <div
              key={act.id}
              className="group rounded-3xl white-card overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={act.image_url}
                  alt={act.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg bg-white/95 text-indigo-700 shadow-xs">
                    {act.category}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-lg bg-white/95 text-amber-700 shadow-xs flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {act.rating}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-xs text-white font-semibold drop-shadow-sm">
                  {act.city_name ? `${act.city_name}, ${act.city_country}` : ''}
                </div>
              </div>

              {/* Activity Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                    {act.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Estimated Cost</span>
                    <span className="text-sm font-bold text-emerald-700">
                      ${act.cost} <span className="text-[10px] text-slate-500 font-normal">/ {act.duration_mins}m</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenAddModal(act)}
                    className="flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Trip</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD ACTIVITY MODAL */}
      {targetActivity && (
        <Modal
          isOpen={!!targetActivity}
          onClose={() => setTargetActivity(null)}
          title={`Schedule "${targetActivity.name}"`}
          maxWidth="max-w-md"
        >
          {userTrips.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-xs text-slate-500">No active trips found in your account.</p>
            </div>
          ) : (
            <form onSubmit={handleSaveActivityToStop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Trip
                </label>
                <select
                  value={selectedTrip?.trip?.id || ''}
                  onChange={(e) => handleTripChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  {userTrips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Destination Stop *
                </label>
                {selectedTrip?.stops && selectedTrip.stops.length > 0 ? (
                  <select
                    value={selectedStopId}
                    onChange={(e) => {
                      setSelectedStopId(e.target.value);
                      const st = selectedTrip.stops.find((x) => x.id === e.target.value);
                      if (st) setActDate(st.arrival_date);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    {selectedTrip.stops.map((s, idx) => (
                      <option key={s.id} value={s.id}>
                        Stop #{idx + 1}: {s.city_name} ({s.arrival_date} - {s.departure_date})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-600">
                    This trip has no stops yet. Please add a stop in builder first.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={actDate}
                    onChange={(e) => setActDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={actTime}
                    onChange={(e) => setActTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTargetActivity(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingAct || !selectedStopId}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {addingAct ? 'Scheduling...' : 'Schedule to Itinerary'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
