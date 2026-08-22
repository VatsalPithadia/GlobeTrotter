const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/catalog/activities - Filter catalog activities
router.get('/activities', (req, res) => {
  try {
    const { category, city_id, max_cost, search, limit = 50 } = req.query;

    let query = `
      SELECT ac.*, c.name as city_name, c.country as city_country 
      FROM activity_catalog ac 
      LEFT JOIN cities c ON ac.city_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ' AND ac.category = ?';
      params.push(category);
    }

    if (city_id && city_id !== 'all') {
      query += ' AND ac.city_id = ?';
      params.push(city_id);
    }

    if (max_cost) {
      query += ' AND ac.cost <= ?';
      params.push(Number(max_cost));
    }

    if (search) {
      query += ' AND (ac.name LIKE ? OR ac.description LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY ac.rating DESC LIMIT ?';
    params.push(Number(limit));

    const activities = db.prepare(query).all(...params);
    res.json({ activities });
  } catch (err) {
    console.error('Get catalog activities error:', err);
    res.status(500).json({ error: 'Failed to fetch activity catalog' });
  }
});

module.exports = router;
