import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://dappit.io';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach auth token to every request
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('supabase-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Also send as cookie-style for Remix route compatibility
        config.headers.Cookie = `supabase-token=${token}`;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired — clear and redirect to login
            AsyncStorage.removeItem('supabase-token');
        }
        return Promise.reject(error);
    }
);

export default api;
export { API_BASE_URL };
