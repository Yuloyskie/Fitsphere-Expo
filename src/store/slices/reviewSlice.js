import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiDelete, apiGet, apiPost, apiPut } from '../../services/api';

// Async thunks for reviews
export const fetchAllReviews = createAsyncThunk(
  'reviews/fetchAllReviews',
  async () => {
    const response = await apiGet('/reviews');
    return response.reviews || [];
  }
);

export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async (productId) => {
    const response = await apiGet(`/products/${productId}/reviews`);
    return response.reviews || [];
  }
);

export const fetchUserReviews = createAsyncThunk(
  'reviews/fetchUserReviews',
  async (userId) => {
    const response = await apiGet(`/reviews?userId=${encodeURIComponent(userId)}`);
    return response.reviews || [];
  }
);

export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async ({ productId, review }) => {
    const response = await apiPost(`/products/${productId}/reviews`, review);
    return { productId, review: response.review, productRating: response.productRating };
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ productId, reviewId, changes }) => {
    const response = await apiPut(`/products/${productId}/reviews/${reviewId}`, changes);
    return { productId, reviewId, changes, updatedReview: response.review };
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async ({ productId, reviewId }) => {
    await apiDelete(`/products/${productId}/reviews/${reviewId}`);
    return { productId, reviewId };
  }
);

export const approveReview = createAsyncThunk(
  'reviews/approveReview',
  async ({ productId, reviewId }) => {
    const response = await apiPut(`/products/${productId}/reviews/${reviewId}/approve`, { approved: true });
    return { productId, reviewId, review: response.review };
  }
);

export const rejectReview = createAsyncThunk(
  'reviews/rejectReview',
  async ({ productId, reviewId, reason }) => {
    const response = await apiPut(`/products/${productId}/reviews/${reviewId}/reject`, { approved: false, rejectionReason: reason });
    return { productId, reviewId, review: response.review };
  }
);

export const flagReview = createAsyncThunk(
  'reviews/flagReview',
  async ({ productId, reviewId, reason }) => {
    const response = await apiPut(`/products/${productId}/reviews/${reviewId}/flag`, { flagged: true, flagReason: reason });
    return { productId, reviewId, review: response.review };
  }
);

export const respondToReview = createAsyncThunk(
  'reviews/respondToReview',
  async ({ productId, reviewId, response: responseText }) => {
    const response = await apiPut(`/products/${productId}/reviews/${reviewId}/respond`, { sellerResponse: responseText });
    return { productId, reviewId, review: response.review };
  }
);

const initialState = {
  allReviews: [],
  productReviews: {},
  userReviews: [],
  filteredReviews: [],
  loading: false,
  error: null,
  selectedReview: null,
  filter: {
    rating: 'all',
    status: 'all',
    sortBy: 'recent',
  },
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setReviewFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearFilter: (state) => {
      state.filter = initialState.filter;
    },
    selectReview: (state, action) => {
      state.selectedReview = action.payload;
    },
    clearSelectedReview: (state) => {
      state.selectedReview = null;
    },
    setFilteredReviews: (state, action) => {
      state.filteredReviews = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all reviews
      .addCase(fetchAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.allReviews = action.payload;
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch product reviews
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        const productId = action.meta.arg;
        state.productReviews[productId] = action.payload;
      })
      // Fetch user reviews
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.userReviews = action.payload;
      })
      // Submit review
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, review } = action.payload;
        if (!state.productReviews[productId]) {
          state.productReviews[productId] = [];
        }
        state.productReviews[productId].push(review);
        state.allReviews.push(review);
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update review
      .addCase(updateReview.fulfilled, (state, action) => {
        const { productId, reviewId, updatedReview } = action.payload;
        if (state.productReviews[productId]) {
          const index = state.productReviews[productId].findIndex(r => r.id === reviewId);
          if (index !== -1) {
            state.productReviews[productId][index] = updatedReview;
          }
        }
        const allReviewIndex = state.allReviews.findIndex(r => r.id === reviewId);
        if (allReviewIndex !== -1) {
          state.allReviews[allReviewIndex] = updatedReview;
        }
        if (state.selectedReview?.id === reviewId) {
          state.selectedReview = updatedReview;
        }
      })
      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        const { productId, reviewId } = action.payload;
        if (state.productReviews[productId]) {
          state.productReviews[productId] = state.productReviews[productId].filter(r => r.id !== reviewId);
        }
        state.allReviews = state.allReviews.filter(r => r.id !== reviewId);
        state.userReviews = state.userReviews.filter(r => r.id !== reviewId);
        if (state.selectedReview?.id === reviewId) {
          state.selectedReview = null;
        }
      })
      // Approve review
      .addCase(approveReview.fulfilled, (state, action) => {
        const { productId, reviewId, review } = action.payload;
        if (state.productReviews[productId]) {
          const index = state.productReviews[productId].findIndex(r => r.id === reviewId);
          if (index !== -1) {
            state.productReviews[productId][index] = review;
          }
        }
        const allReviewIndex = state.allReviews.findIndex(r => r.id === reviewId);
        if (allReviewIndex !== -1) {
          state.allReviews[allReviewIndex] = review;
        }
        if (state.selectedReview?.id === reviewId) {
          state.selectedReview = review;
        }
      })
      // Reject review
      .addCase(rejectReview.fulfilled, (state, action) => {
        const { productId, reviewId, review } = action.payload;
        if (state.productReviews[productId]) {
          const index = state.productReviews[productId].findIndex(r => r.id === reviewId);
          if (index !== -1) {
            state.productReviews[productId][index] = review;
          }
        }
        const allReviewIndex = state.allReviews.findIndex(r => r.id === reviewId);
        if (allReviewIndex !== -1) {
          state.allReviews[allReviewIndex] = review;
        }
        if (state.selectedReview?.id === reviewId) {
          state.selectedReview = review;
        }
      })
      // Flag review
      .addCase(flagReview.fulfilled, (state, action) => {
        const { productId, reviewId, review } = action.payload;
        if (state.productReviews[productId]) {
          const index = state.productReviews[productId].findIndex(r => r.id === reviewId);
          if (index !== -1) {
            state.productReviews[productId][index] = review;
          }
        }
        const allReviewIndex = state.allReviews.findIndex(r => r.id === reviewId);
        if (allReviewIndex !== -1) {
          state.allReviews[allReviewIndex] = review;
        }
        if (state.selectedReview?.id === reviewId) {
          state.selectedReview = review;
        }
      })
      // Respond to review
      .addCase(respondToReview.fulfilled, (state, action) => {
        const { productId, reviewId, review } = action.payload;
        if (state.productReviews[productId]) {
          const index = state.productReviews[productId].findIndex(r => r.id === reviewId);
          if (index !== -1) {
            state.productReviews[productId][index] = review;
          }
        }
        const allReviewIndex = state.allReviews.findIndex(r => r.id === reviewId);
        if (allReviewIndex !== -1) {
          state.allReviews[allReviewIndex] = review;
        }
        if (state.selectedReview?.id === reviewId) {
          state.selectedReview = review;
        }
      });
  },
});

export const { setReviewFilter, clearFilter, selectReview, clearSelectedReview, setFilteredReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
