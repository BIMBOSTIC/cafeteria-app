import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 * @param {string} id - User/Admin ID
 * @param {string} type - 'student' or 'admin'
 * @returns {string} JWT token
 */
export const generateToken = (id, type = 'student') => {
  return jwt.sign(
    { id, type },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

/**
 * Generate refresh token
 * @param {string} id - User/Admin ID
 * @param {string} type - 'student' or 'admin'
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (id, type = 'student') => {
  return jwt.sign(
    { id, type },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};
