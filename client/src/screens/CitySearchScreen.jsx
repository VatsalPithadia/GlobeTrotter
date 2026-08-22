import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/common/Modal';
import {
  Compass,
  Search,
  Filter,
  MapPin,
  Heart,
  Plus,
  DollarSign,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Tag,
  CheckCircle2,
  Calendar
} from 'lucide-react';

const CONTINENTS = ['all', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];
const COST_INDICES = ['all', '$', '$$', '$$$', '$$$$'];

export default function CitySearchScreen({ onQuickAddCity, onOpenNewTripWithCity }) {
  const notify = useNotification();

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [selectedCost, setSelectedCost] = useState('all');

  // Selected City Details Modal
  const [detailCity, setDetailCity] = useState(null);
  const [cityActivities, setCityActivities] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Add to Existing Trip Modal
  const [addToTripModalCity, setAddToTripModalCity] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [stopDates, setStopDates] = useState({ arrival: '', departure: '' });
  const [savingStop, setSavingStop] = useState(false);

  useEffect(() => {
    fetchCities();
  }, [selectedContinent, selectedCost]);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await api.getCities({
        search,
        continent: selectedContinent,
        cost_index: selectedCost
      });
      setCities(res.cities || []);
    } catch (err) {
      notify.error('Failed to load cities');
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
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Discover World Destinations
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore 50+ hand-curated global cities with popularity ratings, daily cost indices, and iconic attraction previews.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl glass-panel border border-slate-800/80 space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city name, country, or vibe (e.g. Kyoto, Italy, beach, historic)..."
            className="w-full bg-slate-900/90 border border-slate-700/80 text-white rounded-2xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 font-medium"
          />
        </form>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Continents filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CONTINENTS.map((cont) => (
              <button
                key={cont}
                onClick={() => setSelectedContinent(cont)}
                className={`px-3 py-1 text-xs font-semibold rounded-xl whitespace-nowrap transition ${
                  selectedContinent === cont
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {cont === 'all' ? 'All Continents' : cont}
              </button>
            ))}
          </div>

          {/* Cost Index Filter */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Cost:</span>
            {COST_INDICES.map((cost) => (
              <button
                key={cost}
                onClick={() => setSelectedCost(cost)}
                className={`px-2.5 py-0.5 text-xs font-extrabold rounded-lg transition ${
                  selectedCost === cost
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
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
            <div key={i} className="h-80 rounded-3xl bg-slate-800/40 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : cities.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card text-center space-y-3">
          <Compass className="w-8 h-8 text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Cities Match Your Search</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search keywords or continent filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <div
              key={city.id}
              onClick={() => handleOpenCityDetails(city)}
              className="group rounded-3xl glass-card overflow-hidden border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                <img
                  src={city.image_url}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-900/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30">
                    {city.continent}
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                    {city.cost_index}
                  </span>
                </div>

                <button
                  onClick={(e) => handleToggleWishlist(city.id, e)}
                  className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition ${
                    city.is_saved
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40'
                      : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${city.is_saved ? 'fill-white' : ''}`} />
                </button>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-bold text-white leading-snug drop-shadow-md">
                    {city.name}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {city.country}
                  </p>
                </div>
              </div>

              {/* City Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {city.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {city.tags &&
                    city.tags.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        #{t}
                      </span>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Avg Daily Cost</span>
                    <span className="text-xs font-bold text-emerald-400">${city.avg_daily_cost}/day</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleOpenAddToTrip(city, e)}
                      className="px-3 py-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 rounded-xl transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Trip</span>
                    </button>
                  </div>
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
          <div className="space-y-6">
            <div className="relative h-56 w-full rounded-2xl overflow-hidden shadow-xl">
              <img
                src={detailCity.image_url}
                alt={detailCity.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-indigo-300 font-semibold">{detailCity.continent}</span>
                  <h3 className="text-xl font-extrabold text-white">{detailCity.name}</h3>
                </div>
                <span className="px-3 py-1 text-xs font-black rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  Cost: {detailCity.cost_index} (${detailCity.avg_daily_cost}/day)
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {detailCity.description}
            </p>

            {/* Top Recommended Activities in this City */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Must-Experience Attractions ({cityActivities.length})
              </h4>

              {loadingDetails ? (
                <div className="h-24 bg-slate-800/40 animate-pulse rounded-xl" />
              ) : cityActivities.length === 0 ? (
                <p className="text-xs text-slate-400">Attraction catalog loading...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                  {cityActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3"
                    >
                      <img
                        src={act.image_url}
                        alt={act.name}
                        className="w-12 h-12 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                      />
                      <div className="truncate">
                        <h5 className="text-xs font-bold text-white truncate">{act.name}</h5>
                        <p className="text-[10px] text-emerald-400 font-semibold">
                          ${act.cost} • {act.duration_mins} mins • ⭐ {act.rating}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Buttons in Modal */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={(e) => handleToggleWishlist(detailCity.id, e)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition ${
                  detailCity.is_saved
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${detailCity.is_saved ? 'fill-rose-400' : ''}`} />
                <span>{detailCity.is_saved ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const city = detailCity;
                    setDetailCity(null);
                    onOpenNewTripWithCity(city);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow transition"
                >
                  Start New Trip Here
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD TO EXISTING TRIP MODAL */}
      {addToTripModalCity && (
        <Modal
          isOpen={!!addToTripModalCity}
          onClose={() => setAddToTripModalCity(null)}
          title={`Add ${addToTripModalCity.name} to an Itinerary`}
          maxWidth="max-w-md"
        >
          {userTrips.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-xs text-slate-400">
                You do not have any active itineraries created yet.
              </p>
              <button
                onClick={() => {
                  const city = addToTripModalCity;
                  setAddToTripModalCity(null);
                  onOpenNewTripWithCity(city);
                }}
                className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
              >
                Create New Trip with {addToTripModalCity.name}
              </button>
            </div>
          ) : (
            <form onSubmit={handleExecuteAddStop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
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
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {userTrips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.start_date} - {t.end_date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    required
                    value={stopDates.arrival}
                    onChange={(e) => setStopDates({ ...stopDates, arrival: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    required
                    value={stopDates.departure}
                    onChange={(e) => setStopDates({ ...stopDates, departure: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddToTripModalCity(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStop}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg"
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
