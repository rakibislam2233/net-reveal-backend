import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { UserValidation } from '../validation/user.validation';
import { generalApiRateLimiter } from '../../middleware/rate-limit.middleware';

const router = Router();

// Validation middleware
const validateRequest = (schema: any) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
  };
};

const validateBody = (schema: any) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
  };
};

// Public routes
router.get(
  '/',
  generalApiRateLimiter,
  validateRequest(UserValidation.getUsers),
  userController.getUsers
);

router.get(
  '/search',
  generalApiRateLimiter,
  userController.searchUsers
);

router.get(
  '/stats',
  generalApiRateLimiter,
  userController.getUserStats
);

// Protected routes (require authentication)
router.get(
  '/profile',
  generalApiRateLimiter,
  userController.getProfile
);

router.put(
  '/profile',
  generalApiRateLimiter,
  validateBody(UserValidation.updateProfile),
  userController.updateProfile
);

router.get(
  '/preferences',
  generalApiRateLimiter,
  userController.getPreferences
);

router.put(
  '/preferences',
  generalApiRateLimiter,
  validateBody(UserValidation.updatePreferences),
  userController.updatePreferences
);

// Admin routes (require admin role)
router.get(
  '/:id',
  generalApiRateLimiter,
  userController.getUserById
);

router.put(
  '/:id',
  generalApiRateLimiter,
  validateBody(UserValidation.updateProfile),
  userController.updateUser
);

router.put(
  '/:id/status',
  generalApiRateLimiter,
  userController.updateUserStatus
);

router.delete(
  '/:id',
  generalApiRateLimiter,
  userController.deleteUser
);

export default router;
