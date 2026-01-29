import { Request, Response, NextFunction } from 'express';
import { ratingService } from '../services/rating.service';
import { StatusCodes } from 'http-status-codes';

export class RatingController {
  // Create or update rating
  async createOrUpdateRating(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { movieId, rating, review } = req.body;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!movieId || !rating) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Movie ID and rating are required',
        });
        return;
      }

      const ratingData = await ratingService.createOrUpdateRating(userId, { movieId, rating, review });

      res.status(StatusCodes.CREATED).json({
        success: true,
        data: ratingData,
        message: 'Rating created/updated successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Update rating
  async updateRating(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { ratingId } = req.params;
      const { rating, review } = req.body;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const updatedRating = await ratingService.updateRating(userId, ratingId, { rating, review });

      res.status(StatusCodes.OK).json({
        success: true,
        data: updatedRating,
        message: 'Rating updated successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Delete rating
  async deleteRating(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { ratingId } = req.params;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const success = await ratingService.deleteRating(userId, ratingId);

      if (success) {
        res.status(StatusCodes.OK).json({
          success: true,
          message: 'Rating deleted successfully',
        });
      } else {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Rating not found',
        });
      }
    } catch (error: any) {
      next(error);
    }
  }

  // Get movie ratings
  async getMovieRatings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { movieId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      if (!movieId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Movie ID is required',
        });
        return;
      }

      const ratings = await ratingService.getMovieRatings(
        movieId,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: ratings,
        message: 'Movie ratings retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get user ratings
  async getUserRatings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { page = 1, limit = 20 } = req.query;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const ratings = await ratingService.getUserRatings(
        userId,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: ratings,
        message: 'User ratings retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get user rating for specific movie
  async getUserMovieRating(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const rating = await ratingService.getUserMovieRating(userId, movieId);

      res.status(StatusCodes.OK).json({
        success: true,
        data: { rating, hasRated: !!rating },
        message: 'User movie rating retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get movie rating statistics
  async getMovieRatingStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { movieId } = req.params;
      const userId = (req as any).user?.userId;

      if (!movieId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Movie ID is required',
        });
        return;
      }

      const stats = await ratingService.getMovieRatingStats(movieId, userId);

      res.status(StatusCodes.OK).json({
        success: true,
        data: stats,
        message: 'Movie rating statistics retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get user rating statistics
  async getUserRatingStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const stats = await ratingService.getUserRatingStats(userId);

      res.status(StatusCodes.OK).json({
        success: true,
        data: stats,
        message: 'User rating statistics retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get top rated movies
  async getTopRatedMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      const topRated = await ratingService.getTopRatedMovies(parseInt(limit as string));

      res.status(StatusCodes.OK).json({
        success: true,
        data: topRated,
        message: 'Top rated movies retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const ratingController = new RatingController();
