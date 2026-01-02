import api from './api';

export const productService = {
    getAll: async (params = {}) => {
        // Backend expects params in query string
        return await api.get('/products', { params });
    },

    getAttributes: async (searchQuery = '', key = 'product') => {
        console.log("searchQuery", searchQuery);
        console.log("key", key);
        return await api.get(`/products/attributes/${key}`, { params: { searchQuery } });
    },

    getById: async (id) => {
        return await api.get(`/products/${id}`);
    },

    create: async (data) => {
        return await api.post('/products', data);
    },

    update: async (id, data) => {
        return await api.put(`/products/${id}`, data);
    },

    updateStock: async (id, data) => {
        // data: { quantity, type: 'ADD'|'REMOVE'|'ADJUST', remarks }
        return await api.post(`/products/${id}/stock`, data);
    },

    delete: async (id) => {
        return await api.delete(`/products/${id}`);
    },

    getLowStock: async () => {
        return await api.get('/products', { params: { lowStock: true } });
    },
};
