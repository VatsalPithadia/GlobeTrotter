import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import {
  Shield,
  Users,
  Plane,
  MapPin,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  Trash2,
  RefreshCw,
  Search,
  Database,
  Coins,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboardScreen({ onNavigate }) {
  const { user } = useAuth();
  const notify = useNotification();

  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchUser, setSearchUser] = useState('');
  const [searchTrip, setSearchTrip] = useState('');
  const [activeTab, setActiveTab] = useState('analytics');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, uRes, tRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminTrips()
      ]);
      // statsRes shape: { counts, continentDistribution, topCities, activityCategoryBreakdown, recentUsers, recentTrips }
      setAnalytics(statsRes);
      setUsersList(uRes.users || []);
      setTripsList(tRes.trips || []);
    } catch (err) {
      notify.error('Admin data load failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReseed = async () => {
    if (!window.confirm('Reseed database with fresh demo data?')) return;
    try {
      await api.reseedDatabase();
      notify.success('Database reseeded successfully!');
      loadAdminData();
    } catch (e) {
      notify.error('Reseed failed: ' + e.message);
    }
  };

  const handleDeleteTripExecute = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteAdminTrip(deleteTarget.id);
      notify.success(`Trip "${deleteTarget.title}" removed by admin`);
      setTripsList((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      notify.error('Failed to remove trip');
    } finally {
      setIsDeleting(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="py-24 text-center space-y-4">
        <Shield className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please sign in with the Admin Demo account (<code className="text-indigo-600 font-bold">admin@globetrotter.in</code>) to view the analytics dashboard.
        </p>
      </div>
    );
  }

  if (loading || !analytics) {
    return (
      <div className="py-24 text-center space-y-3">
        <Shield className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Aggregating platform metrics...</p>
      </div>
    );
  }

  const topCities = analytics?.topCities || [];
  const continentDist = analytics?.continentDistribution || [];
  const counts = analytics?.counts || {};

  const topCitiesChart = {
    labels: topCities.map((c) => c.city_name),
    datasets: [
      {
        label: 'Times Scheduled in Trips',
        data: topCities.map((c) => c.planned_count),
        backgroundColor: '#4f46e5',
        borderRadius: 8
      }
    ]
  };

  const continentDoughnut = {
    labels: continentDist.map((c) => c.continent),
    datasets: [
      {
        data: continentDist.map((c) => c.stop_count),
        backgroundColor: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredTrips = tripsList.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTrip.toLowerCase()) ||
      t.author_name.toLowerCase().includes(searchTrip.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-24 animate-fade-in">
      {/* Admin Header */}
      <div className="rounded-3xl white-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Admin & Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time traveler metrics, popular destinations rankings, moderation tables, and database maintenance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReseed}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>Reseed Demo DB</span>
          </button>
          <button
            onClick={loadAdminData}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl white-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Registered Users</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{counts.total_users || 0}</p>
        </div>
        <div className="p-5 rounded-2xl white-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Trips</span>
          <p className="text-2xl font-black text-indigo-700 mt-1">{counts.total_trips || 0}</p>
        </div>
        <div className="p-5 rounded-2xl white-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Destination Stops</span>
          <p className="text-2xl font-black text-purple-700 mt-1">{counts.total_stops || 0}</p>
        </div>
        <div className="p-5 rounded-2xl white-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Activities Scheduled</span>
          <p className="text-2xl font-black text-cyan-700 mt-1">{counts.total_activities || 0}</p>
        </div>
        <div className="p-5 rounded-2xl white-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Budget Volume</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            ₹{Number(counts.total_budget_volume || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
            activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Analytics & Trends
        </button>
        <button
          onClick={() => setActiveTab('trips')}
          className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
            activeTab === 'trips' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Trip Moderation ({tripsList.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
            activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          User Directory ({usersList.length})
        </button>
      </div>

      {/* 1. Analytics & Trends Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 rounded-3xl white-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Most Planned Destinations</h3>
            </div>
            <div className="h-64">
              <Bar
                data={topCitiesChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { display: false } },
                    y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#f1f5f9' } }
                  },
                  plugins: { legend: { display: false } }
                }}
              />
            </div>
          </div>

          <div className="lg:col-span-5 rounded-3xl white-card p-6 space-y-4 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Regional Stop Share</h3>
            </div>
            <div className="h-60 flex items-center justify-center">
              <Doughnut
                data={continentDoughnut}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { color: '#334155', font: { size: 11 } } }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Trip Moderation Tab */}
      {activeTab === 'trips' && (
        <div className="rounded-3xl white-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Platform Trip Directory</h3>
            <input
              type="text"
              value={searchTrip}
              onChange={(e) => setSearchTrip(e.target.value)}
              placeholder="Filter trips..."
              className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Creator</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Stops</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTrips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">{t.title}</td>
                    <td className="py-3 px-4 text-slate-600">{t.author_name}</td>
                    <td className="py-3 px-4 text-slate-500">{t.start_date} ➔ {t.end_date}</td>
                    <td className="py-3 px-4 text-indigo-700 font-bold">{t.stop_count || 0}</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">₹{Number(t.total_budget).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.visibility === 'public' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.visibility}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setDeleteTarget(t)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. User Directory Tab */}
      {activeTab === 'users' && (
        <div className="rounded-3xl white-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Registered Users</h3>
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search user..."
              className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Trips Created</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <img
                        src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                        alt={u.name}
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-700">{u.trips_count || 0}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTripExecute}
        title="Admin Trip Removal"
        message={`Are you sure you want to remove trip "${deleteTarget?.title}" created by ${deleteTarget?.author_name}?`}
        confirmText="Remove Trip"
        isLoading={isDeleting}
      />
    </div>
  );
}
