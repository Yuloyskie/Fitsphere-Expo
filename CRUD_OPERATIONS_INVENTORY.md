# FitSphere ExpoGo - Complete CRUD Operations Inventory

**Last Updated:** March 23, 2026  
**Scope:** Backend API (server/src/index.js), Redux Slices, Admin & User Screens

---

## Executive Summary

This document provides a comprehensive mapping of all CRUD (Create, Read, Update, Delete) operations across the FitSphere application. The inventory shows implementation status for each resource and identifies gaps in the CRUD functionality.

---

## 1. PRODUCTS

### Overview
Core product catalog management with full CRUD support implemented across backend and frontend.

| Operation | Endpoint/Function | Backend Status | Frontend Status | Location |
|-----------|-------------------|---|---|---|
| **CREATE** | `POST /api/products` | ✅ Complete | ✅ Complete | server/src/index.js:913; AdminProductsScreen.js |
| **READ (List)** | `GET /api/products` | ✅ Complete | ✅ Complete | server/src/index.js:898; productSlice.js (fetchProducts) |
| **READ (Detail)** | `GET /api/products/:id` | ✅ Complete | ✅ Complete | server/src/index.js:909; productSlice.js (fetchProductById) |
| **READ (Search)** | `GET /api/products?query=...` | ✅ Complete | ✅ Complete | server/src/index.js:898; productSlice.js (searchProducts) |
| **READ (Category Filter)** | `GET /api/products?categoryId=...` | ✅ Complete | ✅ Complete | server/src/index.js:898; productSlice.js (fetchProductsByCategory) |
| **UPDATE** | `PUT /api/products/:id` | ✅ Complete | ✅ Complete | server/src/index.js:918; AdminProductsScreen.js |
| **DELETE** | `DELETE /api/products/:id` | ✅ Complete | ✅ Complete | server/src/index.js:923; AdminProductsScreen.js |

### Redux Thunks (productSlice.js)
- `fetchProducts()` - List all products
- `fetchProductById(productId)` - Get single product with reviews
- `searchProducts(query)` - Search by name/description
- `fetchProductsByCategory(categoryId)` - Filter by category
- `createProduct(product)` - Add new product (Admin)
- `updateProduct(product)` - Modify product (Admin)
- `deleteProduct(productId)` - Remove product (Admin)

### Implementation Status: **✅ COMPLETE & PRODUCTION-READY**

---

## 2. CATEGORIES

### Overview
Product categories with CREATE/READ operations. UPDATE/DELETE operations missing at API level.

| Operation | Endpoint/Function | Backend Status | Frontend Status | Notes |
|-----------|-------------------|---|---|---|
| **CREATE** | `POST /api/categories` | ✅ Complete | ⚠️ Limited | server/src/index.js:932; Seeded in DB on startup |
| **READ** | `GET /api/categories` | ✅ Complete | ✅ Complete | server/src/index.js:931; productSlice.js (fetchCategories) |
| **UPDATE** | — | ❌ Missing | ❌ Missing | No endpoint or UI |
| **DELETE** | — | ❌ Missing | ❌ Missing | No endpoint or UI |

### Redux Thunks (productSlice.js)
- `fetchCategories()` - List all categories

### Seeded Categories
```
- Cardio Equipment
- Strength Training Equipment
- Weight Machines
- Functional Training Equipment
- Bodyweight / Calisthenics Equipment
- Flexibility & Recovery Equipment
- Specialized / Sports Equipment
```

### Implementation Status: **⚠️ PARTIAL** (READ only, admin category management missing)

---

## 3. USERS

### Overview
User account management with full CRUD support across authentication and admin systems.

