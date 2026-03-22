# Redux Quick Reference

## Import Pattern

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchOrders, 
  createOrder, 
  updateOrderStatus,
  selectOrder,
  setOrderFilter 
} from '../../store/slices/orderSlice';
```

---

## Common Patterns

### Pattern 1: Fetch Data on Screen Load
```javascript
function MyScreen() {
  const dispatch = useDispatch();
  const data = useSelector(state => state.orders.orders);
  
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchOrders(userId));
    }, [dispatch])
  );
  
  return <FlatList data={data} />;
}
```

### Pattern 2: Handle Async Action
```javascript
const handleAction = async () => {
  try {
    const result = await dispatch(someAction(params)).unwrap();
    Alert.alert('Success', 'Done!');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Pattern 3: Apply Filters
```javascript
dispatch(setOrderFilter({ status: 'pending' }));
const filteredOrders = orders.filter(o => o.status === 'pending');
```

### Pattern 4: Select & View Details
```javascript
dispatch(selectOrder(orderItem));
navigation.navigate('OrderDetails');

// In details screen:
const selected = useSelector(state => state.orders.selectedOrder);
```

---

## Redux Slices Reference

### Order Slice
- **File**: `src/store/slices/orderSlice.js`
- **State Key**: `state.orders`
- **Thunks**: `fetchOrders`, `fetchOrderById`, `fetchAllOrders`, `createOrder`, `updateOrderStatus`, `updateOrder`, `cancelOrder`, `returnOrder`, `refundOrder`, `deleteOrder`
- **Actions**: `clearCurrentOrder`, `selectOrder`, `clearSelectedOrder`, `setOrderFilter`, `clearOrderFilter`

### Product Slice
- **File**: `src/store/slices/productSlice.js`
- **State Key**: `state.products`
- **Thunks**: `fetchProducts`, `fetchCategories`, `fetchProductById`, `searchProducts`, `fetchProductsByCategory`, `createProduct`, `updateProduct`, `deleteProduct`
- **Actions**: `setSelectedCategory`, `clearSearchResults`, `addReview`

### Review Slice (NEW)
- **File**: `src/store/slices/reviewSlice.js`
- **State Key**: `state.reviews`
- **Thunks**: `fetchAllReviews`, `fetchProductReviews`, `fetchUserReviews`, `submitReview`, `updateReview`, `deleteReview`, `approveReview`, `rejectReview`, `flagReview`, `respondToReview`
- **Actions**: `setReviewFilter`, `clearFilter`, `selectReview`, `clearSelectedReview`, `setFilteredReviews`

---

## Cheat Sheet

### Fetch All Orders (User)
```javascript
useEffect(() => {
  dispatch(fetchOrders(user.id));
}, []);
```

### Fetch All Orders (Admin)
```javascript
useEffect(() => {
  dispatch(fetchAllOrders({ status: 'all' }));
}, []);
```

### Create Order
```javascript
dispatch(createOrder({ order: formData, userId: user.id }));
```

### Update Order Status
```javascript
dispatch(updateOrderStatus({ orderId: id, status: 'shipped' }));
```

### Fetch Products
```javascript
dispatch(fetchProducts());
```

### Search Products
```javascript
dispatch(searchProducts('treadmill'));
```

### Submit Review
```javascript
dispatch(submitReview({ productId: id, review: reviewData }));
```

### Fetch All Reviews (Admin)
```javascript
dispatch(fetchAllReviews());
```

### Approve Review (Admin)
```javascript
dispatch(approveReview({ productId: id, reviewId: revId }));
```

### Get Selector Data
```javascript
const orders = useSelector(state => state.orders.orders);
const products = useSelector(state => state.products.products);
const reviews = useSelector(state => state.reviews.allReviews);
const loading = useSelector(state => state.orders.loading);
const error = useSelector(state => state.orders.error);
```

---

## Screen Integration Examples

### OrderHistoryScreen
```javascript
✅ Uses: fetchOrders, orders selector
✅ Features: List user orders, filter by status
✅ Navigation: Opens OrderDetailsScreen
```

### CheckoutScreen
```javascript
✅ Uses: createOrder, clearCart
✅ Features: Place order, show confirmation
✅ Navigation: Navigates to OrderHistory
```

### AdminOrdersScreen
```javascript
✅ Uses: fetchAllOrders, updateOrderStatus, filter
✅ Features: List all orders, update status, send notifications
✅ Stats: Shows total/pending/delivered orders
```

### ProductDetailsScreen
```javascript
✅ Uses: fetchProductById, submitReview, updateReview
✅ Features: Show product, display reviews, submit reviews
✅ Interactions: Add to cart, write review
```

### AdminReviewsScreen
```javascript
✅ Uses: fetchAllReviews, approveReview, rejectReview, flagReview
✅ Features: List reviews, filter by status/rating, moderate
✅ Actions: Approve, reject, respond to reviews
```

---

## Loading & Error Handling

### Show Loading
```javascript
const loading = useSelector(state => state.orders.loading);

{loading && <ActivityIndicator />}
{!loading && <FlatList data={orders} />}
```

### Show Error
```javascript
const error = useSelector(state => state.orders.error);

useEffect(() => {
  if (error) Alert.alert('Error', error);
}, [error]);
```

---

## Common Mistakes to Avoid

❌ Don't: Make API calls directly
```javascript
const orders = await apiGet('/orders');
```

✅ Do: Use Redux dispatch
```javascript
const orders = useSelector(state => state.orders.orders);
dispatch(fetchOrders(userId));
```

❌ Don't: Forget dependencies
```javascript
useEffect(() => {
  dispatch(fetchProducts());
}); // Missing dependencies!
```

✅ Do: Include in dependency array
```javascript
useEffect(() => {
  dispatch(fetchProducts());
}, [dispatch]);
```

❌ Don't: Forget to handle unwrap errors
```javascript
dispatch(createOrder(data)); // No error handling
```

✅ Do: Use try-catch with unwrap
```javascript
try {
  await dispatch(createOrder(data)).unwrap();
} catch (error) {
  Alert.alert('Error', error.message);
}
```

---

## Debug Tips

### Redux DevTools Integration
```javascript
// Already configured in store/index.js
// No additional setup needed!
// Thunks will show state changes
```

### Console Logging State
```javascript
const orders = useSelector(state => {
  console.log('Current orders:', state.orders);
  return state.orders.orders;
});
```

### Check State in Component
```javascript
const state = useSelector(state => {
  console.log('Full orders state:', state);
  return state;
});
```

---

## Performance Tips

### Memoize Selectors (Optional)
```javascript
import { useMemo } from 'react';

function MyComponent() {
  const orders = useSelector(state => state.orders.orders);
  
  const filtered = useMemo(() => 
    orders.filter(o => o.status === 'pending'),
    [orders]
  );
  
  return <FlatList data={filtered} />;
}
```

### Avoid Unnecessary Re-renders
- Use specific selectors (don't select entire state)
- Memoize components if needed
- Keep actions pure

---

## Testing Examples

### Test Order Creation
```javascript
dispatch(createOrder({
  order: { shippingInfo: {...}, paymentMethod: 'card' },
  userId: 'test_user'
})).then(() => {
  const state = store.getState();
  expect(state.orders.currentOrder).toBeDefined();
});
```

### Test Review Submission
```javascript
dispatch(submitReview({
  productId: 'prod_123',
  review: { userId: 'user_1', rating: 5, comment: 'Great!' }
})).then(() => {
  const state = store.getState();
  expect(state.reviews.allReviews.length).toBe(1);
});
```

---

## Resources

- **Full Guide**: See `REDUX_INTEGRATION_GUIDE.md`
- **Store Config**: `src/store/index.js`
- **Order Slice**: `src/store/slices/orderSlice.js`
- **Product Slice**: `src/store/slices/productSlice.js`
- **Review Slice**: `src/store/slices/reviewSlice.js`

---

## Quick Migration from API Calls

### Before
```javascript
const [orders, setOrders] = useState([]);
useEffect(() => {
  apiGet('/orders').then(res => setOrders(res.orders));
}, []);
```

### After
```javascript
const dispatch = useDispatch();
const orders = useSelector(state => state.orders.orders);
useEffect(() => {
  dispatch(fetchOrders(userId));
}, [dispatch]);
```

---

**That's it! You're ready to use Redux! 🚀**
