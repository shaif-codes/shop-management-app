import api from './api';

export const customerService = {
    getAll: async (params = {}) => {
        return await api.get('/customers', { params });
    },

    getById: async (id) => {
        return await api.get(`/customers/${id}`);
    },

    create: async (data) => {
        return await api.post('/customers', data);
    },

    update: async (id, data) => {
        return await api.put(`/customers/${id}`, data);
    },

    remove: async (id) => {
        return await api.delete(`/customers/${id}`);
    },
};