| Operation | Endpoint/Function | Backend Status | Frontend Status | Location |
|-----------|-------------------|---|---|---|
| **CREATE (Register)** | `POST /api/auth/register` | ✅ Complete | ✅ Complete | server/src/index.js:237; authSlice.js (register) |
| **CREATE (Admin)** | `POST /api/users` | ✅ Complete | ✅ Complete | server/src/index.js:954; AdminUsersScreen.js |
| **READ (List)** | `GET /api/users` | ✅ Complete | ✅ Complete | server/src/index.js:953; adminSlice.js (fetchAllUsers) |
| **READ (Detail)** | `GET /api/auth/users/:id` | ✅ Complete | ✅ Complete | server/src/index.js:262 |
| **UPDATE (Profile)** | `PUT /api/auth/users/:id` | ✅ Complete | ✅ Complete | server/src/index.js:268; userSlice.js (updateProfile) |
| **UPDATE (Admin)** | `PUT /api/users/:id` | ✅ Complete | ✅ Complete | server/src/index.js:966; AdminUsersScreen.js |
| **UPDATE (Password)** | — | ⚠️ Simulated | ⚠️ Simulated | userSlice.js (updatePassword) - No real backend endpoint |
| **DELETE** | `DELETE /api/users/:id` | ✅ Complete | ✅ Complete | server/src/index.js:976; AdminUsersScreen.js |

### Redux Thunks
**authSlice.js:**
- `login(email, password)` - User login
- `register(fullName, email, password)` - Create user account
- `logout()` - Logout user
- `updateProfile({name, email, phone, profileImage})` - Update profile
- `googleLogin()` - OAuth login (mocked)
- `facebookLogin()` - OAuth login (mocked)

**adminSlice.js:**
- `fetchAllUsers()` - List all users (admin)
- `createUser(userData)` - Create user (admin)
- `updateUser(userId, userData)` - Modify user (admin)
- `deleteUser(userId)` - Remove user (admin)

### Admin Exclusion
- Email `admin@fitsphere.com` is excluded from standard user management UI

### Implementation Status: **✅ COMPLETE** (with password update simulated)

---

## 4. ORDERS

### Overview
Complete order lifecycle management with comprehensive CRUD operations.

| Operation | Endpoint/Function | Backend Status | Frontend Status | Location |
|-----------|-------------------|---|---|---|
| **CREATE** | `POST /api/orders` | ✅ Complete | ✅ Complete | server/src/index.js:943; orderSlice.js (createOrder) |
| **READ (User Orders)** | `GET /api/orders?userId=...` | ✅ Complete | ✅ Complete | server/src/index.js:927; orderSlice.js (fetchOrders) |
| **READ (All Orders)** | `GET /api/orders` | ✅ Complete | ✅ Complete | server/src/index.js:927; orderSlice.js (fetchAllOrders) |
| **READ (Detail)** | `GET /api/orders/:id` | ✅ Complete | ✅ Complete | orderSlice.js (fetchOrderById) |
| **READ (Can Review)** | `GET /api/orders/:orderId/can-review` | ✅ Complete | ✅ Used | server/src/index.js:987 |
| **UPDATE (Status)** | `PATCH /api/orders/:id/status` | ✅ Complete | ✅ Complete | server/src/index.js:948; orderSlice.js (updateOrderStatus) |
| **UPDATE (Payment Status)** | `PATCH /api/orders/:id` | ✅ Complete | ✅ Complete | server/src/index.js:956; orderSlice.js (updatePaymentStatus) |
| **UPDATE (General)** | `PATCH /api/orders/:id` or `PUT /api/orders/:id` | ✅ Complete | ✅ Complete | server/src/index.js:956; orderSlice.js (updateOrder) |
| **UPDATE (Cancel)** | `PATCH /api/orders/:id/cancel` | ✅ Complete | ✅ Complete | orderSlice.js (cancelOrder) |
| **UPDATE (Return)** | `POST /api/orders/:id/return` | ❌ Missing Backend | ✅ Frontend | orderSlice.js (returnOrder) - No backend endpoint |
| **UPDATE (Refund)** | `POST /api/orders/:id/refund` | ❌ Missing Backend | ✅ Frontend | orderSlice.js (refundOrder) - No backend endpoint |
| **DELETE** | `DELETE /api/orders/:id` | ✅ Complete | ✅ Complete | orderSlice.js (deleteOrder) |

### Order Status Flow
`pending` → `processing` → `shipped` → `delivered` or `cancelled`

### Order Filtering (Admin)
- Status filter (all, pending, processing, shipped, delivered, cancelled)
- Search by order ID or customer name/email
- Date range filtering
- Sort options (newest, oldest, total_high, total_low)

