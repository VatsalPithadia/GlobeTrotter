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
  TrendingUp,
  Heart,
  ArrowRight,
  Sparkles,
  Plane,
  Clock,
  Eye,
  CheckCircle,
  Share2,
  Bookmark,
  SunMedium
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
    <div className="space-y-10 pb-16 animate-fade-in">
      {/* 1. Hero Welcome Hub */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-700/60 p-8 sm:p-10 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80">
        <div
          className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"
        />
        <div
          className="absolute -left-20 -top-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to GlobeTrotter
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hello, {user ? user.name : 'Traveler'}! 🌍
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
              Where would you like to explore next? Build multi-city itineraries, estimate real-time budgets, and turn dream travels into reality.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewTrip}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-102 active:scale-98 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Plan New Trip</span>
            </button>
            <button
              onClick={() => onNavigate('explore-cities')}
              className="flex items-center gap-2 px-5 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white text-sm font-semibold rounded-2xl border border-slate-700 transition"
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Explore Cities</span>
            </button>
          </div>
        </div>

        {/* User Key Metrics Ribbon */}
        {user && stats && (
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400">Total Trips</span>
              <p className="text-2xl font-black text-white mt-1">{stats.total_trips || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400">Cities Visited</span>
              <p className="text-2xl font-black text-indigo-400 mt-1">{stats.total_cities || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400">Wishlist Saved</span>
              <p className="text-2xl font-black text-rose-400 mt-1">{stats.wishlist_count || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400">Budget Managed</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                ${Number(stats.total_budget_managed || 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Recent & Upcoming Itineraries */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Plane className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Your Recent Itineraries</h2>
          </div>
          {recentTrips.length > 0 && (
            <button
              onClick={() => onNavigate('my-trips')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              <span>View All Trips</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-800/40 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : recentTrips.length === 0 ? (
          <div className="p-10 rounded-3xl glass-card text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Compass className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No Trips Planned Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Get started by creating your first personalized multi-city travel itinerary with automatic budget estimation.
              </p>
            </div>
            <button
              onClick={onOpenNewTrip}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              + Create First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentTrips.map((trip) => (
              <div
                key={trip.id}
                className="group rounded-3xl glass-card overflow-hidden flex flex-col justify-between border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300"
              >
                {/* Trip Card Image Header */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                  <img
                    src={trip.cover_image}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-slate-900/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30">
                      {trip.status}
                    </span>
                  </div>

                  {/* Travel Style */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700">
                      {trip.travel_style || 'Explorer'}
                    </span>
                  </div>

                  {/* Stops Preview in Bottom Header */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold drop-shadow-md">
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      {trip.destinations_preview || `${trip.stop_count || 0} Stops`}
                    </span>
                    <span className="text-[11px] text-slate-300">
                      {trip.activity_count || 0} activities
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition">
                      {trip.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {trip.start_date} ➔ {trip.end_date}
                      </span>
                    </div>
                  </div>

                  {/* Budget Mini Progress */}
                  <BudgetGauge
                    spent={trip.total_expenses || 0}
                    budget={trip.total_budget || 0}
                    currency={trip.currency === 'EUR' ? '€' : trip.currency === 'GBP' ? '£' : trip.currency === 'INR' ? '₹' : '$'}
                  />

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => onSelectTrip(trip.id, 'builder')}
                      className="py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold border border-indigo-500/30 transition text-center"
                    >
                      Builder
                    </button>
                    <button
                      onClick={() => onSelectTrip(trip.id, 'view')}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition text-center flex items-center justify-center gap-1"
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

      {/* 3. Recommended / Trending Global Destinations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Popular Global Destinations</h2>
          </div>
          <button
            onClick={() => onNavigate('explore-cities')}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
          >
            <span>Explore All 50+ Cities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularCities.map((city) => (
            <div
              key={city.id}
              className="group rounded-3xl glass-card overflow-hidden border border-slate-800/80 hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                <img
                  src={city.image_url}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Continent & Cost Index Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-900/80 backdrop-blur-md text-purple-300 border border-purple-500/30">
                    {city.continent}
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                    {city.cost_index}
                  </span>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => handleToggleWishlist(city.id)}
                  className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition ${
                    city.is_saved
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40'
                      : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${city.is_saved ? 'fill-white' : ''}`} />
                </button>

                {/* City name & Country */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-bold text-white leading-snug drop-shadow-md">
                    {city.name}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-purple-400" />
                    {city.country}
                  </p>
                </div>
              </div>

              {/* City Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {city.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {city.tags &&
                    city.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Avg Daily Cost</span>
                    <span className="text-xs font-bold text-emerald-400">${city.avg_daily_cost}/day</span>
                  </div>

                  <button
                    onClick={() => onQuickAddCity(city)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 rounded-xl transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Trip</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Inspiring Community Itineraries */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Public Community Itineraries</h2>
          </div>
          <button
            onClick={() => onNavigate('community')}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
          >
            <span>Browse Community Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {communityTrips.slice(0, 3).map((commTrip) => (
            <div
              key={commTrip.id}
              className="rounded-3xl glass-card p-5 border border-slate-800/80 space-y-4 hover:border-indigo-500/40 transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={commTrip.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={commTrip.author_name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
                />
                <div>
                  <h4 className="text-sm font-bold text-white truncate">{commTrip.author_name}</h4>
                  <span className="text-[11px] text-slate-400">Created {commTrip.title}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-indigo-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {commTrip.route_preview || `${commTrip.stop_count} stops`}
                </p>
                <p className="text-xs text-slate-300 line-clamp-2">{commTrip.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                <span>💰 Budget: ${commTrip.total_budget}</span>
                <button
                  onClick={() => onNavigate('shared-view', commTrip.share_code)}
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  <span>Explore Plan</span>
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
