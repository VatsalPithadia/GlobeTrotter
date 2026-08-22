const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./db');
const { initSchema } = require('./db/schema');
const { seedDatabase } = require('./db/seed');

// Initialize database schema
initSchema();

// If user table is empty, auto-seed
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  console.log('Database empty on startup. Running initial seed...');
  seedDatabase();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static uploads / assets directory if needed
const publicDir = path.join(__dirname, '../public');
app.use('/public', express.static(publicDir));

// Route Handlers
const authRoutes = require('./routes/auth');
const tripsRoutes = require('./routes/trips');
const stopsRoutes = require('./routes/stops');
const activitiesRoutes = require('./routes/activities');
const expensesRoutes = require('./routes/expenses');
const citiesRoutes = require('./routes/cities');
const catalogRoutes = require('./routes/catalog');
const wishlistRoutes = require('./routes/savedDestinations');
const adminRoutes = require('./routes/admin');

// API Mounts
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api', stopsRoutes);
app.use('/api', activitiesRoutes);
app.use('/api', expensesRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GlobeTrotter Backend API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Seed API endpoint for reset/demo purposes
app.post('/api/seed', (req, res) => {
  try {
    seedDatabase();
    res.json({ message: 'Database reseeded successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Seed failed: ' + err.message });
  }
});

// Serve frontend static build if available
const clientDistPath = path.join(__dirname, '../../client/dist');
const fs = require('fs');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 GlobeTrotter Backend API running on http://localhost:${PORT}`);
});
