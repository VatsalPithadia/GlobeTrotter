const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/trips/:tripId/expenses - Get trip expenses with breakdown
router.get('/trips/:tripId/expenses', authenticateToken, (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (trip.user_id !== req.user.id && req.user.role !== 'admin' && trip.visibility !== 'public') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const expenses = db.prepare(`
      SELECT e.*, s.city_name 
      FROM expenses e 
      LEFT JOIN stops s ON e.stop_id = s.id 
      WHERE e.trip_id = ? 
      ORDER BY e.date DESC
    `).all(tripId);

    // Also calculate expenses from stops lodging & scheduled activities
    const stopsLodging = db.prepare('SELECT city_name, lodging_name, lodging_cost, arrival_date FROM stops WHERE trip_id = ? AND lodging_cost > 0').all(tripId);
    const activitiesCost = db.prepare('SELECT title, cost, category, scheduled_date FROM activities WHERE trip_id = ? AND cost > 0').all(tripId);

    // Category aggregation
    const categoryTotals = {
      lodging: stopsLodging.reduce((sum, s) => sum + s.lodging_cost, 0),
      activity: activitiesCost.reduce((sum, a) => sum + a.cost, 0),
      transport: 0,
      food: 0,
      other: 0
    };

    expenses.forEach(e => {
      const cat = e.category.toLowerCase();
      if (categoryTotals[cat] !== undefined) {
        categoryTotals[cat] += Number(e.amount);
      } else {
        categoryTotals.other += Number(e.amount);
      }
    });

    const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const budget = Number(trip.total_budget) || 0;
    const remaining = Math.max(0, budget - totalSpent);
    const overBudgetAmount = totalSpent > budget ? totalSpent - budget : 0;

    // Daily spending trend
    const dailySpending = db.prepare(`
      SELECT date, SUM(amount) as daily_total
      FROM expenses
      WHERE trip_id = ?
      GROUP BY date
      ORDER BY date ASC
    `).all(tripId);

    res.json({
      expenses,
      categoryTotals,
      totalSpent,
      budget,
      remaining,
      overBudgetAmount,
      isOverBudget: totalSpent > budget && budget > 0,
      dailySpending
    });
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ error: 'Failed to retrieve expenses' });
  }
});

// POST /api/trips/:tripId/expenses - Add manual expense
router.post('/trips/:tripId/expenses', authenticateToken, (req, res) => {
  try {
    const { tripId } = req.params;
    const {
      stop_id = null,
      category = 'other',
      description,
      amount,
      currency = 'USD',
      date
    } = req.body;

    if (!description || amount === undefined || !date) {
      return res.status(400).json({ error: 'Description, amount, and date are required' });
    }

    const trip = db.prepare('SELECT user_id FROM trips WHERE id = ?').get(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const expenseId = `exp-${uuidv4()}`;

    db.prepare(`
      INSERT INTO expenses (id, trip_id, stop_id, category, description, amount, currency, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      expenseId,
      tripId,
      stop_id || null,
      category,
      description.trim(),
      Number(amount),
      currency,
      date
    );

    const created = db.prepare('SELECT * FROM expenses WHERE id = ?').get(expenseId);
    res.status(201).json({ expense: created, message: 'Expense added successfully' });
  } catch (err) {
    console.error('Add expense error:', err);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// DELETE /api/expenses/:expenseId - Delete expense
router.delete('/expenses/:expenseId', authenticateToken, (req, res) => {
  try {
    const { expenseId } = req.params;
    const expense = db.prepare(`
      SELECT e.*, t.user_id 
      FROM expenses e 
      JOIN trips t ON e.trip_id = t.id 
      WHERE e.id = ?
    `).get(expenseId);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    if (expense.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    db.prepare('DELETE FROM expenses WHERE id = ?').run(expenseId);
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
