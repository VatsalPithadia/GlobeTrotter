const db = require('./index');
const { initSchema } = require('./schema');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

function seedDatabase() {
  initSchema();

  console.log('🌱 Seeding GlobeTrotter database with Indian destinations and travel data...');

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
      name: 'Aarav Sharma',
      email: 'aarav@globetrotter.in',
      password_hash: passwordHashUser,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Travel enthusiast exploring royal heritage forts, mountain passes, and vibrant street food trails across India.',
      currency: 'INR',
      role: 'user',
      language: 'en'
    },
    {
      id: 'usr-2',
      name: 'Admin Manager',
      email: 'admin@globetrotter.in',
      password_hash: passwordHashAdmin,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'GlobeTrotter India Curator & Platform Administrator.',
      currency: 'INR',
      role: 'admin',
      language: 'en'
    },
    {
      id: 'usr-3',
      name: 'Priya Patel',
      email: 'priya@globetrotter.in',
      password_hash: passwordHashUser,
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      bio: 'Backpacker and photographer capturing sunsets across Goa beaches and Kerala backwaters.',
      currency: 'INR',
      role: 'user',
      language: 'en'
    },
    {
      id: 'usr-4',
      name: 'Rohan Verma',
      email: 'rohan@globetrotter.in',
      password_hash: passwordHashUser,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      bio: 'Trekker, bike rider, and Himalayan roadtrip fanatic.',
      currency: 'INR',
      role: 'user',
      language: 'en'
    }
  ];

  for (const user of users) {
    insertUser.run(user);
  }

  // Insert Cities (Indian Destinations)
  const insertCity = db.prepare(`
    INSERT INTO cities (id, name, country, continent, cost_index, popularity_score, image_url, description, avg_daily_cost, lat, lng, tags)
    VALUES (@id, @name, @country, @continent, @cost_index, @popularity_score, @image_url, @description, @avg_daily_cost, @lat, @lng, @tags)
  `);

  const cities = [
    {
      id: 'city-jaipur',
      name: 'Jaipur',
      country: 'India (Rajasthan)',
      continent: 'North India',
      cost_index: '$$',
      popularity_score: 98,
      image_url: 'https://images.unsplash.com/photo-1603258849062-817c1817c72f?auto=format&fit=crop&w=1200&q=80',
      description: 'The Pink City is famous for grand Rajput palaces, majestic Amber Fort, bustling bazaars, and rich royal heritage.',
      avg_daily_cost: 2500,
      lat: 26.9124,
      lng: 75.7873,
      tags: JSON.stringify(['heritage', 'palaces', 'shopping', 'culture', 'food'])
    },
    {
      id: 'city-udaipur',
      name: 'Udaipur',
      country: 'India (Rajasthan)',
      continent: 'North India',
      cost_index: '$$$',
      popularity_score: 96,
      image_url: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
      description: 'The City of Lakes mesmerizes travelers with romantic marble palaces, serene Lake Pichola boat rides, and sunsets.',
      avg_daily_cost: 3200,
      lat: 24.5854,
      lng: 73.7125,
      tags: JSON.stringify(['romantic', 'lakes', 'luxury', 'architecture', 'sunset'])
    },
    {
      id: 'city-goa',
      name: 'Goa',
      country: 'India (Goa)',
      continent: 'West India',
      cost_index: '$$',
      popularity_score: 99,
      image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      description: 'India’s beach paradise offers sun-kissed sands, Portuguese heritage villas, beach shacks, water sports, and vibrant nightlife.',
      avg_daily_cost: 2800,
      lat: 15.2993,
      lng: 74.124,
      tags: JSON.stringify(['beaches', 'nightlife', 'seafood', 'relax', 'adventure'])
    },
    {
      id: 'city-munnar',
      name: 'Munnar',
      country: 'India (Kerala)',
      continent: 'South India',
      cost_index: '$$',
      popularity_score: 94,
      image_url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
      description: 'Idyllic hill station nestled in the Western Ghats surrounded by rolling tea plantations, mist-covered valleys, and waterfalls.',
      avg_daily_cost: 2200,
      lat: 10.0889,
      lng: 77.0595,
      tags: JSON.stringify(['nature', 'tea', 'hills', 'trekking', 'peaceful'])
    },
    {
      id: 'city-alleppey',
      name: 'Alleppey',
      country: 'India (Kerala)',
      continent: 'South India',
      cost_index: '$$$',
      popularity_score: 95,
      image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      description: 'The Venice of the East, celebrated for traditional thatched houseboat cruises through tranquil palm-fringed backwaters.',
      avg_daily_cost: 3500,
      lat: 9.4981,
      lng: 76.3388,
      tags: JSON.stringify(['backwaters', 'houseboat', 'ayurveda', 'romantic', 'nature'])
    },
    {
      id: 'city-manali',
      name: 'Manali',
      country: 'India (Himachal Pradesh)',
      continent: 'North India',
      cost_index: '$$',
      popularity_score: 97,
      image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
      description: 'Himalayan wonderland famous for snow-capped peaks, paragliding in Solang Valley, river rafting, and cozy riverside cafes.',
      avg_daily_cost: 2400,
      lat: 32.2432,
      lng: 77.1892,
      tags: JSON.stringify(['snow', 'mountains', 'adventure', 'trekking', 'cafes'])
    },
    {
      id: 'city-leh',
      name: 'Leh Ladakh',
      country: 'India (Ladakh)',
      continent: 'North India',
      cost_index: '$$$',
      popularity_score: 96,
      image_url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
      description: 'High-altitude desert adventure with breathtaking turquoise Pangong Lake, ancient Buddhist monasteries, and high mountain passes.',
      avg_daily_cost: 3600,
      lat: 34.1526,
      lng: 77.5771,
      tags: JSON.stringify(['roadtrip', 'mountains', 'monasteries', 'biking', 'breathtaking'])
    },
    {
      id: 'city-varanasi',
      name: 'Varanasi',
      country: 'India (Uttar Pradesh)',
      continent: 'North India',
      cost_index: '$',
      popularity_score: 93,
      image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      description: 'One of the world’s oldest living cities, celebrated for spiritual ghats on the sacred river Ganga, evening Maha Aarti, and silk weaving.',
      avg_daily_cost: 1500,
      lat: 25.3176,
      lng: 82.9739,
      tags: JSON.stringify(['spiritual', 'culture', 'heritage', 'photography', 'ganga'])
    },
    {
      id: 'city-rishikesh',
      name: 'Rishikesh',
      country: 'India (Uttarakhand)',
      continent: 'North India',
      cost_index: '$',
      popularity_score: 95,
      image_url: 'https://images.unsplash.com/photo-1600100397608-f010f4439c63?auto=format&fit=crop&w=1200&q=80',
      description: 'The Yoga Capital of the World along the pristine upper Ganga, featuring white-water rafting, cliff jumping, and serene ashrams.',
      avg_daily_cost: 1800,
      lat: 30.0869,
      lng: 78.2676,
      tags: JSON.stringify(['yoga', 'rafting', 'adventure', 'spiritual', 'cafes'])
    },
    {
      id: 'city-mumbai',
      name: 'Mumbai',
      country: 'India (Maharashtra)',
      continent: 'West India',
      cost_index: '$$$',
      popularity_score: 97,
      image_url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
      description: 'The City of Dreams boasting colonial heritage at Gateway of India, sunset walks along Marine Drive, and buzzing street food.',
      avg_daily_cost: 3500,
      lat: 18.922,
      lng: 72.8347,
      tags: JSON.stringify(['citylife', 'foodie', 'bollywood', 'heritage', 'coastal'])
    },
    {
      id: 'city-amritsar',
      name: 'Amritsar',
      country: 'India (Punjab)',
      continent: 'North India',
      cost_index: '$',
      popularity_score: 94,
      image_url: 'https://images.unsplash.com/photo-1588096344356-9a4f40d12e69?auto=format&fit=crop&w=1200&q=80',
      description: 'Home to the magnificent Golden Temple (Harmandir Sahib), soulful Langar, Wagah Border beating retreat, and mouthwatering Punjabi cuisine.',
      avg_daily_cost: 1600,
      lat: 31.634,
      lng: 74.8723,
      tags: JSON.stringify(['spiritual', 'foodie', 'culture', 'heritage', 'patriotic'])
    },
    {
      id: 'city-darjeeling',
      name: 'Darjeeling',
      country: 'India (West Bengal)',
      continent: 'East India',
      cost_index: '$$',
      popularity_score: 92,
      image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      description: 'Queen of the Hills offering views of Mount Kanchenjunga, UNESCO heritage Himalayan Toy Train, and lush organic tea estates.',
      avg_daily_cost: 2100,
      lat: 27.041,
      lng: 88.2663,
      tags: JSON.stringify(['mountains', 'tea', 'trains', 'scenic', 'peaceful'])
    },
    {
      id: 'city-agra',
      name: 'Agra',
      country: 'India (Uttar Pradesh)',
      continent: 'North India',
      cost_index: '$$',
      popularity_score: 98,
      image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
      description: 'The monumental Mughal capital home to the majestic Taj Mahal, Agra Fort, and historic marble craftsmanship.',
      avg_daily_cost: 2200,
      lat: 27.1767,
      lng: 78.0081,
      tags: JSON.stringify(['wonder', 'monuments', 'history', 'photography', 'unesco'])
    },
    {
      id: 'city-andaman',
      name: 'Havelock Island (Andaman)',
      country: 'India (Andamans)',
      continent: 'Islands',
      cost_index: '$$$$',
      popularity_score: 95,
      image_url: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200&q=80',
      description: 'Exotic tropical haven with Radhanagar beach, vibrant coral reefs, scuba diving, bioluminescent night kayaking, and turquoise water.',
      avg_daily_cost: 4500,
      lat: 11.9761,
      lng: 92.9876,
      tags: JSON.stringify(['scuba', 'beaches', 'tropical', 'luxury', 'corals'])
    }
  ];

  for (const city of cities) {
    insertCity.run(city);
  }

  // Insert Activity Catalog
  const insertCatalog = db.prepare(`
    INSERT INTO activity_catalog (id, city_id, name, category, cost, duration_mins, rating, description, image_url)
    VALUES (@id, @city_id, @name, @category, @cost, @duration_mins, @rating, @description, @image_url)
  `);

  const catalogItems = [
    {
      id: 'cat-amber-fort',
      city_id: 'city-jaipur',
      name: 'Amer Fort & Sheesh Mahal Guided Tour',
      category: 'sightseeing',
      cost: 500,
      duration_mins: 180,
      rating: 4.9,
      description: 'Explore the grand hilltop fort, royal courtyards, and dazzling mirror palace (Sheesh Mahal) with an expert historian.',
      image_url: 'https://images.unsplash.com/photo-1603258849062-817c1817c72f?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'cat-hawa-mahal',
      city_id: 'city-jaipur',
      name: 'Hawa Mahal & Old Bazaar Walking Tour',
      category: 'culture',
      cost: 350,
      duration_mins: 120,
      rating: 4.8,
      description: 'Photograph the iconic 953-window Palace of Winds and stroll through Johari and Bapu bazaars for handicrafts.',
      image_url: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'cat-pichola-boat',
      city_id: 'city-udaipur',
      name: 'Lake Pichola Sunset Boat Cruise',
      category: 'relaxation',
      cost: 800,
      duration_mins: 90,
      rating: 4.9,
      description: 'Scenic evening boat ride gliding past Jag Mandir Island and the illuminated City Palace as the sun sets over the Aravallis.',
      image_url: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'cat-goa-watersports',
      city_id: 'city-goa',
      name: 'Calangute & Baga Water Sports Combo',
      category: 'adventure',
      cost: 1800,
      duration_mins: 150,
      rating: 4.7,
      description: 'Thrilling parasailing, jet skiing, bumper rides, and banana boat rides along the vibrant North Goa coast.',
      image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'cat-munnar-tea',
      city_id: 'city-munnar',
      name: 'Kolukkumalai Tea Estate Sunrise Trek',
      category: 'adventure',
      cost: 1200,
      duration_mins: 240,
      rating: 4.9,
      description: 'Early morning 4x4 jeep safari and trek to the highest tea plantation in the world to witness an ethereal cloudbed sunrise.',
      image_url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'cat-alleppey-houseboat',
      city_id: 'city-alleppey',
      name: 'Traditional Kettuvallam Houseboat Day Cruise',
      category: 'relaxation',
      cost: 3500,
      duration_mins: 360,
      rating: 4.9,
      description: 'Full-day cruise through serene backwaters with traditional Kerala sadhya lunch prepared freshly on board.',
      image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'cat-solang-paragliding',
      city_id: 'city-manali',
      name: 'Solang Valley Tandem Paragliding',
      category: 'adventure',
      cost: 2500,
      duration_mins: 60,
      rating: 4.8,
      description: 'Fly high above the snow peaks and cedar forests of Solang Valley with a licensed pilot and HD GoPro recording.',
      image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'cat-pangong-camp',
      city_id: 'city-leh',
      name: 'Pangong Tso Lakeside Stargazing Camp',
      category: 'relaxation',
      cost: 2800,
      duration_mins: 720,
      rating: 4.9,
      description: 'Unforgettable overnight luxury camp beside the color-shifting turquoise Pangong Lake beneath Milky Way skies.',
      image_url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'cat-ganga-aarti',
      city_id: 'city-varanasi',
      name: 'Dashashwamedh Ghat Evening Ganga Aarti Boat',
      category: 'spiritual',
      cost: 400,
      duration_mins: 90,
      rating: 4.9,
      description: 'Witness the divine grand brass lamp ritual from a private traditional wooden boat anchored on holy river Ganga.',
      image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'cat-taj-sunrise',
      city_id: 'city-agra',
      name: 'Taj Mahal Sunrise VIP Guided Walk',
      category: 'sightseeing',
      cost: 650,
      duration_mins: 150,
      rating: 5.0,
      description: 'Skip the crowds at dawn to experience the shimmering ivory marble monument of love bathed in golden morning light.',
      image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'cat-rishikesh-rafting',
      city_id: 'city-rishikesh',
      name: 'Ganga 16km Grade-III River Rafting & Cliff Jump',
      category: 'adventure',
      cost: 1100,
      duration_mins: 180,
      rating: 4.9,
      description: 'Conquer famous rapids like Roller Coaster and Golf Course with safety gear and mandatory cliff jump stop.',
      image_url: 'https://images.unsplash.com/photo-1600100397608-f010f4439c63?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'cat-golden-temple',
      city_id: 'city-amritsar',
      name: 'Golden Temple Heritage Walk & Community Kitchen (Langar)',
      category: 'culture',
      cost: 0,
      duration_mins: 150,
      rating: 5.0,
      description: 'Experience the serene sarovar, gold sanctum, and volunteer at the world’s largest community kitchen serving 100,000 daily meals.',
      image_url: 'https://images.unsplash.com/photo-1588096344356-9a4f40d12e69?auto=format&fit=crop&w=600&q=80'
    }
  ];

  for (const item of catalogItems) {
    insertCatalog.run(item);
  }

  // Insert Rich Sample Trips
  const insertTrip = db.prepare(`
    INSERT INTO trips (id, user_id, title, description, start_date, end_date, cover_image, total_budget, currency, status, visibility, travel_style, share_code)
    VALUES (@id, @user_id, @title, @description, @start_date, @end_date, @cover_image, @total_budget, @currency, @status, @visibility, @travel_style, @share_code)
  `);

  const insertStop = db.prepare(`
    INSERT INTO stops (id, trip_id, city_id, city_name, country, arrival_date, departure_date, lodging_name, lodging_cost, order_index, notes, lat, lng)
    VALUES (@id, @trip_id, @city_id, @city_name, @country, @arrival_date, @departure_date, @lodging_name, @lodging_cost, @order_index, @notes, @lat, @lng)
  `);

  const insertActivity = db.prepare(`
    INSERT INTO activities (id, stop_id, trip_id, title, description, category, cost, duration_mins, scheduled_date, scheduled_time, location_name, image_url, order_index)
    VALUES (@id, @stop_id, @trip_id, @title, @description, @category, @cost, @duration_mins, @scheduled_date, @scheduled_time, @location_name, @image_url, @order_index)
  `);

  const insertExpense = db.prepare(`
    INSERT INTO expenses (id, trip_id, stop_id, category, description, amount, date)
    VALUES (@id, @trip_id, @stop_id, @category, @description, @amount, @date)
  `);

  // TRIP 1: Royal Rajasthan Heritage Tour
  const trip1Id = 'trip-rajasthan-2026';
  insertTrip.run({
    id: trip1Id,
    user_id: 'usr-1',
    title: 'Royal Rajasthan Heritage Explorer',
    description: 'A 7-day royal expedition through the grand palaces of Jaipur and the romantic lakes of Udaipur.',
    start_date: '2026-10-10',
    end_date: '2026-10-17',
    cover_image: 'https://images.unsplash.com/photo-1603258849062-817c1817c72f?auto=format&fit=crop&w=1200&q=80',
    total_budget: 45000,
    currency: 'INR',
    status: 'upcoming',
    visibility: 'public',
    travel_style: 'Family',
    share_code: 'rajasthan-royal-2026'
  });

  const stop1A = 'stop-raj-1';
  insertStop.run({
    id: stop1A,
    trip_id: trip1Id,
    city_id: 'city-jaipur',
    city_name: 'Jaipur',
    country: 'Rajasthan',
    arrival_date: '2026-10-10',
    departure_date: '2026-10-13',
    lodging_name: 'Heritage Haveli Resort',
    lodging_cost: 9000,
    order_index: 1,
    notes: 'Near MI Road, convenient for shopping and monument access.',
    lat: 26.9124,
    lng: 75.7873
  });

  const stop1B = 'stop-raj-2';
  insertStop.run({
    id: stop1B,
    trip_id: trip1Id,
    city_id: 'city-udaipur',
    city_name: 'Udaipur',
    country: 'Rajasthan',
    arrival_date: '2026-10-13',
    departure_date: '2026-10-17',
    lodging_name: 'Lakeview Palace Heritage Hotel',
    lodging_cost: 12000,
    order_index: 2,
    notes: 'Lake-facing room with rooftop restaurant.',
    lat: 24.5854,
    lng: 73.7125
  });

  insertActivity.run({
    id: 'act-raj-1',
    stop_id: stop1A,
    trip_id: trip1Id,
    title: 'Amer Fort & Sheesh Mahal Exploration',
    description: 'Explore the grand Rajput fortress and mirror halls.',
    category: 'sightseeing',
    cost: 500,
    duration_mins: 180,
    scheduled_date: '2026-10-11',
    scheduled_time: '09:30',
    location_name: 'Amer, Jaipur',
    image_url: 'https://images.unsplash.com/photo-1603258849062-817c1817c72f?auto=format&fit=crop&w=600&q=80',
    order_index: 1
  });

  insertActivity.run({
    id: 'act-raj-2',
    stop_id: stop1A,
    trip_id: trip1Id,
    title: 'Hawa Mahal & Johari Bazaar Shopping',
    description: 'Handicrafts, gemstones, and street photography.',
    category: 'culture',
    cost: 350,
    duration_mins: 120,
    scheduled_date: '2026-10-12',
    scheduled_time: '16:00',
    location_name: 'Badi Chaupar, Jaipur',
    image_url: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=600&q=80',
    order_index: 2
  });

  insertActivity.run({
    id: 'act-raj-3',
    stop_id: stop1B,
    trip_id: trip1Id,
    title: 'Lake Pichola Sunset Boat Cruise',
    description: 'Evening boat cruise past Jag Mandir Island.',
    category: 'relaxation',
    cost: 800,
    duration_mins: 90,
    scheduled_date: '2026-10-14',
    scheduled_time: '17:00',
    location_name: 'Rameshwar Ghat, Udaipur',
    image_url: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80',
    order_index: 1
  });

  insertExpense.run({
    id: 'exp-raj-1',
    trip_id: trip1Id,
    stop_id: stop1A,
    category: 'transport',
    description: 'Vande Bharat Express Train Tickets (Delhi - Jaipur)',
    amount: 3200,
    date: '2026-10-10'
  });

  insertExpense.run({
    id: 'exp-raj-2',
    trip_id: trip1Id,
    stop_id: stop1B,
    category: 'food',
    description: 'Authentic Dal Baati Churma Dinner at Chokhi Dhani',
    amount: 1800,
    date: '2026-10-11'
  });

  // TRIP 2: Kerala Backwaters & Tea Gardens
  const trip2Id = 'trip-kerala-2026';
  insertTrip.run({
    id: trip2Id,
    user_id: 'usr-1',
    title: 'God’s Own Country: Kerala Backwaters & Hills',
    description: 'Unwind amidst the misty tea plantations of Munnar and traditional houseboat backwaters in Alleppey.',
    start_date: '2026-11-05',
    end_date: '2026-11-12',
    cover_image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    total_budget: 38000,
    currency: 'INR',
    status: 'upcoming',
    visibility: 'public',
    travel_style: 'Couple',
    share_code: 'kerala-escape-2026'
  });

  const stop2A = 'stop-ker-1';
  insertStop.run({
    id: stop2A,
    trip_id: trip2Id,
    city_id: 'city-munnar',
    city_name: 'Munnar',
    country: 'Kerala',
    arrival_date: '2026-11-05',
    departure_date: '2026-11-08',
    lodging_name: 'Misty Mountain Eco Resort',
    lodging_cost: 7500,
    order_index: 1,
    notes: 'Located amidst cardamom and tea plantations.',
    lat: 10.0889,
    lng: 77.0595
  });

  const stop2B = 'stop-ker-2';
  insertStop.run({
    id: stop2B,
    trip_id: trip2Id,
    city_id: 'city-alleppey',
    city_name: 'Alleppey',
    country: 'Kerala',
    arrival_date: '2026-11-08',
    departure_date: '2026-11-12',
    lodging_name: 'Luxury Thatched Houseboat',
    lodging_cost: 11000,
    order_index: 2,
    notes: 'Overnight stay with traditional chef included.',
    lat: 9.4981,
    lng: 76.3388
  });

  insertActivity.run({
    id: 'act-ker-1',
    stop_id: stop2A,
    trip_id: trip2Id,
    title: 'Kolukkumalai Tea Estate Sunrise 4x4 Tour',
    description: 'Breathtaking sunrise above the clouds.',
    category: 'adventure',
    cost: 1200,
    duration_mins: 240,
    scheduled_date: '2026-11-06',
    scheduled_time: '05:00',
    location_name: 'Kolukkumalai, Munnar',
    image_url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=80',
    order_index: 1
  });

  insertActivity.run({
    id: 'act-ker-2',
    stop_id: stop2B,
    trip_id: trip2Id,
    title: 'Traditional Houseboat Backwaters Cruise',
    description: 'Cruising through paddy fields and palm canals.',
    category: 'relaxation',
    cost: 3500,
    duration_mins: 360,
    scheduled_date: '2026-11-09',
    scheduled_time: '11:00',
    location_name: 'Punnamada Jetty, Alleppey',
    image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80',
    order_index: 1
  });

  // TRIP 3: Goa Beach Vacation
  const trip3Id = 'trip-goa-2026';
  insertTrip.run({
    id: trip3Id,
    user_id: 'usr-3',
    title: 'Goa Coastal Vibes & Beach Trail',
    description: 'Sun, sand, water sports, and Portuguese heritage villas in North & South Goa.',
    start_date: '2026-12-01',
    end_date: '2026-12-06',
    cover_image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    total_budget: 30000,
    currency: 'INR',
    status: 'upcoming',
    visibility: 'public',
    travel_style: 'Friends',
    share_code: 'goa-vibes-2026'
  });

  const stop3A = 'stop-goa-1';
  insertStop.run({
    id: stop3A,
    trip_id: trip3Id,
    city_id: 'city-goa',
    city_name: 'Goa',
    country: 'Goa',
    arrival_date: '2026-12-01',
    departure_date: '2026-12-06',
    lodging_name: 'Candolim Beachside Villa',
    lodging_cost: 14000,
    order_index: 1,
    notes: '2 minutes walk to the beach.',
    lat: 15.2993,
    lng: 74.124
  });

  insertActivity.run({
    id: 'act-goa-1',
    stop_id: stop3A,
    trip_id: trip3Id,
    title: 'Calangute Water Sports Package',
    description: 'Parasailing, jet ski, and speed boat ride.',
    category: 'adventure',
    cost: 1800,
    duration_mins: 150,
    scheduled_date: '2026-12-02',
    scheduled_time: '10:00',
    location_name: 'Calangute Beach, Goa',
    image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    order_index: 1
  });

  // Saved Wishlist for Aarav
  const insertWishlist = db.prepare(`
    INSERT INTO saved_destinations (id, user_id, city_id)
    VALUES (?, ?, ?)
  `);
  insertWishlist.run('fav-1', 'usr-1', 'city-goa');
  insertWishlist.run('fav-2', 'usr-1', 'city-leh');
  insertWishlist.run('fav-3', 'usr-1', 'city-manali');
  insertWishlist.run('fav-4', 'usr-1', 'city-andaman');

  console.log('✅ Database seeded with authentic Indian travel data successfully!');
}

module.exports = { seedDatabase };
