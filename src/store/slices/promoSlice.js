import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const fetchPromoCodes = createAsyncThunk(
  'promo/fetchPromoCodes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/promo-codes');
      return response.data.promoCodes || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch promo codes');
    }
  }
);

export const validatePromoCode = createAsyncThunk(
  'promo/validatePromoCode',
  async (code, { rejectWithValue }) => {
    try {
      const response = await api.get(`/promo-codes/${code}/validate`);
      return response.data.promoCode;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid promo code');
    }
  }
);

export const createPromoCode = createAsyncThunk(
  'promo/createPromoCode',
  async (promoData, { rejectWithValue }) => {
    try {
      const response = await api.post('/promo-codes', promoData);
      return response.data.promoCode;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create promo code');
    }
  }
);

export const updatePromoCode = createAsyncThunk(
  'promo/updatePromoCode',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/promo-codes/${id}`, data);
      return response.data.promoCode;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update promo code');
    }
  }
);

export const deletePromoCode = createAsyncThunk(
  'promo/deletePromoCode',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/promo-codes/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete promo code');
    }
  }
);

export const usePromoCode = createAsyncThunk(
  'promo/usePromoCode',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/promo-codes/${id}/use`);
      return response.data.promoCode;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to use promo code');
    }
  }
);

const initialState = {
  promoCodes: [],
  selectedPromoCode: null,
  loading: false,
  error: null,
};

const promoSlice = createSlice({
  name: 'promo',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedPromoCode: (state, action) => {
      state.selectedPromoCode = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch promo codes
    builder
      .addCase(fetchPromoCodes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromoCodes.fulfilled, (state, action) => {
        state.loading = false;
        state.promoCodes = action.payload;
      })
      .addCase(fetchPromoCodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Validate promo code
    builder
      .addCase(validatePromoCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validatePromoCode.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPromoCode = action.payload;
      })
      .addCase(validatePromoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedPromoCode = null;
      });

    // Create promo code
    builder
      .addCase(createPromoCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPromoCode.fulfilled, (state, action) => {
        state.loading = false;
        state.promoCodes.unshift(action.payload);
      })
      .addCase(createPromoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update promo code
    builder
      .addCase(updatePromoCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePromoCode.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.promoCodes.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.promoCodes[index] = action.payload;
        }
      })
      .addCase(updatePromoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete promo code
    builder
      .addCase(deletePromoCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePromoCode.fulfilled, (state, action) => {
        state.loading = false;
        state.promoCodes = state.promoCodes.filter(p => p.id !== action.payload);
      })
      .addCase(deletePromoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Use promo code
    builder
      .addCase(usePromoCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(usePromoCode.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedPromoCode?.id === action.payload.id) {
          state.selectedPromoCode = action.payload;
        }
      })
      .addCase(usePromoCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelectedPromoCode } = promoSlice.actions;
export default promoSlice.reducer;
