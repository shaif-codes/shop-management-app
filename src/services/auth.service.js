import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
    register: async (data) => {
        const response = await api.post('/auth/register', data);
        console.log("full api path", api.defaults.baseURL);
        if (response.data && response.data.token) {
            await AsyncStorage.setItem('authToken', response.data.token);
        }
        return response;
    },

    login: async (email, password) => {
        console.log("full api path", api.defaults.baseURL);
        const response = await api.post('/auth/login', { email, password });
        if (response.data && response.data.token) {
            await AsyncStorage.setItem('authToken', response.data.token);
        }
        return response;
    },

    logout: async () => {
        await AsyncStorage.removeItem('authToken');
    },

    getMe: async () => {
        return await api.get('/auth/me');
    },

    isAuthenticated: async () => {
        const token = await AsyncStorage.getItem('authToken');
        return !!token;
    },

    updateProfile: async (data) => {
        return await api.put('/auth/profile', data);
    },
};
