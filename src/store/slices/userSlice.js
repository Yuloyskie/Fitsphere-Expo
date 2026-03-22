import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGet, apiPut } from '../../services/api';

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ name, email, avatar, phone, profileImage }, { getState }) => {
    const { auth } = getState();
    const response = await apiPut(`/users/${auth.user.id}`, {
      name: name || auth.user.name,
      email: email || auth.user.email,
      avatar: avatar || auth.user.avatar,
      phone: phone || auth.user.phone || '',
      profileImage: profileImage || auth.user.profileImage || null,
    });

    const updatedUser = response.user;
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }
);

export const updatePassword = createAsyncThunk(
  'user/updatePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (currentPassword && newPassword) {
      // In real app, validate current password
      return { success: true };
    }
    return rejectWithValue('Invalid password');
  }
);

export const fetchUserReviews = createAsyncThunk(
  'user/fetchUserReviews',
  async (userId) => {
    const response = await apiGet(`/reviews?userId=${encodeURIComponent(userId)}`);
    return response.reviews || [];
  }
);

const initialState = {
  profile: null,
  reviews: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.reviews = action.payload;
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
