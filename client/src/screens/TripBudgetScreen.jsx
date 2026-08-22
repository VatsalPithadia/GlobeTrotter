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

  // Add Expense Modal
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
        <Coins className="w-10 h-10 text-emerald-400 animate-bounce mx-auto" />
        <p className="text-sm font-semibold text-slate-400">Analyzing trip budget & expenses...</p>
      </div>
    );
  }

  const { trip, stops } = tripData;
  const { categoryTotals, totalSpent, budget, remaining, isOverBudget, overBudgetAmount, expenses, dailySpending } = expenseData;

  const durationDays = Math.max(1, (new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24) + 1);
  const avgCostPerDay = Math.round(totalSpent / durationDays);

  // Chart Data: Doughnut Breakdown
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
        borderColor: '#0f172a',
        borderWidth: 2
      }
    ]
  };

  // Chart Data: Daily Spending
  const barData = {
    labels: dailySpending.map((d) => d.date),
    datasets: [
      {
        label: 'Daily Expenditure ($)',
        data: dailySpending.map((d) => d.daily_total),
        backgroundColor: '#6366f1',
        borderRadius: 8
      }
    ]
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Header Toolbar */}
      <div className="rounded-3xl glass-panel p-6 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button
            onClick={() => onSelectTrip(trip.id, 'builder')}
            className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Builder</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Financial Dashboard: {trip.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time financial breakdown by category, daily expenditure monitoring, and expense logs.
          </p>
        </div>

        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Expense</span>
        </button>
      </div>

      {/* Overbudget Warning Alert if applicable */}
      {isOverBudget && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-between gap-4 text-rose-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-sm font-bold">Trip is currently over budget by ${overBudgetAmount.toLocaleString()}!</p>
              <p className="text-xs text-rose-300/80">
                Consider optimizing lodging selections or activity scheduling in the Itinerary Builder.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total Planned Budget</span>
          <p className="text-2xl font-black text-white mt-1">${budget.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total Estimated Spent</span>
          <p className={`text-2xl font-black mt-1 ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
            ${totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Remaining Budget</span>
          <p className="text-2xl font-black text-indigo-400 mt-1">${remaining.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Average Daily Cost</span>
          <p className="text-2xl font-black text-purple-400 mt-1">${avgCostPerDay}/day</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Doughnut Chart */}
        <div className="lg:col-span-5 rounded-3xl glass-card p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Expense Distribution</h3>
          </div>

          <div className="relative h-64 flex items-center justify-center">
            {totalSpent > 0 ? (
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 11 } } }
                  }
                }}
              />
            ) : (
              <p className="text-xs text-slate-400">No expense items recorded yet.</p>
            )}
          </div>

          {/* Breakdown summary chips */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-purple-400 font-semibold">🏨 Lodging:</span>
              <span className="font-bold text-white">${categoryTotals.lodging}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-indigo-400 font-semibold">🎟️ Activities:</span>
              <span className="font-bold text-white">${categoryTotals.activity}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-cyan-400 font-semibold">✈️ Transport:</span>
              <span className="font-bold text-white">${categoryTotals.transport}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-amber-400 font-semibold">🍽️ Food:</span>
              <span className="font-bold text-white">${categoryTotals.food}</span>
            </div>
          </div>
        </div>

        {/* Daily Spending Bar Chart */}
        <div className="lg:col-span-7 rounded-3xl glass-card p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Daily Spending Timeline</h3>
          </div>

          <div className="h-64 flex items-center justify-center">
            {dailySpending.length > 0 ? (
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
                    y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
                  },
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            ) : (
              <p className="text-xs text-slate-400">Daily spending trend will display here.</p>
            )}
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Tracks individual expenditures and activities logged on specific calendar days.
          </p>
        </div>
      </div>

      {/* Expense Log Records Table */}
      <div className="rounded-3xl glass-card p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Logged Custom Expenses ({expenses.length})</h3>
          </div>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400">
              No manual expenses recorded yet. You can log flight tickets, dining bills, and transport costs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Stop</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-white">{exp.description}</td>
                    <td className="py-3 px-4 capitalize">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{exp.date}</td>
                    <td className="py-3 px-4 text-indigo-300">{exp.city_name || 'General Trip'}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">${exp.amount}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
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
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Expense Description *
            </label>
            <input
              type="text"
              required
              value={expDescription}
              onChange={(e) => setExpDescription(e.target.value)}
              placeholder="e.g. Flight Tickets, Museum Pass, Dinner"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Amount ($) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                placeholder="150"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Category
              </label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
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
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Date *
              </label>
              <input
                type="date"
                required
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Linked Stop (Optional)
              </label>
              <select
                value={expStopId}
                onChange={(e) => setExpStopId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingExp}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30"
            >
              {savingExp ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
