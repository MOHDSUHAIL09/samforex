import axios from "axios";
import toast from "react-hot-toast"; // Add this import

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});



// ✅ Add env values to apiClient for use in components
apiClient.defaults.headers.common['X-LoginKey'] = import.meta.env.VITE_URL_LOGINKEY;
apiClient.defaults.headers.common['X-MSPassword'] = import.meta.env.VITE_MS_PASSWORD;

// Response interceptor to handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Show toast message
      toast.error("Session expired !");
      
      // Clear local storage
      sessionStorage.removeItem("isLoggedIn");
      
      // Redirect to login page after a short delay (optional)
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
    return Promise.reject(error);
  }
);

export default apiClient;