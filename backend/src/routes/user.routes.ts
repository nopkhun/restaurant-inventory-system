import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  resetUserPassword
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  validate,
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  getUsersQuerySchema
} from '../validators/user.validator';

const router = express.Router();

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with filtering and pagination
 * @access  Private (Admin, Area Manager can see all; others see location-based)
 */
router.get(
  '/',
  authenticate,
  validate(getUsersQuerySchema),
  getUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin, Area Manager can see all; others see themselves or same location)
 */
router.get(
  '/:id',
  authenticate,
  getUserById
);

/**
 * @route   POST /api/v1/users
 * @desc    Create new user
 * @access  Private (Admin and Area Manager only)
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.AREA_MANAGER),
  validate(createUserSchema),
  createUser
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Admin, Area Manager can update all; others can update themselves with restrictions)
 */
router.put(
  '/:id',
  authenticate,
  validate(updateUserSchema),
  updateUser
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Deactivate user (soft delete)
 * @access  Private (Admin and Area Manager only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.AREA_MANAGER),
  deleteUser
);

/**
 * @route   PATCH /api/v1/users/:id/activate
 * @desc    Activate user
 * @access  Private (Admin and Area Manager only)
 */
router.patch(
  '/:id/activate',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.AREA_MANAGER),
  activateUser
);

/**
 * @route   PATCH /api/v1/users/:id/reset-password
 * @desc    Reset user password
 * @access  Private (Admin only)
 */
router.patch(
  '/:id/reset-password',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(resetPasswordSchema),
  resetUserPassword
);

export default router;