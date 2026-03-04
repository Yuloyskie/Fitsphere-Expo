import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (userId) => {
    const ordersStr = await AsyncStorage.getItem('orders');
    let orders = ordersStr ? JSON.parse(ordersStr) : [];
    if (userId) {
      orders = orders.filter(order => order.userId === userId);
    }
    return orders;
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async ({ order, userId }, { getState }) => {
    const { cart, orders } = getState();
    const newOrder = {
      id: Date.now().toString(),
      userId,
      items: cart.items,
      total: cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0) - cart.discount,
      shippingDetails: order.shippingDetails,
      paymentMethod: order.paymentMethod,
      promoCode: cart.promoCode,
      discount: cart.discount,
      status: 'processing',
      createdAt: new Date().toISOString(),
      trackingNumber: `FS${Date.now()}`,
    };
    
    const ordersStr = await AsyncStorage.getItem('orders');
    const allOrders = ordersStr ? JSON.parse(ordersStr) : [];
    allOrders.push(newOrder);
    await AsyncStorage.setItem('orders', JSON.stringify(allOrders));
    
    return newOrder;
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }) => {
    const ordersStr = await AsyncStorage.getItem('orders');
    const allOrders = ordersStr ? JSON.parse(ordersStr) : [];
    const orderIndex = allOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
      allOrders[orderIndex].status = status;
      await AsyncStorage.setItem('orders', JSON.stringify(allOrders));
      return allOrders[orderIndex];
    }
    throw new Error('Order not found');
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId) => {
    const ordersStr = await AsyncStorage.getItem('orders');
    const allOrders = ordersStr ? JSON.parse(ordersStr) : [];
    const orderIndex = allOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1 && allOrders[orderIndex].status !== 'delivered') {
      allOrders[orderIndex].status = 'cancelled';
      await AsyncStorage.setItem('orders', JSON.stringify(allOrders));
      return allOrders[orderIndex];
    }
    throw new Error('Order cannot be cancelled');
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
