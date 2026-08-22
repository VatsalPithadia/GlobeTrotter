import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import BudgetGauge from '../components/common/BudgetGauge';
import MapViewer from '../components/common/MapViewer';
import {
  Compass,
  Plus,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Eye,
  SlidersHorizontal,
  Share2,
  Hotel,
  Tag,
  Search,
  CheckCircle2,
  Navigation
} from 'lucide-react';

export default function ItineraryBuilderScreen({ tripId, onNavigate, onSelectTrip }) {
  const notify = useNotification();

  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stop Modal State
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [stopCitySearch, setStopCitySearch] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [stopArrival, setStopArrival] = useState('');
  const [stopDeparture, setStopDeparture] = useState('');
  const [lodgingName, setLodgingName] = useState('');
  const [lodgingCost, setLodgingCost] = useState('0');
  const [stopNotes, setStopNotes] = useState('');

  // Activity Modal State
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [targetStop, setTargetStop] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [actTitle, setActTitle] = useState('');
  const [actDescription, setActDescription] = useState('');
  const [actCategory, setActCategory] = useState('sightseeing');
  const [actCost, setActCost] = useState('0');
  const [actDuration, setActDuration] = useState('120');
  const [actDate, setActDate] = useState('');
  const [actTime, setActTime] = useState('10:00');
  const [actLocation, setActLocation] = useState('');
  const [actImage, setActImage] = useState('');

  // Catalog picker drawer inside activity modal
  const [availableCatalog, setAvailableCatalog] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'stop'|'activity', id, title }

  // Expanded stops
  const [expandedStops, setExpandedStops] = useState({});

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    setLoading(true);
    try {
      const data = await api.getTrip(tripId);
      setTripData(data);

      // Expand all stops by default
      const exp = {};
      data.stops.forEach((s) => {
        exp[s.id] = true;
      });
      setExpandedStops(exp);
    } catch (err) {
      notify.error('Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  // City Autocomplete Search for Stop Modal
  useEffect(() => {
    if (stopCitySearch.length > 1) {
      api.getCities({ search: stopCitySearch, limit: 6 }).then((res) => {
        setCitySuggestions(res.cities || []);
      });
    } else {
      setCitySuggestions([]);
    }
  }, [stopCitySearch]);

  const handleOpenAddStop = () => {
    setEditingStop(null);
    setStopCitySearch('');
    setSelectedCity(null);
    setStopArrival(tripData?.trip?.start_date || '');
    setStopDeparture(tripData?.trip?.end_date || '');
    setLodgingName('');
    setLodgingCost('0');
    setStopNotes('');
    setIsStopModalOpen(true);
  };

  const handleOpenEditStop = (stop) => {
    setEditingStop(stop);
    setStopCitySearch(stop.city_name);
    setSelectedCity({
      id: stop.city_id,
      name: stop.city_name,
      country: stop.country,
      lat: stop.lat,
      lng: stop.lng
    });
    setStopArrival(stop.arrival_date);
    setStopDeparture(stop.departure_date);
    setLodgingName(stop.lodging_name || '');
    setLodgingCost(String(stop.lodging_cost || 0));
    setStopNotes(stop.notes || '');
    setIsStopModalOpen(true);
  };

  const handleSaveStop = async (e) => {
    e.preventDefault();
    if (!stopCitySearch.trim()) {
      notify.error('City name is required');
      return;
    }

    try {
      const payload = {
        city_id: selectedCity?.id || null,
        city_name: selectedCity?.name || stopCitySearch.trim(),
        country: selectedCity?.country || '',
        arrival_date: stopArrival,
        departure_date: stopDeparture,
        lodging_name: lodgingName.trim(),
        lodging_cost: Number(lodgingCost) || 0,
        notes: stopNotes.trim(),
        lat: selectedCity?.lat || null,
        lng: selectedCity?.lng || null
      };

      if (editingStop) {
        await api.updateStop(editingStop.id, payload);
        notify.success('Stop updated');
      } else {
        await api.addStop(tripId, payload);
        notify.success('Stop added to trip');
      }

      setIsStopModalOpen(false);
      loadTrip();
    } catch (err) {
      notify.error(err.message || 'Failed to save stop');
    }
  };

  // Reorder Stops Up / Down
  const handleMoveStop = async (index, direction) => {
    const stops = [...tripData.stops];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= stops.length) return;

    const temp = stops[index];
    stops[index] = stops[targetIndex];
    stops[targetIndex] = temp;

    const stopIds = stops.map((s) => s.id);
    try {
      await api.reorderStops(tripId, stopIds);
      loadTrip();
    } catch (err) {
      notify.error('Failed to reorder stops');
    }
  };

  // Open Activity Modal
  const handleOpenAddActivity = async (stop) => {
    setTargetStop(stop);
    setEditingActivity(null);
    setActTitle('');
    setActDescription('');
    setActCategory('sightseeing');
    setActCost('0');
    setActDuration('120');
    setActDate(stop.arrival_date);
    setActTime('10:00');
    setActLocation(`${stop.city_name}`);
    setActImage('');

    // Fetch catalog activities for this city
    try {
      const res = await api.getCatalogActivities({ city_id: stop.city_id });
      setAvailableCatalog(res.activities || []);
    } catch (e) {
      setAvailableCatalog([]);
    }

    setIsActivityModalOpen(true);
  };

  const handleOpenEditActivity = (act, stop) => {
    setTargetStop(stop);
    setEditingActivity(act);
    setActTitle(act.title);
    setActDescription(act.description || '');
    setActCategory(act.category || 'sightseeing');
    setActCost(String(act.cost || 0));
    setActDuration(String(act.duration_mins || 90));
    setActDate(act.scheduled_date);
    setActTime(act.scheduled_time || '10:00');
    setActLocation(act.location_name || '');
    setActImage(act.image_url || '');
    setAvailableCatalog([]);
    setIsActivityModalOpen(true);
  };

  const handleSelectCatalogItem = (item) => {
    setActTitle(item.name);
    setActDescription(item.description || '');
    setActCategory(item.category || 'sightseeing');
    setActCost(String(item.cost || 0));
    setActDuration(String(item.duration_mins || 90));
    setActImage(item.image_url || '');
    setActLocation(`${targetStop?.city_name}`);
  };

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    if (!actTitle.trim() || !actDate) {
      notify.error('Title and scheduled date are required');
      return;
    }

    try {
      const payload = {
        title: actTitle.trim(),
        description: actDescription.trim(),
        category: actCategory,
        cost: Number(actCost) || 0,
        duration_mins: Number(actDuration) || 60,
        scheduled_date: actDate,
        scheduled_time: actTime,
        location_name: actLocation.trim(),
        image_url: actImage.trim()
      };

      if (editingActivity) {
        await api.updateActivity(editingActivity.id, payload);
        notify.success('Activity updated');
      } else {
        await api.addActivity(targetStop.id, payload);
        notify.success('Activity scheduled!');
      }

      setIsActivityModalOpen(false);
      loadTrip();
    } catch (err) {
      notify.error(err.message || 'Failed to save activity');
    }
  };

  // Delete Action Confirm
  const handleDeleteExecute = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'stop') {
        await api.deleteStop(deleteTarget.id);
        notify.success('Stop removed');
      } else if (deleteTarget.type === 'activity') {
        await api.deleteActivity(deleteTarget.id);
        notify.success('Activity removed');
      }
      setDeleteTarget(null);
      loadTrip();
    } catch (err) {
      notify.error('Failed to delete');
    }
  };

  const toggleStopExpanded = (id) => {
    setExpandedStops((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading || !tripData) {
    return (
      <div className="py-24 text-center space-y-4">
        <Compass className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-400">Loading Itinerary Builder...</p>
      </div>
    );
  }

  const { trip, stops, activities, metrics } = tripData;

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Top Banner Toolbar */}
      <div className="rounded-3xl glass-panel p-6 border border-slate-700/70 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Interactive Builder
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {trip.travel_style || 'Explorer'}
            </span>
            <span className="text-xs text-slate-400">
              📅 {trip.start_date} ➔ {trip.end_date}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {trip.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">{trip.description}</p>
        </div>

        {/* Quick Navigation Modes for this Trip */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={() => onSelectTrip(trip.id, 'view')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
          >
            <Eye className="w-4 h-4" />
            <span>Itinerary View</span>
          </button>
          <button
            onClick={() => onSelectTrip(trip.id, 'budget')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span>Budget & Charts</span>
          </button>
          <button
            onClick={() => onSelectTrip(trip.id, 'timeline')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Stops Timeline on Left, Map & Live Financials on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stops & Day Planner */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Destinations & Daily Plans ({stops.length})
              </h2>
            </div>

            <button
              onClick={handleOpenAddStop}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stop</span>
            </button>
          </div>

          {stops.length === 0 ? (
            <div className="p-12 rounded-3xl glass-card text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">No Destination Stops Added</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add your first city stop to begin scheduling activities and estimating lodging expenses.
              </p>
              <button
                onClick={handleOpenAddStop}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
              >
                + Add First Stop
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {stops.map((stop, stopIndex) => {
                const stopActivities = activities.filter((a) => a.stop_id === stop.id);
                const isExpanded = expandedStops[stop.id] !== false;

                return (
                  <div
                    key={stop.id}
                    className="rounded-3xl glass-card overflow-hidden border border-slate-800 transition shadow-xl"
                  >
                    {/* Stop Header */}
                    <div className="p-5 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-black text-sm shrink-0">
                          #{stopIndex + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white">
                              {stop.city_name}
                              {stop.country ? `, ${stop.country}` : ''}
                            </h3>
                          </div>
                          <p className="text-xs text-indigo-300 font-medium flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {stop.arrival_date} ➔ {stop.departure_date}
                          </p>
                        </div>
                      </div>

                      {/* Stop Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* Move Up/Down */}
                        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                          <button
                            disabled={stopIndex === 0}
                            onClick={() => handleMoveStop(stopIndex, -1)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            disabled={stopIndex === stops.length - 1}
                            onClick={() => handleMoveStop(stopIndex, 1)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleOpenEditStop(stop)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: 'stop',
                              id: stop.id,
                              title: `Stop: ${stop.city_name}`
                            })
                          }
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStopExpanded(stop.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-5 space-y-5">
                        {/* Lodging & Notes Card */}
                        {(stop.lodging_name || stop.notes) && (
                          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                              {stop.lodging_name && (
                                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                                  <Hotel className="w-4 h-4 text-purple-400 shrink-0" />
                                  <span>Stay: {stop.lodging_name}</span>
                                </div>
                              )}
                              {stop.notes && <p className="text-slate-400">{stop.notes}</p>}
                            </div>
                            {Number(stop.lodging_cost) > 0 && (
                              <span className="font-bold text-emerald-400 px-3 py-1 bg-emerald-950/60 rounded-xl border border-emerald-500/30 whitespace-nowrap self-start sm:self-auto">
                                ${stop.lodging_cost} Lodging
                              </span>
                            )}
                          </div>
                        )}

                        {/* Activities List */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Scheduled Activities ({stopActivities.length})
                            </span>
                            <button
                              onClick={() => handleOpenAddActivity(stop)}
                              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Activity</span>
                            </button>
                          </div>

                          {stopActivities.length === 0 ? (
                            <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
                              <p className="text-xs text-slate-400">
                                No activities scheduled for this stop yet.
                              </p>
                              <button
                                onClick={() => handleOpenAddActivity(stop)}
                                className="mt-2 text-xs font-bold text-indigo-400 hover:underline"
                              >
                                + Browse activities or add custom
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {stopActivities.map((act) => (
                                <div
                                  key={act.id}
                                  className="group p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/30 transition flex items-center justify-between gap-4"
                                >
                                  <div className="flex items-center gap-3">
                                    {act.image_url ? (
                                      <img
                                        src={act.image_url}
                                        alt={act.title}
                                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                                        <Tag className="w-5 h-5" />
                                      </div>
                                    )}

                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-white">{act.title}</h4>
                                        <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-slate-800 text-slate-300 border border-slate-700">
                                          {act.category}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3 text-slate-500" />
                                          {act.scheduled_date} @ {act.scheduled_time}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3 text-slate-500" />
                                          {act.duration_mins} mins
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-emerald-400 whitespace-nowrap">
                                      {Number(act.cost) > 0 ? `$${act.cost}` : 'Free'}
                                    </span>

                                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                                      <button
                                        onClick={() => handleOpenEditActivity(act, stop)}
                                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setDeleteTarget({
                                            type: 'activity',
                                            id: act.id,
                                            title: act.title
                                          })
                                        }
                                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Route Map & Live Budget Highlights */}
        <div className="lg:col-span-4 space-y-6">
          {/* Interactive Multi-City Route Map */}
          <div className="rounded-3xl glass-card p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-indigo-400" />
                Route Map Overview
              </span>
              <span className="text-[11px] text-slate-400">{stops.length} Cities</span>
            </div>
            <div className="h-64 rounded-2xl overflow-hidden">
              <MapViewer stops={stops} height="100%" />
            </div>
          </div>

          {/* Real-time Budget Tracker */}
          <div className="rounded-3xl glass-card p-6 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Live Budget Tracker
              </span>
              <button
                onClick={() => onSelectTrip(trip.id, 'budget')}
                className="text-xs font-bold text-indigo-400 hover:underline"
              >
                Detailed Breakdown →
              </button>
            </div>

            <BudgetGauge
              spent={metrics?.totalSpent || 0}
              budget={trip.total_budget || 0}
              currency={trip.currency === 'EUR' ? '€' : trip.currency === 'GBP' ? '£' : '$'}
            />

            <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>🏨 Lodging Sum:</span>
                <span className="font-bold text-white">${metrics?.lodgingTotal || 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>🎟️ Activities Sum:</span>
                <span className="font-bold text-white">${metrics?.activitiesTotal || 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>✈️ Direct Logged Expenses:</span>
                <span className="font-bold text-white">${metrics?.expensesTotal || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STOP MODAL */}
      <Modal
        isOpen={isStopModalOpen}
        onClose={() => setIsStopModalOpen(false)}
        title={editingStop ? 'Edit Destination Stop' : 'Add Destination Stop'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveStop} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              City / Destination *
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={stopCitySearch}
                onChange={(e) => {
                  setStopCitySearch(e.target.value);
                  setSelectedCity(null);
                }}
                placeholder="Search world cities (e.g. Paris, Tokyo, Rome...)"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* City Suggestion dropdown */}
            {citySuggestions.length > 0 && !selectedCity && (
              <div className="mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-20">
                {citySuggestions.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCity(c);
                      setStopCitySearch(`${c.name}, ${c.country}`);
                      setCitySuggestions([]);
                    }}
                    className="p-2.5 hover:bg-indigo-600/30 cursor-pointer flex items-center justify-between text-xs text-slate-200"
                  >
                    <span className="font-bold">{c.name}, {c.country}</span>
                    <span className="text-[10px] text-slate-400">{c.continent} • {c.cost_index}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Arrival Date *
              </label>
              <input
                type="date"
                required
                value={stopArrival}
                onChange={(e) => setStopArrival(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Departure Date *
              </label>
              <input
                type="date"
                required
                value={stopDeparture}
                onChange={(e) => setStopDeparture(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Lodging / Hotel Name
              </label>
              <input
                type="text"
                value={lodgingName}
                onChange={(e) => setLodgingName(e.target.value)}
                placeholder="e.g. Grand Hotel Central"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Lodging Cost ($)
              </label>
              <input
                type="number"
                min="0"
                value={lodgingCost}
                onChange={(e) => setLodgingCost(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Notes / Local Tips
            </label>
            <textarea
              rows="2"
              value={stopNotes}
              onChange={(e) => setStopNotes(e.target.value)}
              placeholder="Transit instructions, neighborhood details..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsStopModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30"
            >
              Save Stop
            </button>
          </div>
        </form>
      </Modal>

      {/* ACTIVITY MODAL */}
      <Modal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        title={editingActivity ? 'Edit Activity' : `Schedule Activity for ${targetStop?.city_name}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveActivity} className="space-y-5">
          {/* Catalog presets picker if available */}
          {availableCatalog.length > 0 && !editingActivity && (
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Curated Experiences in {targetStop?.city_name} (1-Click Fill)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {availableCatalog.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCatalogItem(item)}
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-indigo-600/30 border border-slate-800 cursor-pointer flex items-center gap-2 text-xs transition"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 truncate">
                      <p className="font-bold text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-emerald-400">${item.cost} • {item.duration_mins}m</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Activity Title *
            </label>
            <input
              type="text"
              required
              value={actTitle}
              onChange={(e) => setActTitle(e.target.value)}
              placeholder="e.g. Louvre Museum Masterpieces Guided Walk"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Category
              </label>
              <select
                value={actCategory}
                onChange={(e) => setActCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="sightseeing">Sightseeing</option>
                <option value="food">Food & Dining</option>
                <option value="culture">Culture & Art</option>
                <option value="adventure">Adventure</option>
                <option value="relaxation">Relaxation</option>
                <option value="transport">Transport</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Cost ($)
              </label>
              <input
                type="number"
                min="0"
                value={actCost}
                onChange={(e) => setActCost(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Date *
              </label>
              <input
                type="date"
                required
                value={actDate}
                onChange={(e) => setActDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Time
              </label>
              <input
                type="time"
                value={actTime}
                onChange={(e) => setActTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Location / Address
              </label>
              <input
                type="text"
                value={actLocation}
                onChange={(e) => setActLocation(e.target.value)}
                placeholder="e.g. Rue de Rivoli, Paris"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Photo URL (Optional)
              </label>
              <input
                type="url"
                value={actImage}
                onChange={(e) => setActImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Description / Notes
            </label>
            <textarea
              rows="2"
              value={actDescription}
              onChange={(e) => setActDescription(e.target.value)}
              placeholder="Booking references, skip-the-line notes..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsActivityModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30"
            >
              Save Activity
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteExecute}
        title="Confirm Removal"
        message={`Are you sure you want to remove ${deleteTarget?.title}?`}
        confirmText="Remove"
      />
    </div>
  );
}
