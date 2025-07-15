import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// !! IMPORTANT: Replace this with your actual Vercel deployment URL
const API_BASE_URL = 'https://lms-testing-six.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle token expiration/invalidity
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check if it's an authentication error (401 or 403) and not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried to prevent infinite loops

      // Optionally, refresh token if you have a refresh token flow
      // For simplicity here, we'll just log out the user
      console.warn('Authentication error (401). Logging out user.');
      await AsyncStorage.clear(); // Clear all stored data
      // You might want to dispatch an action to a global state to trigger logout in UI
      // For now, let's just re-throw to be caught by specific screens

      // If you had a navigation service, you could do:
      // NavigationService.navigate('AuthStack');
    }
    return Promise.reject(error);
  }
);

export default api;