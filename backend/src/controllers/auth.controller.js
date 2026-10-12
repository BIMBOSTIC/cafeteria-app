import User from '../models/User.model.js';
import Admin from '../models/Admin.model.js';
import { generateToken } from '../utils/generateToken.js';

/**
 * @desc    Register student
 * @route   POST /api/auth/student/register
 * @access  Public
 */
export const registerStudent = async (req, res) => {
  try {
    const { studentId, name, email, password, phoneNumber } = req.body;

    // Validation
    if (!studentId || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if student already exists
    const existingStudent = await User.findOne({
      $or: [{ studentId }, { email }],
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student ID or email already registered',
      });
    }

    // Create student
    const student = await User.create({
      studentId: studentId.toUpperCase(),
      name,
      email: email.toLowerCase(),
      password,
      phoneNumber,
    });

    // Generate token
    const token = generateToken(student.studentId, 'student');

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      user: {
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber,
      },
      token,
    });
  } catch (error) {
    console.error('Register student error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

/**
 * @desc    Login student
 * @route   POST /api/auth/student/login
 * @access  Public
 */
export const loginStudent = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // Validation
    if (!studentId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide student ID and password',
      });
    }

    // Find student (include password for comparison)
    const student = await User.findOne({
      studentId: studentId.toUpperCase(),
    }).select('+password');

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if student is blocked
    if (student.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact admin.',
      });
    }

    // Compare password
    const isPasswordMatch = await student.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(student.studentId, 'student');

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber,
      },
      token,
    });
  } catch (error) {
    console.error('Login student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

/**
 * @desc    Login admin
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    // Find admin (include password for comparison)
    const admin = await Admin.findOne({
      username: username.toLowerCase(),
    }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare password
    const isPasswordMatch = await admin.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(admin._id.toString(), 'admin');

    res.json({
      success: true,
      message: 'Admin login successful',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

/**
 * @desc    Register FCM token for push notifications
 * @route   POST /api/auth/register-fcm-token
 * @access  Private/Student
 */
export const registerFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required',
      });
    }

    await User.findOneAndUpdate(
      { studentId: req.user.studentId },
      { fcmToken }
    );

    res.json({ success: true, message: 'FCM token registered' });
  } catch (error) {
    console.error('Register FCM token error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get current user/admin profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    if (req.userType === 'student') {
      res.json({
        success: true,
        user: {
          studentId: req.user.studentId,
          name: req.user.name,
          email: req.user.email,
          phoneNumber: req.user.phoneNumber,
          isBlocked: req.user.isBlocked,
        },
        type: 'student',
      });
    } else if (req.userType === 'admin') {
      res.json({
        success: true,
        admin: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
        },
        type: 'admin',
      });
    }
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
