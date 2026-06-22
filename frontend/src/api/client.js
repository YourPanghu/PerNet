import axios from 'axios';
import { message } from 'antd';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: extract data or handle error
client.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body.code !== 200) {
      message.error(body.message || 'Request failed');
      return Promise.reject(new Error(body.message || 'Request failed'));
    }
    return body.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname.startsWith('/admin') &&
            window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      }
      message.error(data?.message || `Error ${status}`);
    } else {
      message.error('Network error');
    }
    return Promise.reject(error);
  }
);

export default client;
