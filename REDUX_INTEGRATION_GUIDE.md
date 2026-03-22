# Redux Integration Guide - Orders, Products, and Reviews

## Overview

This document explains the complete Redux implementation for Order, Product, and Review management in the FitSphere app.

---

## Redux Architecture

### Store Structure
```javascript
// src/store/index.js
{
  auth: authReducer,          // Authentication state
  products: productReducer,   // Products and categories
  cart: cartReducer,          // Shopping cart
  orders: orderReducer,       // ✅ ENHANCED - Orders with admin features
  users: userReducer,         // User data
  admin: adminReducer,        // Admin state
  reviews: reviewReducer,     // ✅ NEW - Dedicated review management
}
```

---

## 1. ORDER MANAGEMENT (orderSlice.js)

### State Structure
```javascript
{
  orders: [],                  // User's orders
  allOrders: [],              // All orders (admin view)
  currentOrder: null,         // Currently viewed order
  selectedOrder: null,        // Selected order for admin
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
}
```

### Available Thunks (Async Actions)

#### Fetch Orders
```javascript
// Fetch user's orders
dispatch(fetchOrders(userId)).unwrap()

// Fetch all orders (admin)
dispatch(fetchAllOrders({
  status: 'pending',      // optional
  search: 'order',        // optional
  startDate: '2024-01-01', // optional
  endDate: '2024-12-31',  // optional
  sortBy: 'recent'        // optional
})).unwrap()

// Fetch specific order
dispatch(fetchOrderById(orderId)).unwrap()
```

#### Create Order
```javascript
dispatch(createOrder({
  order: {
    shippingInfo: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
    },
    paymentMethod: 'credit_card',
  },
  userId: user.id,
})).unwrap()
```

#### Update Order Status
```javascript
dispatch(updateOrderStatus({
  orderId: 'order_123',
  status: 'processing', // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
})).unwrap()
```

#### Update Order
```javascript
dispatch(updateOrder({
  orderId: 'order_123',
  updates: {
    trackingNumber: 'TRK123456',
    estimatedDelivery: '2024-03-25',
    // Add any partial order updates
  },
})).unwrap()
```

#### Cancel/Return/Refund
```javascript
// Cancel order
dispatch(cancelOrder(orderId)).unwrap()

// Return order
dispatch(returnOrder({
  orderId: 'order_123',
  reason: 'Product defective',
})).unwrap()

// Process refund
dispatch(refundOrder({
  orderId: 'order_123',
  refundAmount: 50.00,
  reason: 'Partial refund for damage',
})).unwrap()
```

### Sync Actions (Reducers)
```javascript
// Clear current order
dispatch(clearCurrentOrder())

// Select order for viewing
dispatch(selectOrder(orderData))

// Clear selection
dispatch(clearSelectedOrder())

// Set filter
dispatch(setOrderFilter({
  status: 'shipped',
  sortBy: 'oldest',
  searchQuery: 'customer name',
}))

// Clear all filters
dispatch(clearOrderFilter())
```

### Usage Examples

#### In Components

**Fetch user orders:**
```javascript
import { fetchOrders } from '../../store/slices/orderSlice';
import { useDispatch, useSelector } from 'react-redux';

function OrderHistoryScreen({ navigation }) {
  const dispatch = useDispatch();
  const orders = useSelector(state => state.orders.orders);
  const loading = useSelector(state => state.orders.loading);
  
  useEffect(() => {
    dispatch(fetchOrders(user.id));
  }, []);
  
  return (
    <FlatList
      data={orders}
      renderItem={({ item }) => (
        <OrderCard order={item} />
      )}
    />
  );
}
```

**Admin: Fetch all orders with filters:**
```javascript
function AdminOrdersScreen() {
  const dispatch = useDispatch();
  const allOrders = useSelector(state => state.orders.allOrders);
  const stats = useSelector(state => state.orders.stats);
  
  useEffect(() => {
    dispatch(fetchAllOrders({
      status: 'all',
      sortBy: 'recent',
    }));
  }, []);
  
  return (
    <View>
      <Text>Total Orders: {stats.totalOrders}</Text>
      <Text>Total Revenue: ${stats.totalRevenue}</Text>
      <FlatList
        data={allOrders}
        renderItem={({ item }) => (
          <OrderCard order={item} />
        )}
      />
    </View>
  );
}
```

