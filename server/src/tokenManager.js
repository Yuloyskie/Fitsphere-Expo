/**
 * JWT Token Management Middleware & Utilities
 * Handles token generation, verification, and refresh
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fitsphere-secret-key-2024-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d'; // Token valid for 7 days
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '30d'; // Refresh token valid for 30 days

/**
 * Generate JWT Token
 * @param {Object} user - User object (should have id, email, role)
 * @returns {Object} - { accessToken, refreshToken, expiresIn }
 */
function generateTokens(user) {
  if (!user || !user._id) {
    throw new Error('User object with _id is required');
  }

  // Access Token (short-lived)
  const accessToken = jwt.sign(
    {
      userId: String(user._id),
      email: user.email,
      role: user.role,
      type: 'access',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );

  // Refresh Token (long-lived)
  const refreshToken = jwt.sign(
    {
      userId: String(user._id),
      email: user.email,
      type: 'refresh',
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRATION }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: '7d',
    refreshExpiresIn: '30d',
  };
}

/**
 * Verify JWT Token
 * @param {String} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

/**
 * Reverse verify token (without throwing error)
 * @param {String} token - JWT token to verify
 * @returns {Object|null} - Decoded token or null if invalid
 */
function verifyTokenSafe(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} - Token or null
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  return parts[1];
}

/**
 * Middleware to verify JWT token
 * Attaches decoded token to req.user
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    if (decoded.type !== 'access') {
      return res.status(401).json({ message: 'Invalid token type' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

/**
 * Get token expiration date
 * @param {String} token - JWT token
 * @returns {Date|null} - Expiration date or null if invalid
 */
function getTokenExpiration(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return null;
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 * @param {String} token - JWT token
 * @returns {Boolean} - true if expired, false if still valid
 */
function isTokenExpired(token) {
  try {
    jwt.verify(token, JWT_SECRET);
    return false;
  } catch (error) {
    return error.name === 'TokenExpiredError';
  }
}

/**
 * Check if token is expiring soon (within specified hours)
 * @param {String} token - JWT token
 * @param {Number} hoursThreshold - Hours threshold (default 24)
 * @returns {Boolean} - true if expiring soon
 */
function isTokenExpiringSoon(token, hoursThreshold = 24) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return false;

    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    const hoursUntilExpiration = timeUntilExpiration / (1000 * 60 * 60);

    return hoursUntilExpiration < hoursThreshold;
  } catch {
    return true;
  }
}

module.exports = {
  generateTokens,
  verifyToken,
  verifyTokenSafe,
  extractTokenFromHeader,
  authMiddleware,
  getTokenExpiration,
  isTokenExpired,
  isTokenExpiringSoon,
  JWT_SECRET,
  JWT_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
};
