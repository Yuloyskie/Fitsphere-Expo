/**
 * Push Token Management Utilities
 * Handles push token registration, cleanup, and validation
 */

const { PushToken, StaleToken } = require('./schemas');

/**
 * Register or update a push notification token
 * @param {String} userId - User ID
 * @param {String} token - Push token from Expo/FCM
 * @param {Object} deviceInfo - Device information { platform, deviceId, deviceName, appVersion, osVersion }
 * @returns {Promise<Object>} - Registered push token
 */
async function registerPushToken(userId, token, deviceInfo = {}) {
  try {
    if (!userId || !token) {
      throw new Error('userId and token are required');
    }

    const {
      platform = 'android',
      deviceId = '',
      deviceName = 'Unknown Device',
      appVersion = '1.0.0',
      osVersion = '',
    } = deviceInfo;

    // Check if token already exists for this user
    let pushToken = await PushToken.findOne({
      userId,
      token,
    });

    if (pushToken) {
      // Update existing token
      pushToken.isActive = true;
      pushToken.lastUsedAt = new Date();
      pushToken.failureCount = 0;
      pushToken.lastFailureAt = undefined;
      pushToken.deviceName = deviceName;
      pushToken.appVersion = appVersion;
      pushToken.osVersion = osVersion;
      await pushToken.save();
      return pushToken;
    }

    // Create new push token
    pushToken = new PushToken({
      userId,
      token,
      tokenType: 'expo', // Default to Expo
      platform,
      deviceId,
      deviceName,
      appVersion,
      osVersion,
      isActive: true,
      registeredAt: new Date(),
      notificationPreferences: {
        orders: true,
        promotions: true,
        reviews: true,
        messages: true,
        general: true,
      },
    });

    await pushToken.save();
    return pushToken;
  } catch (error) {
    throw new Error(`Failed to register push token: ${error.message}`);
  }
}

/**
 * Get all active push tokens for a user
 * @param {String} userId - User ID
 * @returns {Promise<Array>} - Array of active push tokens
 */
async function getUserPushTokens(userId) {
  try {
    const tokens = await PushToken.find({
      userId,
      isActive: true,
    }).sort({ lastUsedAt: -1 });

    return tokens;
  } catch (error) {
    throw new Error(`Failed to get push tokens: ${error.message}`);
  }
}

/**
 * Deactivate a push token (logout from device)
 * @param {String} userId - User ID
 * @param {String} token - Push token to deactivate
 * @returns {Promise<Boolean>} - true if deactivated
 */
async function deactivatePushToken(userId, token) {
  try {
    const result = await PushToken.findOneAndUpdate(
      { userId, token },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (result) {
      // Mark token as stale
      await markTokenAsStale(userId, result._id, 'manual_logout');
    }

    return !!result;
  } catch (error) {
    throw new Error(`Failed to deactivate push token: ${error.message}`);
  }
}

/**
 * Mark a push token as failed
 * @param {String} pushTokenId - Push token ID (MongoDB ObjectId)
 * @param {String} reason - Reason for failure
 * @returns {Promise<Object>} - Updated push token
 */
async function markTokenFailed(pushTokenId, reason = 'invalid_token') {
  try {
    const pushToken = await PushToken.findById(pushTokenId);
    if (!pushToken) {
      return null;
    }

    pushToken.failureCount = (pushToken.failureCount || 0) + 1;
    pushToken.lastFailureAt = new Date();
    pushToken.failureReason = reason;

    // Mark as inactive after 3 failures
    if (pushToken.failureCount >= 3) {
      pushToken.isActive = false;
      // Mark as stale
      await markTokenAsStale(pushToken.userId, pushTokenId, 'failed_send');
    }

    await pushToken.save();
    return pushToken;
  } catch (error) {
    throw new Error(`Failed to mark token failed: ${error.message}`);
  }
}

/**
 * Mark a token as stale (needs cleanup)
 * @param {String} userId - User ID
 * @param {String} pushTokenId - Push token ID
 * @param {String} reason - Reason for marking as stale
 * @returns {Promise<Object>} - Created stale token record
 */
async function markTokenAsStale(userId, pushTokenId, reason) {
  try {
    const pushToken = await PushToken.findById(pushTokenId);

    const staleToken = new StaleToken({
      userId,
      pushTokenId,
      reason,
      markedAt: new Date(),
      lastUsedAt: pushToken?.lastUsedAt,
    });

    await staleToken.save();
    return staleToken;
  } catch (error) {
    throw new Error(`Failed to mark stale token: ${error.message}`);
  }
}

/**
 * Update token last used timestamp
 * @param {String} pushTokenId - Push token ID
 * @returns {Promise<Object>} - Updated push token
 */
async function updateTokenLastUsed(pushTokenId) {
  try {
    const updated = await PushToken.findByIdAndUpdate(
      pushTokenId,
      { lastUsedAt: new Date() },
      { new: true }
    );
    return updated;
  } catch (error) {
    throw new Error(`Failed to update token last used: ${error.message}`);
  }
}

/**
 * Clean up stale tokens (inactive for 30+ days)
 * @param {Number} inactiveDays - Days of inactivity to consider stale (default 30)
 * @returns {Promise<Object>} - { removed: number, marked: number }
 */
async function cleanupInactiveTokens(inactiveDays = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

    // Find inactive tokens
    const inactiveTokens = await PushToken.find({
      lastUsedAt: { $lt: cutoffDate },
      isActive: true,
    });

    let markedCount = 0;

    // Mark as stale
    for (const token of inactiveTokens) {
      await markTokenAsStale(
        token.userId,
        token._id,
        inactiveDays >= 90 ? 'inactive_90_days' : 'inactive_30_days'
      );

      await PushToken.findByIdAndUpdate(token._id, { isActive: false });
      markedCount++;
    }

    // Remove old stale token records (older than 30 days)
    const staleCutoffDate = new Date();
    staleCutoffDate.setDate(staleCutoffDate.getDate() - 30);

    const removeResult = await StaleToken.deleteMany({
      markedAt: { $lt: staleCutoffDate },
    });

    return {
      markedInactive: markedCount,
      removedStaleRecords: removeResult.deletedCount,
    };
  } catch (error) {
    throw new Error(`Failed to cleanup inactive tokens: ${error.message}`);
  }
}