### Redux Thunks (orderSlice.js)
- `fetchOrders(userId)` - Get user's orders
- `fetchAllOrders(filters)` - Get all orders with advanced filtering
- `fetchOrderById(orderId)` - Get order details
- `createOrder({order, userId})` - Create order from cart
- `updateOrderStatus({orderId, status})` - Change order status
- `updatePaymentStatus({orderId, paymentStatus})` - Update payment state
- `updateOrder({orderId, updates})` - General update
- `cancelOrder(orderId)` - Cancel order
- `returnOrder({orderId, reason})` - Request return (no backend)
- `refundOrder({orderId, refundAmount, reason})` - Request refund (no backend)
- `deleteOrder(orderId)` - Remove order

### Implementation Status: **⚠️ MOSTLY COMPLETE** (Return & Refund operations missing backend)

---

## 5. REVIEWS

### Overview
Comprehensive review system with user submissions and admin moderation.

| Operation | Endpoint/Function | Backend Status | Frontend Status | Location |
|-----------|-------------------|---|---|---|
| **CREATE (Submit)** | `POST /api/products/:productId/reviews` | ✅ Complete | ✅ Complete | server/src/index.js:993; productSlice.js (submitReview) |
| **READ (Product Reviews)** | `GET /api/products/:productId/reviews` | ✅ Complete | ✅ Complete | server/src/index.js:1025; productSlice.js (fetchProductReviews) |
| **READ (All Reviews)** | `GET /api/reviews` | ✅ Complete | ✅ Complete | server/src/index.js:984; reviewSlice.js (fetchAllReviews) |
| **READ (User Reviews)** | `GET /api/reviews?userId=...` | ✅ Complete | ✅ Complete | server/src/index.js:984; reviewSlice.js (fetchUserReviews) |
| **UPDATE (User)** | `PUT /api/reviews/:reviewId` | ✅ Complete | ✅ Complete | server/src/index.js:1031; productSlice.js (updateReview) |
| **UPDATE (Approve)** | `PUT /api/products/:productId/reviews/:reviewId/approve` | ✅ Complete | ✅ Complete | server/src/index.js:1054; AdminReviewsScreen.js |
| **UPDATE (Reject)** | `PUT /api/products/:productId/reviews/:reviewId/reject` | ✅ Complete | ✅ Complete | server/src/index.js:1063; AdminReviewsScreen.js |
| **UPDATE (Flag)** | `PUT /api/products/:productId/reviews/:reviewId/flag` | ✅ Complete | ✅ Complete | server/src/index.js:1075; AdminReviewsScreen.js |
| **UPDATE (Respond)** | `PUT /api/products/:productId/reviews/:reviewId/respond` | ✅ Complete | ✅ Complete | server/src/index.js:1087; AdminReviewsScreen.js |
| **DELETE (User)** | `DELETE /api/reviews/:reviewId` | ✅ Complete | ✅ Complete | server/src/index.js:1046; ReviewsScreen.js |
| **DELETE (Admin Clear All)** | `DELETE /api/admin/reviews/clear` | ✅ Complete | ❌ Missing | server/src/index.js:1096 |

### Review Moderation Workflow
1. User submits review (requires verified purchase for new reviews)
2. Review starts as unapproved
3. Admin can approve, reject, flag, or respond to review
4. Users can edit/delete own reviews
5. Product rating calculated as average of all reviews

### Redux Thunks
**productSlice.js:**
- `submitReview({productId, review})` - Submit new review
- `updateReview({productId, reviewId, userId, rating, comment})` - Edit review
- `deleteReview({productId, reviewId, userId})` - Remove review

**reviewSlice.js:**
- `fetchAllReviews()` - Get all reviews (admin)
- `fetchProductReviews(productId)` - Get product reviews
- `fetchUserReviews(userId)` - Get user's reviews
- `submitReview({productId, review})` - Submit review
- `updateReview({productId, reviewId, changes})` - Edit review
- `deleteReview({productId, reviewId})` - Delete review
- `approveReview({productId, reviewId})` - Admin approve
- `rejectReview({productId, reviewId, reason})` - Admin reject
- `flagReview({productId, reviewId, reason})` - Admin flag
- `respondToReview({productId, reviewId, response})` - Admin respond

### Review Data Fields
- `productId`, `userId`, `userName`, `userProfileImage`
- `rating` (1-5), `comment`, `images` (array)
- `orderId`, `approved`, `flagged`, `flagReason`, `rejectionReason`, `sellerResponse`
- `createdAt`, `updatedAt`

### Implementation Status: **✅ COMPLETE** (with full moderation workflow)

