import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulator to access localhost
// Use your machine's local IP for physical devices, or 10.0.2.2 for emulator
// Machine IP: 192.168.31.208
const API_BASE_URL = Platform.OS === 'android'
    ? 'http://192.168.31.208:5001/api'
    : 'http://localhost:5001/api';

// const API_BASE_URL = 'http://localhost:5001/api';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        console.log('Request interceptor - Token found:', !!token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            await AsyncStorage.removeItem('authToken');
            // In a real app, we might want to trigger a navigation action here
            // or dispatch a logout action if we had access to the store
        }
        return Promise.reject(error.response?.data || error);
    }
);

export default api;
