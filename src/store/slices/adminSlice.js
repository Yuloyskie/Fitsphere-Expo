import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async () => {
    const usersStr = await AsyncStorage.getItem('users');
    return usersStr ? JSON.parse(usersStr) : [];
  }
);

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData) => {
    const usersStr = await AsyncStorage.getItem('users');
    const users = usersStr ? JSON.parse(usersStr) : [];
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await AsyncStorage.setItem('users', JSON.stringify(users));
    return newUser;
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, userData }) => {
    const usersStr = await AsyncStorage.getItem('users');
    const users = usersStr ? JSON.parse(usersStr) : [];
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      await AsyncStorage.setItem('users', JSON.stringify(users));
      return users[index];
    }
    throw new Error('User not found');
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId) => {
    const usersStr = await AsyncStorage.getItem('users');
    let users = usersStr ? JSON.parse(usersStr) : [];
    users = users.filter(u => u.id !== userId);
    await AsyncStorage.setItem('users', JSON.stringify(users));
    return userId;
  }
);

export const fetchAllOrders = createAsyncThunk(
  'admin/fetchAllOrders',
  async () => {
    const ordersStr = await AsyncStorage.getItem('orders');
    return ordersStr ? JSON.parse(ordersStr) : [];
  }
);

export const fetchAdminProducts = createAsyncThunk(
  'admin/fetchAdminProducts',
  async () => {
    const productsStr = await AsyncStorage.getItem('adminProducts');
    return productsStr ? JSON.parse(productsStr) : [];
  }
);

export const addProduct = createAsyncThunk(
  'admin/addProduct',
  async (productData) => {
    const productsStr = await AsyncStorage.getItem('adminProducts');
    const products = productsStr ? JSON.parse(productsStr) : [];
    const newProduct = {
      id: Date.now().toString(),
      ...productData,
      createdAt: new Date().toISOString(),
    };
    products.push(newProduct);
    await AsyncStorage.setItem('adminProducts', JSON.stringify(products));
    return newProduct;
  }
);

export const updateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ productId, productData }) => {
    const productsStr = await AsyncStorage.getItem('adminProducts');
    const products = productsStr ? JSON.parse(productsStr) : [];
    const index = products.findIndex(p => p.id === productId);
    
    if (index !== -1) {
      products[index] = { ...products[index], ...productData };
      await AsyncStorage.setItem('adminProducts', JSON.stringify(products));
      return products[index];
    }
    throw new Error('Product not found');
  }
);

export const deleteProduct = createAsyncThunk(
  'admin/deleteProduct',
  async (productId) => {
    const productsStr = await AsyncStorage.getItem('adminProducts');
    let products = productsStr ? JSON.parse(productsStr) : [];
    products = products.filter(p => p.id !== productId);
    await AsyncStorage.setItem('adminProducts', JSON.stringify(products));
    return productId;
  }
);

export const updateShippingRate = createAsyncThunk(
  'admin/updateShippingRate',
  async (rateData) => {
    const ratesStr = await AsyncStorage.getItem('shippingRates');
    let rates = ratesStr ? JSON.parse(ratesStr) : [];
    const index = rates.findIndex(r => r.id === rateData.id);
    
    if (index !== -1) {
      rates[index] = rateData;
    } else {
      rates.push({ ...rateData, id: Date.now().toString() });
    }
    
    await AsyncStorage.setItem('shippingRates', JSON.stringify(rates));
    return rates;
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
