import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { products as mockProducts, categories as mockCategories } from '../../data/mockData';

// Async thunks for products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProducts;
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCategories;
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProducts.find(p => p.id === productId);
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const filtered = mockProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
    return filtered;
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async (categoryId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (categoryId === 'all') {
      return mockProducts;
    }
    return mockProducts.filter(p => p.categoryId === categoryId);
  }
);

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
        product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
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
      });
  },
});

export const { setSelectedCategory, clearSearchResults, addReview } = productSlice.actions;
export default productSlice.reducer;