---

## 6. SHOPPING CART

### Overview
Client-side cart management with persistent storage (AsyncStorage).

| Operation | Endpoint/Function | Backend Status | Frontend Status | Location |
|-----------|-------------------|---|---|---|
| **CREATE (Add)** | `addToCart(product, quantity, size)` | N/A - Local | ✅ Complete | cartSlice.js (reducer) |
| **READ (Items)** | `selectCartItems()` | N/A - Local | ✅ Complete | cartSlice.js (selector) |
| **READ (Total)** | `selectCartTotal()` | N/A - Local | ✅ Complete | cartSlice.js (selector) |
| **READ (Count)** | `selectCartCount()` | N/A - Local | ✅ Complete | cartSlice.js (selector) |
| **UPDATE (Quantity)** | `updateQuantity(productId, size, quantity)` | N/A - Local | ✅ Complete | cartSlice.js (reducer) |
| **UPDATE (Apply Promo)** | `applyPromoCode(code, discount)` | N/A - Local | ✅ Complete | cartSlice.js (reducer) |
| **UPDATE (Load)** | `loadCart()` | N/A - AsyncStorage | ✅ Complete | cartSlice.js (thunk) |
| **UPDATE (Save)** | `saveCartToStorage(items)` | N/A - AsyncStorage | ✅ Complete | cartSlice.js (thunk) |
| **DELETE (Item)** | `removeFromCart(productId, size)` | N/A - Local | ✅ Complete | cartSlice.js (reducer) |
| **DELETE (All)** | `clearCart()` | N/A - Local | ✅ Complete | cartSlice.js (reducer) |
| **DELETE (Storage)** | `clearCartStorage()` | N/A - AsyncStorage | ✅ Complete | cartSlice.js (thunk) |

### Redux Reducers & Thunks (cartSlice.js)
**Reducers:**
- `addToCart({product, quantity, size})`
- `removeFromCart({productId, size})`
- `updateQuantity({productId, size, quantity})`
- `clearCart()`
- `applyPromoCode({code, discount})`
- `removePromoCode()`

**Thunks:**
- `loadCart()` - Load from AsyncStorage
- `saveCartToStorage(items)` - Persist to AsyncStorage
- `clearCartStorage()` - Clear AsyncStorage

### Implementation Status: **✅ COMPLETE** (fully functional local cart)

---

## 7. PROMO CODES

### Overview
Promotional discount codes - **CRITICAL GAP**: Frontend implemented but not integrated with backend API.

| Operation | Endpoint/Function | Backend Status | Frontend Status | Notes |
|-----------|-------------------|---|---|---|
| **CREATE** | `POST /api/promo-codes` | ❌ Missing | ✅ Complete | AdminPromoCodesScreen.js - client-side only |
| **READ** | `GET /api/promo-codes` | ❌ Missing | ⚠️ Limited | Uses mockData.js (hardcoded) |
| **UPDATE** | `PUT /api/promo-codes/:id` | ❌ Missing | ✅ Complete | AdminPromoCodesScreen.js - client-side only |
| **DELETE** | `DELETE /api/promo-codes/:id` | ❌ Missing | ✅ Complete | AdminPromoCodesScreen.js - client-side only |
| **VALIDATE** | — | ❌ Missing | ⚠️ Applied directly | cartSlice.js (applyPromoCode) - no validation |

### Current Implementation (Client-Side Only)
**AdminPromoCodesScreen.js:**
```javascript
const [promoCodes, setPromoCodes] = useState([
  { id: '1', code: 'WELCOME10', discount: 10, active: true, ... },
  { id: '2', code: 'SAVE20', discount: 20, active: true, ... },
  { id: '3', code: 'FIT50', discount: 50, active: false, ... },
]);
```

**Form Fields:**
- Code (uppercase)
- Discount % (1-100)
- Description
- Expiration Date

**Actions:**
- Create new promo code
- Edit existing code
- Delete code
- Toggle active/inactive status
- Send promotion notification to users

### Mock Data (src/data/mockData.js)
```javascript
export const promoCodes = [
  { id: '1', code: 'WELCOME10', discount: 10, ... },
  { id: '2', code: 'SAVE20', discount: 20, ... },
  ...
];
```

