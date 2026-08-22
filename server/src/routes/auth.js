const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, currency = 'USD' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const id = `usr-${uuidv4()}`;
    const password_hash = bcrypt.hashSync(password, 10);
    const avatar_url = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, avatar_url, currency, role, language)
      VALUES (?, ?, ?, ?, ?, ?, 'user', 'en')
    `).run(id, name.trim(), email.toLowerCase().trim(), password_hash, avatar_url, currency);

    const user = db.prepare('SELECT id, name, email, avatar_url, bio, currency, role, language, created_at FROM users WHERE id = ?').get(id);
    const token = generateToken(user);

    res.status(201).json({ user, token, message: 'Registration successful' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordValid = bcrypt.compareSync(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      bio: user.bio,
      currency: user.currency,
      role: user.role,
      language: user.language,
      created_at: user.created_at
    };

    const token = generateToken(safeUser);
    res.json({ user: safeUser, token, message: 'Welcome back!' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// POST /api/auth/demo-login
router.post('/demo-login', (req, res) => {
  try {
    const { role = 'user' } = req.body;
    let email = 'alex@globetrotter.io';
    if (role === 'admin') {
      email = 'admin@globetrotter.io';
    }

    const user = db.prepare('SELECT id, name, email, avatar_url, bio, currency, role, language, created_at FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(404).json({ error: 'Demo user not found. Please run seed script.' });
    }

    const token = generateToken(user);
    res.json({ user, token, message: `Logged in as ${user.name} (${user.role})` });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ error: 'Failed demo login' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM trips WHERE user_id = ?) as total_trips,
        (SELECT COUNT(DISTINCT city_name) FROM stops s JOIN trips t ON s.trip_id = t.id WHERE t.user_id = ?) as total_cities,
        (SELECT COUNT(*) FROM saved_destinations WHERE user_id = ?) as wishlist_count,
        (SELECT COALESCE(SUM(total_budget), 0) FROM trips WHERE user_id = ?) as total_budget_managed
    `).get(req.user.id, req.user.id, req.user.id, req.user.id);

    res.json({ user: req.user, stats });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, avatar_url, bio, currency, language } = req.body;

    db.prepare(`
      UPDATE users 
      SET 
        name = COALESCE(?, name),
        avatar_url = COALESCE(?, avatar_url),
        bio = COALESCE(?, bio),
        currency = COALESCE(?, currency),
        language = COALESCE(?, language),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, avatar_url, bio, currency, language, req.user.id);

    const updatedUser = db.prepare('SELECT id, name, email, avatar_url, bio, currency, role, language, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  // Simulated password reset token
  res.json({
    message: 'If an account exists with this email, password reset instructions have been sent.',
    demo_reset_code: 'GT-884920'
  });
});

module.exports = router;
