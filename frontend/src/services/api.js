import axios from 'axios';

const api = axios.create({
    baseURL: 'https://task-managment-h2fy.vercel.app', // Should use environment variable in production
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
