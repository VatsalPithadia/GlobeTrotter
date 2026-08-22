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
  const [viewMode, setViewMode] = useState('days'); // 'days' | 'cities' | 'map'

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
      <div className="py-24 text-center space-y-4">
        <Compass className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-400">Loading structured itinerary...</p>
      </div>
    );
  }

  const { trip, stops, activities, metrics } = tripData;

  // Group activities by date for Day-by-Day timeline
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
      {/* 1. Trip Header Hero */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-700/60 shadow-2xl">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={trip.cover_image}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Action Bar inside Header (No Print) */}
          <div className="absolute top-4 right-4 flex items-center gap-2 no-print">
            <button
              onClick={() => onSelectTrip(trip.id, 'builder')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md border border-slate-700 transition"
            >
              <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edit Builder</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-white backdrop-blur-md border border-slate-700 transition"
              title="Print or Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyShare}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-white backdrop-blur-md border border-slate-700 transition"
              title="Share Link"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          {/* Title & Info */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-extrabold uppercase rounded-lg bg-indigo-600 text-white shadow">
                {trip.status}
              </span>
              <span className="px-3 py-1 text-[10px] font-bold rounded-lg bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700">
                {trip.travel_style || 'Explorer'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              {trip.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-200 font-medium pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                {trip.start_date} ➔ {trip.end_date}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-400" />
                {stops.length} Destination Stops
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Budget: ${trip.total_budget}
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Toggle Ribbon */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between no-print">
          <p className="text-xs text-slate-400 hidden sm:block">
            {trip.description || 'Custom structured travel itinerary'}
          </p>

          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('days')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                viewMode === 'days' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Day-by-Day</span>
            </button>
            <button
              onClick={() => setViewMode('cities')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                viewMode === 'cities' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>City Groups</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                viewMode === 'map' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Route Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MODE 1: DAY-BY-DAY VIEW */}
      {viewMode === 'days' && (
        <div className="space-y-8">
          {sortedDates.length === 0 ? (
            <div className="p-12 rounded-3xl glass-card text-center space-y-3">
              <Calendar className="w-8 h-8 text-indigo-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Scheduled Day Activities</h3>
              <p className="text-xs text-slate-400">
                Go to the Itinerary Builder to assign activities to specific dates.
              </p>
              <button
                onClick={() => onSelectTrip(trip.id, 'builder')}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
              >
                Open Builder
              </button>
            </div>
          ) : (
            sortedDates.map((dateStr, dayIndex) => {
              const dayActivities = activitiesByDate[dateStr];
              return (
                <div key={dateStr} className="space-y-4">
                  {/* Day Header Badge */}
                  <div className="flex items-center gap-3">
                    <div className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30">
                      Day {dayIndex + 1}
                    </div>
                    <span className="text-sm font-bold text-slate-200">
                      {new Date(dateStr).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>

                  {/* Day Activities Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {dayActivities.map((act) => (
                      <div
                        key={act.id}
                        className="rounded-2xl glass-card p-5 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition"
                      >
                        <div className="space-y-3">
                          {act.image_url && (
                            <img
                              src={act.image_url}
                              alt={act.title}
                              className="w-full h-36 rounded-xl object-cover ring-1 ring-slate-700"
                            />
                          )}

                          <div>
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-slate-800 text-indigo-300 border border-indigo-500/30">
                                {act.category}
                              </span>
                              <span className="text-xs font-bold text-emerald-400">
                                {Number(act.cost) > 0 ? `$${act.cost}` : 'Free'}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-white mt-1.5">{act.title}</h4>
                            {act.description && (
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                {act.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 font-semibold text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            {act.scheduled_time} ({act.duration_mins}m)
                          </span>
                          {act.location_name && (
                            <span className="flex items-center gap-1 truncate max-w-[140px]">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
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

      {/* 3. MODE 2: CITY GROUPED VIEW */}
      {viewMode === 'cities' && (
        <div className="space-y-8">
          {stops.map((stop, sIdx) => {
            const stopActs = activities.filter((a) => a.stop_id === stop.id);
            return (
              <div
                key={stop.id}
                className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-600/30">
                      {sIdx + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {stop.city_name}, {stop.country}
                      </h3>
                      <p className="text-xs text-slate-400">
                        📅 {stop.arrival_date} ➔ {stop.departure_date}
                      </p>
                    </div>
                  </div>

                  {stop.lodging_name && (
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs text-purple-300">
                      <Hotel className="w-4 h-4 shrink-0" />
                      <span>{stop.lodging_name} (${stop.lodging_cost})</span>
                    </div>
                  )}
                </div>

                {/* Stop Activities */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stopActs.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                          {act.category}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          {Number(act.cost) > 0 ? `$${act.cost}` : 'Free'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{act.title}</h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
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

      {/* 4. MODE 3: MAP VIEW */}
      {viewMode === 'map' && (
        <div className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              Full Multi-City Travel Route
            </h3>
            <span className="text-xs text-slate-400">{stops.length} connected stops</span>
          </div>
          <div className="h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <MapViewer stops={stops} height="100%" />
          </div>
        </div>
      )}
    </div>
  );
}
