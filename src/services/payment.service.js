import api from './api';

export const paymentService = {
    create: async (data) => {
        return await api.post('/payments', data);
    },

    getAll: async (params = {}) => {
        return await api.get('/payments', { params });
    },

    getByCustomer: async (customerId) => {
        return await api.get('/payments', { params: { customerId } });
    },
};
