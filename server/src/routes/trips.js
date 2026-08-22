const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken, optionalToken } = require('../middleware/auth');

function generateShareCode(title) {
  const cleanTitle = (title || 'trip')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 20);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${cleanTitle}-${randomSuffix}`;
}

// GET /api/trips - List user's trips with stats
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT 
        t.*,
        (SELECT COUNT(*) FROM stops WHERE trip_id = t.id) as stop_count,
        (SELECT COUNT(*) FROM activities WHERE trip_id = t.id) as activity_count,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE trip_id = t.id) as total_expenses,
        (SELECT GROUP_CONCAT(city_name, ', ') FROM (
          SELECT city_name FROM stops WHERE trip_id = t.id ORDER BY order_index ASC LIMIT 4
        )) as destinations_preview
      FROM trips t
      WHERE t.user_id = ?
    `;

    const params = [req.user.id];

    if (status && status !== 'all') {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY t.created_at DESC';

    const trips = db.prepare(query).all(...params);
    res.json({ trips });
  } catch (err) {
    console.error('List trips error:', err);
    res.status(500).json({ error: 'Failed to retrieve trips' });
  }
});

// GET /api/trips/public/community - Public community featured trips
router.get('/public/community', (req, res) => {
  try {
    const trips = db.prepare(`
      SELECT 
        t.*,
        u.name as author_name,
        u.avatar_url as author_avatar,
        (SELECT COUNT(*) FROM stops WHERE trip_id = t.id) as stop_count,
        (SELECT COUNT(*) FROM activities WHERE trip_id = t.id) as activity_count,
        (SELECT COUNT(*) FROM trip_clones WHERE original_trip_id = t.id) as clone_count,
        (SELECT GROUP_CONCAT(city_name, ' • ') FROM (
          SELECT city_name FROM stops WHERE trip_id = t.id ORDER BY order_index ASC LIMIT 3
        )) as route_preview
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.visibility = 'public'
      ORDER BY t.created_at DESC
      LIMIT 12
    `).all();

    res.json({ trips });
  } catch (err) {
    console.error('Get community trips error:', err);
    res.status(500).json({ error: 'Failed to fetch community trips' });
  }
});

// GET /api/trips/share/:shareCode - Public read-only trip viewer
router.get('/share/:shareCode', optionalToken, (req, res) => {
  try {
    const { shareCode } = req.params;
    const trip = db.prepare(`
      SELECT 
        t.*,
        u.name as author_name,
        u.avatar_url as author_avatar,
        u.bio as author_bio
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.share_code = ?
    `).get(shareCode);

    if (!trip) {
      return res.status(404).json({ error: 'Itinerary not found or link has expired' });
    }

    if (trip.visibility !== 'public' && (!req.user || req.user.id !== trip.user_id)) {
      return res.status(403).json({ error: 'This itinerary is private' });
    }

    const stops = db.prepare(`
      SELECT * FROM stops WHERE trip_id = ? ORDER BY order_index ASC
    `).all(trip.id);

    const activities = db.prepare(`
      SELECT * FROM activities WHERE trip_id = ? ORDER BY scheduled_date ASC, scheduled_time ASC, order_index ASC
    `).all(trip.id);

    const expenses = db.prepare(`
      SELECT * FROM expenses WHERE trip_id = ? ORDER BY date ASC
    `).all(trip.id);

    res.json({ trip, stops, activities, expenses, isOwner: req.user ? req.user.id === trip.user_id : false });
  } catch (err) {
    console.error('Get shared trip error:', err);
    res.status(500).json({ error: 'Failed to load shared itinerary' });
  }
});

