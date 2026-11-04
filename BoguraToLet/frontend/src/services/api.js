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

    // FormData পাঠানোর সময় ডিফল্ট JSON Content-Type মুছে দেওয়া,
    // যাতে ব্রাউজার নিজে multipart boundary সেট করে
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      // ছবি আপলোডে সময় বেশি লাগে (Render cold start সহ), তাই টাইমআউট বাড়ানো
      config.timeout = 60000;
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