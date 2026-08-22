const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// POST /api/stops/:stopId/activities - Add activity to stop
router.post('/stops/:stopId/activities', authenticateToken, (req, res) => {
  try {
    const { stopId } = req.params;
    const {
      title,
      description = '',
      category = 'sightseeing',
      cost = 0,
      duration_mins = 90,
      scheduled_date,
      scheduled_time = '10:00',
      location_name = '',
      image_url = ''
    } = req.body;

    if (!title || !scheduled_date) {
      return res.status(400).json({ error: 'Activity title and scheduled date are required' });
    }

    const stop = db.prepare(`
      SELECT s.*, t.user_id, t.id as trip_id 
      FROM stops s 
      JOIN trips t ON s.trip_id = t.id 
      WHERE s.id = ?
    `).get(stopId);

    if (!stop) {
      return res.status(404).json({ error: 'Stop not found' });
    }
    if (stop.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const maxOrder = db.prepare('SELECT COALESCE(MAX(order_index), -1) as max_idx FROM activities WHERE stop_id = ?').get(stopId);
    const orderIndex = maxOrder.max_idx + 1;
    const activityId = `act-${uuidv4()}`;

    db.prepare(`
      INSERT INTO activities (id, stop_id, trip_id, title, description, category, cost, duration_mins, scheduled_date, scheduled_time, location_name, image_url, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      activityId,
      stopId,
      stop.trip_id,
      title.trim(),
      description.trim(),
      category,
      Number(cost) || 0,
      Number(duration_mins) || 60,
      scheduled_date,
      scheduled_time,
      location_name,
      image_url,
      orderIndex
    );

    const createdActivity = db.prepare('SELECT * FROM activities WHERE id = ?').get(activityId);
    res.status(201).json({ activity: createdActivity, message: 'Activity scheduled!' });
  } catch (err) {
    console.error('Add activity error:', err);
    res.status(500).json({ error: 'Failed to add activity' });
  }
});

// PUT /api/activities/:activityId - Update activity
router.put('/activities/:activityId', authenticateToken, (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = db.prepare(`
      SELECT a.*, t.user_id 
      FROM activities a 
      JOIN trips t ON a.trip_id = t.id 
      WHERE a.id = ?
    `).get(activityId);

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    if (activity.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const {
      title,
      description,
      category,
      cost,
      duration_mins,
      scheduled_date,
      scheduled_time,
      location_name,
      image_url,
      stop_id
    } = req.body;

    db.prepare(`
      UPDATE activities
      SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        cost = COALESCE(?, cost),
        duration_mins = COALESCE(?, duration_mins),
        scheduled_date = COALESCE(?, scheduled_date),
        scheduled_time = COALESCE(?, scheduled_time),
        location_name = COALESCE(?, location_name),
        image_url = COALESCE(?, image_url),
        stop_id = COALESCE(?, stop_id)
      WHERE id = ?
    `).run(
      title,
      description,
      category,
      cost !== undefined ? Number(cost) : undefined,
      duration_mins !== undefined ? Number(duration_mins) : undefined,
      scheduled_date,
      scheduled_time,
      location_name,
      image_url,
      stop_id,
      activityId
    );

    const updated = db.prepare('SELECT * FROM activities WHERE id = ?').get(activityId);
    res.json({ activity: updated, message: 'Activity updated successfully' });
  } catch (err) {
    console.error('Update activity error:', err);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// DELETE /api/activities/:activityId - Delete activity
router.delete('/activities/:activityId', authenticateToken, (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = db.prepare(`
      SELECT a.*, t.user_id 
      FROM activities a 
      JOIN trips t ON a.trip_id = t.id 
      WHERE a.id = ?
    `).get(activityId);

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    if (activity.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    db.prepare('DELETE FROM activities WHERE id = ?').run(activityId);
    res.json({ message: 'Activity removed' });
  } catch (err) {
    console.error('Delete activity error:', err);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// POST /api/stops/:stopId/activities/reorder - Reorder activities inside a stop or day
router.post('/stops/:stopId/activities/reorder', authenticateToken, (req, res) => {
  try {
    const { stopId } = req.params;
    const { activityIds } = req.body;

    if (!Array.isArray(activityIds)) {
      return res.status(400).json({ error: 'activityIds array is required' });
    }

    const stop = db.prepare(`
      SELECT s.*, t.user_id 
      FROM stops s 
      JOIN trips t ON s.trip_id = t.id 
      WHERE s.id = ?
    `).get(stopId);

    if (!stop) {
      return res.status(404).json({ error: 'Stop not found' });
    }
    if (stop.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateOrder = db.prepare('UPDATE activities SET order_index = ? WHERE id = ? AND stop_id = ?');
    const tx = db.transaction(() => {
      activityIds.forEach((id, index) => {
        updateOrder.run(index, id, stopId);
      });
    });
    tx();

    const activities = db.prepare('SELECT * FROM activities WHERE stop_id = ? ORDER BY order_index ASC').all(stopId);
    res.json({ activities, message: 'Activities reordered' });
  } catch (err) {
    console.error('Reorder activities error:', err);
    res.status(500).json({ error: 'Failed to reorder activities' });
  }
});

module.exports = router;