### Cart Integration (cartSlice.js)
```javascript
applyPromoCode: (state, action) => {
  const { code, discount } = action.payload;
  state.promoCode = code;
  state.discount = discount;
}
```

### Implementation Status: **❌ INCOMPLETE - MISSING BACKEND INTEGRATION**

**Requirements to Complete:**
1. Add backend endpoints:
   - `POST /api/admin/promo-codes` (create)
   - `GET /api/admin/promo-codes` (list)
   - `PUT /api/admin/promo-codes/:id` (update)
   - `DELETE /api/admin/promo-codes/:id` (delete)
   - `POST /api/promo-codes/validate` (validate on checkout)

2. Add Promo Code schema to MongoDB

3. Add redemption tracking (tracking usage, expiration)

4. Integrate validation in checkout flow

---

## 8. AUTHENTICATION & TOKENS

### Overview
JWT token management, session handling, and authentication flow.

| Operation | Endpoint/Function | Backend Status | Frontend Status | Location |
|-----------|-------------------|---|---|---|
| **CREATE (Login)** | `POST /api/auth/login` | ✅ Complete | ✅ Complete | server/src/index.js:203; authSlice.js (login) |
| **CREATE (Register)** | `POST /api/auth/register` | ✅ Complete | ✅ Complete | server/src/index.js:224; authSlice.js (register) |
| **CREATE (Tokens)** | `POST /api/auth/tokens` | ✅ Complete | ⚠️ Not Used | server/src/index.js:333 |
| **READ (Refresh)** | `POST /api/auth/tokens/refresh` | ✅ Complete | ⚠️ Not Used | server/src/index.js:353 |
| **READ (Verify)** | `POST /api/auth/tokens/verify` | ✅ Complete | ⚠️ Not Used | server/src/index.js:386 |
| **READ (Check Expiring)** | `GET /api/auth/tokens/check-expiring` | ✅ Complete | ❌ Missing UI | server/src/index.js:411 |
| **DELETE (Logout)** | `POST /api/auth/logout` | ✅ Complete | ⚠️ AsyncStorage | server/src/index.js:423; authSlice.js (logout) |
| **DELETE (Revoke)** | Implicit in logout | ✅ Complete | — | server/src/index.js:423 |

### Authentication Methods
1. **Email/Password** - Standard registration and login
2. **Google OAuth** - Mocked (no real integration)
3. **Facebook OAuth** - Mocked (no real integration)

### Admin Credentials
```
Email: admin@fitsphere.com or admin@firsphere.com
Password: admin123
```

### Token Management (Backend Only)
- **Access Token:** 7-day expiration
- **Refresh Token:** 30-day expiration
- **Token Blacklist:** Revoked tokens tracked in DB
- **Token Cleanup:** Cleanup endpoints for stale tokens

### Backend Token Thunks (authSlice.js)
- `login({email, password})` - Authenticate user
- `register({fullName, email, password})` - Create account
- `logout()` - End session
- `updateProfile({name, email, phone, profileImage})` - Modify profile

### Implementation Status: **✅ COMPLETE** (tokens implemented backend, not utilized frontend)

---

## 9. PUSH NOTIFICATIONS & TOKENS

### Overview
Push notification token management for Firebase/Expo notifications.

| Operation | Endpoint/Function | Backend Status | Frontend Status | Location |
|-----------|-------------------|---|---|---|
| **CREATE (Register)** | `POST /api/notifications/tokens` | ✅ Complete | ⚠️ Limited | server/src/index.js:470 |
| **READ (List)** | `GET /api/notifications/tokens` | ✅ Complete | ❌ Missing UI | server/src/index.js:485 |
| **READ (Stats)** | `GET /api/admin/tokens/stats` | ✅ Complete | ❌ Missing UI | server/src/index.js:544 |
| **UPDATE (Preferences)** | `PUT /api/notifications/tokens/:tokenId/preferences` | ✅ Complete | ❌ Missing UI | server/src/index.js:504 |
| **DELETE (Single)** | `DELETE /api/notifications/tokens/:tokenId` | ✅ Complete | ❌ Missing UI | server/src/index.js:493 |
| **DELETE (All)** | `POST /api/notifications/tokens/logout-all` | ✅ Complete | ❌ Missing UI | server/src/index.js:511 |
| **CLEANUP (Inactive)** | `POST /api/admin/tokens/cleanup/inactive` | ✅ Complete | ❌ Missing UI | server/src/index.js:524 |
| **CLEANUP (Failed)** | `POST /api/admin/tokens/cleanup/failed` | ✅ Complete | ❌ Missing UI | server/src/index.js:539 |

