import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Compass,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Tag,
  CheckCircle2
} from 'lucide-react';

export default function TripTimelineScreen({ tripId, onSelectTrip }) {
  const notify = useNotification();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    setLoading(true);
    try {
      const data = await api.getTrip(tripId);
      setTripData(data);
      if (data.trip.start_date) {
        setSelectedDate(data.trip.start_date);
      }
    } catch (err) {
      notify.error('Failed to load trip timeline');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !tripData) {
    return (
      <div className="py-24 text-center space-y-3">
        <CalendarIcon className="w-10 h-10 text-purple-400 animate-pulse mx-auto" />
        <p className="text-sm font-semibold text-slate-400">Loading Trip Calendar & Timeline...</p>
      </div>
    );
  }

  const { trip, stops, activities } = tripData;

  // Generate list of all trip dates
  const generateDatesList = () => {
    const dates = [];
    const curr = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    while (curr <= end) {
      dates.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const allDates = generateDatesList();

  const getStopForDate = (dateStr) => {
    return stops.find((s) => dateStr >= s.arrival_date && dateStr <= s.departure_date);
  };

  const getActivitiesForDate = (dateStr) => {
    return activities.filter((a) => a.scheduled_date === dateStr);
  };

  const activeDayActivities = selectedDate ? getActivitiesForDate(selectedDate) : [];
  const activeDayStop = selectedDate ? getStopForDate(selectedDate) : null;

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div className="rounded-3xl glass-panel p-6 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onSelectTrip(trip.id, 'builder')}
            className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Builder</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Calendar & Chronological Timeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {trip.title} • {allDates.length} Days Travel Flow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTrip(trip.id, 'view')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
          >
            View Itinerary
          </button>
        </div>
      </div>

      {/* Date Carousel Strip */}
      <div className="p-4 rounded-3xl glass-panel border border-slate-800 flex items-center gap-3 overflow-x-auto pb-3">
        {allDates.map((dateStr, idx) => {
          const isSelected = selectedDate === dateStr;
          const acts = getActivitiesForDate(dateStr);
          const stop = getStopForDate(dateStr);
          const dObj = new Date(dateStr);

          return (
            <div
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`p-3.5 rounded-2xl cursor-pointer min-w-[120px] text-center border transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30 scale-102 font-bold'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider font-extrabold block">
                Day {idx + 1}
              </span>
              <p className="text-base font-black my-1">
                {dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <span className="text-[11px] truncate block opacity-90">
                {stop ? stop.city_name : 'In Transit'}
              </span>
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-center gap-1 text-[10px]">
                <span className="px-1.5 py-0.5 rounded-full bg-white/20">
                  {acts.length} act.
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Day Timeline Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Vertical Timeline for Selected Day */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Schedule for{' '}
                {selectedDate &&
                  new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {activeDayStop ? `${activeDayStop.city_name}, ${activeDayStop.country}` : 'Travel & Transit'}
              </h3>
            </div>

            {activeDayStop?.lodging_name && (
              <span className="px-3 py-1.5 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-500/30 text-xs font-bold">
                🏨 {activeDayStop.lodging_name}
              </span>
            )}
          </div>

          {activeDayActivities.length === 0 ? (
            <div className="p-12 rounded-3xl glass-card text-center space-y-3">
              <CalendarIcon className="w-8 h-8 text-indigo-400 mx-auto" />
              <h4 className="text-base font-bold text-white">No Scheduled Events on this Day</h4>
              <p className="text-xs text-slate-400">
                You can add activities for this date in the Itinerary Builder.
              </p>
              <button
                onClick={() => onSelectTrip(trip.id, 'builder')}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
              >
                + Add Activity in Builder
              </button>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:to-purple-500">
              {activeDayActivities.map((act, index) => (
                <div key={act.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-3 w-4 h-4 rounded-full bg-indigo-600 border-2 border-slate-900 ring-2 ring-indigo-500/50 shadow" />

                  {/* Activity Card */}
                  <div className="rounded-2xl glass-card p-5 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {act.image_url ? (
                        <img
                          src={act.image_url}
                          alt={act.title}
                          className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                          <Tag className="w-6 h-6" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-slate-800 text-indigo-300 border border-indigo-500/30">
                            {act.category}
                          </span>
                          <span className="text-xs font-bold text-white">{act.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{act.description}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                          <span className="flex items-center gap-1 font-semibold text-slate-300">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            {act.scheduled_time} ({act.duration_mins} mins)
                          </span>
                          {act.location_name && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {act.location_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-emerald-400">
                        {Number(act.cost) > 0 ? `$${act.cost}` : 'Free'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Full Trip Overview Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl glass-card p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              Trip Route Hierarchy
            </h3>

            <div className="space-y-3 text-xs">
              {stops.map((s, idx) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white">
                      Stop {idx + 1}: {s.city_name}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {s.arrival_date} ➔ {s.departure_date}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400">
                    {activities.filter((a) => a.stop_id === s.id).length} acts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
