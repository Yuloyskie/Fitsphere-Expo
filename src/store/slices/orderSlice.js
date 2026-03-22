import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGet, apiPatch, apiPost, apiDelete } from '../../services/api';

// Async thunks for orders
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (userId) => {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const response = await apiGet(`/orders${query}`);
    return response.orders || [];
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId) => {
    const response = await apiGet(`/orders/${orderId}`);
    return response.order;
  }
);

export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAllOrders',
  async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    console.log('🚀 fetchAllOrders: Calling API endpoint /orders' + query);
    const response = await apiGet(`/orders${query}`);
    console.log('📥 fetchAllOrders: Received response from API with', response.orders?.length || 0, 'orders');
    if (response.orders && response.orders.length > 0) {
      console.log('💾 Sample order from API:', {
        id: response.orders[0].id,
        total: response.orders[0].total,
        status: response.orders[0].status,
        source: 'MongoDB database via /api/orders'
      });
    }
    return response.orders || [];
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async ({ order, userId }, { getState }) => {
    const { cart } = getState();
    const subtotal = cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    const discountAmount = subtotal * (cart.discount / 100);
    const total = subtotal - discountAmount;

    const payload = {
      userId,
      items: cart.items,
      subtotal,
      discount: cart.discount,
      total,
      shippingInfo: order.shippingInfo || order.shippingDetails,
      paymentMethod: order.paymentMethod,
      promoCode: cart.promoCode,
      status: 'pending',
      trackingNumber: `FS${Date.now()}`,
    };

    const response = await apiPost('/orders', payload);
    return response.order;
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }) => {
    const response = await apiPatch(`/orders/${orderId}/status`, { status });
    return response.order;
  }
);

export const updatePaymentStatus = createAsyncThunk(
  'orders/updatePaymentStatus',
  async ({ orderId, paymentStatus }) => {
    const response = await apiPatch(`/orders/${orderId}`, { paymentStatus });
    return response.order;
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ orderId, updates }) => {
    const response = await apiPatch(`/orders/${orderId}`, updates);
    return response.order;
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId) => {
    const response = await apiPatch(`/orders/${orderId}/cancel`, {});
    return response.order;
  }
);

export const returnOrder = createAsyncThunk(
  'orders/returnOrder',
  async ({ orderId, reason }) => {
    const response = await apiPost(`/orders/${orderId}/return`, { reason });
    return response.order;
  }
);

export const refundOrder = createAsyncThunk(
  'orders/refundOrder',
  async ({ orderId, refundAmount, reason }) => {
    const response = await apiPost(`/orders/${orderId}/refund`, { refundAmount, reason });
    return response.order;
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (orderId) => {
    await apiDelete(`/orders/${orderId}`);
    return orderId;
  }
);

const initialState = {
  orders: [],
  allOrders: [],
  currentOrder: null,
  selectedOrder: null,
  loading: false,
  error: null,
  filter: {
    status: 'all',
    sortBy: 'recent',
    searchQuery: '',
  },
  stats: {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  },
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    selectOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    setOrderFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearOrderFilter: (state) => {
      state.filter = initialState.filter;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.allOrders = [];
      state.currentOrder = null;
      state.selectedOrder = null;
      state.loading = false;
      state.error = null;
      state.stats = initialState.stats;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders by user
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch all orders (admin)
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrders = action.payload;
        console.log('✅ Redux: Updated allOrders with', action.payload.length, 'orders from database');
        // Calculate stats
        state.stats.totalOrders = action.payload.length;
        state.stats.totalRevenue = action.payload.reduce((sum, order) => sum + (order.total || 0), 0);
        state.stats.pendingOrders = action.payload.filter(o => o.status === 'pending').length;
        state.stats.deliveredOrders = action.payload.filter(o => o.status === 'delivered').length;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch order by ID
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.selectedOrder = action.payload;
      })
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
        state.allOrders.unshift(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        const allIndex = state.allOrders.findIndex(o => o.id === action.payload.id);
        if (allIndex !== -1) {
          state.allOrders[allIndex] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
      })
      // Update payment status
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        const allIndex = state.allOrders.findIndex(o => o.id === action.payload.id);
        if (allIndex !== -1) {
          state.allOrders[allIndex] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
      })
      // Update order
      .addCase(updateOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        const allIndex = state.allOrders.findIndex(o => o.id === action.payload.id);
        if (allIndex !== -1) {
          state.allOrders[allIndex] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
      })
      // Cancel order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        const allIndex = state.allOrders.findIndex(o => o.id === action.payload.id);
        if (allIndex !== -1) {
          state.allOrders[allIndex] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      // Return order
      .addCase(returnOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      // Refund order
      .addCase(refundOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      // Delete order
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(o => o.id !== action.payload);
        state.allOrders = state.allOrders.filter(o => o.id !== action.payload);
        if (state.currentOrder?.id === action.payload) {
          state.currentOrder = null;
        }
        if (state.selectedOrder?.id === action.payload) {
          state.selectedOrder = null;
        }
      });
  },
});

export const { clearCurrentOrder, selectOrder, clearSelectedOrder, setOrderFilter, clearOrderFilter, clearOrders } = orderSlice.actions;
export default orderSlice.reducer;