**Update order status:**
```javascript
const handleUpdateStatus = async (orderId, newStatus) => {
  try {
    const result = await dispatch(updateOrderStatus({
      orderId,
      status: newStatus,
    })).unwrap();
    
    Alert.alert('Success', 'Order updated');
    
    // Send notification
    await notificationService.sendLocalNotification(
      'Order Status Update',
      `Your order is now ${newStatus}`,
      { orderId, type: 'order_update' }
    );
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

---

## 2. PRODUCT MANAGEMENT (productSlice.js)

### State Structure
```javascript
{
  products: [],           // All products
  categories: [],         // Product categories
  filteredProducts: [],   // Filtered results
  selectedProduct: null,  // Currently viewed product
  searchResults: [],      // Search results
  loading: false,
  error: null,
  selectedCategory: 'all',
}
```

### Available Thunks

#### Fetch Operations
```javascript
// Fetch all products
dispatch(fetchProducts()).unwrap()

// Fetch categories
dispatch(fetchCategories()).unwrap()

// Fetch single product with reviews
dispatch(fetchProductById(productId)).unwrap()

// Search products
dispatch(searchProducts('treadmill')).unwrap()

// Fetch by category
dispatch(fetchProductsByCategory(categoryId)).unwrap()
// Pass 'all' to get all products
dispatch(fetchProductsByCategory('all')).unwrap()
```

#### CRUD Operations
```javascript
// Create product (admin)
dispatch(createProduct({
  name: 'Smart Treadmill',
  description: 'Advanced treadmill',
  price: 999.99,
  originalPrice: 1299.99,
  category: 'Cardio Equipment',
  stock: 50,
  brand: 'FitPro',
  image: 'image_url',
  images: [], // optional array
})).unwrap()

// Update product (admin)
dispatch(updateProduct({
  id: 'product_123',
  name: 'Updated Name',
  price: 899.99,
  // Update any fields
})).unwrap()

// Delete product (admin)
dispatch(deleteProduct(productId)).unwrap()
```

### Product Reducer Actions
```javascript
// Set selected category
dispatch(setSelectedCategory('Strength Training Equipment'))

// Clear search results
dispatch(clearSearchResults())

