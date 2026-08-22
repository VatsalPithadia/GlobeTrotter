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

  // Catalog picker inside activity modal
  const [availableCatalog, setAvailableCatalog] = useState([]);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

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
      <div className="py-24 text-center space-y-3">
        <Compass className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading Itinerary Builder...</p>
      </div>
    );
  }

  const { trip, stops, activities, metrics } = tripData;

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Top Banner Toolbar */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              Interactive Builder
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700">
              {trip.travel_style || 'Explorer'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              📅 {trip.start_date} ➔ {trip.end_date}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {trip.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">{trip.description}</p>
        </div>

        {/* Quick Modes Navigation */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => onSelectTrip(trip.id, 'view')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Itinerary View</span>
          </button>
          <button
            onClick={() => onSelectTrip(trip.id, 'budget')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Budget & Charts</span>
          </button>
          <button
            onClick={() => onSelectTrip(trip.id, 'timeline')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Stops on Left, Map & Live Financials on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stops List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Destinations & Daily Plans ({stops.length})
              </h2>
            </div>

            <button
              onClick={handleOpenAddStop}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stop</span>
            </button>
          </div>

          {stops.length === 0 ? (
            <div className="p-12 rounded-3xl white-card text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Destination Stops Added</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add your first city stop to begin scheduling activities and estimating lodging expenses.
              </p>
              <button
                onClick={handleOpenAddStop}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                + Add First Stop
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {stops.map((stop, stopIndex) => {
                const stopActivities = activities.filter((a) => a.stop_id === stop.id);
                const isExpanded = expandedStops[stop.id] !== false;

                return (
                  <div
                    key={stop.id}
                    className="rounded-3xl white-card overflow-hidden"
                  >
                    {/* Stop Header */}
                    <div className="p-5 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {stopIndex + 1}
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900">
                            {stop.city_name}
                            {stop.country ? `, ${stop.country}` : ''}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {stop.arrival_date} ➔ {stop.departure_date}
                          </p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <div className="flex bg-white p-0.5 rounded-xl border border-slate-200">
                          <button
                            disabled={stopIndex === 0}
                            onClick={() => handleMoveStop(stopIndex, -1)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 disabled:opacity-30 transition"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={stopIndex === stops.length - 1}
                            onClick={() => handleMoveStop(stopIndex, 1)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 disabled:opacity-30 transition"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleOpenEditStop(stop)}
                          className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: 'stop',
                              id: stop.id,
                              title: `Stop: ${stop.city_name}`
                            })
                          }
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleStopExpanded(stop.id)}
                          className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-5 space-y-4">
                        {/* Lodging Note */}
                        {(stop.lodging_name || stop.notes) && (
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-0.5">
                              {stop.lodging_name && (
                                <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                                  <Hotel className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                  <span>Stay: {stop.lodging_name}</span>
                                </div>
                              )}
                              {stop.notes && <p className="text-slate-500">{stop.notes}</p>}
                            </div>
                            {Number(stop.lodging_cost) > 0 && (
                              <span className="font-bold text-emerald-700 px-2.5 py-1 bg-emerald-50 rounded-xl border border-emerald-200 whitespace-nowrap self-start sm:self-auto">
                                ${stop.lodging_cost} Lodging
                              </span>
                            )}
                          </div>
                        )}

                        {/* Activities List */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Scheduled Activities ({stopActivities.length})
                            </span>
                            <button
                              onClick={() => handleOpenAddActivity(stop)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Activity</span>
                            </button>
                          </div>

                          {stopActivities.length === 0 ? (
                            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                              <p className="text-xs text-slate-500">
                                No activities scheduled for this stop yet.
                              </p>
                              <button
                                onClick={() => handleOpenAddActivity(stop)}
                                className="mt-1.5 text-xs font-bold text-indigo-600 hover:underline"
                              >
                                + Browse curated activities or add custom
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {stopActivities.map((act) => (
                                <div
                                  key={act.id}
                                  className="group p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-xs transition flex items-center justify-between gap-4"
                                >
                                  <div className="flex items-center gap-3">
                                    {act.image_url ? (
                                      <img
                                        src={act.image_url}
                                        alt={act.title}
                                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Tag className="w-5 h-5" />
                                      </div>
                                    )}

                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                                        <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-slate-100 text-slate-600">
                                          {act.category}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3 text-slate-400" />
                                          {act.scheduled_date} @ {act.scheduled_time}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3 text-slate-400" />
                                          {act.duration_mins}m
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">
                                      {Number(act.cost) > 0 ? `$${act.cost}` : 'Free'}
                                    </span>

                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleOpenEditActivity(act, stop)}
                                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition"
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
                                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
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

        {/* Right Column: Route Map & Live Financials */}
        <div className="lg:col-span-4 space-y-6">
          {/* Route Map */}
          <div className="rounded-3xl white-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-indigo-600" />
                Route Map Overview
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">{stops.length} Cities</span>
            </div>
            <div className="h-60 rounded-2xl overflow-hidden border border-slate-200">
              <MapViewer stops={stops} height="100%" />
            </div>
          </div>

          {/* Real-time Budget Tracker */}
          <div className="rounded-3xl white-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Live Budget Tracker
              </span>
              <button
                onClick={() => onSelectTrip(trip.id, 'budget')}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Detailed Breakdown →
              </button>
            </div>

            <BudgetGauge
              spent={metrics?.totalSpent || 0}
              budget={trip.total_budget || 0}
              currency={trip.currency === 'EUR' ? '€' : trip.currency === 'GBP' ? '£' : '$'}
            />

            <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>🏨 Lodging Total:</span>
                <span className="font-bold text-slate-900">${metrics?.lodgingTotal || 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>🎟️ Activities Total:</span>
                <span className="font-bold text-slate-900">${metrics?.activitiesTotal || 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>✈️ Direct Logged Expenses:</span>
                <span className="font-bold text-slate-900">${metrics?.expensesTotal || 0}</span>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              City / Destination *
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={stopCitySearch}
                onChange={(e) => {
                  setStopCitySearch(e.target.value);
                  setSelectedCity(null);
                }}
                placeholder="Search world cities (e.g. Paris, Tokyo, Rome...)"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            {citySuggestions.length > 0 && !selectedCity && (
              <div className="mt-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg z-20">
                {citySuggestions.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCity(c);
                      setStopCitySearch(`${c.name}, ${c.country}`);
                      setCitySuggestions([]);
                    }}
                    className="p-2.5 hover:bg-indigo-50 cursor-pointer flex items-center justify-between text-xs text-slate-800"
                  >
                    <span className="font-bold">{c.name}, {c.country}</span>
                    <span className="text-[10px] text-slate-500">{c.continent} • {c.cost_index}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Arrival Date *
              </label>
              <input
                type="date"
                required
                value={stopArrival}
                onChange={(e) => setStopArrival(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Departure Date *
              </label>
              <input
                type="date"
                required
                value={stopDeparture}
                onChange={(e) => setStopDeparture(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lodging / Hotel Name
              </label>
              <input
                type="text"
                value={lodgingName}
                onChange={(e) => setLodgingName(e.target.value)}
                placeholder="e.g. Grand Hotel Central"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lodging Cost ($)
              </label>
              <input
                type="number"
                min="0"
                value={lodgingCost}
                onChange={(e) => setLodgingCost(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notes / Local Tips
            </label>
            <textarea
              rows="2"
              value={stopNotes}
              onChange={(e) => setStopNotes(e.target.value)}
              placeholder="Transit instructions, neighborhood details..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStopModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
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
        <form onSubmit={handleSaveActivity} className="space-y-4">
          {availableCatalog.length > 0 && !editingActivity && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Curated Experiences in {targetStop?.city_name} (1-Click Fill)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {availableCatalog.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCatalogItem(item)}
                    className="p-2 rounded-xl bg-white hover:bg-indigo-100/50 border border-indigo-100 cursor-pointer flex items-center gap-2 text-xs transition"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 truncate">
                      <p className="font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-emerald-700 font-semibold">${item.cost} • {item.duration_mins}m</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Activity Title *
            </label>
            <input
              type="text"
              required
              value={actTitle}
              onChange={(e) => setActTitle(e.target.value)}
              placeholder="e.g. Louvre Museum Masterpieces Guided Walk"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={actCategory}
                onChange={(e) => setActCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cost ($)
              </label>
              <input
                type="number"
                min="0"
                value={actCost}
                onChange={(e) => setActCost(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={actDate}
                onChange={(e) => setActDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={actTime}
                onChange={(e) => setActTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Location / Address
              </label>
              <input
                type="text"
                value={actLocation}
                onChange={(e) => setActLocation(e.target.value)}
                placeholder="e.g. Rue de Rivoli, Paris"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Photo URL (Optional)
              </label>
              <input
                type="url"
                value={actImage}
                onChange={(e) => setActImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Notes
            </label>
            <textarea
              rows="2"
              value={actDescription}
              onChange={(e) => setActDescription(e.target.value)}
              placeholder="Booking references, skip-the-line notes..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsActivityModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Save Activity
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
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