### Push Token Data
- `userId`, `token`, `platform` (android/ios)
- `deviceId`, `deviceName`, `appVersion`, `osVersion`
- `isActive`, `registeredAt`, `lastUsedAt`
- `notificationPreferences` (orders, promotions, reviews, messages, general)

### Notification Service (src/services/NotificationService.js)
- Send local notifications
- Schedule notifications
- Handle promotion notifications
- Handle push tokens registration

### Implementation Status: **⚠️ PARTIAL** (backend complete, frontend UI missing)

---

## 10. SHIPPING RATES

### Overview
Configurable shipping rate management for store operations.

| Operation | Endpoint/Function | Backend Status | Frontend Status | Location |
|-----------|-------------------|---|---|---|
| **CREATE** | Implicit in `PUT /api/admin/shipping-rates` | ✅ Complete | ❌ Missing | server/src/index.js:1101 |
| **READ** | `GET /api/admin/shipping-rates` | ✅ Complete | ❌ Missing | server/src/index.js:1100 |
| **UPDATE** | `PUT /api/admin/shipping-rates` | ✅ Complete | ⚠️ Redux only | server/src/index.js:1101; adminSlice.js |
| **DELETE** | — | ❌ Missing | ❌ Missing | No endpoint |

### Shipping Rate Fields
- `name`, `minDays`, `maxDays`, `price`, `active`

### Redux Thunk (adminSlice.js)
- `updateShippingRate(rateData)` - Create or update rate

### Implementation Status: **⚠️ PARTIAL** (backend exists but no admin UI)

---

## CRUD Operations Summary Table

### Overall Status by Resource

| Resource | CREATE | READ | UPDATE | DELETE | Overall Status |
|----------|--------|------|--------|--------|--|
| Products | ✅ | ✅ | ✅ | ✅ | ✅ **COMPLETE** |
| Categories | ✅ | ✅ | ❌ | ❌ | ⚠️ **READ-ONLY** |
| Users | ✅ | ✅ | ✅ | ✅ | ✅ **COMPLETE** |
| Orders | ✅ | ✅ | ✅* | ✅ | ⚠️ **PARTIAL** (Return/Refund missing) |
| Reviews | ✅ | ✅ | ✅ | ✅ | ✅ **COMPLETE** |
| Cart | ✅ | ✅ | ✅ | ✅ | ✅ **COMPLETE** (Local) |
| Promo Codes | ⚠️* | ⚠️* | ⚠️* | ⚠️* | ❌ **MISSING BACKEND** |
| Auth & Tokens | ✅ | ✅ | ⚠️ | ✅ | ✅ **COMPLETE** |
| Push Tokens | ✅ | ✅ | ✅ | ✅ | ⚠️ **PARTIAL UI** |
| Shipping Rates | ✅* | ✅ | ✅ | ❌ | ⚠️ **NO ADMIN UI** |

**Legend:**
- ✅ = Fully implemented
- ⚠️ = Partially implemented or missing UI
- ❌ = Not implemented
- \* = Backend exists but frontend incomplete

---

## Critical Gaps & Issues

### 1. **Promo Code System - HIGH PRIORITY** 🔴
**Status:** Frontend-only implementation
- No backend API endpoints
- No database persistence
- No validation/redemption tracking
- Hardcoded mock data in frontend

**Impact:** Promotional campaigns cannot be managed or tracked

**Fix Needed:**
- Create MongoDB schema for promo codes
- Add CRUD endpoints to backend
- Add validation endpoint (check code validity and expiration)
- Add redemption tracking
- Integrate into checkout flow

---

### 2. **Order Return & Refund - MEDIUM PRIORITY** 🟡
**Status:** Frontend actions exist but no backend implementation

**Impact:** Cannot properly process returns/refunds

**Fix Needed:**
- Implement `/api/orders/:id/return` endpoint
- Implement `/api/orders/:id/refund` endpoint
- Add return/refund status tracking to Order schema
- Add refund amount tracking
- Add refund reason tracking

---

### 3. **Push Notification UI - MEDIUM PRIORITY** 🟡
**Status:** Backend complete but no admin/user UI