/**
 * Remove failed tokens (with multiple failures)
 * @param {Number} failureThreshold - Number of failures to consider for removal (default 3)
 * @returns {Promise<Object>} - { removed: number, marked: number }
 */
async function removeFailedTokens(failureThreshold = 3) {
  try {
    // Find tokens with high failure count
    const failedTokens = await PushToken.find({
      failureCount: { $gte: failureThreshold },
      isActive: true,
    });

    let markedCount = 0;

    for (const token of failedTokens) {
      await markTokenAsStale(token.userId, token._id, 'device_unreachable');
      await PushToken.findByIdAndUpdate(token._id, { isActive: false });
      markedCount++;
    }

    // Remove old stale records
    const staleCutoffDate = new Date();
    staleCutoffDate.setDate(staleCutoffDate.getDate() - 7);

    const removeResult = await StaleToken.deleteMany({
      reason: 'failed_send',
      markedAt: { $lt: staleCutoffDate },
    });

    return {
      markedFailed: markedCount,
      removedOldRecords: removeResult.deletedCount,
    };
  } catch (error) {
    throw new Error(`Failed to remove failed tokens: ${error.message}`);
  }
}

/**
 * Get stale token cleanup statistics
 * @returns {Promise<Object>} - Statistics about stale tokens
 */
async function getStaleTokenStats() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveCount = await PushToken.countDocuments({
      lastUsedAt: { $lt: thirtyDaysAgo },
      isActive: true,
    });

    const failedCount = await PushToken.countDocuments({
      failureCount: { $gte: 3 },
      isActive: true,
    });

    const staleRecordsCount = await StaleToken.countDocuments({});

    const recentlyMarked = await StaleToken.countDocuments({
      markedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    return {
      inactiveTokens: inactiveCount,
      failedTokens: failedCount,
      staleRecords: staleRecordsCount,
      recentlyMarkedStale: recentlyMarked,
    };
  } catch (error) {
    throw new Error(`Failed to get stale token stats: ${error.message}`);
  }
}

/**
 * Clear all push tokens for a user (complete logout)
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - { deactivated: number }
 */
async function clearUserPushTokens(userId) {
  try {
    const result = await PushToken.updateMany(
      { userId, isActive: true },
      {
        isActive: false,
        updatedAt: new Date(),
      }
    );

    return {
      deactivated: result.modifiedCount,
    };
  } catch (error) {
    throw new Error(`Failed to clear user push tokens: ${error.message}`);
  }
}

module.exports = {
  registerPushToken,
  getUserPushTokens,
  deactivatePushToken,
  markTokenFailed,
  markTokenAsStale,
  updateTokenLastUsed,
  cleanupInactiveTokens,
  removeFailedTokens,
  getStaleTokenStats,
  clearUserPushTokens,
};
