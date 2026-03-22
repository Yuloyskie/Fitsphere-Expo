/**
 * Token Storage Schema & Model
 * Stores JWT tokens and push notification tokens
 */

const mongoose = require('mongoose');

// JWT Token Storage Schema
// Used to track active tokens, handle token revocation, and manage token lifecycle
const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accessToken: {
      type: String,
      required: true,
      unique: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    tokenType: {
      type: String,
      enum: ['web', 'mobile', 'desktop'],
      default: 'mobile',
      index: true,
    },
    deviceInfo: {
      userAgent: String,
      deviceId: String,
      deviceName: String,
      platform: {
        type: String,
        enum: ['ios', 'android', 'web', 'windows', 'macos', 'linux'],
        default: 'android',
      },
    },
    ipAddress: String,
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      // Auto-delete 7 days after expiration
      expires: 604800,
    },
    refreshExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: Date,
    revokedReason: String,
    lastUsedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
tokenSchema.index({ userId: 1, isActive: 1 });
tokenSchema.index({ userId: 1, isRevoked: 1 });
tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

// Push Notification Token Schema
// Stores device push notification tokens for sending notifications
const pushTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tokenType: {
      type: String,
      enum: ['expo', 'fcm', 'apns'],
      default: 'expo',
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web'],
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    deviceName: String,
    appVersion: String,
    osVersion: String,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    notificationPreferences: {
      orders: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      reviews: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      general: { type: Boolean, default: true },
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    lastFailureAt: Date,
    failureReason: String,
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      index: true,
      // Auto-delete 1 year after expiration
      expires: 31536000,
    },
  },
  { timestamps: true }
);

// Index for efficient token queries by user
pushTokenSchema.index({ userId: 1, isActive: 1 });
pushTokenSchema.index({ userId: 1, platform: 1 });
pushTokenSchema.index({ lastUsedAt: 1 });

// Stale Token Schema (for tracking tokens to be removed)
const staleTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    pushTokenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PushToken',
    },
    reason: {
      type: String,
      enum: [
        'expired',
        'inactive_30_days',
        'inactive_90_days',
        'failed_send',
        'manual_logout',
        'device_unreachable',
        'invalid_token',
      ],
      required: true,
    },
    markedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    removedAt: Date,
    lastUsedAt: Date,
  },
  { timestamps: true }
);

// Index for cleanup queries
staleTokenSchema.index({ markedAt: 1 });
staleTokenSchema.index({ removedAt: 1 });

const Token = mongoose.model('Token', tokenSchema);
const PushToken = mongoose.model('PushToken', pushTokenSchema);
const StaleToken = mongoose.model('StaleToken', staleTokenSchema);

module.exports = {
  Token,
  PushToken,
  StaleToken,
  tokenSchema,
  pushTokenSchema,
  staleTokenSchema,
};
