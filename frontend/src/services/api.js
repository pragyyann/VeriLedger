import axios from 'axios';

// Step 2: Use VITE_API_URL from .env
const API = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: `${API}/api`,
});

// Step 3: Attach JWT token — sends Authorization: Bearer <token> on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('veriledger_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export default api;
