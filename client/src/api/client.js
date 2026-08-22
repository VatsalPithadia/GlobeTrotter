const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('globetrotter_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'An error occurred while communicating with the server');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password, currency) => apiRequest('/auth/register', { method: 'POST', body: { name, email, password, currency } }),
  demoLogin: (role) => apiRequest('/auth/demo-login', { method: 'POST', body: { role } }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (profile) => apiRequest('/auth/profile', { method: 'PUT', body: profile }),
  forgotPassword: (email) => apiRequest('/auth/forgot-password', { method: 'POST', body: { email } }),

  // Trips
  getTrips: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/trips${query ? `?${query}` : ''}`);
  },
  getTrip: (id) => apiRequest(`/trips/${id}`),
  createTrip: (tripData) => apiRequest('/trips', { method: 'POST', body: tripData }),
  updateTrip: (id, tripData) => apiRequest(`/trips/${id}`, { method: 'PUT', body: tripData }),
  deleteTrip: (id) => apiRequest(`/trips/${id}`, { method: 'DELETE' }),
  duplicateTrip: (id) => apiRequest(`/trips/${id}/duplicate`, { method: 'POST' }),
  getCommunityTrips: () => apiRequest('/trips/public/community'),
  getSharedTrip: (shareCode) => apiRequest(`/trips/share/${shareCode}`),
  cloneSharedTrip: (shareCode) => apiRequest(`/trips/share/${shareCode}/clone`, { method: 'POST' }),

  // Stops
  addStop: (tripId, stopData) => apiRequest(`/trips/${tripId}/stops`, { method: 'POST', body: stopData }),
  updateStop: (stopId, stopData) => apiRequest(`/stops/${stopId}`, { method: 'PUT', body: stopData }),
  deleteStop: (stopId) => apiRequest(`/stops/${stopId}`, { method: 'DELETE' }),
  reorderStops: (tripId, stopIds) => apiRequest(`/trips/${tripId}/stops/reorder`, { method: 'POST', body: { stopIds } }),

  // Activities
  addActivity: (stopId, activityData) => apiRequest(`/stops/${stopId}/activities`, { method: 'POST', body: activityData }),
  updateActivity: (activityId, activityData) => apiRequest(`/activities/${activityId}`, { method: 'PUT', body: activityData }),
  deleteActivity: (activityId) => apiRequest(`/activities/${activityId}`, { method: 'DELETE' }),
  reorderActivities: (stopId, activityIds) => apiRequest(`/stops/${stopId}/activities/reorder`, { method: 'POST', body: { activityIds } }),

  // Expenses
  getExpenses: (tripId) => apiRequest(`/trips/${tripId}/expenses`),
  addExpense: (tripId, expenseData) => apiRequest(`/trips/${tripId}/expenses`, { method: 'POST', body: expenseData }),
  deleteExpense: (expenseId) => apiRequest(`/expenses/${expenseId}`, { method: 'DELETE' }),

  // Cities & Catalog
  getCities: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/cities${query ? `?${query}` : ''}`);
  },
  getCity: (id) => apiRequest(`/cities/${id}`),
  getCatalogActivities: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/catalog/activities${query ? `?${query}` : ''}`);
  },

  // Wishlist
  getWishlist: () => apiRequest('/wishlist'),
  toggleWishlist: (cityId) => apiRequest(`/wishlist/${cityId}`, { method: 'POST' }),

  // Admin
  getAdminStats: () => apiRequest('/admin/stats'),
  getAdminUsers: () => apiRequest('/admin/users'),
  getAdminTrips: () => apiRequest('/admin/trips'),
  deleteAdminTrip: (id) => apiRequest(`/admin/trips/${id}`, { method: 'DELETE' }),
  reseedDatabase: () => apiRequest('/seed', { method: 'POST' })
};
