const db = require('./index');
const { initSchema } = require('./schema');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

function seedDatabase() {
  initSchema();

  console.log('🌱 Seeding GlobeTrotter database with rich travel data...');

  const passwordHashUser = bcrypt.hashSync('password123', 10);
  const passwordHashAdmin = bcrypt.hashSync('admin123', 10);

  // Clear existing data in correct FK order
  db.exec(`
    DELETE FROM trip_clones;
    DELETE FROM saved_destinations;
    DELETE FROM expenses;
    DELETE FROM activities;
    DELETE FROM stops;
    DELETE FROM trips;
    DELETE FROM activity_catalog;
    DELETE FROM cities;
    DELETE FROM users;
  `);

  // Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, avatar_url, bio, currency, role, language)
    VALUES (@id, @name, @email, @password_hash, @avatar_url, @bio, @currency, @role, @language)
  `);

  const users = [
    {
      id: 'usr-1',
      name: 'Alex Vance',
      email: 'alex@globetrotter.io',
      password_hash: passwordHashUser,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Avid explorer, photographer, and coffee hunter wandering through historical streets and mountain trails.',
      currency: 'USD',
      role: 'user',
      language: 'en'
    },
    {
      id: 'usr-2',
      name: 'Admin Manager',
      email: 'admin@globetrotter.io',
      password_hash: passwordHashAdmin,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Platform Administrator & Chief Travel Curator at GlobeTrotter HQ.',
      currency: 'USD',
      role: 'admin',
      language: 'en'
    },
    {
      id: 'usr-3',
      name: 'Maya Lin',
      email: 'maya@globetrotter.io',
      password_hash: passwordHashUser,
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      bio: 'Culinary adventurer exploring street food flavors across Asia and Europe.',
      currency: 'EUR',
      role: 'user',
      language: 'en'
    }
  ];

  for (const user of users) {
    insertUser.run(user);
  }

  // Insert Cities
  const insertCity = db.prepare(`
    INSERT INTO cities (id, name, country, continent, cost_index, popularity_score, image_url, description, avg_daily_cost, lat, lng, tags)
    VALUES (@id, @name, @country, @continent, @cost_index, @popularity_score, @image_url, @description, @avg_daily_cost, @lat, @lng, @tags)
  `);

  const cities = [
    {
      id: 'city-paris',
      name: 'Paris',
      country: 'France',
      continent: 'Europe',
      cost_index: '$$$',
      popularity_score: 98,
      image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      description: 'The City of Light captivates with timeless art, grand boulevards, world-class gastronomy, and iconic architectural marvels.',
      avg_daily_cost: 160,
      lat: 48.8566,
      lng: 2.3522,
      tags: JSON.stringify(['romantic', 'art', 'historic', 'foodie', 'architecture'])
    },
    {
      id: 'city-rome',
      name: 'Rome',
      country: 'Italy',
      continent: 'Europe',
      cost_index: '$$$',
      popularity_score: 96,
      image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
      description: 'An open-air museum of colossal ancient ruins, Renaissance piazzas, rich gelato, and passionate street life.',
      avg_daily_cost: 140,
      lat: 41.9028,
      lng: 12.4964,
      tags: JSON.stringify(['ancient', 'historic', 'foodie', 'culture', 'architecture'])
    },
    {
      id: 'city-barcelona',
      name: 'Barcelona',
      country: 'Spain',
      continent: 'Europe',
      cost_index: '$$',
      popularity_score: 94,
      image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
      description: 'A sun-drenched Mediterranean metropolis brimming with Gaudí masterpieces, vibrant tapas bars, and beach vibes.',
      avg_daily_cost: 125,
      lat: 41.3851,
      lng: 2.1734,
      tags: JSON.stringify(['beach', 'nightlife', 'architecture', 'foodie', 'coastal'])
    },
    {
      id: 'city-tokyo',
      name: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      cost_index: '$$$',
      popularity_score: 99,
      image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      description: 'A dazzling juxtaposition of neon skyscrapers, ancient Shinto shrines, unmatched culinary mastery, and anime culture.',
      avg_daily_cost: 150,
      lat: 35.6762,
      lng: 139.6503,
      tags: JSON.stringify(['futuristic', 'foodie', 'culture', 'shopping', 'technology'])
    },
    {
      id: 'city-kyoto',
      name: 'Kyoto',
      country: 'Japan',
      continent: 'Asia',
      cost_index: '$$',
      popularity_score: 93,
      image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      description: 'The cultural heart of Japan with thousands of classical Buddhist temples, serene bamboo groves, and traditional geisha districts.',
      avg_daily_cost: 120,
      lat: 35.0116,
      lng: 135.7681,
      tags: JSON.stringify(['peaceful', 'historic', 'nature', 'culture', 'spiritual'])
    },
    {
      id: 'city-delhi',
      name: 'New Delhi',
      country: 'India',
      continent: 'Asia',
      cost_index: '$',
      popularity_score: 90,
      image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      description: 'A sprawling historic capital pulsating with vibrant bazaars, Mughal forts, rich spices, and timeless monuments.',
      avg_daily_cost: 45,
      lat: 28.6139,
      lng: 77.2090,
      tags: JSON.stringify(['historic', 'foodie', 'budget', 'culture', 'vibrant'])
    },
    {
      id: 'city-agra',
      name: 'Agra',
      country: 'India',
      continent: 'Asia',
      cost_index: '$',
      popularity_score: 92,
      image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
      description: 'Home to the awe-inspiring Taj Mahal, marble craft ateliers, and legendary Mughal heritage along the Yamuna River.',
      avg_daily_cost: 40,
      lat: 27.1767,
      lng: 78.0081,
      tags: JSON.stringify(['wonder', 'historic', 'monuments', 'photography', 'budget'])
    },
    {
      id: 'city-jaipur',
      name: 'Jaipur',
      country: 'India',
      continent: 'Asia',
      cost_index: '$',
      popularity_score: 91,
      image_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
      description: 'The Pink City of royalty, boasting hilltop fortress walls, opulent royal palaces, and rich textile traditions.',
      avg_daily_cost: 50,
      lat: 26.9124,
      lng: 75.7873,
      tags: JSON.stringify(['royal', 'palaces', 'culture', 'shopping', 'historic'])
    },
    {
      id: 'city-newyork',
      name: 'New York City',
      country: 'United States',
      continent: 'North America',
      cost_index: '$$$$',
      popularity_score: 97,
      image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
      description: 'The pulse of energy where iconic skylines meet Broadway theater, world-class dining, and diverse neighborhoods.',
      avg_daily_cost: 220,
      lat: 40.7128,
      lng: -74.0060,
      tags: JSON.stringify(['metropolitan', 'arts', 'shopping', 'nightlife', 'iconic'])
    },
    {
      id: 'city-sanfrancisco',
      name: 'San Francisco',
      country: 'United States',
      continent: 'North America',
      cost_index: '$$$$',
      popularity_score: 91,
      image_url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80',
      description: 'Famous for the Golden Gate Bridge, rolling hills, historic cable cars, and tech innovation alongside bay vistas.',
      avg_daily_cost: 210,
      lat: 37.7749,
      lng: -122.4194,
      tags: JSON.stringify(['coastal', 'scenic', 'tech', 'foodie', 'iconic'])
    },
    {
      id: 'city-losangeles',
      name: 'Los Angeles',
      country: 'United States',
      continent: 'North America',
      cost_index: '$$$',
      popularity_score: 92,
      image_url: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=1200&q=80',
      description: 'The world entertainment capital with sunny beaches, palm-lined avenues, Hollywood glamour, and scenic canyons.',
      avg_daily_cost: 180,
      lat: 34.0522,
      lng: -118.2437,
      tags: JSON.stringify(['beach', 'entertainment', 'luxury', 'sunshine', 'celebrity'])
    },
    {
      id: 'city-sydney',
      name: 'Sydney',
      country: 'Australia',
      continent: 'Oceania',
      cost_index: '$$$',
      popularity_score: 93,
      image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
      description: 'Iconic harbor sails, golden Bondi sands, cosmopolitan cafes, and a laid-back Australian coastal lifestyle.',
      avg_daily_cost: 170,
      lat: -33.8688,
      lng: 151.2093,
      tags: JSON.stringify(['harbor', 'beach', 'outdoor', 'modern', 'scenic'])
    },
    {
      id: 'city-dubai',
      name: 'Dubai',
      country: 'United Arab Emirates',
      continent: 'Asia',
      cost_index: '$$$$',
      popularity_score: 95,
      image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
      description: 'Futuristic oasis of record-breaking skyscrapers, luxury shopping mega-malls, and thrilling desert safaris.',
      avg_daily_cost: 200,
      lat: 25.2048,
      lng: 55.2708,
      tags: JSON.stringify(['luxury', 'futuristic', 'desert', 'shopping', 'architecture'])
    },
    {
      id: 'city-capetown',
      name: 'Cape Town',
      country: 'South Africa',
      continent: 'Africa',
      cost_index: '$$',
      popularity_score: 92,
      image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
      description: 'Dramatic Table Mountain backdrop, world-renowned wine valleys, penguin beaches, and rich cultural heritage.',
      avg_daily_cost: 85,
      lat: -33.9249,
      lng: 18.4241,
      tags: JSON.stringify(['mountains', 'wine', 'coastal', 'adventure', 'wildlife'])
    },
    {
      id: 'city-rio',
      name: 'Rio de Janeiro',
      country: 'Brazil',
      continent: 'South America',
      cost_index: '$$',
      popularity_score: 90,
      image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
      description: 'Samba rhythms, Christ the Redeemer overlooking lush mountains, Copacabana sands, and boundless joy for life.',
      avg_daily_cost: 80,
      lat: -22.9068,
      lng: -43.1729,
      tags: JSON.stringify(['beach', 'music', 'carnival', 'scenic', 'nature'])
    },
    {
      id: 'city-bali',
      name: 'Bali (Denpasar)',
      country: 'Indonesia',
      continent: 'Asia',
      cost_index: '$',
      popularity_score: 96,
      image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      description: 'Tropical paradise of emerald rice terraces, sacred Hindu water temples, world-class surfing, and spiritual wellness.',
      avg_daily_cost: 55,
      lat: -8.4095,
      lng: 115.1889,
      tags: JSON.stringify(['tropical', 'surfing', 'wellness', 'spiritual', 'budget'])
    },
    {
      id: 'city-amsterdam',
      name: 'Amsterdam',
      country: 'Netherlands',
      continent: 'Europe',
      cost_index: '$$$',
      popularity_score: 92,
      image_url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1200&q=80',
      description: 'Enchanting canal rings, historic gabled townhouses, endless bike paths, and world-class Van Gogh art collections.',
      avg_daily_cost: 155,
      lat: 52.3676,
      lng: 4.9041,
      tags: JSON.stringify(['canals', 'cycling', 'museums', 'cozy', 'historic'])
    },
    {
      id: 'city-london',
      name: 'London',
      country: 'United Kingdom',
      continent: 'Europe',
      cost_index: '$$$$',
      popularity_score: 97,
      image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
      description: 'Centuries of royal heritage, West End theater, iconic red double-deckers, and cutting-edge cosmopolitan vibes.',
      avg_daily_cost: 190,
      lat: 51.5074,
      lng: -0.1278,
      tags: JSON.stringify(['royal', 'theater', 'historic', 'museums', 'multicultural'])
    }
  ];

  for (const city of cities) {
    insertCity.run(city);
  }

  // Insert Activity Catalog
  const insertActivityCatalog = db.prepare(`
    INSERT INTO activity_catalog (id, city_id, name, category, cost, duration_mins, image_url, description, rating, lat, lng)
    VALUES (@id, @city_id, @name, @category, @cost, @duration_mins, @image_url, @description, @rating, @lat, @lng)
  `);

  const activitiesCatalog = [
    // Paris
    {
      id: 'act-paris-1',
      city_id: 'city-paris',
      name: 'Eiffel Tower Sunset Summit Access',
      category: 'sightseeing',
      cost: 35,
      duration_mins: 150,
      image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80',
      description: 'Ascend to the summit of the Iron Lady as Paris lights up beneath you at twilight.',
      rating: 4.9,
      lat: 48.8584,
      lng: 2.2945
    },
    {
      id: 'act-paris-2',
      city_id: 'city-paris',
      name: 'Louvre Museum Masterpieces Guided Tour',
      category: 'culture',
      cost: 45,
      duration_mins: 180,
      image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80',
      description: 'Skip the line to discover the Mona Lisa, Venus de Milo, and Winged Victory with an art historian.',
      rating: 4.8,
      lat: 48.8606,
      lng: 2.3376
    },
    {
      id: 'act-paris-3',
      city_id: 'city-paris',
      name: 'Seine River Gourmet Dinner Cruise',
      category: 'food',
      cost: 95,
      duration_mins: 120,
      image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
      description: 'Indulge in a 3-course French dining experience while gliding past illuminated monuments.',
      rating: 4.7,
      lat: 48.8590,
      lng: 2.2970
    },
    {
      id: 'act-paris-4',
      city_id: 'city-paris',
      name: 'Montmartre Artists & Pastry Walking Tour',
      category: 'food',
      cost: 40,
      duration_mins: 120,
      image_url: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=600&q=80',
      description: 'Taste authentic macarons and croissants along the bohemian cobblestone alleys of Sacré-Cœur.',
      rating: 4.9,
      lat: 48.8867,
      lng: 2.3431
    },

    // Rome
    {
      id: 'act-rome-1',
      city_id: 'city-rome',
      name: 'Colosseum, Roman Forum & Palatine Hill Tour',
      category: 'sightseeing',
      cost: 50,
      duration_mins: 180,
      image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
      description: 'Walk in the footsteps of gladiators and emperors with full arena and archaeological park access.',
      rating: 4.9,
      lat: 41.8902,
      lng: 12.4922
    },
    {
      id: 'act-rome-2',
      city_id: 'city-rome',
      name: 'Vatican Museums & Sistine Chapel Tour',
      category: 'culture',
      cost: 55,
      duration_mins: 210,
      image_url: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=600&q=80',
      description: 'Marvel at Michelangelo’s Sistine Chapel ceiling and Raphael’s Rooms with priority entrance.',
      rating: 4.9,
      lat: 41.9065,
      lng: 12.4536
    },
    {
      id: 'act-rome-3',
      city_id: 'city-rome',
      name: 'Trastevere Food & Wine Walking Tour',
      category: 'food',
      cost: 65,
      duration_mins: 150,
      image_url: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=600&q=80',
      description: 'Taste cacio e pepe, supplì, crispy Roman pizza, and local Chianti wines in authentic trattorias.',
      rating: 4.8,
      lat: 41.8895,
      lng: 12.4700
    },

    // Barcelona
    {
      id: 'act-bcn-1',
      city_id: 'city-barcelona',
      name: 'Sagrada Família Fast-Track Tower Tour',
      category: 'culture',
      cost: 38,
      duration_mins: 120,
      image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&q=80',
      description: 'Explore Antoni Gaudí’s unearthly basilica and climb the towers for panoramic city and sea views.',
      rating: 4.9,
      lat: 41.4036,
      lng: 2.1744
    },
    {
      id: 'act-bcn-2',
      city_id: 'city-barcelona',
      name: 'Park Güell & Gaudí Mosaic Experience',
      category: 'sightseeing',
      cost: 20,
      duration_mins: 100,
      image_url: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=600&q=80',
      description: 'Stroll among whimsical gingerbread gatehouses, serpentine benches, and the iconic ceramic dragon.',
      rating: 4.7,
      lat: 41.4145,
      lng: 2.1527
    },
    {
      id: 'act-bcn-3',
      city_id: 'city-barcelona',
      name: 'Barceloneta Sunset Catamaran Cruise',
      category: 'adventure',
      cost: 45,
      duration_mins: 90,
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      description: 'Sail the azure waters with chilled drinks and live acoustic music as the sun sets over Montjuïc.',
      rating: 4.8,
      lat: 41.3784,
      lng: 2.1925
    },

    // Tokyo
    {
      id: 'act-tokyo-1',
      city_id: 'city-tokyo',
      name: 'Shinjuku Neon & Omoide Yokocho Food Tour',
      category: 'food',
      cost: 70,
      duration_mins: 180,
      image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
      description: 'Sample succulent yakitori, artisan ramen, and Japanese craft beers in atmospheric lantern-lit alleyways.',
      rating: 4.9,
      lat: 35.6938,
      lng: 139.7003
    },
    {
      id: 'act-tokyo-2',
      city_id: 'city-tokyo',
      name: 'teamLab Planets Immersive Digital Art',
      category: 'culture',
      cost: 32,
      duration_mins: 120,
      image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      description: 'Wade through water and lose yourself in infinite crystalline digital light sculptures.',
      rating: 4.9,
      lat: 35.6491,
      lng: 139.7898
    },
    {
      id: 'act-tokyo-3',
      city_id: 'city-tokyo',
      name: 'Asakusa Senso-ji Temple & Kimono Walk',
      category: 'sightseeing',
      cost: 35,
      duration_mins: 150,
      image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80',
      description: 'Wear traditional Japanese attire and explore Tokyo’s oldest and most sacred Buddhist temple grounds.',
      rating: 4.8,
      lat: 35.7148,
      lng: 139.7967
    },

    // Kyoto
    {
      id: 'act-kyoto-1',
      city_id: 'city-kyoto',
      name: 'Fushimi Inari 10,000 Torii Gates Hike',
      category: 'sightseeing',
      cost: 15,
      duration_mins: 150,
      image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
      description: 'Hike through tunnels of vibrant vermilion gates winding up the sacred Mount Inari forest.',
      rating: 4.9,
      lat: 34.9671,
      lng: 135.7727
    },
    {
      id: 'act-kyoto-2',
      city_id: 'city-kyoto',
      name: 'Arashiyama Bamboo Grove & Monkey Park',
      category: 'adventure',
      cost: 20,
      duration_mins: 140,
      image_url: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=600&q=80',
      description: 'Listen to the rustling towering bamboo stems and feed wild macaques overlooking the Kyoto basin.',
      rating: 4.8,
      lat: 35.0166,
      lng: 135.6713
    },

    // Delhi
    {
      id: 'act-delhi-1',
      city_id: 'city-delhi',
      name: 'Old Delhi Rickshaw & Chandni Chowk Food Safari',
      category: 'food',
      cost: 25,
      duration_mins: 180,
      image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
      description: 'Ride through spice markets, taste piping hot parathas, jalebis, and visit the historic Jama Masjid.',
      rating: 4.9,
      lat: 28.6507,
      lng: 77.2334
    },
    {
      id: 'act-delhi-2',
      city_id: 'city-delhi',
      name: 'Qutub Minar & Humayun’s Tomb Heritage Tour',
      category: 'culture',
      cost: 15,
      duration_mins: 150,
      image_url: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=600&q=80',
      description: 'Explore UNESCO World Heritage Mughal architecture and the world’s tallest brick minaret.',
      rating: 4.8,
      lat: 28.5245,
      lng: 77.1855
    },

    // Agra
    {
      id: 'act-agra-1',
      city_id: 'city-agra',
      name: 'Taj Mahal VIP Sunrise Tour',
      category: 'sightseeing',
      cost: 30,
      duration_mins: 180,
      image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
      description: 'Witness the white marble monument of eternal love glowing in the first golden rays of dawn.',
      rating: 5.0,
      lat: 27.1751,
      lng: 78.0421
    },
    {
      id: 'act-agra-2',
      city_id: 'city-agra',
      name: 'Agra Fort & Mughal Garden Exploration',
      category: 'culture',
      cost: 18,
      duration_mins: 120,
      image_url: 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=600&q=80',
      description: 'Walk through red sandstone palaces and pavilions where Mughal emperors once ruled.',
      rating: 4.7,
      lat: 27.1795,
      lng: 78.0211
    },

    // Jaipur
    {
      id: 'act-jaipur-1',
      city_id: 'city-jaipur',
      name: 'Amber Fort Hilltop Palace & Sheesh Mahal',
      category: 'sightseeing',
      cost: 20,
      duration_mins: 180,
      image_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
      description: 'Admire mirror mosaic halls, rampart battlements, and panoramic views of Maota Lake.',
      rating: 4.9,
      lat: 26.9855,
      lng: 75.8513
    },
    {
      id: 'act-jaipur-2',
      city_id: 'city-jaipur',
      name: 'Hawa Mahal & City Palace Royal Walking Tour',
      category: 'culture',
      cost: 22,
      duration_mins: 150,
      image_url: 'https://images.unsplash.com/photo-1603228254119-e6aefd84be25?auto=format&fit=crop&w=600&q=80',
      description: 'Photograph the 953 honeycombed windows of the Palace of Winds and royal weaponry courts.',
      rating: 4.8,
      lat: 26.9239,
      lng: 75.8267
    }
  ];

  for (const act of activitiesCatalog) {
    insertActivityCatalog.run(act);
  }

  // Pre-seed 3 rich Demo Trips with Stops, Activities, and Expenses for user usr-1
  const insertTrip = db.prepare(`
    INSERT INTO trips (id, user_id, title, description, start_date, end_date, cover_image, total_budget, currency, visibility, share_code, status, travel_style)
    VALUES (@id, @user_id, @title, @description, @start_date, @end_date, @cover_image, @total_budget, @currency, @visibility, @share_code, @status, @travel_style)
  `);

  const insertStop = db.prepare(`
    INSERT INTO stops (id, trip_id, city_id, city_name, country, arrival_date, departure_date, order_index, lodging_name, lodging_cost, notes, lat, lng)
    VALUES (@id, @trip_id, @city_id, @city_name, @country, @arrival_date, @departure_date, @order_index, @lodging_name, @lodging_cost, @notes, @lat, @lng)
  `);

  const insertActivity = db.prepare(`
    INSERT INTO activities (id, stop_id, trip_id, title, description, category, cost, duration_mins, scheduled_date, scheduled_time, location_name, image_url, order_index)
    VALUES (@id, @stop_id, @trip_id, @title, @description, @category, @cost, @duration_mins, @scheduled_date, @scheduled_time, @location_name, @image_url, @order_index)
  `);

  const insertExpense = db.prepare(`
    INSERT INTO expenses (id, trip_id, stop_id, category, description, amount, currency, date)
    VALUES (@id, @trip_id, @stop_id, @category, @description, @amount, @currency, @date)
  `);

  // TRIP 1: European Grand Tour (Paris -> Rome -> Barcelona)
  const trip1 = {
    id: 'trip-euro-tour',
    user_id: 'usr-1',
    title: 'European Grand Tour: Paris, Rome & Barcelona',
    description: 'An unforgettable 10-day cultural journey across France, Italy, and Spain featuring art, historic architecture, and world-class culinary highlights.',
    start_date: '2026-09-10',
    end_date: '2026-09-20',
    cover_image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    total_budget: 3200,
    currency: 'USD',
    visibility: 'public',
    share_code: 'euro-tour-2026',
    status: 'upcoming',
    travel_style: 'Couple'
  };
  insertTrip.run(trip1);

  // Stops for Trip 1
  const trip1Stops = [
    {
      id: 'stop-1-paris',
      trip_id: 'trip-euro-tour',
      city_id: 'city-paris',
      city_name: 'Paris',
      country: 'France',
      arrival_date: '2026-09-10',
      departure_date: '2026-09-13',
      order_index: 0,
      lodging_name: 'Hotel Le Marais Boutique',
      lodging_cost: 450,
      notes: 'Boutique stay in the vibrant Marais quarter close to bakeries and metro.',
      lat: 48.8566,
      lng: 2.3522
    },
    {
      id: 'stop-2-rome',
      trip_id: 'trip-euro-tour',
      city_id: 'city-rome',
      city_name: 'Rome',
      country: 'Italy',
      arrival_date: '2026-09-14',
      departure_date: '2026-09-17',
      order_index: 1,
      lodging_name: 'Navona Grand Suites',
      lodging_cost: 480,
      notes: 'Steps away from Piazza Navona and artisan pasta trattorias.',
      lat: 41.9028,
      lng: 12.4964
    },
    {
      id: 'stop-3-barcelona',
      trip_id: 'trip-euro-tour',
      city_id: 'city-barcelona',
      city_name: 'Barcelona',
      country: 'Spain',
      arrival_date: '2026-09-18',
      departure_date: '2026-09-20',
      order_index: 2,
      lodging_name: 'Eixample Modernist Hotel',
      lodging_cost: 380,
      notes: 'Sunny rooftop terrace with views towards Sagrada Familia.',
      lat: 41.3851,
      lng: 2.1734
    }
  ];
  for (const stop of trip1Stops) insertStop.run(stop);

  // Activities for Trip 1
  const trip1Activities = [
    {
      id: 'act-1-1',
      stop_id: 'stop-1-paris',
      trip_id: 'trip-euro-tour',
      title: 'Eiffel Tower Sunset Summit Access',
      description: 'Ascend to the top for twilight views of the City of Light.',
      category: 'sightseeing',
      cost: 35,
      duration_mins: 150,
      scheduled_date: '2026-09-10',
      scheduled_time: '18:00',
      location_name: 'Champ de Mars, 5 Av. Anatole France',
      image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80',
      order_index: 0
    },
    {
      id: 'act-1-2',
      stop_id: 'stop-1-paris',
      trip_id: 'trip-euro-tour',
      title: 'Louvre Museum Masterpieces Tour',
      description: 'Guided tour of the world’s most celebrated art collection.',
      category: 'culture',
      cost: 45,
      duration_mins: 180,
      scheduled_date: '2026-09-11',
      scheduled_time: '10:00',
      location_name: 'Rue de Rivoli, 75001 Paris',
      image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80',
      order_index: 1
    },
    {
      id: 'act-1-3',
      stop_id: 'stop-1-paris',
      trip_id: 'trip-euro-tour',
      title: 'Seine River Gourmet Dinner Cruise',
      description: 'Romantic evening boat ride with French wine and live music.',
      category: 'food',
      cost: 95,
      duration_mins: 120,
      scheduled_date: '2026-09-12',
      scheduled_time: '20:00',
      location_name: 'Port de la Bourdonnais',
      image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
      order_index: 2
    },
    {
      id: 'act-1-4',
      stop_id: 'stop-2-rome',
      trip_id: 'trip-euro-tour',
      title: 'Colosseum & Roman Forum Tour',
      description: 'Exploring the gladiatorial arena and ancient temples.',
      category: 'sightseeing',
      cost: 50,
      duration_mins: 180,
      scheduled_date: '2026-09-14',
      scheduled_time: '09:30',
      location_name: 'Piazza del Colosseo',
      image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
      order_index: 0
    },
    {
      id: 'act-1-5',
      stop_id: 'stop-2-rome',
      trip_id: 'trip-euro-tour',
      title: 'Vatican Museums & Sistine Chapel',
      description: 'Michelangelo’s fresco masterpieces in Vatican City.',
      category: 'culture',
      cost: 55,
      duration_mins: 210,
      scheduled_date: '2026-09-15',
      scheduled_time: '11:00',
      location_name: 'Viale Vaticano',
      image_url: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=600&q=80',
      order_index: 1
    },
    {
      id: 'act-1-6',
      stop_id: 'stop-3-barcelona',
      trip_id: 'trip-euro-tour',
      title: 'Sagrada Família Fast-Track Tower Tour',
      description: 'Explore Antoni Gaudí’s unearthly basilica and climb towers.',
      category: 'culture',
      cost: 38,
      duration_mins: 120,
      scheduled_date: '2026-09-18',
      scheduled_time: '10:30',
      location_name: 'C/ de Mallorca, 401',
      image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&q=80',
      order_index: 0
    },
    {
      id: 'act-1-7',
      stop_id: 'stop-3-barcelona',
      trip_id: 'trip-euro-tour',
      title: 'Barceloneta Sunset Catamaran Cruise',
      description: 'Sail the azure waters with chilled drinks at sunset.',
      category: 'adventure',
      cost: 45,
      duration_mins: 90,
      scheduled_date: '2026-09-19',
      scheduled_time: '18:30',
      location_name: 'Port Vell Marina',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      order_index: 1
    }
  ];
  for (const act of trip1Activities) {
    insertActivity.run({
      description: null,
      scheduled_time: '10:00',
      location_name: null,
      image_url: null,
      order_index: 0,
      cost: 0,
      duration_mins: 60,
      ...act
    });
  }

  // Expenses for Trip 1
  const trip1Expenses = [
    { id: 'exp-1', trip_id: 'trip-euro-tour', stop_id: 'stop-1-paris', category: 'lodging', description: 'Hotel Le Marais (3 nights)', amount: 450, currency: 'USD', date: '2026-09-10' },
    { id: 'exp-2', trip_id: 'trip-euro-tour', stop_id: 'stop-2-rome', category: 'lodging', description: 'Navona Grand Suites (3 nights)', amount: 480, currency: 'USD', date: '2026-09-14' },
    { id: 'exp-3', trip_id: 'trip-euro-tour', stop_id: 'stop-3-barcelona', category: 'lodging', description: 'Eixample Modernist Hotel (2 nights)', amount: 380, currency: 'USD', date: '2026-09-18' },
    { id: 'exp-4', trip_id: 'trip-euro-tour', stop_id: 'stop-1-paris', category: 'transport', description: 'Eurostar & Metro Pass Paris', amount: 120, currency: 'USD', date: '2026-09-10' },
    { id: 'exp-5', trip_id: 'trip-euro-tour', stop_id: 'stop-2-rome', category: 'transport', description: 'Flight Paris -> Rome', amount: 160, currency: 'USD', date: '2026-09-14' },
    { id: 'exp-6', trip_id: 'trip-euro-tour', stop_id: 'stop-3-barcelona', category: 'transport', description: 'Flight Rome -> Barcelona', amount: 140, currency: 'USD', date: '2026-09-18' },
    { id: 'exp-7', trip_id: 'trip-euro-tour', stop_id: 'stop-1-paris', category: 'food', description: 'Bistros & Bakery Brunches in Paris', amount: 180, currency: 'USD', date: '2026-09-11' },
    { id: 'exp-8', trip_id: 'trip-euro-tour', stop_id: 'stop-2-rome', category: 'food', description: 'Trattoria Dinners & Gelato Rome', amount: 160, currency: 'USD', date: '2026-09-15' },
    { id: 'exp-9', trip_id: 'trip-euro-tour', stop_id: 'stop-3-barcelona', category: 'food', description: 'Tapas and Paella at El Born', amount: 140, currency: 'USD', date: '2026-09-19' }
  ];
  for (const exp of trip1Expenses) insertExpense.run(exp);

  // TRIP 2: Japan Cherry Blossom Explorer (Tokyo -> Kyoto)
  const trip2 = {
    id: 'trip-japan-sakura',
    user_id: 'usr-1',
    title: 'Japan Cherry Blossom Explorer: Tokyo & Kyoto',
    description: 'Immerse in ancient shrines, neon futuristic districts, and tranquil bamboo groves during Sakura season.',
    start_date: '2026-10-05',
    end_date: '2026-10-13',
    cover_image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    total_budget: 2800,
    currency: 'USD',
    visibility: 'public',
    share_code: 'japan-sakura-2026',
    status: 'upcoming',
    travel_style: 'Solo'
  };
  insertTrip.run(trip2);

  const trip2Stops = [
    {
      id: 'stop-tokyo-1',
      trip_id: 'trip-japan-sakura',
      city_id: 'city-tokyo',
      city_name: 'Tokyo',
      country: 'Japan',
      arrival_date: '2026-10-05',
      departure_date: '2026-10-09',
      order_index: 0,
      lodging_name: 'Shinjuku Prince Hotel',
      lodging_cost: 520,
      notes: 'Close to major JR station for fast bullet train connections.',
      lat: 35.6762,
      lng: 139.6503
    },
    {
      id: 'stop-kyoto-1',
      trip_id: 'trip-japan-sakura',
      city_id: 'city-kyoto',
      city_name: 'Kyoto',
      country: 'Japan',
      arrival_date: '2026-10-10',
      departure_date: '2026-10-13',
      order_index: 1,
      lodging_name: 'Traditional Ryokan Gion',
      lodging_cost: 490,
      notes: 'Tatami rooms with soothing onsen baths and kaiseki dinners.',
      lat: 35.0116,
      lng: 135.7681
    }
  ];
  for (const stop of trip2Stops) insertStop.run(stop);

  const trip2Activities = [
    {
      id: 'act-2-1',
      stop_id: 'stop-tokyo-1',
      trip_id: 'trip-japan-sakura',
      title: 'Shinjuku Neon & Omoide Yokocho Food Tour',
      description: 'Yakitori, ramen and craft beer tasting.',
      category: 'food',
      cost: 70,
      duration_mins: 180,
      scheduled_date: '2026-10-05',
      scheduled_time: '19:00',
      location_name: 'Shinjuku Golden Gai',
      image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
      order_index: 0
    },
    {
      id: 'act-2-2',
      stop_id: 'stop-tokyo-1',
      trip_id: 'trip-japan-sakura',
      title: 'teamLab Planets Immersive Digital Art',
      description: 'Walking through crystal light fields.',
      category: 'culture',
      cost: 32,
      duration_mins: 120,
      scheduled_date: '2026-10-07',
      scheduled_time: '14:00',
      location_name: 'Toyosu Waterfront',
      image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      order_index: 1
    },
    {
      id: 'act-2-3',
      stop_id: 'stop-kyoto-1',
      trip_id: 'trip-japan-sakura',
      title: 'Fushimi Inari 10,000 Torii Gates Hike',
      description: 'Morning climb through mystical orange shrine gates.',
      category: 'sightseeing',
      cost: 15,
      duration_mins: 150,
      scheduled_date: '2026-10-10',
      scheduled_time: '08:30',
      location_name: 'Fushimi Ward',
      image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
      order_index: 0
    }
  ];
  for (const act of trip2Activities) insertActivity.run(act);

  // TRIP 3: Golden Triangle of India (Delhi -> Agra -> Jaipur)
  const trip3 = {
    id: 'trip-golden-triangle',
    user_id: 'usr-1',
    title: 'Golden Triangle of India: Delhi, Agra & Jaipur',
    description: 'Experience iconic heritage wonders, majestic forts, aromatic spice bazaars, and royal palaces.',
    start_date: '2026-11-15',
    end_date: '2026-11-22',
    cover_image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    total_budget: 1200,
    currency: 'USD',
    visibility: 'public',
    share_code: 'india-triangle-2026',
    status: 'upcoming',
    travel_style: 'Family'
  };
  insertTrip.run(trip3);

  const trip3Stops = [
    {
      id: 'stop-delhi-1',
      trip_id: 'trip-golden-triangle',
      city_id: 'city-delhi',
      city_name: 'New Delhi',
      country: 'India',
      arrival_date: '2026-11-15',
      departure_date: '2026-11-17',
      order_index: 0,
      lodging_name: 'The Imperial Heritage Hotel',
      lodging_cost: 180,
      notes: 'Colonial charm in Connaught Place.',
      lat: 28.6139,
      lng: 77.2090
    },
    {
      id: 'stop-agra-1',
      trip_id: 'trip-golden-triangle',
      city_id: 'city-agra',
      city_name: 'Agra',
      country: 'India',
      arrival_date: '2026-11-18',
      departure_date: '2026-11-19',
      order_index: 1,
      lodging_name: 'ITC Mughal Resort',
      lodging_cost: 140,
      notes: 'Close to Taj Mahal east gate.',
      lat: 27.1767,
      lng: 78.0081
    },
    {
      id: 'stop-jaipur-1',
      trip_id: 'trip-golden-triangle',
      city_id: 'city-jaipur',
      city_name: 'Jaipur',
      country: 'India',
      arrival_date: '2026-11-20',
      departure_date: '2026-11-22',
      order_index: 2,
      lodging_name: 'Alsisar Haveli Palace Stay',
      lodging_cost: 160,
      notes: 'Traditional royal haveli with courtyards and frescoes.',
      lat: 26.9124,
      lng: 75.7873
    }
  ];
  for (const stop of trip3Stops) insertStop.run(stop);

  // Saved destinations wishlist for usr-1
  const insertSaved = db.prepare(`
    INSERT INTO saved_destinations (id, user_id, city_id)
    VALUES (?, ?, ?)
  `);
  insertSaved.run('save-1', 'usr-1', 'city-tokyo');
  insertSaved.run('save-2', 'usr-1', 'city-bali');
  insertSaved.run('save-3', 'usr-1', 'city-sydney');
  insertSaved.run('save-4', 'usr-1', 'city-capetown');

  console.log('✅ Seeding complete! Database is fully populated with users, destinations, activities, and demo itineraries.');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
