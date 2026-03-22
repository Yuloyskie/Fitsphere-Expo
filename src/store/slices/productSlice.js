import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiDelete, apiGet, apiPost, apiPut } from '../../services/api';

const normalizeProduct = (product) => ({
  ...product,
  id: product.id || product._id,
  reviews: product.reviews || [],
  images: product.images?.length ? product.images : [product.image].filter(Boolean),
  rating: Number(product.rating || 0),
});

// Async thunks for products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const response = await apiGet('/products');
    return (response.products || []).map(normalizeProduct);
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async () => {
    const response = await apiGet('/categories');
    return (response.categories || []).map((category) => ({
      ...category,
      id: category.id || category._id,
    }));
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId) => {
    const response = await apiGet(`/products/${productId}`);
    const product = normalizeProduct(response.product);
    // Reviews are now included in the product response from backend
    if (response.product.reviews) {
      product.reviews = response.product.reviews;
    } else {
      // Fallback: fetch reviews separately if not included
      const reviewsRes = await apiGet(`/products/${productId}/reviews`);
      product.reviews = reviewsRes.reviews || [];
      product.rating = reviewsRes.rating || product.rating;
    }
    return product;
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query) => {
    const response = await apiGet(`/products?query=${encodeURIComponent(query)}`);
    return (response.products || []).map(normalizeProduct);
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async (categoryId) => {
    if (categoryId === 'all') {
      const response = await apiGet('/products');
      return (response.products || []).map(normalizeProduct);
    }

    const response = await apiGet(`/products?categoryId=${encodeURIComponent(categoryId)}`);
    return (response.products || []).map(normalizeProduct);
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (product) => {
    const payload = {
      ...product,
      images: product.images?.length ? product.images : [product.image],
      reviews: product.reviews || [],
      rating: product.rating || 0,
    };

    const response = await apiPost('/products', payload);
    return normalizeProduct(response.product);
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (product) => {
    const response = await apiPut(`/products/${product.id}`, product);
    return normalizeProduct(response.product);
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId) => {
    await apiDelete(`/products/${productId}`);
    return productId;
  }
);

export const submitReview = createAsyncThunk(
  'products/submitReview',
  async ({ productId, review }) => {
    const response = await apiPost(`/products/${productId}/reviews`, review);
    return { productId, review: response.review, productRating: response.productRating };
  }
);

export const updateReview = createAsyncThunk(
  'products/updateReview',
  async ({ productId, reviewId, userId, rating, comment }) => {
    await apiPut(`/reviews/${reviewId}`, {
      productId,
      userId,
      rating,
      comment,
    });
    return { productId, reviewId, changes: { rating, comment, updatedAt: new Date().toISOString() } };
  }
);

export const deleteReview = createAsyncThunk(
  'products/deleteReview',
  async ({ productId, reviewId, userId }) => {
    await apiDelete(`/reviews/${reviewId}`, { productId, userId });
    return { productId, reviewId };
  }
);

const recalculateRating = (product) => {
  if (!product || !product.reviews || product.reviews.length === 0) {
    product.rating = 0;
    return;
  }
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
};

const initialState = {
  products: [],
  categories: [],
  filteredProducts: [],
  selectedProduct: null,
  searchResults: [],
  loading: false,
  error: null,
  selectedCategory: 'all',
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    addReview: (state, action) => {
      const { productId, review } = action.payload;
      const product = state.products.find(p => p.id === productId);
      if (product) {
        product.reviews.push(review);
        recalculateRating(product);
      }

      if (state.selectedProduct?.id === productId) {
        state.selectedProduct.reviews = [...(state.selectedProduct.reviews || []), review];
        recalculateRating(state.selectedProduct);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.filteredProducts = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedProduct = action.payload;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.filteredProducts = action.payload;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
        state.filteredProducts = state.products;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
        state.filteredProducts = state.products;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
        if (state.selectedProduct?.id === action.payload) {
          state.selectedProduct = null;
        }
        state.filteredProducts = state.products;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        const { productId, review } = action.payload;
        
        // Update selectedProduct
        if (state.selectedProduct?.id === productId) {
          state.selectedProduct.reviews = [...(state.selectedProduct.reviews || []), review];
          recalculateRating(state.selectedProduct);
        }
        
        // Also update the product in the products list
        const productIndex = state.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          state.products[productIndex].reviews = [...(state.products[productIndex].reviews || []), review];
          recalculateRating(state.products[productIndex]);
        }
        
        // Also update the product in filteredProducts list
        const filteredIndex = state.filteredProducts.findIndex(p => p.id === productId);
        if (filteredIndex !== -1) {
          state.filteredProducts[filteredIndex].reviews = [...(state.filteredProducts[filteredIndex].reviews || []), review];
          recalculateRating(state.filteredProducts[filteredIndex]);
        }
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        const { productId, reviewId, changes } = action.payload;
        
        // Update selectedProduct
        if (state.selectedProduct?.id === productId) {
          state.selectedProduct.reviews = (state.selectedProduct.reviews || []).map(
            r => r.id === reviewId ? { ...r, ...changes } : r
          );
          recalculateRating(state.selectedProduct);
        }
        
        // Also update the product in the products list
        const productIndex = state.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          state.products[productIndex].reviews = (state.products[productIndex].reviews || []).map(
            r => r.id === reviewId ? { ...r, ...changes } : r
          );
          recalculateRating(state.products[productIndex]);
        }
        
        // Also update the product in filteredProducts list
        const filteredIndex = state.filteredProducts.findIndex(p => p.id === productId);
        if (filteredIndex !== -1) {
          state.filteredProducts[filteredIndex].reviews = (state.filteredProducts[filteredIndex].reviews || []).map(
            r => r.id === reviewId ? { ...r, ...changes } : r
          );
          recalculateRating(state.filteredProducts[filteredIndex]);
        }
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        const { productId, reviewId } = action.payload;
        
        // Update selectedProduct
        if (state.selectedProduct?.id === productId) {
          state.selectedProduct.reviews = (state.selectedProduct.reviews || []).filter(r => r.id !== reviewId);
          recalculateRating(state.selectedProduct);
        }
        
        // Also update the product in the products list
        const productIndex = state.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          state.products[productIndex].reviews = (state.products[productIndex].reviews || []).filter(r => r.id !== reviewId);
          recalculateRating(state.products[productIndex]);
        }
        
        // Also update the product in filteredProducts list
        const filteredIndex = state.filteredProducts.findIndex(p => p.id === productId);
        if (filteredIndex !== -1) {
          state.filteredProducts[filteredIndex].reviews = (state.filteredProducts[filteredIndex].reviews || []).filter(r => r.id !== reviewId);
          recalculateRating(state.filteredProducts[filteredIndex]);
        }
      });
  },
});

export const { setSelectedCategory, clearSearchResults, addReview } = productSlice.actions;
export default productSlice.reducer;
