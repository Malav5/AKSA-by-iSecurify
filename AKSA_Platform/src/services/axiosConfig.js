import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
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

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle session expiration
      if (error.response.status === 401 && error.response.data?.sessionExpired) {
        // Clear all authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('soc_username');
        localStorage.removeItem('soc_fullname');
        localStorage.removeItem('soc_email');
        localStorage.removeItem('role');
        
        // Show session expired message
        alert('Your session has expired. Please log in again.');
        
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // Handle other 401 errors (invalid token, etc.)
      if (error.response.status === 401) {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('soc_username');
        localStorage.removeItem('soc_fullname');
        localStorage.removeItem('soc_email');
        localStorage.removeItem('role');
        
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 