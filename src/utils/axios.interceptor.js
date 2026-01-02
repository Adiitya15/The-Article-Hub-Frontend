import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: `${backendUrl}/api`, // Your API base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Modify request before sending
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('Request sent:', config);
    return config;
  },
  (error) => {
    // Handle request error
    console.log('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor (optional)
axiosInstance.interceptors.response.use(
  (response) => {
        console.log('Request response:', response);

    // Handle successful response
    return response;
  },
  (error) => {
    console.log('error optional:', error);

    // Handle response error
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;