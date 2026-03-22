import { Platform } from 'react-native';
import Constants from 'expo-constants';

const normalizeBaseUrl = (url) => String(url || '').trim().replace(/\/$/, '');

const extractHost = (value) => {
  if (!value) {
    return null;
  }

  const text = String(value).trim();

  // Handles values like 192.168.1.10:8081, exp://192.168.1.10:8081, http://localhost:8081
  const match = text.match(/^(?:[a-z]+:\/\/)?([^/:?#]+)(?::\d+)?/i);
  return match?.[1] || null;
};

const extractExpoHost = () => {
  const hostUriCandidates = [
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost,
    Constants.expoGoConfig?.debuggerHost,
    Constants.linkingUri,
  ];

  for (const candidate of hostUriCandidates) {
    const host = extractHost(candidate);
    if (host) {
      return host;
    }
  }

  return null;
};

const resolveBaseUrlCandidates = () => {
  const configured = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
  const candidates = [];

  if (configured) {
    candidates.push(configured);
  }

  if (Platform.OS === 'web') {
    candidates.push('http://localhost:5000/api');
  } else {
    const expoHost = extractExpoHost();
    if (expoHost && expoHost !== 'localhost') {
      candidates.push(`http://${expoHost}:5000/api`);
    }

    // Android emulator reaches host via 10.0.2.2.
    if (Platform.OS === 'android') {
      candidates.push('http://10.0.2.2:5000/api');
    }

    // Simulator / local fallback.
    candidates.push('http://localhost:5000/api');
  }

  return [...new Set(candidates.map(normalizeBaseUrl).filter(Boolean))];
};

const API_BASE_URL_CANDIDATES = resolveBaseUrlCandidates();
export let API_BASE_URL = API_BASE_URL_CANDIDATES[0] || 'http://localhost:5000/api';
const REQUEST_TIMEOUT_MS = 8000;

const request = async (path, options = {}) => {
  const networkErrors = [];

  for (const baseUrl of API_BASE_URL_CANDIDATES) {
    let response;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      response = await fetch(`${baseUrl}${path}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        signal: controller.signal,
        ...options,
      });
    } catch (_error) {
      networkErrors.push(baseUrl);
      clearTimeout(timeoutId);
      continue;
    }
    clearTimeout(timeoutId);

    API_BASE_URL = baseUrl;

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  throw new Error(
    `Network request failed. Tried: ${networkErrors.join(', ') || API_BASE_URL}. Check backend is running and phone/emulator can reach this host.`
  );
};

export const apiGet = (path) => request(path);
export const apiPost = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
export const apiPut = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) });
export const apiPatch = (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) });
export const apiDelete = (path, body) => request(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined });

// ================== TOKEN-AWARE API FUNCTIONS ==================

/**
 * Make authenticated API request with JWT token
 * Automatically includes Authorization header
 */
export const apiWithAuth = async (path, options = {}, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return request(path, {
    ...options,
    headers,
  });
};

/**
 * GET request with authentication
 */
export const apiGetAuth = (path, token) => apiWithAuth(path, {}, token);

/**
 * POST request with authentication
 */
export const apiPostAuth = (path, body, token) =>
  apiWithAuth(path, { method: 'POST', body: JSON.stringify(body) }, token);

/**
 * PUT request with authentication
 */
export const apiPutAuth = (path, body, token) =>
  apiWithAuth(path, { method: 'PUT', body: JSON.stringify(body) }, token);

/**
 * DELETE request with authentication
 */
export const apiDeleteAuth = (path, token) =>
  apiWithAuth(path, { method: 'DELETE' }, token);

// ================== TOKEN MANAGEMENT API FUNCTIONS ==================

/**
 * Generate JWT tokens on login
 */
export const generateTokens = (userId, email, role) =>
  apiPost('/auth/tokens', { userId, email, role });

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = (refreshToken) =>
  apiPost('/auth/tokens/refresh', { refreshToken });

/**
 * Verify JWT token is still valid
 */
export const verifyToken = (accessToken) =>
  apiWithAuth('/auth/tokens/verify', {}, accessToken);

/**
 * Check if token is expiring soon
 */
export const checkTokenExpiring = (accessToken) =>
  apiWithAuth('/auth/tokens/check-expiring', {}, accessToken);

/**
 * Logout user (revoke tokens on backend)
 */
export const logoutUser = (accessToken) =>
  apiWithAuth('/auth/logout', { method: 'POST' }, accessToken);

// ================== PUSH TOKEN API FUNCTIONS ==================

/**
 * Register push notification token with backend
 */
export const registerPushToken = (token, platform, deviceId, deviceName, appVersion, osVersion, accessToken) =>
  apiPostAuth('/notifications/tokens', {
    token,
    platform,
    deviceId,
    deviceName,
    appVersion,
    osVersion,
  }, accessToken);

/**
 * Get all registered push tokens for user
 */
export const getPushTokens = (accessToken) =>
  apiGetAuth('/notifications/tokens', accessToken);

/**
 * Deactivate a specific push token
 */
export const deactivatePushToken = (tokenId, accessToken) =>
  apiDeleteAuth(`/notifications/tokens/${tokenId}`, accessToken);

/**
 * Logout from all devices (deactivate all push tokens)
 */
export const logoutAllDevices = (accessToken) =>
  apiWithAuth('/notifications/tokens/logout-all', { method: 'POST' }, accessToken);

/**
 * Update notification preferences for a device
 */
export const updateNotificationPreferences = (tokenId, preferences, accessToken) =>
  apiPutAuth(`/notifications/tokens/${tokenId}/preferences`, preferences, accessToken);

// ================== ADMIN TOKEN CLEANUP API FUNCTIONS ==================

/**
 * Clean up inactive push tokens (admin only)
 */
export const cleanupInactiveTokens = (days = 30, accessToken) =>
  apiWithAuth(`/admin/tokens/cleanup/inactive?days=${days}`, { method: 'POST' }, accessToken);

/**
 * Remove failed push tokens (admin only)
 */
export const removeFailedTokens = (threshold = 3, accessToken) =>
  apiWithAuth(`/admin/tokens/cleanup/failed?threshold=${threshold}`, { method: 'POST' }, accessToken);

/**
 * Get token cleanup statistics (admin only)
 */
export const getTokenStats = (accessToken) =>
  apiGetAuth('/admin/tokens/stats', accessToken);
