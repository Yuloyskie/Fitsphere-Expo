import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiDelete, apiGet, apiPost, apiPut } from '../../services/api';

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async () => {
    const response = await apiGet('/users');
    return response.users || [];
  }
);

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData) => {
    const response = await apiPost('/users', userData);
    return response.user;
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, userData }) => {
    const response = await apiPut(`/users/${userId}`, userData);
    return response.user;
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId) => {
    await apiDelete(`/users/${userId}`);
    return userId;
  }
);

export const fetchAllOrders = createAsyncThunk(
  'admin/fetchAllOrders',
  async () => {
    const response = await apiGet('/orders');
    return response.orders || [];
  }
);

export const fetchAdminProducts = createAsyncThunk(
  'admin/fetchAdminProducts',
  async () => {
    const response = await apiGet('/products');
    return response.products || [];
  }
);

export const addProduct = createAsyncThunk(
  'admin/addProduct',
  async (productData) => {
    const response = await apiPost('/products', productData);
    return response.product;
  }
);

export const updateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ productId, productData }) => {
    const response = await apiPut(`/products/${productId}`, productData);
    return response.product;
  }
);

export const deleteProduct = createAsyncThunk(
  'admin/deleteProduct',
  async (productId) => {
    await apiDelete(`/products/${productId}`);
    return productId;
  }
);

export const updateShippingRate = createAsyncThunk(
  'admin/updateShippingRate',
  async (rateData) => {
    const response = await apiPut('/admin/shipping-rates', rateData);
    return response.shippingRates || [];
  }
);

const initialState = {
  users: [],
  orders: [],
  products: [],
  shippingRates: [],
  dashboardMetrics: {
    totalSales: 0,
    totalOrders: 0,
    activeUsers: 0,
    lowStockProducts: [],
  },
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    calculateDashboardMetrics: (state, action) => {
      const { orders, users, products } = action.payload;
      state.dashboardMetrics = {
        totalSales: orders.reduce((sum, o) => sum + o.total, 0),
        totalOrders: orders.length,
        activeUsers: users.length,
        lowStockProducts: products.filter(p => p.stock < 10),
      };
    },
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create User
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      // Fetch All Orders
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      // Fetch Admin Products
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      })
      // Add Product
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      // Update Product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
      })
      // Update Shipping Rate
      .addCase(updateShippingRate.fulfilled, (state, action) => {
        state.shippingRates = action.payload;
      });
  },
});

export const { calculateDashboardMetrics, clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