**Impact:** Push notification preferences cannot be configured

**Fix Needed:**
- Create admin UI for viewing push token stats
- Create user settings screen for notification preferences
- Add cleanup task/scheduler for inactive tokens
- Send automated expiring token warnings

---

### 4. **Category Management - MEDIUM PRIORITY** 🟡
**Status:** Read-only, no update/delete UI

**Impact:** Cannot modify existing categories or remove obsolete ones

**Fix Needed:**
- Add category update endpoint: `PUT /api/categories/:id`
- Add category delete endpoint: `DELETE /api/categories/:id`
- Create admin UI for category CRUD
- Handle category deletion (cascade to products)

---

### 5. **Shipping Rate Admin UI - LOW PRIORITY** 🟢
**Status:** Backend complete, Redux implemented, no UI

**Impact:** Shipping rates cannot be configured in app

**Fix Needed:**
- Create admin shipping rates management screen
- Add delete shipping rate endpoint
- Display in admin dashboard

---

### 6. **Password Change - LOW PRIORITY** 🟢
**Status:** Partially implemented (simulated)

**Impact:** Users cannot actually change their password via backend

**Fix Needed:**
- Implement real password validation endpoint
- Add current password verification
- Add password encryption/hashing
- Create change password endpoint: `PUT /api/auth/users/:id/password`

---

### 7. **OAuth Integration - LOW PRIORITY** 🟢
**Status:** Mocked (no real integration)

**Impact:** Google and Facebook logins are simulated

**Fix Needed:**
- Integrate real Google OAuth 2.0
- Integrate real Facebook OAuth
- Add OAuth user creation and linking
- Handle OAuth token storage

---

## API Endpoint Checklist

### Authentication
- ✅ POST `/api/auth/login` - Login
- ✅ POST `/api/auth/register` - Register  
- ✅ POST `/api/auth/tokens` - Generate JWT
- ✅ POST `/api/auth/tokens/refresh` - Refresh JWT
- ✅ POST `/api/auth/tokens/verify` - Verify JWT
- ✅ GET `/api/auth/tokens/check-expiring` - Check expiring
- ✅ POST `/api/auth/logout` - Logout

### Users
- ✅ GET `/api/users` - List users (admin)
- ✅ GET `/api/auth/users/:id` - Get user detail
- ✅ POST `/api/users` - Create user (admin)
- ✅ PUT `/api/users/:id` - Update user (admin)
- ✅ PUT `/api/auth/users/:id` - Update own profile
- ✅ DELETE `/api/users/:id` - Delete user (admin)

### Products
- ✅ GET `/api/products` - List products
- ✅ GET `/api/products/:id` - Get product
- ✅ POST `/api/products` - Create product (admin)
- ✅ PUT `/api/products/:id` - Update product (admin)
- ✅ DELETE `/api/products/:id` - Delete product (admin)

### Categories
- ✅ GET `/api/categories` - List categories
- ✅ POST `/api/categories` - Create category
- ❌ PUT `/api/categories/:id` - Update category
- ❌ DELETE `/api/categories/:id` - Delete category

### Orders
- ✅ GET `/api/orders` - List orders
- ✅ GET `/api/orders/:id` - Get order (implied in thunk)
- ✅ POST `/api/orders` - Create order
- ✅ PATCH `/api/orders/:id/status` - Update status
- ✅ PATCH `/api/orders/:id` - Update (payment status, etc.)
- ✅ PUT `/api/orders/:id` - Update (general)
- ✅ PATCH `/api/orders/:id/cancel` - Cancel order
- ✅ GET `/api/orders/:id/can-review` - Check delivery status
- ❌ POST `/api/orders/:id/return` - Request return
- ❌ POST `/api/orders/:id/refund` - Request refund
- ✅ DELETE `/api/orders/:id` - Delete order

### Reviews
- ✅ GET `/api/reviews` - List reviews
- ✅ GET `/api/products/:id/reviews` - Get product reviews
- ✅ POST `/api/products/:id/reviews` - Submit review
- ✅ PUT `/api/reviews/:id` - Update review
- ✅ PUT `/api/products/:id/reviews/:id/approve` - Approve (admin)
- ✅ PUT `/api/products/:id/reviews/:id/reject` - Reject (admin)
- ✅ PUT `/api/products/:id/reviews/:id/flag` - Flag (admin)
- ✅ PUT `/api/products/:id/reviews/:id/respond` - Respond (admin)
- ✅ DELETE `/api/reviews/:id` - Delete review
- ✅ DELETE `/api/admin/reviews/clear` - Clear all (admin)

