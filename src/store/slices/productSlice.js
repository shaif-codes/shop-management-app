import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/product.service';

export const fetchProducts = createAsyncThunk(
    'products/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await productService.getAll(params);
            // Backend returns { success: true, data: { products: [] } }
            // api.js interceptor returns response.data
            // So here response is { success: true, data: { products: [] } }
            // Wait, api.js returns response.data directly.
            // So if backend returns { success: true, data: { products: [] } }
            // Then response IS that object.
            // So response.data is { products: [] }.
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch products');
        }
    }
);

export const createProduct = createAsyncThunk(
    'products/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await productService.create(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create product');
        }
    }
);

export const updateProduct = createAsyncThunk(
    'products/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await productService.update(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update product');
        }
    }
);

export const updateStock = createAsyncThunk(
    'products/updateStock',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await productService.updateStock(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update stock');
        }
    }
);

const productSlice = createSlice({
    name: 'products',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                // API returns { products: [...] } for getAll
                state.list = action.payload.products || [];
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                // Add new product to list if matches current filters? 
                // Simplest is to just prepend it
                state.list.unshift(action.payload);
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.list.findIndex(p => p._id === action.payload._id || p.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            })
            .addCase(updateStock.fulfilled, (state, action) => {
                const index = state.list.findIndex(p => p._id === action.payload._id || p.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            });
    },
});

export default productSlice.reducer;
