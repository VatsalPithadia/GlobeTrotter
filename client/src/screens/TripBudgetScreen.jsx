import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/common/Modal';
import BudgetGauge from '../components/common/BudgetGauge';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import {
  DollarSign,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Trash2,
  Calendar,
  Layers,
  ArrowLeft,
  Coins,
  Receipt,
  Sparkles
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function TripBudgetScreen({ tripId, onNavigate, onSelectTrip }) {
  const notify = useNotification();

  const [tripData, setTripData] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('food');
  const [expDate, setExpDate] = useState('');
  const [expStopId, setExpStopId] = useState('');
  const [savingExp, setSavingExp] = useState(false);

  useEffect(() => {
    loadData();
  }, [tripId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tripRes, expRes] = await Promise.all([
        api.getTrip(tripId),
        api.getExpenses(tripId)
      ]);
      setTripData(tripRes);
      setExpenseData(expRes);
      setExpDate(tripRes.trip.start_date || new Date().toISOString().split('T')[0]);
    } catch (err) {
      notify.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expDescription.trim() || !expAmount || !expDate) {
      notify.error('Description, amount, and date are required');
      return;
    }

    setSavingExp(true);
    try {
      await api.addExpense(tripId, {
        description: expDescription.trim(),
        amount: Number(expAmount),
        category: expCategory,
        date: expDate,
        stop_id: expStopId || null
      });

      notify.success('Expense recorded successfully');
      setIsAddExpenseOpen(false);
      setExpDescription('');
      setExpAmount('');
      loadData();
    } catch (err) {
      notify.error(err.message || 'Failed to add expense');
    } finally {
      setSavingExp(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.deleteExpense(id);
      notify.success('Expense entry removed');
      loadData();
    } catch (err) {
      notify.error('Failed to delete expense');
    }
  };

  if (loading || !tripData || !expenseData) {
    return (
      <div className="py-24 text-center space-y-3">
        <Coins className="w-8 h-8 text-emerald-600 animate-bounce mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Analyzing trip budget & expenses...</p>
      </div>
    );
  }

  const { trip, stops } = tripData;
  const { categoryTotals, totalSpent, budget, remaining, isOverBudget, overBudgetAmount, expenses, dailySpending } = expenseData;

  const durationDays = Math.max(1, (new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24) + 1);
  const avgCostPerDay = Math.round(totalSpent / durationDays);

  const doughnutData = {
    labels: ['Lodging', 'Activities', 'Transport', 'Food & Dining', 'Other'],
    datasets: [
      {
        data: [
          categoryTotals.lodging || 0,
          categoryTotals.activity || 0,
          categoryTotals.transport || 0,
          categoryTotals.food || 0,
          categoryTotals.other || 0
        ],
        backgroundColor: ['#8b5cf6', '#6366f1', '#06b6d4', '#f59e0b', '#ec4899'],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const barData = {
    labels: dailySpending.map((d) => d.date),
    datasets: [
      {
        label: 'Daily Expenditure (₹)',
        data: dailySpending.map((d) => d.daily_total),
        backgroundColor: '#4f46e5',
        borderRadius: 6
      }
    ]
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in max-w-7xl mx-auto">
      {/* Header Toolbar */}
      <div className="rounded-3xl white-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button
            onClick={() => onSelectTrip(trip.id, 'builder')}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Builder</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Analytics: {trip.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time categorical breakdown, daily expenditure monitoring, and expense logs.
          </p>
        </div>

        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Expense</span>
        </button>
      </div>

      {/* Overbudget Warning Alert */}
      {isOverBudget && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4 text-rose-800">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">Trip is currently over budget by ₹{Number(overBudgetAmount).toLocaleString('en-IN')}!</p>
              <p className="text-xs text-rose-600/80">
                Consider optimizing stay selections or activity scheduling in the Itinerary Builder.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl white-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Planned Budget</span>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{Number(budget).toLocaleString('en-IN')}</p>
        </div>
        <div className="p-5 rounded-2xl white-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Spent</span>
          <p className={`text-2xl font-black mt-1 ${isOverBudget ? 'text-rose-600' : 'text-emerald-700'}`}>
            ₹{Number(totalSpent).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="p-5 rounded-2xl white-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Remaining</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">₹{Number(remaining).toLocaleString('en-IN')}</p>
        </div>
        <div className="p-5 rounded-2xl white-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Average / Day</span>
          <p className="text-2xl font-black text-purple-700 mt-1">₹{Number(avgCostPerDay).toLocaleString('en-IN')}/day</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Doughnut */}
        <div className="lg:col-span-5 rounded-3xl white-card p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Expense Distribution</h3>
          </div>

          <div className="relative h-64 flex items-center justify-center">
            {totalSpent > 0 ? (
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { color: '#334155', font: { size: 11, family: 'var(--font-sans)' } } }
                  }
                }}
              />
            ) : (
              <p className="text-xs text-slate-400">No expenses recorded yet.</p>
            )}
          </div>

          {/* Breakdown chips */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 flex justify-between">
              <span className="text-purple-800 font-semibold">🏨 Stay:</span>
              <span className="font-bold text-slate-900">₹{Number(categoryTotals.lodging || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 flex justify-between">
              <span className="text-indigo-800 font-semibold">🎟️ Activities:</span>
              <span className="font-bold text-slate-900">₹{Number(categoryTotals.activity || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-100 flex justify-between">
              <span className="text-cyan-800 font-semibold">✈️ Transit:</span>
              <span className="font-bold text-slate-900">₹{Number(categoryTotals.transport || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 flex justify-between">
              <span className="text-amber-800 font-semibold">🍽️ Food:</span>
              <span className="font-bold text-slate-900">₹{Number(categoryTotals.food || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Daily Spending Bar Chart */}
        <div className="lg:col-span-7 rounded-3xl white-card p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Daily Spending Timeline</h3>
          </div>

          <div className="h-64 flex items-center justify-center">
            {dailySpending.length > 0 ? (
              <Bar
                data={barData}
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
            ) : (
              <p className="text-xs text-slate-400">Daily expenditure trend will display here.</p>
            )}
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            Tracks individual costs and scheduled activities on each calendar day.
          </p>
        </div>
      </div>

      {/* Expense Log Table */}
      <div className="rounded-3xl white-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Logged Custom Expenses ({expenses.length})</h3>
          </div>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-500">
              No manual expenses recorded yet. Log flight tickets, dining bills, and transport costs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Stop</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">{exp.description}</td>
                    <td className="py-3 px-4 capitalize">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{exp.date}</td>
                    <td className="py-3 px-4 text-indigo-700">{exp.city_name || 'General Trip'}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">₹{Number(exp.amount).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD EXPENSE MODAL */}
      <Modal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title="Record New Trip Expense"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Expense Description *
            </label>
            <input
              type="text"
              required
              value={expDescription}
              onChange={(e) => setExpDescription(e.target.value)}
              placeholder="e.g. Train Tickets, Museum Pass, Dinner"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                placeholder="1500"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                <option value="transport">Transport / Flights</option>
                <option value="lodging">Stay / Hotel</option>
                <option value="activity">Activities</option>
                <option value="food">Food & Dining</option>
                <option value="other">Miscellaneous</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Linked Stop (Optional)
              </label>
              <select
                value={expStopId}
                onChange={(e) => setExpStopId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                <option value="">General Trip Expense</option>
                {stops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.city_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingExp}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              {savingExp ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
