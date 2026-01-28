import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authenticationService } from '../services/authentication.service';
import { 
  RegisterRequest, 
  LoginRequest, 
  RefreshTokenRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest
} from '../interfaces/auth.interface';

export class AuthenticationController {
  // Register user
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: RegisterRequest = req.body;
      const result = await authenticationService.register(userData);

      res.status(StatusCodes.CREATED).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Login user
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;
      const result = await authenticationService.login(loginData);

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Refresh token
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokenData: RefreshTokenRequest = req.body;
      const result = await authenticationService.refreshToken(tokenData);

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
        message: 'Token refreshed successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Logout
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokenData: RefreshTokenRequest = req.body;
      const result = await authenticationService.logout(tokenData);

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Change password
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const passwordData: ChangePasswordRequest = req.body;
      const result = await authenticationService.changePassword(userId, passwordData);

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Forgot password
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const forgotPasswordData: ForgotPasswordRequest = req.body;
      const result = await authenticationService.forgotPassword(forgotPasswordData);

      res.status(StatusCodes.OK).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Reset password
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resetPasswordData: ResetPasswordRequest = req.body;
      const result = await authenticationService.resetPassword(resetPasswordData);

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Verify email
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const verifyEmailData: VerifyEmailRequest = req.body;
      const result = await authenticationService.verifyEmail(verifyEmailData);

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get current user profile
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      
      if (!user) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: {
          id: user.userId,
          email: user.email,
          role: user.role,
        },
        message: 'Profile retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const authenticationController = new AuthenticationController();
