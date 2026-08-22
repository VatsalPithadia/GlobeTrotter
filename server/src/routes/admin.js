const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/admin/stats - Overview analytics
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const counts = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM trips) as total_trips,
        (SELECT COUNT(*) FROM stops) as total_stops,
        (SELECT COUNT(*) FROM activities) as total_activities,
        (SELECT COUNT(*) FROM saved_destinations) as total_saved_destinations,
        (SELECT COALESCE(SUM(total_budget), 0) FROM trips) as total_budget_volume,
        (SELECT COUNT(*) FROM trips WHERE visibility = 'public') as public_trips_count
    `).get();

    // Continent distribution of stops planned
    const continentDistribution = db.prepare(`
      SELECT c.continent, COUNT(s.id) as stop_count
      FROM stops s
      JOIN cities c ON s.city_id = c.id
      GROUP BY c.continent
      ORDER BY stop_count DESC
    `).all();

    // Top 5 most added cities to itineraries
    const topCities = db.prepare(`
      SELECT s.city_name, s.country, COUNT(s.id) as planned_count
      FROM stops s
      GROUP BY s.city_name, s.country
      ORDER BY planned_count DESC
      LIMIT 6
    `).all();

    // Top activity categories
    const activityCategoryBreakdown = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM activities
      GROUP BY category
      ORDER BY count DESC
    `).all();

    // Recent user signups
    const recentUsers = db.prepare(`
      SELECT id, name, email, role, avatar_url, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 8
    `).all();

    // Recent trips created
    const recentTrips = db.prepare(`
      SELECT t.*, u.name as author_name, u.email as author_email
      FROM trips t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 8
    `).all();

    res.json({
      counts,
      continentDistribution,
      topCities,
      activityCategoryBreakdown,
      recentUsers,
      recentTrips
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to generate admin statistics' });
  }
});

// GET /api/admin/users - User management table
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT 
        u.id, u.name, u.email, u.role, u.avatar_url, u.currency, u.language, u.created_at,
        (SELECT COUNT(*) FROM trips WHERE user_id = u.id) as trips_count,
        (SELECT COUNT(*) FROM saved_destinations WHERE user_id = u.id) as wishlist_count
      FROM users u
      ORDER BY u.created_at DESC
    `).all();

    res.json({ users });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to retrieve user list' });
  }
});

// GET /api/admin/trips - All trips moderation
router.get('/trips', authenticateToken, requireAdmin, (req, res) => {
  try {
    const trips = db.prepare(`
      SELECT 
        t.*,
        u.name as author_name,
        u.email as author_email,
        (SELECT COUNT(*) FROM stops WHERE trip_id = t.id) as stop_count,
        (SELECT COUNT(*) FROM activities WHERE trip_id = t.id) as activity_count
      FROM trips t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `).all();

    res.json({ trips });
  } catch (err) {
    console.error('Admin trips error:', err);
    res.status(500).json({ error: 'Failed to retrieve all trips' });
  }
});

// DELETE /api/admin/trips/:id - Admin delete trip
router.delete('/trips/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM trips WHERE id = ?').run(id);
    res.json({ message: 'Trip successfully removed by admin' });
  } catch (err) {
    console.error('Admin delete trip error:', err);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

module.exports = router;
