import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import MapViewer from '../components/common/MapViewer';
import confetti from 'canvas-confetti';
import {
  Compass,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Share2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Send,
  QrCode,
  User,
  Heart
} from 'lucide-react';

export default function SharedItineraryScreen({ shareCode, onSelectTrip, onNavigate }) {
  const { user } = useAuth();
  const notify = useNotification();

  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadSharedTrip();
  }, [shareCode]);

  const loadSharedTrip = async () => {
    setLoading(true);
    try {
      const data = await api.getSharedTrip(shareCode);
      setTripData(data);
    } catch (err) {
      notify.error(err.message || 'Shared itinerary not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    notify.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCloneTrip = async () => {
    if (!user) {
      notify.info('Please sign in or use Traveler Demo to clone this trip to your account');
      onNavigate('auth');
      return;
    }

    setCloning(true);
    try {
      const res = await api.cloneSharedTrip(shareCode);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      notify.success('Trip successfully cloned to your itineraries!');
      onSelectTrip(res.trip.id, 'builder');
    } catch (err) {
      notify.error('Failed to clone trip');
    } finally {
      setCloning(false);
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out this travel itinerary "${tripData?.trip?.title}" on GlobeTrotter: ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      `Planning my next adventure with this "${tripData?.trip?.title}" itinerary on GlobeTrotter! ✈️🌍`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Compass className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading public travel itinerary...</p>
      </div>
    );
  }

  if (!tripData) {
    return (
      <div className="py-24 text-center space-y-3">
        <Compass className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Itinerary Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The link may have expired or the author made this trip private.
        </p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
        >
          Explore Community
        </button>
      </div>
    );
  }

  const { trip, stops, activities } = tripData;

  const activitiesByDate = {};
  activities.forEach((a) => {
    if (!activitiesByDate[a.scheduled_date]) activitiesByDate[a.scheduled_date] = [];
    activitiesByDate[a.scheduled_date].push(a);
  });
  const sortedDates = Object.keys(activitiesByDate).sort();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden white-panel shadow-sm">
        <div className="relative h-72 sm:h-96 w-full overflow-hidden">
          <img
            src={trip.cover_image}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          <div className="absolute top-6 left-6">
            <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-extrabold shadow-sm">
              Public Itinerary
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 space-y-2 text-white">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-white/90 text-slate-800 text-xs font-bold">
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
                {stops.length} Stops ({stops.map((s) => s.city_name).join(' • ')})
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-300" />
                Budget: ${trip.total_budget}
              </span>
            </div>
          </div>
        </div>

        {/* Action & Author Bar */}
        <div className="p-6 bg-white border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <img
              src={trip.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
              alt={trip.author_name}
              className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div>
              <p className="text-[11px] text-slate-500 font-semibold">Curated by</p>
              <h3 className="text-sm font-bold text-slate-900">{trip.author_name}</h3>
              {trip.author_bio && <p className="text-[11px] text-slate-500 max-w-sm">{trip.author_bio}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCloneTrip}
              disabled={cloning}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-98"
            >
              <Copy className="w-4 h-4" />
              <span>{cloning ? 'Cloning Itinerary...' : 'Clone Trip to My Account'}</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-white transition"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={shareOnWhatsApp}
                className="p-2 rounded-lg text-emerald-600 hover:bg-white transition"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={shareOnTwitter}
                className="p-2 rounded-lg text-sky-600 hover:bg-white transition"
                title="Share on Twitter / X"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className="p-2 rounded-lg text-purple-600 hover:bg-white transition"
                title="Show QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code */}
      {showQR && (
        <div className="p-6 rounded-3xl white-card border border-indigo-200 text-center space-y-3 max-w-sm mx-auto shadow-lg animate-scale-up">
          <h4 className="text-xs font-bold text-slate-900">Scan to Open on Mobile</h4>
          <div className="p-3 bg-white rounded-xl inline-block border border-slate-100 shadow-xs">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.href)}`}
              alt="QR Code"
              className="w-40 h-40 mx-auto"
            />
          </div>
          <p className="text-[11px] text-slate-500">Share this code with your travel companions!</p>
        </div>
      )}

      {/* Route Map Preview */}
      <div className="rounded-3xl white-panel p-6 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-600" />
          Interactive Destination Route Map
        </h3>
        <div className="h-64 rounded-2xl overflow-hidden border border-slate-200">
          <MapViewer stops={stops} height="100%" />
        </div>
      </div>

      {/* Day by Day Plan */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Day-by-Day Journey Plan
        </h3>

        {sortedDates.map((dateStr, dIdx) => {
          const acts = activitiesByDate[dateStr];
          return (
            <div key={dateStr} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-xs">
                  Day {dIdx + 1}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {new Date(dateStr).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {acts.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-2xl white-card flex items-center gap-4"
                  >
                    {act.image_url && (
                      <img
                        src={act.image_url}
                        alt={act.title}
                        className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                    )}
                    <div className="space-y-0.5 truncate">
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {act.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{act.title}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {act.scheduled_time} ({act.duration_mins}m)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
