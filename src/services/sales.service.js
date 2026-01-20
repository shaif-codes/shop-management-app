import api from './api';

export const salesService = {
    create: async (data) => {
        return await api.post('/sales', data);
    },

    getAll: async (params = {}) => {
        return await api.get('/sales', { params });
    },

    getById: async (id) => {
        return await api.get(`/sales/${id}`);
    },
    delete: async (id) => {
        return await api.delete(`/sales/${id}`);
    },
    update: async (id, data) => {
        return await api.put(`/sales/${id}`, data);
    },
};
