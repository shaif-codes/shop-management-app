import api from './api';

export const reportsService = {
    getDashboard: async () => {
        return await api.get('/reports/dashboard');
    },

    getSalesReport: async (params = {}) => {
        return await api.get('/reports/sales', { params });
    },

    getCreditReport: async () => {
        return await api.get('/reports/credit');
    },

    getStockReport: async () => {
        return await api.get('/reports/stock');
    },
};