// GET /api/trips/:id - Get full trip details
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Allow user if owner or admin, or if public
    if (trip.user_id !== req.user.id && req.user.role !== 'admin' && trip.visibility !== 'public') {
      return res.status(403).json({ error: 'You do not have permission to view this trip' });
    }

    const stops = db.prepare(`
      SELECT * FROM stops WHERE trip_id = ? ORDER BY order_index ASC
    `).all(id);

    const activities = db.prepare(`
      SELECT * FROM activities WHERE trip_id = ? ORDER BY scheduled_date ASC, scheduled_time ASC, order_index ASC
    `).all(id);

    const expenses = db.prepare(`
      SELECT * FROM expenses WHERE trip_id = ? ORDER BY date ASC
    `).all(id);

    // Summary calculations
    const lodgingTotal = stops.reduce((sum, s) => sum + (Number(s.lodging_cost) || 0), 0);
    const activitiesTotal = activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
    const expensesTotal = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const calculatedTotalSpent = lodgingTotal + activitiesTotal + expensesTotal;

    res.json({
      trip,
      stops,
      activities,
      expenses,
      metrics: {
        totalBudget: trip.total_budget,
        totalSpent: calculatedTotalSpent,
        lodgingTotal,
        activitiesTotal,
        expensesTotal,
        remainingBudget: Math.max(0, trip.total_budget - calculatedTotalSpent),
        isOverBudget: calculatedTotalSpent > trip.total_budget && trip.total_budget > 0
      }
    });
  } catch (err) {
    console.error('Get trip error:', err);
    res.status(500).json({ error: 'Failed to load trip details' });
  }
});

