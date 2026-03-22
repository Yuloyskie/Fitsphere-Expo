/**
 * Secure Token Storage using Expo SecureStore
 * Handles JWT token persistence and retrieval
 */

import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'fitsphere_access_token',
  REFRESH_TOKEN: 'fitsphere_refresh_token',
  USER_ID: 'fitsphere_user_id',
  PUSH_TOKEN: 'fitsphere_push_token',
  DEVICE_ID: 'fitsphere_device_id',
};

/**
 * Save tokens securely to device storage
 * @param {Object} tokens - { accessToken, refreshToken, user }
 * @returns {Promise<boolean>} - true if saved successfully
 */
export async function saveTokensSecurely(tokens) {
  try {
    if (!tokens || !tokens.accessToken) {
      throw new Error('Invalid tokens object');
    }

    // Save tokens to secure storage
    await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);

    // Save user ID for quick reference
    if (tokens.user && tokens.user.id) {
      await SecureStore.setItemAsync(TOKEN_KEYS.USER_ID, tokens.user.id);
    }

    console.log('[TokenStore] Tokens saved securely');
    return true;
  } catch (error) {
    console.error('[TokenStore] Failed to save tokens:', error);
    throw new Error(`Token save failed: ${error.message}`);
  }
}

/**
 * Get access token from secure storage
 * @returns {Promise<string|null>} - Access token or null if not found
 */
export async function getAccessToken() {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
    return token || null;
  } catch (error) {
    console.error('[TokenStore] Failed to get access token:', error);
    return null;
  }
}

/**
 * Get refresh token from secure storage
 * @returns {Promise<string|null>} - Refresh token or null if not found
 */
export async function getRefreshToken() {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
    return token || null;
  } catch (error) {
    console.error('[TokenStore] Failed to get refresh token:', error);
    return null;
  }
}

/**
 * Get stored user ID
 * @returns {Promise<string|null>} - User ID or null
 */
export async function getStoredUserId() {
  try {
    const userId = await SecureStore.getItemAsync(TOKEN_KEYS.USER_ID);
    return userId || null;
  } catch (error) {
    console.error('[TokenStore] Failed to get user ID:', error);
    return null;
  }
}

/**
 * Clear all tokens from secure storage
 * @returns {Promise<boolean>} - true if cleared successfully
 */
export async function clearAllTokens() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(TOKEN_KEYS.USER_ID);
    await SecureStore.deleteItemAsync(TOKEN_KEYS.PUSH_TOKEN);

    console.log('[TokenStore] All tokens cleared');
    return true;
  } catch (error) {
    console.error('[TokenStore] Failed to clear tokens:', error);
    return false;
  }
}

/**
 * Check if tokens exist in storage
 * @returns {Promise<boolean>} - true if both tokens exist
 */
export async function hasTokens() {
  try {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    return !!(accessToken && refreshToken);
  } catch (error) {
    console.error('[TokenStore] Failed to check tokens:', error);
    return false;
  }
}

/**
 * Get all tokens (both access and refresh)
 * @returns {Promise<Object|null>} - { accessToken, refreshToken } or null
 */
export async function getAllTokens() {
  try {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('[TokenStore] Failed to get all tokens:', error);
    return null;
  }
}

/**
 * Save push notification token
 * @param {String} token - Expo push token
 * @returns {Promise<boolean>} - true if saved
 */
export async function savePushToken(token) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEYS.PUSH_TOKEN, token);
    console.log('[TokenStore] Push token saved securely');
    return true;
  } catch (error) {
    console.error('[TokenStore] Failed to save push token:', error);
    return false;
  }
}

/**
 * Get saved push notification token
 * @returns {Promise<string|null>} - Push token or null
 */
export async function getPushToken() {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEYS.PUSH_TOKEN);
    return token || null;
  } catch (error) {
    console.error('[TokenStore] Failed to get push token:', error);
    return null;
  }
}

/**
 * Register push notification token with backend
 * @param {String} accessToken - JWT access token
 * @param {String} pushToken - Expo push token
 * @param {Object} deviceInfo - Device information
 * @returns {Promise<Object>} - Response from backend
 */
export async function registerPushTokenWithBackend(accessToken, pushToken, deviceInfo = {}) {
  try {
    if (!accessToken || !pushToken) {
      throw new Error('Access token and push token are required');
    }

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/tokens`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          token: pushToken,
          platform: deviceInfo.platform || 'android',
          deviceId: deviceInfo.deviceId || '',
          deviceName: deviceInfo.deviceName || 'Unknown Device',
          appVersion: deviceInfo.appVersion || '1.0.0',
          osVersion: deviceInfo.osVersion || '',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[TokenStore] Push token registered with backend');
    return data;
  } catch (error) {
    console.error('[TokenStore] Failed to register push token:', error);
    throw error;
  }
}

/**
 * Update notification preferences for a device
 * @param {String} accessToken - JWT access token
 * @param {String} pushTokenId - Backend push token ID
 * @param {Object} preferences - Notification preferences
 * @returns {Promise<Object>} - Response from backend
 */
export async function updateNotificationPreferences(accessToken, pushTokenId, preferences) {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/tokens/${pushTokenId}/preferences`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preferences),
      }
    );

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[TokenStore] Failed to update preferences:', error);
    throw error;
  }
}

/**
 * Deactivate push token on logout
 * @param {String} accessToken - JWT access token
 * @param {String} pushTokenId - Backend push token ID
 * @returns {Promise<Object>} - Response from backend
 */
export async function deactivatePushTokenOnLogout(accessToken, pushTokenId) {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/tokens/${pushTokenId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[TokenStore] Push token deactivated on logout');
    return data;
  } catch (error) {
    console.error('[TokenStore] Failed to deactivate push token:', error);
    throw error;
  }
}

/**
 * Get and set up device ID for persistent device identification
 * @returns {Promise<string>} - Device ID
 */
export async function getOrCreateDeviceId() {
  try {
    let deviceId = await SecureStore.getItemAsync(TOKEN_KEYS.DEVICE_ID);

    if (!deviceId) {
      // Create new device ID (UUID v4 format)
      deviceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await SecureStore.setItemAsync(TOKEN_KEYS.DEVICE_ID, deviceId);
      console.log('[TokenStore] New device ID created:', deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('[TokenStore] Failed to get/create device ID:', error);
    // Return a temporary device ID if storage fails
    return `temp-${Date.now()}`;
  }
}

export default {
  saveTokensSecurely,
  getAccessToken,
  getRefreshToken,
  getStoredUserId,
  clearAllTokens,
  hasTokens,
  getAllTokens,
  savePushToken,
  getPushToken,
  registerPushTokenWithBackend,
  updateNotificationPreferences,
  deactivatePushTokenOnLogout,
  getOrCreateDeviceId,
};
