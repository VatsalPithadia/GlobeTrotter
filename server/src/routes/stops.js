const express = require('express');
const router = express.Router({ mergeParams: true });
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// POST /api/trips/:tripId/stops - Add stop to trip
router.post('/trips/:tripId/stops', authenticateToken, (req, res) => {
  try {
    const { tripId } = req.params;
    const {
      city_id,
      city_name,
      country,
      arrival_date,
      departure_date,
      lodging_name = '',
      lodging_cost = 0,
      notes = '',
      lat = null,
      lng = null
    } = req.body;

    if (!city_name || !arrival_date || !departure_date) {
      return res.status(400).json({ error: 'City name, arrival date, and departure date are required' });
    }

    const trip = db.prepare('SELECT id, user_id FROM trips WHERE id = ?').get(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get next order_index
    const maxOrder = db.prepare('SELECT COALESCE(MAX(order_index), -1) as max_idx FROM stops WHERE trip_id = ?').get(tripId);
    const orderIndex = maxOrder.max_idx + 1;
    const stopId = `stop-${uuidv4()}`;

    db.prepare(`
      INSERT INTO stops (id, trip_id, city_id, city_name, country, arrival_date, departure_date, order_index, lodging_name, lodging_cost, notes, lat, lng)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      stopId,
      tripId,
      city_id || null,
      city_name,
      country || '',
      arrival_date,
      departure_date,
      orderIndex,
      lodging_name,
      Number(lodging_cost) || 0,
      notes,
      lat,
      lng
    );

    const createdStop = db.prepare('SELECT * FROM stops WHERE id = ?').get(stopId);
    res.status(201).json({ stop: createdStop, message: 'Stop added to itinerary' });
  } catch (err) {
    console.error('Add stop error:', err);
    res.status(500).json({ error: 'Failed to add stop' });
  }
});

// PUT /api/stops/:stopId - Update stop
router.put('/stops/:stopId', authenticateToken, (req, res) => {
  try {
    const { stopId } = req.params;
    const stop = db.prepare(`
      SELECT s.*, t.user_id FROM stops s JOIN trips t ON s.trip_id = t.id WHERE s.id = ?
    `).get(stopId);

    if (!stop) {
      return res.status(404).json({ error: 'Stop not found' });
    }
    if (stop.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const {
      city_name,
      country,
      arrival_date,
      departure_date,
      lodging_name,
      lodging_cost,
      notes,
      lat,
      lng
    } = req.body;

    db.prepare(`
      UPDATE stops
      SET
        city_name = COALESCE(?, city_name),
        country = COALESCE(?, country),
        arrival_date = COALESCE(?, arrival_date),
        departure_date = COALESCE(?, departure_date),
        lodging_name = COALESCE(?, lodging_name),
        lodging_cost = COALESCE(?, lodging_cost),
        notes = COALESCE(?, notes),
        lat = COALESCE(?, lat),
        lng = COALESCE(?, lng)
      WHERE id = ?
    `).run(
      city_name,
      country,
      arrival_date,
      departure_date,
      lodging_name,
      lodging_cost !== undefined ? Number(lodging_cost) : undefined,
      notes,
      lat,
      lng,
      stopId
    );

    const updatedStop = db.prepare('SELECT * FROM stops WHERE id = ?').get(stopId);
    res.json({ stop: updatedStop, message: 'Stop updated successfully' });
  } catch (err) {
    console.error('Update stop error:', err);
    res.status(500).json({ error: 'Failed to update stop' });
  }
});

// DELETE /api/stops/:stopId - Delete stop
router.delete('/stops/:stopId', authenticateToken, (req, res) => {
  try {
    const { stopId } = req.params;
    const stop = db.prepare(`
      SELECT s.*, t.user_id FROM stops s JOIN trips t ON s.trip_id = t.id WHERE s.id = ?
    `).get(stopId);

    if (!stop) {
      return res.status(404).json({ error: 'Stop not found' });
    }
    if (stop.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    db.prepare('DELETE FROM stops WHERE id = ?').run(stopId);
    res.json({ message: 'Stop deleted successfully' });
  } catch (err) {
    console.error('Delete stop error:', err);
    res.status(500).json({ error: 'Failed to delete stop' });
  }
});

// POST /api/trips/:tripId/stops/reorder - Reorder stops
router.post('/trips/:tripId/stops/reorder', authenticateToken, (req, res) => {
  try {
    const { tripId } = req.params;
    const { stopIds } = req.body; // Array of stop IDs in new order

    if (!Array.isArray(stopIds)) {
      return res.status(400).json({ error: 'stopIds array is required' });
    }

    const trip = db.prepare('SELECT user_id FROM trips WHERE id = ?').get(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateOrder = db.prepare('UPDATE stops SET order_index = ? WHERE id = ? AND trip_id = ?');
    const tx = db.transaction(() => {
      stopIds.forEach((id, index) => {
        updateOrder.run(index, id, tripId);
      });
    });
    tx();

    const orderedStops = db.prepare('SELECT * FROM stops WHERE trip_id = ? ORDER BY order_index ASC').all(tripId);
    res.json({ stops: orderedStops, message: 'Stops reordered successfully' });
  } catch (err) {
    console.error('Reorder stops error:', err);
    res.status(500).json({ error: 'Failed to reorder stops' });
  }
});

module.exports = router;