// POST /api/trips - Create new trip
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      title,
      description = '',
      start_date,
      end_date,
      cover_image,
      total_budget = 0,
      currency = 'USD',
      visibility = 'private',
      travel_style = 'Explorer',
      initial_stops = []
    } = req.body;

    if (!title || !start_date || !end_date) {
      return res.status(400).json({ error: 'Title, start date, and end date are required' });
    }

    const tripId = `trip-${uuidv4()}`;
    const shareCode = generateShareCode(title);
    const defaultCover = cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

    const insertTrip = db.prepare(`
      INSERT INTO trips (id, user_id, title, description, start_date, end_date, cover_image, total_budget, currency, visibility, share_code, status, travel_style)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planning', ?)
    `);

    const insertStop = db.prepare(`
      INSERT INTO stops (id, trip_id, city_id, city_name, country, arrival_date, departure_date, order_index, lodging_name, lodging_cost, notes, lat, lng)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      insertTrip.run(
        tripId,
        req.user.id,
        title.trim(),
        description.trim(),
        start_date,
        end_date,
        defaultCover,
        Number(total_budget) || 0,
        currency,
        visibility,
        shareCode,
        travel_style
      );

      if (Array.isArray(initial_stops) && initial_stops.length > 0) {
        initial_stops.forEach((stop, index) => {
          insertStop.run(
            `stop-${uuidv4()}`,
            tripId,
            stop.city_id || null,
            stop.city_name || 'Destination',
            stop.country || '',
            stop.arrival_date || start_date,
            stop.departure_date || end_date,
            index,
            stop.lodging_name || '',
            Number(stop.lodging_cost) || 0,
            stop.notes || '',
            stop.lat || null,
            stop.lng || null
          );
        });
      }
    });

    transaction();

    const createdTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
    res.status(201).json({ trip: createdTrip, message: 'Trip created successfully!' });
  } catch (err) {
    console.error('Create trip error:', err);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

// PUT /api/trips/:id - Update trip metadata
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const {
      title,
      description,
      start_date,
      end_date,
      cover_image,
      total_budget,
      currency,
      visibility,
      status,
      travel_style
    } = req.body;

    db.prepare(`
      UPDATE trips
      SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        cover_image = COALESCE(?, cover_image),
        total_budget = COALESCE(?, total_budget),
        currency = COALESCE(?, currency),
        visibility = COALESCE(?, visibility),
        status = COALESCE(?, status),
        travel_style = COALESCE(?, travel_style),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title,
      description,
      start_date,
      end_date,
      cover_image,
      total_budget !== undefined ? Number(total_budget) : undefined,
      currency,
      visibility,
      status,
      travel_style,
      id
    );

    const updatedTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
    res.json({ trip: updatedTrip, message: 'Trip updated successfully' });
  } catch (err) {
    console.error('Update trip error:', err);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// DELETE /api/trips/:id - Delete trip
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    db.prepare('DELETE FROM trips WHERE id = ?').run(id);
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    console.error('Delete trip error:', err);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

// POST /api/trips/:id/duplicate - Clone trip
router.post('/:id/duplicate', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const originalTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);

    if (!originalTrip) {
      return res.status(404).json({ error: 'Original trip not found' });
    }

    const newTripId = `trip-${uuidv4()}`;
    const newShareCode = generateShareCode(`${originalTrip.title}-copy`);

    const stops = db.prepare('SELECT * FROM stops WHERE trip_id = ? ORDER BY order_index ASC').all(id);
    const activities = db.prepare('SELECT * FROM activities WHERE trip_id = ?').all(id);

    const cloneTx = db.transaction(() => {
      // Insert new trip
      db.prepare(`
        INSERT INTO trips (id, user_id, title, description, start_date, end_date, cover_image, total_budget, currency, visibility, share_code, status, travel_style)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'private', ?, 'planning', ?)
      `).run(
        newTripId,
        req.user.id,
        `${originalTrip.title} (Copy)`,
        originalTrip.description,
        originalTrip.start_date,
        originalTrip.end_date,
        originalTrip.cover_image,
        originalTrip.total_budget,
        originalTrip.currency,
        newShareCode,
        originalTrip.travel_style
      );

      // Map old stop IDs to new stop IDs
      const stopMap = {};
      const insertStop = db.prepare(`
        INSERT INTO stops (id, trip_id, city_id, city_name, country, arrival_date, departure_date, order_index, lodging_name, lodging_cost, notes, lat, lng)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const s of stops) {
        const newStopId = `stop-${uuidv4()}`;
        stopMap[s.id] = newStopId;
        insertStop.run(
          newStopId,
          newTripId,
          s.city_id,
          s.city_name,
          s.country,
          s.arrival_date,
          s.departure_date,
          s.order_index,
          s.lodging_name,
          s.lodging_cost,
          s.notes,
          s.lat,
          s.lng
        );
      }

      // Clone activities
      const insertActivity = db.prepare(`
        INSERT INTO activities (id, stop_id, trip_id, title, description, category, cost, duration_mins, scheduled_date, scheduled_time, location_name, image_url, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const act of activities) {
        const newStopId = stopMap[act.stop_id];
        if (newStopId) {
          insertActivity.run(
            `act-${uuidv4()}`,
            newStopId,
            newTripId,
            act.title,
            act.description,
            act.category,
            act.cost,
            act.duration_mins,
            act.scheduled_date,
            act.scheduled_time,
            act.location_name,
            act.image_url,
            act.order_index
          );
        }
      }

      // Record clone event
      db.prepare(`
        INSERT INTO trip_clones (id, original_trip_id, cloned_trip_id, user_id)
        VALUES (?, ?, ?, ?)
      `).run(`clone-${uuidv4()}`, originalTrip.id, newTripId, req.user.id);
    });

    cloneTx();

    const clonedTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get(newTripId);
    res.status(201).json({ trip: clonedTrip, message: 'Trip duplicated to your itineraries!' });
  } catch (err) {
    console.error('Duplicate trip error:', err);
    res.status(500).json({ error: 'Failed to duplicate trip' });
  }
});

// POST /api/trips/share/:shareCode/clone - Clone shared trip
router.post('/share/:shareCode/clone', authenticateToken, (req, res) => {
  try {
    const { shareCode } = req.params;
    const trip = db.prepare('SELECT id FROM trips WHERE share_code = ?').get(shareCode);
    if (!trip) {
      return res.status(404).json({ error: 'Shared trip not found' });
    }

    // Reuse duplicate logic
    req.params.id = trip.id;
    router.handle(req, res);
  } catch (err) {
    console.error('Clone shared trip error:', err);
    res.status(500).json({ error: 'Failed to clone shared trip' });
  }
});

module.exports = router;
