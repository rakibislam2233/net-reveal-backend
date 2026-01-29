import { Request, Response, NextFunction } from 'express';
import { movieService } from '../services/movie.service';
import { StatusCodes } from 'http-status-codes';
import logger from '../../utils/logger';

export class MovieController {
  // Get all movies with pagination and filtering
  async getMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        genre,
        language,
        year,
        minRating,
        maxRating,
        search,
        sortBy = 'popularity',
        sortOrder = 'desc',
      } = req.query;

      const params = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        genre: genre as string,
        language: language as string,
        year: year ? parseInt(year as string) : undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        maxRating: maxRating ? parseFloat(maxRating as string) : undefined,
        search: search as string,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      };

      const result = await movieService.getMovies(params);

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
        message: 'Movies retrieved successfully',
      });
    } catch (error: any) {
      logger.error('Error in getMovies controller:', error);
      next(error);
    }
  }

  // Get movie by ID
  async getMovieById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const movie = await movieService.getMovieById(id);

      if (!movie) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Movie not found',
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: movie,
        message: 'Movie retrieved successfully',
      });
    } catch (error: any) {
      logger.error('Error in getMovieById controller:', error);
      next(error);
    }
  }

  // Get movie by TMDB ID
  async getMovieByTMDBId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tmdbId } = req.params;
      const movie = await movieService.getMovieByTMDBId(parseInt(tmdbId));

      if (!movie) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Movie not found',
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: movie,
        message: 'Movie retrieved successfully',
      });
    } catch (error: any) {
      logger.error('Error in getMovieByTMDBId controller:', error);
      next(error);
    }
  }

  // Get trending movies
  async getTrendingMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      
      const result = await movieService.getTrendingMovies(
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
        message: 'Trending movies retrieved successfully',
      });
    } catch (error: any) {
      logger.error('Error in getTrendingMovies controller:', error);
      next(error);
    }
  }

  // Get popular movies
  async getPopularMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      
      const result = await movieService.getPopularMovies(
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
        message: 'Popular movies retrieved successfully',
      });
    } catch (error: any) {
      logger.error('Error in getPopularMovies controller:', error);
      next(error);
    }
  }

  // Search movies
  async searchMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, page = 1, limit = 20 } = req.query;

      if (!query) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Search query is required',
        });
        return;
      }

      const result = await movieService.searchMovies(
        query as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
        message: 'Movies searched successfully',
      });
    } catch (error: any) {
      logger.error('Error in searchMovies controller:', error);
      next(error);
    }
  }

  // Get movies by genre
  async getMoviesByGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { genreId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await movieService.getMoviesByGenre(
        parseInt(genreId),
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
        message: 'Movies by genre retrieved successfully',
      });
    } catch (error: any) {
      logger.error('Error in getMoviesByGenre controller:', error);
      next(error);
    }
  }

  // Get all genres
  async getGenres(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const genres = await movieService.getGenres();

      res.status(StatusCodes.OK).json({
        success: true,
        data: genres,
        message: 'Genres retrieved successfully',
      });
    } catch (error: any) {
      logger.error('Error in getGenres controller:', error);
      next(error);
    }
  }

  // Sync movie from TMDB
  async syncMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tmdbId } = req.body;

      if (!tmdbId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'TMDB ID is required',
        });
        return;
      }

      const movie = await movieService.syncMovieFromTMDB(parseInt(tmdbId));

      if (!movie) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Movie not found in TMDB',
        });
        return;
      }

      res.status(StatusCodes.CREATED).json({
        success: true,
        data: movie,
        message: 'Movie synced successfully',
      });
    } catch (error: any) {
      logger.error('Error in syncMovie controller:', error);
      next(error);
    }
  }
}

export const movieController = new MovieController();
