import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import MapViewer from '../components/common/MapViewer';
import BudgetGauge from '../components/common/BudgetGauge';
import {
  Compass,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Tag,
  Share2,
  Printer,
  Edit2,
  ListOrdered,
  Layers,
  Map,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Hotel
} from 'lucide-react';

export default function ItineraryViewScreen({ tripId, onNavigate, onSelectTrip }) {
  const notify = useNotification();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('days');

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    setLoading(true);
    try {
      const data = await api.getTrip(tripId);
      setTripData(data);
    } catch (err) {
      notify.error('Failed to load itinerary');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShare = () => {
    const url = `${window.location.origin}/#share-${tripData?.trip?.share_code}`;
    navigator.clipboard.writeText(url);
    notify.success('Public itinerary link copied to clipboard!');
  };

  if (loading || !tripData) {
    return (
      <div className="py-24 text-center space-y-3">
        <Compass className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading structured itinerary...</p>
      </div>
    );
  }

  const { trip, stops, activities } = tripData;

  const activitiesByDate = {};
  activities.forEach((act) => {
    if (!activitiesByDate[act.scheduled_date]) {
      activitiesByDate[act.scheduled_date] = [];
    }
    activitiesByDate[act.scheduled_date].push(act);
  });

  const sortedDates = Object.keys(activitiesByDate).sort();

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Trip Header Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={trip.cover_image}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          {/* Action Bar (No Print) */}
          <div className="absolute top-4 right-4 flex items-center gap-2 no-print">
            <button
              onClick={() => onSelectTrip(trip.id, 'builder')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-900 text-xs font-bold shadow-sm transition"
            >
              <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Edit Builder</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 shadow-sm transition"
              title="Print or Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyShare}
              className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 shadow-sm transition"
              title="Share Link"
            >
              <Share2 className="w-4 h-4 text-cyan-600" />
            </button>
          </div>

          {/* Title & Info */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-lg bg-indigo-600 text-white shadow-xs">
                {trip.status}
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-white/90 text-slate-800 shadow-xs">
                {trip.travel_style || 'Explorer'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
              {trip.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-200 font-medium pt-0.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-300" />
                {trip.start_date} ➔ {trip.end_date}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-300" />
                {stops.length} Destination Stops
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-300" />
                Budget: ${trip.total_budget}
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between no-print">
          <p className="text-xs text-slate-500 hidden sm:block">
            {trip.description || 'Structured travel itinerary'}
          </p>

          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('days')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                viewMode === 'days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Day-by-Day</span>
            </button>
            <button
              onClick={() => setViewMode('cities')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                viewMode === 'cities' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>City Groups</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Route Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. DAY-BY-DAY VIEW */}
      {viewMode === 'days' && (
        <div className="space-y-8">
          {sortedDates.length === 0 ? (
            <div className="p-12 rounded-3xl white-card text-center space-y-3">
              <Calendar className="w-8 h-8 text-indigo-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Scheduled Day Activities</h3>
              <p className="text-xs text-slate-500">
                Go to the Itinerary Builder to assign activities to specific dates.
              </p>
              <button
                onClick={() => onSelectTrip(trip.id, 'builder')}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Open Builder
              </button>
            </div>
          ) : (
            sortedDates.map((dateStr, dayIndex) => {
              const dayActivities = activitiesByDate[dateStr];
              return (
                <div key={dateStr} className="space-y-4">
                  {/* Day Header */}
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-xs">
                      Day {dayIndex + 1}
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {new Date(dateStr).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* Day Activities Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {dayActivities.map((act) => (
                      <div
                        key={act.id}
                        className="rounded-2xl white-card p-4 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2.5">
                          {act.image_url && (
                            <img
                              src={act.image_url}
                              alt={act.title}
                              className="w-full h-36 rounded-xl object-cover ring-1 ring-slate-200"
                            />
                          )}

                          <div>
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {act.category}
                              </span>
                              <span className="text-xs font-bold text-emerald-700">
                                {Number(act.cost) > 0 ? `$${act.cost}` : 'Free'}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mt-1">{act.title}</h4>
                            {act.description && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                {act.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            {act.scheduled_time} ({act.duration_mins}m)
                          </span>
                          {act.location_name && (
                            <span className="flex items-center gap-1 truncate max-w-[140px]">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {act.location_name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. CITY GROUPED VIEW */}
      {viewMode === 'cities' && (
        <div className="space-y-6">
          {stops.map((stop, sIdx) => {
            const stopActs = activities.filter((a) => a.stop_id === stop.id);
            return (
              <div
                key={stop.id}
                className="rounded-3xl white-panel p-6 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-xs">
                      {sIdx + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {stop.city_name}, {stop.country}
                      </h3>
                      <p className="text-xs text-slate-500">
                        📅 {stop.arrival_date} ➔ {stop.departure_date}
                      </p>
                    </div>
                  </div>

                  {stop.lodging_name && (
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-purple-800">
                      <Hotel className="w-4 h-4 shrink-0 text-purple-600" />
                      <span>{stop.lodging_name} (${stop.lodging_cost})</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stopActs.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                          {act.category}
                        </span>
                        <span className="text-xs font-bold text-emerald-700">
                          {Number(act.cost) > 0 ? `$${act.cost}` : 'Free'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {act.scheduled_date} @ {act.scheduled_time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. MAP VIEW */}
      {viewMode === 'map' && (
        <div className="rounded-3xl white-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Full Destination Route Map
            </h3>
            <span className="text-xs text-slate-500 font-semibold">{stops.length} connected stops</span>
          </div>
          <div className="h-[480px] rounded-2xl overflow-hidden border border-slate-200">
            <MapViewer stops={stops} height="100%" />
          </div>
        </div>
      )}
    </div>
  );
}
