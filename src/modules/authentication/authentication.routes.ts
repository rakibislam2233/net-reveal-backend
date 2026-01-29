import { Router } from 'express';
import { generalApiRateLimiter, loginRateLimiter } from '../../middleware/rate-limit.middleware';
import { AuthValidation } from './auth.validation';
import { authenticationController } from './authentication.controller';

const router = Router();

// Validation middleware
const validateRequest = (schema: any) => {
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
router.post(
  '/register',
  generalApiRateLimiter,
  validateRequest(AuthValidation.register),
  authenticationController.register
);

router.post(
  '/login',
  loginRateLimiter,
  validateRequest(AuthValidation.login),
  authenticationController.login
);

router.post(
  '/refresh-token',
  generalApiRateLimiter,
  validateRequest(AuthValidation.refreshToken),
  authenticationController.refreshToken
);

router.post(
  '/forgot-password',
  generalApiRateLimiter,
  validateRequest(AuthValidation.forgotPassword),
  authenticationController.forgotPassword
);

router.post(
  '/reset-password',
  generalApiRateLimiter,
  validateRequest(AuthValidation.resetPassword),
  authenticationController.resetPassword
);

router.post(
  '/verify-email',
  generalApiRateLimiter,
  validateRequest(AuthValidation.verifyEmail),
  authenticationController.verifyEmail
);

// Protected routes (require authentication)
router.post(
  '/logout',
  generalApiRateLimiter,
  validateRequest(AuthValidation.refreshToken),
  authenticationController.logout
);

router.post(
  '/change-password',
  generalApiRateLimiter,
  validateRequest(AuthValidation.changePassword),
  authenticationController.changePassword
);

router.get(
  '/profile',
  generalApiRateLimiter,
  authenticationController.getProfile
);

export default router;
