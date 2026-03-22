import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiDelete, apiGet, apiPost, apiPut } from '../../services/api';

const ADMIN_EMAILS = ['admin@fitsphere.com', 'admin@firsphere.com'];
const ADMIN_PASSWORD = 'admin123';

// Async thunks for authentication
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const response = await apiPost('/auth/login', { email: normalizedEmail, password });
      const isExactAdmin = ADMIN_EMAILS.includes(normalizedEmail) && password === ADMIN_PASSWORD;
      const user = {
        ...response.user,
        role: isExactAdmin ? 'admin' : 'user',
      };
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ fullName, email, password }, { rejectWithValue }) => {
    try {
      const response = await apiPost('/auth/register', { fullName, email, password });
      const user = response.user;
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await AsyncStorage.removeItem('user');
    return null;
  }
);

// Google Login
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const user = { 
        id: 'google_' + Date.now().toString(), 
        email: 'user@gmail.com', 
        name: 'Google User', 
        role: 'user', 
        avatar: 'https://via.placeholder.com/150',
        provider: 'google'
      };
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Facebook Login
export const facebookLogin = createAsyncThunk(
  'auth/facebookLogin',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const user = { 
        id: 'facebook_' + Date.now().toString(), 
        email: 'user@facebook.com', 
        name: 'Facebook User', 
        role: 'user', 
        avatar: 'https://via.placeholder.com/150',
        provider: 'facebook'
      };
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ name, email, phone, profileImage, avatar }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      const response = await apiPut(`/auth/users/${user.id}`, {
        fullName: name || user.fullName || user.name,
        email: email || user.email,
        phone: phone || user.phone || '',
        profileImage: profileImage || user.profileImage || null,
        avatar: avatar || user.avatar,
      });

      const updatedUser = response.user;
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAccount = createAsyncThunk(
  'auth/fetchAccount',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiGet(`/auth/users/${userId}`);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (userId, { rejectWithValue }) => {
    try {
      await apiDelete(`/auth/users/${userId}`);
      await AsyncStorage.removeItem('user');
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  showLanding: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setShowLanding: (state, action) => {
      state.showLanding = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.showLanding = true;
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Facebook Login
      .addCase(facebookLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(facebookLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(facebookLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Fetch Account
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Delete Account
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setShowLanding } = authSlice.actions;
export default authSlice.reducer;
