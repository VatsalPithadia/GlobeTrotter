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
      <div className="relative rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Welcome to GlobeTrotter
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hello, {user ? user.name : 'Traveler'}! 🌍
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl leading-relaxed">
              Design multi-city itineraries, estimate real-time trip budgets, and discover curated global travel experiences.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewTrip}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Plan New Trip</span>
            </button>
            <button
              onClick={() => onNavigate('explore-cities')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition"
            >
              <Compass className="w-4 h-4 text-slate-600" />
              <span>Explore Cities</span>
            </button>
          </div>
        </div>

        {/* User Key Metrics Ribbon */}
        {user && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-8 pt-6 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Trips</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_trips || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Cities Visited</span>
              <p className="text-2xl font-black text-indigo-700 mt-1">{stats.total_cities || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Wishlist Saved</span>
              <p className="text-2xl font-black text-rose-700 mt-1">{stats.wishlist_count || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Budget Managed</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                ${Number(stats.total_budget_managed || 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Recent & Upcoming Itineraries */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Your Recent Itineraries
            </h2>
          </div>
          {recentTrips.length > 0 && (
            <button
              onClick={() => onNavigate('my-trips')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
            >
              <span>View All Trips</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : recentTrips.length === 0 ? (
          <div className="p-10 rounded-3xl white-card text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No Trips Planned Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Get started by creating your first multi-city travel itinerary with automatic budget estimation.
              </p>
            </div>
            <button
              onClick={onOpenNewTrip}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              + Create First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentTrips.map((trip) => (
              <div
                key={trip.id}
                className="group rounded-3xl white-card overflow-hidden flex flex-col justify-between"
              >
                {/* Trip Card Image Header */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={trip.cover_image}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-white/95 backdrop-blur-md text-indigo-700 shadow-xs">
                      {trip.status}
                    </span>
                  </div>

                  {/* Travel Style */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-white/95 backdrop-blur-md text-slate-700 shadow-xs">
                      {trip.travel_style || 'Explorer'}
                    </span>
                  </div>

                  {/* Stops Preview in Bottom Header */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold drop-shadow-sm">
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <MapPin className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                      {trip.destinations_preview || `${trip.stop_count || 0} Stops`}
                    </span>
                    <span className="text-[11px] text-slate-200">
                      {trip.activity_count || 0} activities
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition">
                      {trip.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onSelectTrip(trip.id, 'builder')}
                      className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-100 transition text-center"
                    >
                      Builder
                    </button>
                    <button
                      onClick={() => onSelectTrip(trip.id, 'view')}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition text-center flex items-center justify-center gap-1"
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

      {/* 3. Popular Global Destinations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Popular Global Destinations
            </h2>
          </div>
          <button
            onClick={() => onNavigate('explore-cities')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
          >
            <span>Explore All 50+ Cities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularCities.map((city) => (
            <div
              key={city.id}
              className="group rounded-3xl white-card overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={city.image_url}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-white/95 text-indigo-700 shadow-xs">
                    {city.continent}
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-white/95 text-emerald-700 shadow-xs">
                    {city.cost_index}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleWishlist(city.id)}
                  className={`absolute top-3 right-3 p-2 rounded-xl transition ${
                    city.is_saved
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white/90 text-slate-700 hover:text-rose-600 hover:bg-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${city.is_saved ? 'fill-white' : ''}`} />
                </button>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-base font-extrabold leading-snug drop-shadow-sm">
                    {city.name}
                  </h3>
                  <p className="text-xs text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-300" />
                    {city.country}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {city.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {city.tags &&
                    city.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Avg Daily Cost</span>
                    <span className="text-xs font-bold text-emerald-600">${city.avg_daily_cost}/day</span>
                  </div>

                  <button
                    onClick={() => onQuickAddCity(city)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
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
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Community Itineraries
            </h2>
          </div>
          <button
            onClick={() => onNavigate('community')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
          >
            <span>Browse Community Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {communityTrips.slice(0, 3).map((commTrip) => (
            <div
              key={commTrip.id}
              className="rounded-3xl white-card p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={commTrip.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={commTrip.author_name}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{commTrip.author_name}</h4>
                  <span className="text-[11px] text-slate-500">Created {commTrip.title}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-600" />
                  {commTrip.route_preview || `${commTrip.stop_count} stops`}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2">{commTrip.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">💰 Budget: ${commTrip.total_budget}</span>
                <button
                  onClick={() => onNavigate('shared-view', commTrip.share_code)}
                  className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
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