// Add review (for backwards compatibility)
dispatch(addReview({
  productId: 'prod_123',
  review: { id, rating, comment, userId }
}))
```

### Usage Examples

**Fetch products:**
```javascript
function HomeScreen() {
  const dispatch = useDispatch();
  const products = useSelector(state => state.products.products);
  
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchProducts());
    }, [dispatch])
  );
  
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
}
```

**Search with filters:**
```javascript
function SearchScreen() {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const searchResults = useSelector(state => state.products.searchResults);
  
  const handleSearch = debounce((text) => {
    if (text.length > 2) {
      dispatch(searchProducts(text));
    }
  }, 500);
  
  return (
    <TextInput
      placeholder="Search products..."
      onChangeText={(text) => {
        setQuery(text);
        handleSearch(text);
      }}
    />
  );
}
```

**Admin: Create product:**
```javascript
const handleCreateProduct = async (formData) => {
  try {
    const result = await dispatch(createProduct(formData)).unwrap();
    Alert.alert('Success', 'Product created');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

---

## 3. REVIEW MANAGEMENT (reviewSlice.js) ✅ NEW

### State Structure
```javascript
{
  allReviews: [],         // All reviews (admin)
  productReviews: {},     // Reviews by product ID
  userReviews: [],        // Current user's reviews
  filteredReviews: [],    // Filtered review list
  loading: false,
  error: null,
  selectedReview: null,   // Currently selected review
  filter: {
    rating: 'all',        // '1' to '5' or 'all'
    status: 'all',        // 'pending', 'approved', 'flagged', 'all'
    sortBy: 'recent',     // 'recent', 'oldest', 'highest', 'lowest'
  },
}
```

### Available Thunks

#### Fetch Reviews
```javascript
// Fetch all reviews (admin)
dispatch(fetchAllReviews()).unwrap()

// Fetch product reviews
dispatch(fetchProductReviews(productId)).unwrap()

// Fetch user's own reviews
dispatch(fetchUserReviews(userId)).unwrap()
```

#### Review Operations
```javascript
// Submit new review
dispatch(submitReview({
  productId: 'prod_123',
  review: {
    userId: 'user_123',
    userName: 'John Doe',
    rating: 5,
    comment: 'Great product!',
    createdAt: new Date().toISOString(),
  },
})).unwrap()

// Update review
dispatch(updateReview({
  productId: 'prod_123',
  reviewId: 'rev_123',
  changes: {
    rating: 4,
    comment: 'Updated review',
    updatedAt: new Date().toISOString(),
  },
})).unwrap()

// Delete review
dispatch(deleteReview({
  productId: 'prod_123',
  reviewId: 'rev_123',
})).unwrap()
```

#### Admin Review Moderation
```javascript
// Approve review
dispatch(approveReview({
  productId: 'prod_123',
  reviewId: 'rev_123',
})).unwrap()

// Reject review
dispatch(rejectReview({
  productId: 'prod_123',
  reviewId: 'rev_123',
  reason: 'Inappropriate language',
})).unwrap()

// Flag review
dispatch(flagReview({
  productId: 'prod_123',
  reviewId: 'rev_123',
  reason: 'Spam content',
})).unwrap()

// Respond to review
dispatch(respondToReview({
  productId: 'prod_123',
  reviewId: 'rev_123',
  response: 'Thank you for your review!',
})).unwrap()
```

### Sync Actions
```javascript
// Set filter
dispatch(setReviewFilter({
  rating: '5',
  status: 'approved',
  sortBy: 'recent',
}))

// Clear filters
dispatch(clearFilter())

// Select review for viewing
dispatch(selectReview(reviewData))

// Clear selection
dispatch(clearSelectedReview())

// Manually set filtered results
dispatch(setFilteredReviews(filteredArray))
```

### Usage Examples

**Customer: Submit review:**
```javascript
function ReviewsScreen({ route }) {
  const { productId } = route.params;
  const dispatch = useDispatch();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const handleSubmit = async () => {
    try {
      await dispatch(submitReview({
        productId,
        review: {
          userId: user.id,
          userName: user.name,
          rating,
          comment,
          createdAt: new Date().toISOString(),
        },
      })).unwrap();
      
      Alert.alert('Success', 'Review submitted!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  return (
    <View>
      <StarRating value={rating} onChange={setRating} />
      <TextInput
        placeholder="Write your review..."
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <Button onPress={handleSubmit} title="Submit" />
    </View>
  );
}
```

**Admin: Manage reviews:**
```javascript
function AdminReviewsScreen() {
  const dispatch = useDispatch();
  const allReviews = useSelector(state => state.reviews.allReviews);
  const filter = useSelector(state => state.reviews.filter);
  
  useEffect(() => {
    dispatch(fetchAllReviews());
  }, []);
  
  const handleApprove = (review) => {
    dispatch(approveReview({
      productId: review.productId,
      reviewId: review.id,
    }));
  };
  
  const handleRespond = (reviewId, productId, response) => {
    dispatch(respondToReview({
      productId,
      reviewId,
      response,
    }));
  };
  
  return (
    <View>
      <FilterChips
        ratings={['all', '1', '2', '3', '4', '5']}
        statuses={['all', 'pending', 'approved', 'flagged']}
        onRatingSelect={(r) => dispatch(setReviewFilter({ rating: r }))}
        onStatusSelect={(s) => dispatch(setReviewFilter({ status: s }))}
      />
      
      <FlatList
        data={allReviews}
        renderItem={({ item }) => (
          <ReviewCard
            review={item}
            onApprove={() => handleApprove(item)}
            onRespond={(text) => handleRespond(item.id, item.productId, text)}
          />
        )}
      />
    </View>
  );
}
```

---

## Data Flow Diagrams

### Order Flow
```
CheckoutScreen
    ↓
dispatch(createOrder(...))
    ↓
orderSlice - createOrder thunk
    ↓
API POST /orders
    ↓
state.orders updated
    ↓
clearCart()
    ↓
Navigate to Order History
```

### Product Flow
```
HomeScreen/SearchScreen
    ↓
dispatch(fetchProducts/searchProducts(...))
    ↓
productSlice - fetch thunk
    ↓
API GET /products
    ↓
state.products updated
    ↓
Re-render with new products
```

### Review Flow
```
ReviewsScreen
    ↓
dispatch(submitReview(...))
    ↓
reviewSlice - submitReview thunk
    ↓
API POST /products/{id}/reviews
    ↓
state.reviews.allReviews + state.reviews.productReviews updated
    ↓
Product rating recalculated
    ↓
Success alert
```

---

## Selector Examples

### Getting Data
```javascript
// Orders
const orders = useSelector(state => state.orders.orders);
const allOrders = useSelector(state => state.orders.allOrders);
const orderStats = useSelector(state => state.orders.stats);
const isLoadingOrders = useSelector(state => state.orders.loading);

// Products
const products = useSelector(state => state.products.products);
const selectedProduct = useSelector(state => state.products.selectedProduct);
const categories = useSelector(state => state.products.categories);
const isLoadingProducts = useSelector(state => state.products.loading);

// Reviews
const allReviews = useSelector(state => state.reviews.allReviews);
const productReviews = useSelector(state => state.reviews.productReviews['prod_123']);
const userReviews = useSelector(state => state.reviews.userReviews);
const reviewFilter = useSelector(state => state.reviews.filter);
const isLoadingReviews = useSelector(state => state.reviews.loading);
```

---

## Error Handling

### Pattern
```javascript
try {
  const result = await dispatch(someAsyncAction()).unwrap();
  // Success handling
  Alert.alert('Success', 'Action completed');
} catch (error) {
  // Error from unwrap()
  Alert.alert('Error', error.message);
}
```

### Example
```javascript
const handleCreateOrder = async () => {
  try {
    const order = await dispatch(createOrder({
      order: orderData,
      userId: user.id,
    })).unwrap();
    
    // Clear cart
    dispatch(clearCart());
    dispatch(clearCartStorage());
    
    // Navigate
    navigation.navigate('UserTabs', { screen: 'Orders' });
    
    Alert.alert(
      'Order Placed!',
      `Order #${order.id} confirmed`,
      [{ text: 'OK' }]
    );
  } catch (error) {
    Alert.alert('Order Failed', error.message || 'Please try again');
  }
};
```

---

## Best Practices

### 1. Use useEffect Carefully
```javascript
// ✅ Good - Fetches on mount
useEffect(() => {
  dispatch(fetchOrders(userId));
}, [userId, dispatch]);

