const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/wishlist - Get user's saved destinations
router.get('/', authenticateToken, (req, res) => {
  try {
    const saved = db.prepare(`
      SELECT c.*, sd.created_at as saved_at
      FROM saved_destinations sd
      JOIN cities c ON sd.city_id = c.id
      WHERE sd.user_id = ?
      ORDER BY sd.created_at DESC
    `).all(req.user.id);

    const formatted = saved.map(c => ({
      ...c,
      tags: c.tags ? JSON.parse(c.tags) : [],
      is_saved: true
    }));

    res.json({ wishlist: formatted });
  } catch (err) {
    console.error('Get wishlist error:', err);
    res.status(500).json({ error: 'Failed to retrieve wishlist' });
  }
});

// POST /api/wishlist/:cityId - Toggle wishlist
router.post('/:cityId', authenticateToken, (req, res) => {
  try {
    const { cityId } = req.params;
    const existing = db.prepare('SELECT id FROM saved_destinations WHERE user_id = ? AND city_id = ?').get(req.user.id, cityId);

    if (existing) {
      db.prepare('DELETE FROM saved_destinations WHERE id = ?').run(existing.id);
      return res.json({ is_saved: false, message: 'Removed from saved destinations' });
    } else {
      db.prepare('INSERT INTO saved_destinations (id, user_id, city_id) VALUES (?, ?, ?)').run(
        `sd-${uuidv4()}`,
        req.user.id,
        cityId
      );
      return res.json({ is_saved: true, message: 'Saved to your dream destinations!' });
    }
  } catch (err) {
    console.error('Toggle wishlist error:', err);
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
});

module.exports = router;
