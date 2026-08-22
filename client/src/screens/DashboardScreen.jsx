import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import BudgetGauge from '../components/common/BudgetGauge';
import {
  Compass,
  Plus,
  MapPin,
  Calendar,
  DollarSign,
  Heart,
  ArrowRight,
  Sparkles,
  Plane,
  Eye,
  Share2
} from 'lucide-react';

export default function DashboardScreen({ onNavigate, onSelectTrip, onOpenNewTrip, onQuickAddCity }) {
  const { user, stats } = useAuth();
  const notify = useNotification();

  const [recentTrips, setRecentTrips] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [communityTrips, setCommunityTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [tripsRes, citiesRes, commRes] = await Promise.all([
        api.getTrips({ limit: 4 }).catch(() => ({ trips: [] })),
        api.getCities({ limit: 6 }).catch(() => ({ cities: [] })),
        api.getCommunityTrips().catch(() => ({ trips: [] }))
      ]);

      setRecentTrips(tripsRes.trips || []);
      setPopularCities(citiesRes.cities || []);
      setCommunityTrips(commRes.trips || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async (cityId) => {
    try {
      const res = await api.toggleWishlist(cityId);
      notify.success(res.message);
      setPopularCities((prev) =>
        prev.map((c) => (c.id === cityId ? { ...c, is_saved: res.is_saved } : c))
      );
    } catch (err) {
      notify.error('Please sign in to save destinations');
    }
  };

  return (
    <div className="space-y-12 pb-20 animate-fade-in max-w-7xl mx-auto">
      {/* 1. Spacious Hero Welcome Header */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-10 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Welcome to GlobeTrotter India
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Namaste, {user ? user.name : 'Traveler'}! 🙏
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              Plan royal palace tours in Rajasthan, serene backwaters in Kerala, or mountain road trips in Himachal & Ladakh.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewTrip}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Plan New Trip</span>
            </button>
            <button
              onClick={() => onNavigate('explore-cities')}
              className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Places</span>
            </button>
          </div>
        </div>

        {/* Lifetime Travel Stats */}
        {user && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Planned Trips</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_trips || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Indian Cities</span>
              <p className="text-2xl font-black text-indigo-700 mt-1">{stats.total_cities || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Wishlist</span>
              <p className="text-2xl font-black text-rose-600 mt-1">{stats.wishlist_count || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Total Budget</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                ₹{Number(stats.total_budget_managed || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Recent Itineraries */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Your Travel Itineraries
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage and customize your ongoing and upcoming plans</p>
          </div>

          {recentTrips.length > 0 && (
            <button
              onClick={() => onNavigate('my-trips')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : recentTrips.length === 0 ? (
          <div className="p-12 rounded-3xl white-card text-center space-y-3">
            <Compass className="w-10 h-10 text-indigo-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Trips Created Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first multi-city Indian itinerary with automatic budget calculations.
            </p>
            <button
              onClick={onOpenNewTrip}
              className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              + Create First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTrips.map((trip) => (
              <div
                key={trip.id}
                className="group rounded-3xl white-card overflow-hidden flex flex-col justify-between"
              >
                {/* Image Header */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={trip.cover_image}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-white/95 text-indigo-700 shadow-xs">
                      {trip.status}
                    </span>
                  </div>

                  <div className="absolute top-3.5 right-3.5">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-white/95 text-slate-700 shadow-xs">
                      {trip.travel_style || 'Explorer'}
                    </span>
                  </div>

                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-xs text-white font-semibold drop-shadow-sm">
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <MapPin className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                      {trip.destinations_preview || `${trip.stop_count || 0} stops`}
                    </span>
                    <span className="text-[11px] text-slate-200">
                      {trip.activity_count || 0} activities
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                      {trip.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trip.start_date} ➔ {trip.end_date}</span>
                    </div>
                  </div>

                  <BudgetGauge
                    spent={trip.total_expenses || 0}
                    budget={trip.total_budget || 0}
                    currency={trip.currency === 'USD' ? '$' : '₹'}
                  />

                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onSelectTrip(trip.id, 'builder')}
                      className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition text-center"
                    >
                      Builder
                    </button>
                    <button
                      onClick={() => onSelectTrip(trip.id, 'view')}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition text-center flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Itinerary</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Popular Indian Destinations */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Popular Indian Destinations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore heritage cities, coastal getaways, and hill stations</p>
          </div>

          <button
            onClick={() => onNavigate('explore-cities')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
          >
            <span>Explore All Places</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularCities.map((city) => (
            <div
              key={city.id}
              className="group rounded-3xl white-card overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={city.image_url}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                  onClick={() => handleToggleWishlist(city.id)}
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
                    <MapPin className="w-3 h-3 text-indigo-300" />
                    {city.country}
                  </p>
                </div>
              </div>

              {/* Card Body */}
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
                    onClick={() => onQuickAddCity(city)}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Plan Trip</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Community Inspiration Feed */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Community Travel Plans
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore trips created by fellow travelers and clone them with 1 click</p>
          </div>

          <button
            onClick={() => onNavigate('community')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
          >
            <span>View All Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {communityTrips.slice(0, 3).map((commTrip) => (
            <div
              key={commTrip.id}
              className="rounded-3xl white-card p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={commTrip.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={commTrip.author_name}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{commTrip.author_name}</h4>
                  <span className="text-[11px] text-slate-500">Planned {commTrip.title}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {commTrip.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-600 font-semibold">💰 Budget: ₹{Number(commTrip.total_budget || 0).toLocaleString('en-IN')}</span>
                <button
                  onClick={() => onNavigate('shared-view', commTrip.share_code)}
                  className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                >
                  <span>View Plan</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
