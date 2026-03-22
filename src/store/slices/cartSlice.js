import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save cart to AsyncStorage
export const saveCartToStorage = createAsyncThunk(
  'cart/saveCartToStorage',
  async (items) => {
    await AsyncStorage.setItem('cart', JSON.stringify(items));
    return items;
  }
);

export const loadCart = createAsyncThunk(
  'cart/loadCart',
  async () => {
    const cartStr = await AsyncStorage.getItem('cart');
    if (cartStr) {
      return JSON.parse(cartStr);
    }
    return [];
  }
);

export const clearCartStorage = createAsyncThunk(
  'cart/clearCartStorage',
  async () => {
    await AsyncStorage.removeItem('cart');
    return [];
  }
);

const initialState = {
  items: [],
  loading: false,
  promoCode: null,
  discount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, size } = action.payload;
      const existingItem = state.items.find(
        item => item.product.id === product.id && item.size === size
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity, size });
      }
      // Auto-save to AsyncStorage
      AsyncStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const { productId, size } = action.payload;
      state.items = state.items.filter(
        item => !(item.product.id === productId && item.size === size)
      );
      AsyncStorage.setItem('cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { productId, size, quantity } = action.payload;
      const item = state.items.find(
        item => item.product.id === productId && item.size === size
      );
      if (item) {
        item.quantity = quantity;
      }
      AsyncStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      state.promoCode = null;
      state.discount = 0;
      AsyncStorage.setItem('cart', JSON.stringify(state.items));
    },
    applyPromoCode: (state, action) => {
      const { code, discount } = action.payload;
      state.promoCode = code;
      state.discount = discount;
    },
    removePromoCode: (state) => {
      state.promoCode = null;
      state.discount = 0;
      AsyncStorage.setItem('cart', JSON.stringify(state.items));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(saveCartToStorage.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(clearCartStorage.fulfilled, (state) => {
        state.items = [];
        state.promoCode = null;
        state.discount = 0;
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, applyPromoCode, removePromoCode } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.items.reduce(
  (total, item) => total + (item.product.price * item.quantity), 0
);
export const selectCartCount = (state) => state.cart.items.reduce(
  (count, item) => count + item.quantity, 0
);

export default cartSlice.reducer;
