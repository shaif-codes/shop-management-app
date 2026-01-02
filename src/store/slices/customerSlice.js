import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerService } from '../../services/customer.service';

export const fetchCustomers = createAsyncThunk(
    'customers/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await customerService.getAll(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch customers');
        }
    }
);

export const createCustomer = createAsyncThunk(
    'customers/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await customerService.create(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create customer');
        }
    }
);

export const updateCustomer = createAsyncThunk(
    'customers/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await customerService.update(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update customer');
        }
    }
);

const customerSlice = createSlice({
    name: 'customers',
    initialState: {
        list: [],
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
        },
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.customers || [];
                state.pagination = action.payload.pagination || state.pagination;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            .addCase(createCustomer.fulfilled, (state, action) => {
                state.list.unshift(action.payload);
            })
            .addCase(updateCustomer.fulfilled, (state, action) => {
                const index = state.list.findIndex(c => (c._id || c.id) === (action.payload._id || action.payload.id));
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            });
    },
});

export default customerSlice.reducer;