// ✅ Good - Fetches when screen focused
useFocusEffect(
  useCallback(() => {
    dispatch(fetchProducts());
  }, [dispatch])
);
```

### 2. Handle Loading States
```javascript
const loading = useSelector(state => state.orders.loading);

return (
  {loading ? (
    <ActivityIndicator />
  ) : (
    <FlatList data={orders} />
  )}
);
```

### 3. Handle Errors
```javascript
const error = useSelector(state => state.orders.error);

useEffect(() => {
  if (error) {
    Alert.alert('Error', error);
  }
}, [error]);
```

### 4. Clear Selection After Use
```javascript
useEffect(() => {
  return () => {
    dispatch(clearSelectedReview());
  };
}, []);
```

---

## Auto-incrementing Stats in OrderSlice

When you fetch all orders, stats are automatically calculated:

```javascript
state.stats = {
  totalOrders: allOrders.length,
  totalRevenue: sum of all order totals,
  pendingOrders: count of pending status,
  deliveredOrders: count of delivered status,
}
```

No need to calculate manually!

---

## Migration Path from Old Code

If you have existing direct API calls:

### Before (Direct API)
```javascript
const response = await apiGet('/orders');
setOrders(response.orders);
```

### After (Redux)
```javascript
const dispatch = useDispatch();
const orders = useSelector(state => state.orders.orders);

useEffect(() => {
  dispatch(fetchOrders());
}, [dispatch]);
```

---

## Testing Redux Actions

```javascript
import store from '../../store';
import { createOrder } from '../../store/slices/orderSlice';

// Test async thunk
store.dispatch(createOrder({
  order: testOrder,
  userId: testUserId,
})).then(() => {
  const state = store.getState();
  console.log('Orders:', state.orders.orders);
});
```

---

## Summary

| Feature | Thunks | Actions | State |
|---------|--------|---------|-------|
| **Orders** | 10 thunks ✅ | Clear, Select | Full order mgmt |
| **Products** | 8 thunks | Category filter | All + filtered |
| **Reviews** | 10 thunks ✅ | Filter, Select | Comprehensive |

All three are now fully integrated with Redux for centralized state management, better performance, and easier debugging!

---

## Next Steps

1. ✅ Import selectors in components
2. ✅ Replace direct API calls with dispatch
3. ✅ Use useSelector hooks
4. ✅ Handle loading/error states
5. ✅ Test with Redux DevTools

**Happy Redux-ing! 🚀**
