import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Shield,
  Users,
  Plane,
  MapPin,
  Sparkles,
  TrendingUp,
  DollarSign,
  Trash2,
  RefreshCw,
  Eye,
  Calendar,
  CheckCircle2,
  Layers,
  Database
} from 'lucide-react';

export default function AdminDashboardScreen({ onSelectTrip, onNavigate }) {
  const notify = useNotification();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'users' | 'trips'
  const [reseeding, setReseeding] = useState(false);

  // Delete trip state
  const [tripToDelete, setTripToDelete] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, tripsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminTrips()
      ]);
      setStats(statsRes);
      setUsers(usersRes.users || []);
      setTrips(tripsRes.trips || []);
    } catch (err) {
      notify.error(err.message || 'Admin authorization required');
    } finally {
      setLoading(false);
    }
  };

  const handleReseed = async () => {
    if (!window.confirm('Reseed database back to default sample state?')) return;
    setReseeding(true);
    try {
      await api.reseedDatabase();
      notify.success('Database reseeded successfully with demo data!');
      loadAdminData();
    } catch (e) {
      notify.error('Reseed failed');
    } finally {
      setReseeding(false);
    }
  };

  const handleDeleteTripConfirm = async () => {
    if (!tripToDelete) return;
    try {
      await api.deleteAdminTrip(tripToDelete.id);
      notify.success('Trip deleted by admin');
      setTrips((prev) => prev.filter((t) => t.id !== tripToDelete.id));
      setTripToDelete(null);
    } catch (e) {
      notify.error('Failed to delete trip');
    }
  };

  if (loading || !stats) {
    return (
      <div className="py-24 text-center space-y-3">
        <Shield className="w-10 h-10 text-amber-400 animate-pulse mx-auto" />
        <p className="text-sm font-semibold text-slate-400">Loading Platform Intelligence & Analytics...</p>
      </div>
    );
  }

  const { counts, continentDistribution, topCities, activityCategoryBreakdown } = stats;

  // Chart: Top Cities
  const citiesChartData = {
    labels: topCities.map((c) => c.city_name),
    datasets: [
      {
        label: 'Times Planned in Itineraries',
        data: topCities.map((c) => c.planned_count),
        backgroundColor: '#6366f1',
        borderRadius: 8
      }
    ]
  };

  // Chart: Continent Doughnut
  const continentChartData = {
    labels: continentDistribution.map((c) => c.continent),
    datasets: [
      {
        data: continentDistribution.map((c) => c.stop_count),
        backgroundColor: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
        borderColor: '#0f172a',
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Admin Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-amber-950/20 via-slate-900/90 to-indigo-950/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Administrator View
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Platform Analytics & Moderation
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleReseed}
            disabled={reseeding}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 transition shadow"
          >
            <Database className="w-4 h-4" />
            <span>{reseeding ? 'Reseeding...' : 'Reseed Demo Data'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total Travelers</span>
          <p className="text-2xl font-black text-white mt-1">{counts.total_users || 0}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total Trips Created</span>
          <p className="text-2xl font-black text-indigo-400 mt-1">{counts.total_trips || 0}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total Stops Planned</span>
          <p className="text-2xl font-black text-purple-400 mt-1">{counts.total_stops || 0}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Activities Scheduled</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{counts.total_activities || 0}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card border border-slate-800 col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-slate-400">Total Volume Tracked</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            ${Number(counts.total_budget_volume || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analytics & Visuals</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'users' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users Directory ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('trips')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'trips' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>All Trips Moderation ({trips.length})</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS CHARTS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Top Destination Cities Bar Chart */}
          <div className="lg:col-span-7 rounded-3xl glass-card p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              Most Planned Destination Cities
            </h3>
            <div className="h-64">
              <Bar
                data={citiesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { display: false } },
                    y: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
                  },
                  plugins: { legend: { display: false } }
                }}
              />
            </div>
          </div>

          {/* Continent Distribution Doughnut */}
          <div className="lg:col-span-5 rounded-3xl glass-card p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Regional Stop Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut
                data={continentChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 10 } } }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY TABLE */}
      {activeTab === 'users' && (
        <div className="rounded-3xl glass-card p-6 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Registered Users Directory</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Currency</th>
                  <th className="py-3 px-4">Trips Created</th>
                  <th className="py-3 px-4">Wishlist Items</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={u.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">{u.currency}</td>
                    <td className="py-3 px-4 font-bold text-indigo-400">{u.trips_count}</td>
                    <td className="py-3 px-4 font-bold text-rose-400">{u.wishlist_count}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALL TRIPS MODERATION TABLE */}
      {activeTab === 'trips' && (
        <div className="rounded-3xl glass-card p-6 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">All Platform Itineraries</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Trip Title</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Stops</th>
                  <th className="py-3 px-4">Activities</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {trips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white">{t.title}</td>
                    <td className="py-3 px-4 text-slate-300">{t.author_name}</td>
                    <td className="py-3 px-4 text-indigo-400 font-bold">{t.stop_count}</td>
                    <td className="py-3 px-4 text-purple-400 font-bold">{t.activity_count}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">${t.total_budget}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                        {t.visibility}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => onSelectTrip(t.id, 'view')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="View Itinerary"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTripToDelete(t)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        title="Admin Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Trip Confirm */}
      <ConfirmDialog
        isOpen={!!tripToDelete}
        onClose={() => setTripToDelete(null)}
        onConfirm={handleDeleteTripConfirm}
        title="Admin Moderate: Delete Trip"
        message={`Are you sure you want to permanently delete "${tripToDelete?.title}" by ${tripToDelete?.author_name}?`}
        confirmText="Delete as Admin"
      />
    </div>
  );
}
