import axios from 'axios';

// Render-এর লাইভ ব্যাকএন্ড এপিআই সরাসরি ডিফল্ট হিসেবে দেওয়া হলো
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'https://boguratolet-api.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// রিকোয়েস্ট ইন্টারসেপ্টর: টোকেন পাঠানো
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

// রেসপন্স ইন্টারসেপ্টর
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'কিছু একটা ভুল হয়েছে!';
    return Promise.reject(new Error(message));
  }
);

export default api;
