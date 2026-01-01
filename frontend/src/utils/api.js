import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token expired or invalid
      if (error.response.status === 401 || error.response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    return response.data;
  },
};

// MOU API calls (all authenticated)
export const mouAPI = {
  getAll: async (page = 1, limit = 50, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/mou', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/mou/${id}`);
    return response.data;
  },
  filter: async (params) => {
    const response = await apiClient.get('/mou/filter', { params });
    return response.data;
  },
  add: async (formData) => {
    const response = await apiClient.post('/mou/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  update: async (id, formData) => {
    const response = await apiClient.put(`/mou/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/mou/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await apiClient.get('/mou/stats/summary');
    return response.data;
  },
  getExpiring: async (days = 30) => {
    const response = await apiClient.get('/mou/expiring/list', { params: { days } });
    return response.data;
  },
  overwrite: async (data) => {
    const response = await apiClient.post('/mou/overwrite', data);
    return response.data;
  },
};

// Helper functions
export const auth = {
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },
  getToken: () => {
    return localStorage.getItem('token');
  },
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  removeToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
};

export default apiClient;
