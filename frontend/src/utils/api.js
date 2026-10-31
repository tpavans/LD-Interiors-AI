import axios from 'axios';

const getBaseURL = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || '';
  if (!url || url.includes('ld-interiors-backend.onrender.com')) {
    url = 'https://ld-interiors-ai.onrender.com/api';
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5004/api';
    }
  }
  if (url.endsWith('/')) url = url.slice(0, -1);
  if (!url.endsWith('/api')) url += '/api';
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Interceptor to inject bearer auth token & automatically manage FormData boundary headers
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('ld_token');
      // If admin session is active but token is absent, ensure persistent master admin token
      if (!token && sessionStorage.getItem('ld_admin_authenticated') === 'true') {
        token = 'ld_master_admin_token_' + Date.now();
        localStorage.setItem('ld_token', token);
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // If sending FormData, remove explicit Content-Type header so Axios generates proper boundary token
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
