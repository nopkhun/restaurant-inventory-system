import express from 'express';
import {
  login,
  register,
  refresh,
  logout,
  logoutAll,
  getProfile,
  changePassword
} from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  validate,
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  changePasswordSchema
} from '../validators/auth.validator';

const router = express.Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', validate(loginSchema), login);

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user (admin only)
 * @access  Private (Admin only)
 */
router.post(
  '/register',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(registerSchema),
  register
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', validate(refreshTokenSchema), refresh);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    User logout
 * @access  Public
 */
router.post('/logout', logout);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', authenticate, logoutAll);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;