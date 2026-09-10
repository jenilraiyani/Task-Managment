import axios from 'axios';

const api = axios.create({
    baseURL: 'https://task-managment-7b69.onrender.com/api', // Should use environment variable in production
<<<<<<< HEAD
=======
    // baseURL: 'http://localhost:5000/api', 
>>>>>>> 8271ad4 (Respocive)
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
