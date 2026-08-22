import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/common/Modal';
import {
  Compass,
  Search,
  MapPin,
  Heart,
  Plus,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const REGIONS = ['all', 'North India', 'South India', 'West India', 'East India', 'Islands'];
const COST_INDICES = ['all', '$', '$$', '$$$', '$$$$'];

export default function CitySearchScreen({ onQuickAddCity, onOpenNewTripWithCity }) {
  const notify = useNotification();

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCost, setSelectedCost] = useState('all');

  const [detailCity, setDetailCity] = useState(null);
  const [cityActivities, setCityActivities] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [addToTripModalCity, setAddToTripModalCity] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [stopDates, setStopDates] = useState({ arrival: '', departure: '' });
  const [savingStop, setSavingStop] = useState(false);

  useEffect(() => {
    fetchCities();
  }, [selectedRegion, selectedCost]);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await api.getCities({
        search,
        continent: selectedRegion,
        cost_index: selectedCost
      });
      setCities(res.cities || []);
    } catch (err) {
      notify.error('Failed to load Indian destinations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCities();
  };

  const handleToggleWishlist = async (cityId, e) => {
    e.stopPropagation();
    try {
      const res = await api.toggleWishlist(cityId);
      notify.success(res.message);
      setCities((prev) =>
        prev.map((c) => (c.id === cityId ? { ...c, is_saved: res.is_saved } : c))
      );
      if (detailCity && detailCity.id === cityId) {
        setDetailCity((prev) => ({ ...prev, is_saved: res.is_saved }));
      }
    } catch (err) {
      notify.error('Please sign in to save destinations');
    }
  };

  const handleOpenCityDetails = async (city) => {
    setDetailCity(city);
    setLoadingDetails(true);
    try {
      const res = await api.getCity(city.id);
      setDetailCity(res.city);
      setCityActivities(res.activities || []);
    } catch (e) {
      setCityActivities([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenAddToTrip = async (city, e) => {
    if (e) e.stopPropagation();
    setAddToTripModalCity(city);
    try {
      const res = await api.getTrips();
      setUserTrips(res.trips || []);
      if (res.trips && res.trips.length > 0) {
        setSelectedTripId(res.trips[0].id);
        setStopDates({
          arrival: res.trips[0].start_date,
          departure: res.trips[0].end_date
        });
      }
    } catch (err) {
      notify.error('Please sign in to add to your trips');
    }
  };

  const handleExecuteAddStop = async (e) => {
    e.preventDefault();
    if (!selectedTripId) {
      notify.error('Please select an active trip');
      return;
    }

    setSavingStop(true);
    try {
      await api.addStop(selectedTripId, {
        city_id: addToTripModalCity.id,
        city_name: addToTripModalCity.name,
        country: addToTripModalCity.country,
        arrival_date: stopDates.arrival,
        departure_date: stopDates.departure,
        lat: addToTripModalCity.lat,
        lng: addToTripModalCity.lng
      });
      notify.success(`Added ${addToTripModalCity.name} to your itinerary!`);
      setAddToTripModalCity(null);
    } catch (err) {
      notify.error(err.message || 'Failed to add stop');
    } finally {
      setSavingStop(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-600" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Discover Indian Destinations
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore heritage cities, coastal beaches, and Himalayan mountain passes across India.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Indian city or state (e.g. Jaipur, Goa, Manali, Kerala, Varanasi)..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl pl-11 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
          />
        </form>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Region filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {REGIONS.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition ${
                  selectedRegion === reg
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {reg === 'all' ? 'All India' : reg}
              </button>
            ))}
          </div>

          {/* Cost Index Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Cost:</span>
            {COST_INDICES.map((cost) => (
              <button
                key={cost}
                onClick={() => setSelectedCost(cost)}
                className={`px-2.5 py-0.5 text-xs font-bold rounded-lg transition ${
                  selectedCost === cost
                    ? 'bg-white text-emerald-700 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {cost === 'all' ? 'All' : cost}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : cities.length === 0 ? (
        <div className="p-12 rounded-3xl white-card text-center space-y-3">
          <Compass className="w-8 h-8 text-indigo-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Destinations Found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search terms or region filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <div
              key={city.id}
              onClick={() => handleOpenCityDetails(city)}
              className="group rounded-3xl white-card overflow-hidden flex flex-col justify-between cursor-pointer"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={city.image_url}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-white/95 text-indigo-700 shadow-xs">
                    {city.continent}
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-white/95 text-emerald-700 shadow-xs">
                    {city.cost_index}
                  </span>
                </div>

                <button
                  onClick={(e) => handleToggleWishlist(city.id, e)}
                  className={`absolute top-3.5 right-3.5 p-2 rounded-xl transition ${
                    city.is_saved
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white/90 text-slate-700 hover:text-rose-600 hover:bg-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${city.is_saved ? 'fill-white' : ''}`} />
                </button>

                <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                  <h3 className="text-lg font-extrabold leading-snug drop-shadow-sm">
                    {city.name}
                  </h3>
                  <p className="text-xs text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                    {city.country}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {city.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Avg Daily Cost</span>
                    <span className="text-sm font-bold text-emerald-700">₹{city.avg_daily_cost}/day</span>
                  </div>

                  <button
                    onClick={(e) => handleOpenAddToTrip(city, e)}
                    className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition flex items-center gap-1"
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

      {/* CITY DETAILS MODAL */}
      {detailCity && (
        <Modal
          isOpen={!!detailCity}
          onClose={() => setDetailCity(null)}
          title={`${detailCity.name}, ${detailCity.country}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5">
            <div className="relative h-56 w-full rounded-2xl overflow-hidden shadow-sm">
              <img
                src={detailCity.image_url}
                alt={detailCity.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <div>
                  <span className="text-xs text-indigo-200 font-semibold">{detailCity.continent}</span>
                  <h3 className="text-xl font-extrabold">{detailCity.name}</h3>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-xl bg-white/90 text-emerald-800 shadow-xs">
                  {detailCity.cost_index} (₹{detailCity.avg_daily_cost}/day)
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {detailCity.description}
            </p>

            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Must-Visit Experiences ({cityActivities.length})
              </h4>

              {loadingDetails ? (
                <div className="h-20 bg-slate-100 animate-pulse rounded-xl" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {cityActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5"
                    >
                      <img
                        src={act.image_url}
                        alt={act.name}
                        className="w-11 h-11 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://picsum.photos/seed/act/88/88'; }}
                      />
                      <div className="truncate">
                        <h5 className="text-xs font-bold text-slate-900 truncate">{act.name}</h5>
                        <p className="text-[10px] text-emerald-700 font-semibold">
                          ₹{act.cost} • {act.duration_mins}m • ⭐ {act.rating}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={(e) => handleToggleWishlist(detailCity.id, e)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition ${
                  detailCity.is_saved
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${detailCity.is_saved ? 'fill-rose-600 text-rose-600' : 'text-slate-500'}`} />
                <span>{detailCity.is_saved ? 'In Wishlist' : 'Save to Wishlist'}</span>
              </button>

              <button
                onClick={() => {
                  const city = detailCity;
                  setDetailCity(null);
                  onOpenNewTripWithCity(city);
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
              >
                Start Trip Here
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD TO TRIP MODAL */}
      {addToTripModalCity && (
        <Modal
          isOpen={!!addToTripModalCity}
          onClose={() => setAddToTripModalCity(null)}
          title={`Add ${addToTripModalCity.name} to Trip`}
          maxWidth="max-w-md"
        >
          {userTrips.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-xs text-slate-500">
                You do not have any active itineraries created yet.
              </p>
              <button
                onClick={() => {
                  const city = addToTripModalCity;
                  setAddToTripModalCity(null);
                  onOpenNewTripWithCity(city);
                }}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Create New Trip with {addToTripModalCity.name}
              </button>
            </div>
          ) : (
            <form onSubmit={handleExecuteAddStop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Trip *
                </label>
                <select
                  value={selectedTripId}
                  onChange={(e) => {
                    setSelectedTripId(e.target.value);
                    const t = userTrips.find((x) => x.id === e.target.value);
                    if (t) {
                      setStopDates({ arrival: t.start_date, departure: t.end_date });
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  {userTrips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    required
                    value={stopDates.arrival}
                    onChange={(e) => setStopDates({ ...stopDates, arrival: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    required
                    value={stopDates.departure}
                    onChange={(e) => setStopDates({ ...stopDates, departure: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddToTripModalCity(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStop}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {savingStop ? 'Adding...' : 'Confirm & Add Stop'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
