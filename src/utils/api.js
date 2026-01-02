import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const API = axios.create({
  baseURL: `${backendUrl}/api`,
});

// Request interceptor (you already have this)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (ADD THIS)
API.interceptors.response.use(
  (response) => {
    console.log("Response :>>", response)
    // If response is successful, just return it
    return response;
  },
  (error) => {
    console.log("Error :>>", error)
    // Handle errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      // You can also clear other auth-related data
      localStorage.removeItem("user");
      
      // Redirect to login
      window.location.href = "/login";
      
      // Optional: Show a message to user
      // toast.error("Session expired. Please login again.");
    }
    
    return Promise.reject(error);
  }
);

export const fetchUserById = (id) => API.get(`/user/${id}`);
export const updateUserById = (id, formData) =>
  API.put(`/user/${id}`, formData);

export default API;