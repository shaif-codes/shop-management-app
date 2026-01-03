import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { PROD_API_URL, DEV_ANDROID_API_URL, DEV_IOS_API_URL, NODE_ENV, USE_PROD_API } from '@env';

// TODO: Replace this with your Azure Backend URL after deployment
// const PROD_API_URL = 'https://munshiapp-cefcenfdg7e3btga.centralindia-01.azurewebsites.net';

const DEV_API_URL = Platform.OS === 'android'
    ? DEV_ANDROID_API_URL
    : DEV_IOS_API_URL || 'http://localhost:5001/api';

// Set this to true when building the APK for release
const IS_PRODUCTION = NODE_ENV === 'production';

console.log('NODE_ENV:', NODE_ENV);
console.log('IS_PRODUCTION:', IS_PRODUCTION);

// Add react-refresh/babel to the plugins array if not in production


const API_BASE_URL = USE_PROD_API && IS_PRODUCTION ? PROD_API_URL : DEV_API_URL;

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