### Push Notifications
- ✅ POST `/api/notifications/tokens` - Register token
- ✅ GET `/api/notifications/tokens` - List tokens
- ✅ DELETE `/api/notifications/tokens/:id` - Deactivate token
- ✅ POST `/api/notifications/tokens/logout-all` - Logout all
- ✅ PUT `/api/notifications/tokens/:id/preferences` - Set preferences
- ✅ POST `/api/admin/tokens/cleanup/inactive` - Cleanup (admin)
- ✅ POST `/api/admin/tokens/cleanup/failed` - Cleanup failed (admin)
- ✅ GET `/api/admin/tokens/stats` - Token stats (admin)

### Shipping
- ✅ GET `/api/admin/shipping-rates` - List rates (admin)
- ✅ PUT `/api/admin/shipping-rates` - Create/Update rate (admin)
- ❌ DELETE `/api/admin/shipping-rates/:id` - Delete rate (admin)

### Promo Codes
- ❌ GET `/api/admin/promo-codes` - List promo codes
- ❌ POST `/api/admin/promo-codes` - Create promo code
- ❌ PUT `/api/admin/promo-codes/:id` - Update promo code
- ❌ DELETE `/api/admin/promo-codes/:id` - Delete promo code
- ❌ POST `/api/promo-codes/validate` - Validate code on checkout

---

## Notes on Implementation

### Data Persistence
- **Backend:** MongoDB (Mongoose schemas)
- **Frontend:** Redux state + AsyncStorage (cart only)
- **Sessions:** JWT tokens with refresh mechanism

### Admin Superuser
- **Email:** `admin@fitsphere.com` or `admin@firsphere.com`
- **Password:** `admin123`
- **Cannot be deleted** via user management UI

### Database Seeding
On server startup, the following are auto-seeded if not present:
- Admin user account
- 7 default product categories

### Notification System
- Local notifications (React Native)
- Promotion notifications with promo code details
- Order status update notifications
- Custom notification service (NotificationService.js)

---

## Frontend Integration Status

### Admin Screens Implemented
- ✅ Dashboard
- ✅ Products (CRUD)
- ✅ Users (CRUD)
- ✅ Orders (Read, Update Status/Payment)
- ✅ Reviews (Read, Approve/Reject/Flag/Respond)
- ✅ Promo Codes (CRUD - local only)
- ✅ Shipping Rates (partial - Redux only)
- ⚠️ Reports (incomplete)

### User Screens Implemented
- ✅ Authentication (Login/Register/Logout)
- ✅ Home/Browse Products
- ✅ Product Details with Reviews
- ✅ Search & Filter
- ✅ Shopping Cart
- ✅ Checkout
- ✅ Order History
- ✅ Order Details
- ✅ Write/Edit Reviews
- ✅ Profile Management
- ✅ Notifications

---

## Recommendations for Next Development

### Immediate (Critical)
1. **Implement Promo Code Backend**
   - Create MongoDB schema
   - Add validation endpoint
   - Integrate with checkout

2. **Add Order Return/Refund Logic**
   - Backend endpoints
   - Status tracking
   - Refund processing

### Short Term (Important)
3. **Complete Push Notification UI**
   - Admin token management
   - User preference settings
   - Notification history

4. **Add Category Management UI**
   - Admin CRUD interface
   - Product count display
   - Cascade deletion handling

5. **Implement Real Password Change**
   - Backend validation
   - Current password verification
   - Add endpoint: `PUT /api/auth/users/:id/password`

### Medium Term (Enhancement)
6. **Real OAuth Integration**
   - Google Firebase Auth
   - Facebook SDK
   - Account linking

7. **Shipping Rates Admin UI**
   - CRUD interface
   - Rate calculation display
   - Delete endpoint

8. **Advanced Admin Features**
   - Analytics/Reports
   - Bulk operations
   - Export/Import

---

**Document Generated:** March 23, 2026
**Total Endpoints:** 67 (52 implemented, 15 missing)
**Implementation Rate:** ~78% backend, ~65% frontend
