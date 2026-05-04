import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Auth context handles routing to login panel.
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/signup', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Events API
export const eventsAPI = {
  getEvents: (params = {}) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  autocomplete: (query) => api.get(`/events/autocomplete?q=${encodeURIComponent(query)}`),
};

// Discover API
export const discoverAPI = {
  getNearbyEvents: (lat, lon, distance = 20, category) => {
    const params = { lat, lon, distance_km: distance };
    if (category) params.category = category;
    return api.get('/discover/nearby', { params });
  },
  getTrendingEvents: (k = 10) => api.get(`/discover/trending?k=${k}`),
  getRecommendedEvents: () => api.get('/discover/recommended'),
};

// Bookings API
export const bookingsAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/mine'),
};

// Chatbot API
export const chatbotAPI = {
  getBotName: () => api.get('/chatbot/name'),
  chat: (message, latitude, longitude) => 
    api.post('/chatbot/chat', { message, latitude, longitude }),
};

export default api;
