require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Token management imports
const {
  generateTokens,
  verifyToken,
  authMiddleware,
  isTokenExpiringSoon,
} = require('./tokenManager');
const {
  registerPushToken,
  getUserPushTokens,
  deactivatePushToken,
  markTokenFailed,
  cleanupInactiveTokens,
  removeFailedTokens,
  getStaleTokenStats,
  clearUserPushTokens,
} = require('./pushTokenManager');
const { Token, PushToken, StaleToken } = require('./schemas');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: Number,
    originalPrice: Number,
    category: String,
    categoryId: String,
    image: String,
    images: [String],
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    sale: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    icon: { type: String, default: 'apps' },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String, default: null },
    phone: { type: String, default: '' },
    profileImage: { type: String, default: null },
    pushTokens: [
      {
        token: String,
        platform: String,
        deviceId: String,
        registered: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.Mixed, required: true },
    quantity: { type: Number, required: true },
    size: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: { type: [orderItemSchema], default: [] },
    subtotal: Number,
    discount: Number,
    total: Number,
    shippingInfo: mongoose.Schema.Types.Mixed,
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    promoCode: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: String,
  },
  { timestamps: true }
);

const shippingRateSchema = new mongoose.Schema(
  {
    name: String,
    minDays: Number,
    maxDays: Number,
    price: Number,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userProfileImage: { type: String, default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: { type: [String], default: [] },
    orderId: String,
    approved: { type: Boolean, default: false },
    flagged: { type: Boolean, default: false },
    flagReason: { type: String, default: null },
    rejectionReason: { type: String, default: null },
    sellerResponse: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'reviews' }
);

const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);
const ShippingRate = mongoose.model('ShippingRate', shippingRateSchema);
const Review = mongoose.model('Review', reviewSchema);

const mapId = (doc) => {
  if (!doc) {
    return null;
  }

  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: String(obj._id),
    _id: undefined,
  };
};

const mapOrder = (doc) => {
  if (!doc) {
    return null;
  }

  const obj = mapId(doc);
  return {
    ...obj,
    createdAt: obj.createdAt || new Date().toISOString(),
  };
};

const sanitizeUser = (doc) => {
  const mapped = mapId(doc);
  if (!mapped) {
    return null;
  }

  const fullName = mapped.fullName || mapped.name || '';

  return {
    ...mapped,
    password: undefined,
    fullName,
    name: fullName,
  };
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPassword = String(password || '');

  if (!normalizedEmail || !normalizedPassword) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  let user = await User.findOne({ email: normalizedEmail });

  // Account does not exist - user must register first
  if (!user) {
    return res.status(404).json({ message: 'Account is invalid, register first' });
  }

  if (user.password !== normalizedPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({ user: sanitizeUser(user) });
});

app.post('/api/auth/register', async (req, res) => {
  const { fullName, name, email, password, isCompletion } = req.body;
  const normalizedFullName = String(fullName || name || '').trim();
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedFullName || !normalizedEmail || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const user = await User.create({
    fullName: normalizedFullName,
    name: normalizedFullName,
    email: normalizedEmail,
    password,
    role: 'user',
  });

  return res.status(201).json({ user: sanitizeUser(user) });
});

app.get('/api/auth/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user: sanitizeUser(user) });
});

app.put('/api/auth/users/:id', async (req, res) => {
  const incoming = { ...req.body };
  const normalizedFullName = String(incoming.fullName || incoming.name || '').trim();

  if (normalizedFullName) {
    incoming.fullName = normalizedFullName;
    incoming.name = normalizedFullName;
  }

  if (incoming.email) {
    incoming.email = String(incoming.email).toLowerCase();
  }

  const updated = await User.findByIdAndUpdate(req.params.id, incoming, { new: true });
  if (!updated) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user: sanitizeUser(updated) });
});

app.delete('/api/auth/users/:id', async (req, res) => {
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ id: req.params.id });
});

// ================== JWT TOKEN MANAGEMENT ENDPOINTS ==================

/**
 * POST /api/auth/tokens - Generate JWT tokens on login
 * Body: { userId, email, role }
 */
