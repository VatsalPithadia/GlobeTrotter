const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalToken } = require('../middleware/auth');

// GET /api/cities - Search and list cities
router.get('/', optionalToken, (req, res) => {
  try {
    const { search, continent, cost_index, tag, limit = 50 } = req.query;

    let query = 'SELECT * FROM cities WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR country LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (continent && continent !== 'all') {
      query += ' AND continent = ?';
      params.push(continent);
    }

    if (cost_index && cost_index !== 'all') {
      query += ' AND cost_index = ?';
      params.push(cost_index);
    }

    if (tag && tag !== 'all') {
      query += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }

    query += ' ORDER BY popularity_score DESC LIMIT ?';
    params.push(Number(limit));

    const cities = db.prepare(query).all(...params);

    // If user is logged in, attach is_saved flag
    let savedCityIds = new Set();
    if (req.user) {
      const saved = db.prepare('SELECT city_id FROM saved_destinations WHERE user_id = ?').all(req.user.id);
      savedCityIds = new Set(saved.map(s => s.city_id));
    }

    const formattedCities = cities.map(c => ({
      ...c,
      tags: c.tags ? JSON.parse(c.tags) : [],
      is_saved: savedCityIds.has(c.id)
    }));

    res.json({ cities: formattedCities });
  } catch (err) {
    console.error('Get cities error:', err);
    res.status(500).json({ error: 'Failed to search cities' });
  }
});

// GET /api/cities/:id - Get single city with its activities
router.get('/:id', optionalToken, (req, res) => {
  try {
    const { id } = req.params;
    const city = db.prepare('SELECT * FROM cities WHERE id = ?').get(id);

    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    const activities = db.prepare('SELECT * FROM activity_catalog WHERE city_id = ? ORDER BY rating DESC').all(id);

    let is_saved = false;
    if (req.user) {
      const saved = db.prepare('SELECT id FROM saved_destinations WHERE user_id = ? AND city_id = ?').get(req.user.id, id);
      is_saved = !!saved;
    }

    res.json({
      city: {
        ...city,
        tags: city.tags ? JSON.parse(city.tags) : [],
        is_saved
      },
      activities
    });
  } catch (err) {
    console.error('Get city error:', err);
    res.status(500).json({ error: 'Failed to get city details' });
  }
});

module.exports = router;
