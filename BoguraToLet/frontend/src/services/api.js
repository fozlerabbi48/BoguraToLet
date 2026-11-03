import axios from 'axios';

// সরাসরি আপনার রেন্ডার ব্যাকএন্ড লিংক ডিফল্ট করা হলো
const api = axios.create({
  baseURL: 'https://boguratolet-api.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

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