app.post('/api/auth/tokens', async (req, res) => {
  try {
    const { userId, email, role } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ message: 'userId and email are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } = generateTokens(user);

    // Store tokens in database
    const tokenRecord = new Token({
      userId,
      accessToken,
      refreshToken,
      tokenType: 'mobile',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      refreshExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    });

    await tokenRecord.save();

    return res.status(201).json({
      accessToken,
      refreshToken,
      expiresIn,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/auth/tokens/refresh - Refresh access token
 * Body: { refreshToken }
 */
app.post('/api/auth/tokens/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    // Find token record
    const tokenRecord = await Token.findOne({ refreshToken, isActive: true });
    if (!tokenRecord) {
      return res.status(401).json({ message: 'Refresh token not found or revoked' });
    }

    // Get updated user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken, expiresIn } = generateTokens(user);

    // Update token record
    tokenRecord.accessToken = accessToken;
    tokenRecord.refreshToken = newRefreshToken;
    tokenRecord.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    tokenRecord.refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    tokenRecord.lastUsedAt = new Date();
    await tokenRecord.save();

    return res.json({
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn,
    });
  } catch (error) {
    return res.status(401).json({ message: 'Token refresh failed: ' + error.message });
  }
});

/**
 * POST /api/auth/tokens/verify - Verify JWT token
 * Headers: Authorization: Bearer <token>
 */
app.post('/api/auth/tokens/verify', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      valid: true,
      user: sanitizeUser(user),
      expiresIn: req.user.exp ? new Date(req.user.exp * 1000) : null,
    });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});

/**
 * POST /api/auth/logout - Logout user (revoke tokens)
 * Headers: Authorization: Bearer <token>
 */
