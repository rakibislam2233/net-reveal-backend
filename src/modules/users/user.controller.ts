import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { userService } from './user.service';
import { UpdateUserRequest, UpdateUserPreferencesRequest } from './user.interface';

export class UserController {
  // Get all users (admin only)
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page,
        limit,
        search,
        role,
        status,
        sortBy,
        sortOrder
      } = req.query;

      const result = await userService.getUsers({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        role: role as string,
        status: status as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as string,
      });

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
        message: 'Users retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: user,
        message: 'User retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get current user profile
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const user = await userService.getUserById(userId);

      if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: user,
        message: 'Profile retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const updateData: UpdateUserRequest = req.body;
      const user = await userService.updateUser(userId, updateData);

      res.status(StatusCodes.OK).json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Update user preferences
  async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const preferencesData: UpdateUserPreferencesRequest = req.body;
      const preferences = await userService.updateUserPreferences(userId, preferencesData);

      res.status(StatusCodes.OK).json({
        success: true,
        data: preferences,
        message: 'Preferences updated successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get user preferences
  async getPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const preferences = await userService.getUserPreferences(userId);

      res.status(StatusCodes.OK).json({
        success: true,
        data: preferences,
        message: 'Preferences retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Update user (admin only)
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateUserRequest = req.body;
      
      const user = await userService.updateUser(id, updateData);

      res.status(StatusCodes.OK).json({
        success: true,
        data: user,
        message: 'User updated successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Update user status (admin only)
  async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Status is required',
        });
        return;
      }

      const user = await userService.updateUserStatus(id, status);

      res.status(StatusCodes.OK).json({
        success: true,
        data: user,
        message: 'User status updated successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Delete user (admin only)
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      await userService.deleteUser(id);

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get user statistics (admin only)
  async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await userService.getUserStats();

      res.status(StatusCodes.OK).json({
        success: true,
        data: stats,
        message: 'User statistics retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Search users (admin only)
  async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q: query, limit = 10 } = req.query;
      
      if (!query) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Search query is required',
        });
        return;
      }

      const users = await userService.searchUsers(query as string, parseInt(limit as string));

      res.status(StatusCodes.OK).json({
        success: true,
        data: users,
        message: 'Users found successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const userController = new UserController();
