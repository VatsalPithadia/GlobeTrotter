const db = require('./index');

function initSchema() {
  const schemaSql = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      currency TEXT DEFAULT 'USD',
      role TEXT DEFAULT 'user', -- 'user' or 'admin'
      language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Cities table (pre-populated global destination database)
    CREATE TABLE IF NOT EXISTS cities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      continent TEXT NOT NULL,
      cost_index TEXT NOT NULL, -- '$', '$$', '$$$', '$$$$'
      popularity_score INTEGER DEFAULT 80,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      avg_daily_cost REAL DEFAULT 100,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      tags TEXT, -- JSON array of tags: ["historic", "foodie", "beach", etc.]
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Activity Catalog (things to do in various cities)
    CREATE TABLE IF NOT EXISTS activity_catalog (
      id TEXT PRIMARY KEY,
      city_id TEXT,
      name TEXT NOT NULL,
      category TEXT NOT NULL, -- 'sightseeing', 'food', 'adventure', 'culture', 'relaxation', 'transport'
      cost REAL NOT NULL,
      duration_mins INTEGER DEFAULT 120,
      image_url TEXT,
      description TEXT,
      rating REAL DEFAULT 4.8,
      lat REAL,
      lng REAL,
      FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
    );

    -- Trips table
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      cover_image TEXT,
      total_budget REAL DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      visibility TEXT DEFAULT 'private', -- 'public', 'private'
      share_code TEXT UNIQUE,
      status TEXT DEFAULT 'planning', -- 'planning', 'ongoing', 'completed'
      travel_style TEXT DEFAULT 'Explorer', -- 'Solo', 'Couple', 'Family', 'Friends', 'Luxury', 'Backpacker'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Stops table (Destinations within a trip)
    CREATE TABLE IF NOT EXISTS stops (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      city_id TEXT,
      city_name TEXT NOT NULL,
      country TEXT NOT NULL,
      arrival_date TEXT NOT NULL,
      departure_date TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      lodging_name TEXT,
      lodging_cost REAL DEFAULT 0,
      notes TEXT,
      lat REAL,
      lng REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
    );

    -- Activities table (Specific scheduled items in a stop)
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      stop_id TEXT NOT NULL,
      trip_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'sightseeing', -- 'sightseeing', 'food', 'adventure', 'culture', 'relaxation', 'transport'
      cost REAL DEFAULT 0,
      duration_mins INTEGER DEFAULT 90,
      scheduled_date TEXT NOT NULL,
      scheduled_time TEXT DEFAULT '10:00',
      location_name TEXT,
      image_url TEXT,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    -- Expenses table (Financial logging)
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      stop_id TEXT,
      category TEXT NOT NULL, -- 'transport', 'lodging', 'activity', 'food', 'misc'
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE SET NULL
    );

    -- Saved Destinations / Wishlist
    CREATE TABLE IF NOT EXISTS saved_destinations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      city_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, city_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
    );

    -- Trip Clones / Community Copies Tracking
    CREATE TABLE IF NOT EXISTS trip_clones (
      id TEXT PRIMARY KEY,
      original_trip_id TEXT NOT NULL,
      cloned_trip_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (original_trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (cloned_trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Indexes for lightning fast queries
    CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
    CREATE INDEX IF NOT EXISTS idx_trips_share_code ON trips(share_code);
    CREATE INDEX IF NOT EXISTS idx_stops_trip_id ON stops(trip_id);
    CREATE INDEX IF NOT EXISTS idx_activities_stop_id ON activities(stop_id);
    CREATE INDEX IF NOT EXISTS idx_activities_trip_id ON activities(trip_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
    CREATE INDEX IF NOT EXISTS idx_cities_continent ON cities(continent);
    CREATE INDEX IF NOT EXISTS idx_saved_destinations_user ON saved_destinations(user_id);
  `;

  db.exec(schemaSql);
  console.log('✅ Database schema initialized with all relational tables and indexes.');
}

module.exports = { initSchema };