app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;

    // Revoke the current token
    await Token.findOneAndUpdate(
      { userId, accessToken: req.headers.authorization.split(' ')[1] },
      { isRevoked: true, revokedAt: new Date(), revokedReason: 'User logout' }
    );

    // Clear user's push tokens
    await clearUserPushTokens(userId);

    return res.json({ message: 'Successfully logged out' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/auth/tokens/check-expiring - Check if token is expiring soon
 * Headers: Authorization: Bearer <token>
 */
app.get('/api/auth/tokens/check-expiring', authMiddleware, (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];

    const expiringSoon = isTokenExpiringSoon(token, 24); // 24 hour threshold

    return res.json({
      expiringSoon,
      message: expiringSoon ? 'Token is expiring soon, consider refreshing' : 'Token is valid',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ================== PUSH TOKEN MANAGEMENT ENDPOINTS ==================

/**
 * POST /api/notifications/tokens - Register push notification token
 * Headers: Authorization: Bearer <token>
 * Body: { token, platform, deviceId, deviceName, appVersion, osVersion }
 */
app.post('/api/notifications/tokens', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { token, platform = 'android', deviceId = '', deviceName = 'Device', appVersion = '1.0.0', osVersion = '' } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Push token is required' });
    }

    const pushToken = await registerPushToken(userId, token, {
      platform,
      deviceId,
      deviceName,
      appVersion,
      osVersion,
    });

    return res.status(201).json({
      message: 'Push token registered',
      pushToken: {
        id: pushToken._id,
        token: pushToken.token,
        platform: pushToken.platform,
        isActive: pushToken.isActive,
        registered: pushToken.registeredAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/notifications/tokens - Get all user push tokens
 * Headers: Authorization: Bearer <token>
 */
app.get('/api/notifications/tokens', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const tokens = await getUserPushTokens(userId);

    return res.json({
      count: tokens.length,
      tokens: tokens.map(t => ({
        id: t._id,
        platform: t.platform,
        deviceName: t.deviceName,
        isActive: t.isActive,
        lastUsed: t.lastUsedAt,
        registered: t.registeredAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE /api/notifications/tokens/:tokenId - Deactivate a push token
 * Headers: Authorization: Bearer <token>
 */
app.delete('/api/notifications/tokens/:tokenId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { tokenId } = req.params;

    const pushToken = await PushToken.findById(tokenId);
    if (!pushToken || pushToken.userId.toString() !== userId) {
      return res.status(404).json({ message: 'Push token not found' });
    }

    await deactivatePushToken(userId, pushToken.token);

    return res.json({ message: 'Push token deactivated', tokenId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/notifications/tokens/logout-all - Deactivate all user push tokens
 * Headers: Authorization: Bearer <token>
 */
app.post('/api/notifications/tokens/logout-all', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const result = await clearUserPushTokens(userId);

    return res.json({
      message: 'All push tokens deactivated',
      deactivated: result.deactivated,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/notifications/tokens/:tokenId/preferences - Update notification preferences
 * Headers: Authorization: Bearer <token>
 * Body: { orders, promotions, reviews, messages, general }
 */
app.put('/api/notifications/tokens/:tokenId/preferences', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { tokenId } = req.params;
    const preferences = req.body;

    const pushToken = await PushToken.findById(tokenId);
    if (!pushToken || pushToken.userId.toString() !== userId) {
      return res.status(404).json({ message: 'Push token not found' });
    }

    pushToken.notificationPreferences = {
      ...pushToken.notificationPreferences,
      ...preferences,
    };

    await pushToken.save();

    return res.json({
      message: 'Notification preferences updated',
      preferences: pushToken.notificationPreferences,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ================== TOKEN CLEANUP ENDPOINTS ==================

/**
 * POST /api/admin/tokens/cleanup/inactive - Clean up inactive push tokens
 * Query: ?days=30 (default: 30)
 * Headers: Authorization: Bearer <token> (admin only)
 */
app.post('/api/admin/tokens/cleanup/inactive', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const days = parseInt(req.query.days) || 30;
    const result = await cleanupInactiveTokens(days);

    return res.json({
      message: `Inactive tokens cleanup completed (${days}+ days)`,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/admin/tokens/cleanup/failed - Remove failed push tokens
 * Query: ?threshold=3 (default: 3)
 * Headers: Authorization: Bearer <token> (admin only)
 */
app.post('/api/admin/tokens/cleanup/failed', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const threshold = parseInt(req.query.threshold) || 3;
    const result = await removeFailedTokens(threshold);

    return res.json({
      message: `Failed tokens cleanup completed (${threshold}+ failures)`,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/admin/tokens/stats - Get token cleanup statistics
 * Headers: Authorization: Bearer <token> (admin only)
 */
app.get('/api/admin/tokens/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const stats = await getStaleTokenStats();

    return res.json({
      message: 'Token cleanup statistics',
      ...stats,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  const { categoryId, query } = req.query;
  const filter = {};

  if (categoryId && categoryId !== 'all') {
    filter.categoryId = categoryId;
  }

  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ];
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });
  
  // Get review counts for all products
  const productsWithReviews = await Promise.all(
    products.map(async (product) => {
      const reviews = await Review.find({ productId: product._id.toString() });
      return {
        ...mapId(product),
        reviews: reviews.map(mapId),
        reviewCount: reviews.length
      };
    })
  );
  
  res.json({ products: productsWithReviews });
});

app.get('/api/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Get review count for this product (convert ObjectId to string for proper matching)
  const reviews = await Review.find({ productId: product._id.toString() });
  
  return res.json({ 
    product: {
      ...mapId(product),
      reviews: reviews.map(mapId),
      reviewCount: reviews.length
    }
  });
});

app.post('/api/products', async (req, res) => {
  const created = await Product.create(req.body);
  res.status(201).json({ product: mapId(created) });
});

app.put('/api/products/:id', async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.json({ product: mapId(updated) });
});

app.delete('/api/products/:id', async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.json({ id: req.params.id });
});

app.get('/api/categories', async (_req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json({ categories: categories.map(mapId) });
});

app.post('/api/categories', async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ category: mapId(category) });
});

app.get('/api/orders', async (req, res) => {
  try {
    const { userId, status, search, startDate, endDate, sortBy } = req.query;
    
    let filter = {};
    
    // Filter by user if provided
    if (userId) {
      filter.userId = userId;
    }
    
    // Filter by status if provided
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Search by order ID or customer name if provided
    if (search) {
      filter.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } },
        { 'customerDetails.email': { $regex: search, $options: 'i' } },
      ];
    }
    
    // Determine sort order
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sortBy === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sortBy === 'total_high') {
      sortOption = { total: -1 };
    } else if (sortBy === 'total_low') {
      sortOption = { total: 1 };
    }
    
    const orders = await Order.find(filter).sort(sortOption);
    res.json({ orders: orders.map(mapOrder) });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const payload = req.body || {};
  const created = await Order.create({
    ...payload,
    trackingNumber: payload.trackingNumber || `FS${Date.now()}`,
    status: payload.status || 'pending',
  });

  res.status(201).json({ order: mapOrder(created) });
});

app.patch('/api/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!updated) {
    return res.status(404).json({ message: 'Order not found' });
  }

  return res.json({ order: mapOrder(updated) });
});

app.patch('/api/orders/:id', async (req, res) => {
  const { paymentStatus, ...updates } = req.body;
  
  const updateData = { ...updates };
  if (paymentStatus) {
    updateData.paymentStatus = paymentStatus;
  }
  
  const updated = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!updated) {
    return res.status(404).json({ message: 'Order not found' });
  }

  return res.json({ order: mapOrder(updated) });
});

app.put('/api/orders/:id', async (req, res) => {
  const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) {
    return res.status(404).json({ message: 'Order not found' });
  }

  return res.json({ order: mapOrder(updated) });
});

app.patch('/api/orders/:id/cancel', async (req, res) => {
  const existing = await Order.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (existing.status === 'delivered') {
    return res.status(400).json({ message: 'Order cannot be cancelled' });
  }

  existing.status = 'cancelled';
  await existing.save();
  return res.json({ order: mapOrder(existing) });
});

// Check if order is delivered (can review products)
app.get('/api/orders/:orderId/can-review', async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  return res.json({ canReview: order.status === 'delivered' });
});

// Create a review for a product
app.post('/api/products/:productId/reviews', async (req, res) => {
  const { userId, userName, rating, comment, orderId, images, userProfileImage } = req.body;
  
  const productId = req.params.productId;
  const product = await Product.findById(productId);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Verify order is delivered
  if (orderId) {
    const order = await Order.findById(orderId);
    if (!order || order.status !== 'delivered') {
      return res.status(403).json({ message: 'Can only review delivered orders' });
    }
  }

  // Create new review - allow multiple reviews per user per product
  const newReview = new Review({
    productId,
    userId,
    userName: userName || 'Anonymous User',
    userProfileImage: userProfileImage || null,
    rating: Math.min(5, Math.max(1, rating)),
    comment: String(comment || '').trim(),
    images: Array.isArray(images) ? images.filter(img => img) : [],
    orderId,
    createdAt: new Date(),
  });

  await newReview.save();

  // Update product rating (average of all reviews for this product)
  const allReviews = await Review.find({ productId });
  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  product.rating = Math.round((totalRating / allReviews.length) * 10) / 10;
  await product.save();

  return res.status(201).json({ review: mapId(newReview), productRating: product.rating });
});

// Get product reviews
app.get('/api/products/:productId/reviews', async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
  const mappedReviews = reviews.map(mapId);

  return res.json({ reviews: mappedReviews, rating: product.rating });
});

// Update a review
app.put('/api/reviews/:reviewId', async (req, res) => {
  const { productId, userId, rating, comment } = req.body;
  const reviewId = req.params.reviewId;

  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  // Only user who created review can update it
  if (review.userId !== userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  review.rating = Math.min(5, Math.max(1, rating));
  review.comment = String(comment || '').trim();
  review.updatedAt = new Date();
  await review.save();

  // Recalculate product rating
  const product = await Product.findById(productId);
  const allReviews = await Review.find({ productId });
  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  product.rating = Math.round((totalRating / allReviews.length) * 10) / 10;
  await product.save();

  return res.json({ review: mapId(review), productRating: product.rating });
});

// Delete a review
app.delete('/api/reviews/:reviewId', async (req, res) => {
  const { productId, userId } = req.body;
  const reviewId = req.params.reviewId;

  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  // Only user who created review can delete it
  if (review.userId !== userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  await Review.findByIdAndDelete(reviewId);

  // Recalculate product rating
  const product = await Product.findById(productId);
  const allReviews = await Review.find({ productId });
  
  if (allReviews.length > 0) {
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = Math.round((totalRating / allReviews.length) * 10) / 10;
  } else {
    product.rating = 0;
  }

  await product.save();
  return res.json({ success: true });
});

// Admin: Approve review
app.put('/api/products/:productId/reviews/:reviewId/approve', async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  review.approved = true;
  review.flagged = false;
  review.rejectionReason = null;
  await review.save();

  return res.json({ review: mapId(review) });
});

// Admin: Reject review
app.put('/api/products/:productId/reviews/:reviewId/reject', async (req, res) => {
  const { rejectionReason } = req.body;
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  review.approved = false;
  review.rejectionReason = rejectionReason || 'Rejected by admin';
  await review.save();

  return res.json({ review: mapId(review) });
});

// Admin: Flag review
app.put('/api/products/:productId/reviews/:reviewId/flag', async (req, res) => {
  const { flagReason } = req.body;
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  review.flagged = true;
  review.flagReason = flagReason || 'Flagged by admin';
  await review.save();

  return res.json({ review: mapId(review) });
});

// Admin: Respond to review
app.put('/api/products/:productId/reviews/:reviewId/respond', async (req, res) => {
  const { sellerResponse } = req.body;
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  review.sellerResponse = sellerResponse;
  await review.save();

  return res.json({ review: mapId(review) });
});

// Clear all reviews (admin)
app.delete('/api/admin/reviews/clear', async (req, res) => {
  try {
    // Delete all reviews
    await Review.deleteMany({});

    // Reset all product ratings to 0
    await Product.updateMany({}, { rating: 0 });

    return res.json({ message: 'All reviews cleared successfully', success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to clear reviews', error: error.message });
  }
});

app.get('/api/users', async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users: users.map(sanitizeUser) });
});

app.post('/api/users', async (req, res) => {
  const incoming = { ...req.body };
  const normalizedFullName = String(incoming.fullName || incoming.name || '').trim();

  const user = await User.create({
    ...incoming,
    fullName: normalizedFullName,
    name: normalizedFullName,
    email: String(incoming.email || '').toLowerCase(),
  });

  res.status(201).json({ user: sanitizeUser(user) });
});

app.put('/api/users/:id', async (req, res) => {
  const incoming = { ...req.body };
  const normalizedFullName = String(incoming.fullName || incoming.name || '').trim();

  if (normalizedFullName) {
    incoming.fullName = normalizedFullName;
    incoming.name = normalizedFullName;
  }

  if (incoming.email) {
    incoming.email = String(incoming.email).toLowerCase();
  }

  const updated = await User.findByIdAndUpdate(req.params.id, incoming, { new: true });
  if (!updated) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user: sanitizeUser(updated) });
});

app.delete('/api/users/:id', async (req, res) => {
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ id: req.params.id });
});

app.get('/api/reviews', async (req, res) => {
  const { userId } = req.query;
  
  try {
    let query = {};
    if (userId) {
      query.userId = userId;
    }
    
    const reviews = await Review.find(query).sort({ createdAt: -1 });
    const mappedReviews = reviews.map(mapId);
    
    return res.json({ reviews: mappedReviews });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

app.get('/api/admin/shipping-rates', async (_req, res) => {
  const shippingRates = await ShippingRate.find().sort({ createdAt: -1 });
  res.json({ shippingRates: shippingRates.map(mapId) });
});

app.put('/api/admin/shipping-rates', async (req, res) => {
  const rateData = req.body;

  let rate;
  if (rateData.id) {
    rate = await ShippingRate.findByIdAndUpdate(rateData.id, rateData, { new: true });
  } else {
    rate = await ShippingRate.create(rateData);
  }

  const shippingRates = await ShippingRate.find().sort({ createdAt: -1 });
  res.json({
    shippingRates: shippingRates.map(mapId),
    updatedRate: mapId(rate),
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

const seedDefaults = async () => {
  const adminEmails = ['admin@fitsphere.com', 'admin@firsphere.com'];

  for (const adminEmail of adminEmails) {
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        email: adminEmail,
        password: 'admin123',
        fullName: 'Admin User',
        name: 'Admin User',
        role: 'admin',
      });
    }
  }
};

const start = async () => {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in server environment');
  }

  await mongoose.connect(MONGODB_URI);
  await seedDefaults();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitSphere API running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error('Failed to start API server', error);
  process.exit(1);
});
