import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import BudgetGauge from '../components/common/BudgetGauge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  Plane,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  MoreVertical,
  Edit2,
  Copy,
  Share2,
  Trash2,
  Eye,
  LayoutGrid,
  List,
  Compass,
  SlidersHorizontal,
  CheckCircle
} from 'lucide-react';

export default function MyTripsScreen({ onSelectTrip, onOpenNewTrip, onNavigate }) {
  const notify = useNotification();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [viewMode, setViewMode] = useState('grid');

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, [statusFilter]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.getTrips({ status: statusFilter, search });
      setTrips(res.trips || []);
    } catch (err) {
      notify.error('Failed to load your trips');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTrips();
  };

  const handleDuplicate = async (tripId) => {
    try {
      const res = await api.duplicateTrip(tripId);
      notify.success('Trip duplicated successfully!');
      fetchTrips();
    } catch (err) {
      notify.error('Failed to duplicate trip');
    }
  };

  const handleCopyShareLink = (trip) => {
    const url = `${window.location.origin}/#share-${trip.share_code}`;
    navigator.clipboard.writeText(url);
    notify.success('Shareable link copied to clipboard!');
    setActiveMenuId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteTrip(tripToDelete.id);
      notify.success('Trip deleted successfully');
      setTrips((prev) => prev.filter((t) => t.id !== tripToDelete.id));
      setTripToDelete(null);
    } catch (err) {
      notify.error('Failed to delete trip');
    } finally {
      setIsDeleting(false);
    }
  };

  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.start_date) - new Date(a.start_date);
    if (sortBy === 'date-asc') return new Date(a.start_date) - new Date(b.start_date);
    if (sortBy === 'budget-desc') return (b.total_budget || 0) - (a.total_budget || 0);
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Travel Itineraries
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage personal trips, edit stops, review real-time budgets, and share with friends.
          </p>
        </div>

        <button
          onClick={onOpenNewTrip}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Trip</span>
        </button>
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips by destination or title..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white placeholder:text-slate-400"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            {['all', 'upcoming', 'ongoing', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-semibold capitalize rounded-lg transition ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="budget-desc">Highest Budget</option>
            <option value="name">Alphabetical</option>
          </select>

          {/* View Toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : sortedTrips.length === 0 ? (
        <div className="p-12 rounded-3xl white-card text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Trips Found</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {search
                ? `No trips matching "${search}". Try clearing your search filter.`
                : 'You have not created any trips yet in this category.'}
            </p>
          </div>
          <button
            onClick={onOpenNewTrip}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            + Create a Trip
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTrips.map((trip) => (
            <div
              key={trip.id}
              className="group rounded-3xl white-card overflow-hidden flex flex-col justify-between"
            >
              {/* Cover Image & Badges */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={trip.cover_image}
                  alt={trip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-white/95 text-indigo-700 shadow-xs">
                    {trip.status}
                  </span>
                  {trip.visibility === 'public' && (
                    <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Public
                    </span>
                  )}
                </div>

                {/* 3-Dot Menu */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === trip.id ? null : trip.id)}
                    className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 shadow-xs transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === trip.id && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setActiveMenuId(null)}
                      />
                      <div className="absolute right-0 mt-1 w-44 rounded-xl white-dropdown z-30 py-1 shadow-xl animate-scale-up">
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onSelectTrip(trip.id, 'builder');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                          Edit in Builder
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onSelectTrip(trip.id, 'view');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-600" />
                          View Itinerary
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onSelectTrip(trip.id, 'budget');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                          Budget Breakdown
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            handleDuplicate(trip.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Copy className="w-3.5 h-3.5 text-blue-600" />
                          Duplicate Trip
                        </button>
                        <button
                          onClick={() => handleCopyShareLink(trip)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Share2 className="w-3.5 h-3.5 text-cyan-600" />
                          Share Link
                        </button>
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            setTripToDelete(trip);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Trip
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Stops Summary */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold drop-shadow-sm">
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
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                    {trip.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {trip.start_date} ➔ {trip.end_date}
                    </span>
                  </div>
                </div>

                <BudgetGauge
                  spent={trip.total_expenses || 0}
                  budget={trip.total_budget || 0}
                  currency={trip.currency === 'USD' ? '$' : '₹'}
                />

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onSelectTrip(trip.id, 'builder')}
                    className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition text-center"
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
      ) : (
        /* LIST VIEW */
        <div className="space-y-3">
          {sortedTrips.map((trip) => (
            <div
              key={trip.id}
              className="rounded-2xl white-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={trip.cover_image}
                  alt={trip.title}
                  className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{trip.title}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {trip.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {trip.start_date} ➔ {trip.end_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      {trip.destinations_preview || `${trip.stop_count || 0} stops`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-36 hidden sm:block">
                  <BudgetGauge
                    spent={trip.total_expenses || 0}
                    budget={trip.total_budget || 0}
                  />
                </div>

                <button
                  onClick={() => onSelectTrip(trip.id, 'builder')}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Builder
                </button>
                <button
                  onClick={() => onSelectTrip(trip.id, 'view')}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  View
                </button>
                <button
                  onClick={() => setTripToDelete(trip)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmDialog
        isOpen={!!tripToDelete}
        onClose={() => setTripToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Travel Itinerary"
        message={`Are you sure you want to delete "${tripToDelete?.title}"? All associated destination stops and activities will be removed.`}
        confirmText="Delete Itinerary"
        isLoading={isDeleting}
      />
    </div>
  );
}
