import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Admin from '../models/Admin.model.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      if (decoded.type === 'student') {
        req.user = await User.findOne({ studentId: decoded.id }).select('-password');
        req.userType = 'student';
      } else if (decoded.type === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
        req.userType = 'admin';
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if student is blocked
      if (req.userType === 'student' && req.user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been blocked. Please contact admin.',
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.userType === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as admin',
    });
  }
};

// Student only middleware
export const studentOnly = (req, res, next) => {
  if (req.user && req.userType === 'student') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as student',
    });
  }
};
