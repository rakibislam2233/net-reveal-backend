import { Request, Response, NextFunction } from 'express';
import { watchlistService } from '../services/watchlist.service';
import { StatusCodes } from 'http-status-codes';

export class WatchlistController {
  // Add movie to watchlist
  async addToWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { movieId, listType } = req.body;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!movieId || !listType) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Movie ID and list type are required',
        });
        return;
      }

      const item = await watchlistService.addToWatchlist(userId, { movieId, listType });

      res.status(StatusCodes.CREATED).json({
        success: true,
        data: item,
        message: 'Movie added to watchlist successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Remove movie from watchlist
  async removeFromWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { movieId } = req.params;
      const { listType } = req.query;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const success = await watchlistService.removeFromWatchlist(userId, movieId, listType as string);

      if (success) {
        res.status(StatusCodes.OK).json({
          success: true,
          message: 'Movie removed from watchlist successfully',
        });
      } else {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Movie not found in watchlist',
        });
      }
    } catch (error: any) {
      next(error);
    }
  }

  // Get user's watchlist
  async getWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { listType, page = 1, limit = 20 } = req.query;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const watchlist = await watchlistService.getUserWatchlist(
        userId,
        listType as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: watchlist,
        message: 'Watchlist retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Check if movie is in list
  async checkMovieInList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { movieId } = req.params;
      const { listType } = req.query;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const item = await watchlistService.checkMovieInList(userId, movieId, listType as string);

      res.status(StatusCodes.OK).json({
        success: true,
        data: { item, isInList: !!item },
        message: 'Movie list status retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Move movie between lists
  async moveBetweenLists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { movieId } = req.params;
      const { fromListType, toListType } = req.body;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!fromListType || !toListType) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'From list type and to list type are required',
        });
        return;
      }

      const item = await watchlistService.moveBetweenLists(userId, movieId, fromListType, toListType);

      res.status(StatusCodes.OK).json({
        success: true,
        data: item,
        message: 'Movie moved between lists successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get watchlist statistics
  async getWatchlistStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const stats = await watchlistService.getWatchlistStats(userId);

      res.status(StatusCodes.OK).json({
        success: true,
        data: stats,
        message: 'Watchlist statistics retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Clear watchlist
  async clearWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { listType } = req.query;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const success = await watchlistService.clearWatchlist(userId, listType as string);

      if (success) {
        res.status(StatusCodes.OK).json({
          success: true,
          message: listType 
            ? `${listType} cleared successfully` 
            : 'Watchlist cleared successfully',
        });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Failed to clear watchlist',
        });
      }
    } catch (error: any) {
      next(error);
    }
  }

  // Get similar movies for recommendations
  async getSimilarMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const similarMovies = await watchlistService.getSimilarMovies(userId, parseInt(limit as string));

      res.status(StatusCodes.OK).json({
        success: true,
        data: similarMovies,
        message: 'Similar movies retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const watchlistController = new WatchlistController();
