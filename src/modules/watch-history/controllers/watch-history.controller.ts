import { Request, Response, NextFunction } from 'express';
import { watchHistoryService } from '../services/watch-history.service';
import { StatusCodes } from 'http-status-codes';

export class WatchHistoryController {
  // Update watch history
  async updateWatchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { movieId, watchedMinutes, totalMinutes, completed } = req.body;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!movieId || watchedMinutes === undefined || totalMinutes === undefined) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Movie ID, watched minutes, and total minutes are required',
        });
        return;
      }

      const history = await watchHistoryService.updateWatchHistory(userId, {
        movieId,
        watchedMinutes,
        totalMinutes,
        completed,
      });

      res.status(StatusCodes.OK).json({
        success: true,
        data: history,
        message: 'Watch history updated successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get watch history
  async getWatchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { page = 1, limit = 20, completed } = req.query;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const history = await watchHistoryService.getWatchHistory(
        userId,
        parseInt(page as string),
        parseInt(limit as string),
        completed === 'true' ? true : completed === 'false' ? false : undefined
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: history,
        message: 'Watch history retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get continue watching list
  async getContinueWatching(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { limit = 10 } = req.query;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const continueWatching = await watchHistoryService.getContinueWatching(
        userId,
        parseInt(limit as string)
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: continueWatching,
        message: 'Continue watching list retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get watch history statistics
  async getWatchHistoryStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const stats = await watchHistoryService.getWatchHistoryStats(userId);

      res.status(StatusCodes.OK).json({
        success: true,
        data: stats,
        message: 'Watch history statistics retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Delete watch history entry
  async deleteWatchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { movieId } = req.params;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const success = await watchHistoryService.deleteWatchHistory(userId, movieId);

      if (success) {
        res.status(StatusCodes.OK).json({
          success: true,
          message: 'Watch history entry deleted successfully',
        });
      } else {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Watch history entry not found',
        });
      }
    } catch (error: any) {
      next(error);
    }
  }

  // Clear all watch history
  async clearWatchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const success = await watchHistoryService.clearWatchHistory(userId);

      if (success) {
        res.status(StatusCodes.OK).json({
          success: true,
          message: 'Watch history cleared successfully',
        });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Failed to clear watch history',
        });
      }
    } catch (error: any) {
      next(error);
    }
  }

  // Mark movie as completed
  async markAsCompleted(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { movieId } = req.params;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const history = await watchHistoryService.markAsCompleted(userId, movieId);

      res.status(StatusCodes.OK).json({
        success: true,
        data: history,
        message: 'Movie marked as completed successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get watch history for specific movie
  async getMovieWatchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { movieId } = req.params;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const history = await watchHistoryService.getMovieWatchHistory(userId, movieId);

      res.status(StatusCodes.OK).json({
        success: true,
        data: { history, hasWatched: !!history },
        message: 'Movie watch history retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get watching trends
  async getWatchingTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { days = 30 } = req.query;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const trends = await watchHistoryService.getWatchingTrends(
        userId,
        parseInt(days as string)
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: trends,
        message: 'Watching trends retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const watchHistoryController = new WatchHistoryController();
