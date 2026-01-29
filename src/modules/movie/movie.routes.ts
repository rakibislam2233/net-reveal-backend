import { Router } from 'express';
import { movieController } from '../controllers/movie.controller';
import { generalApiRateLimiter } from '../../middleware/rate-limit.middleware';

const router = Router();

// Apply rate limiting to all movie routes
router.use(generalApiRateLimiter);

// Get all movies with pagination and filtering
router.get('/', movieController.getMovies);

// Get trending movies
router.get('/trending', movieController.getTrendingMovies);

// Get popular movies
router.get('/popular', movieController.getPopularMovies);

// Search movies
router.get('/search', movieController.searchMovies);

// Get all genres
router.get('/genres', movieController.getGenres);

// Get movies by genre
router.get('/genre/:genreId', movieController.getMoviesByGenre);

// Get movie by TMDB ID
router.get('/tmdb/:tmdbId', movieController.getMovieByTMDBId);

// Sync movie from TMDB (admin only)
router.post('/sync', movieController.syncMovie);

// Get movie by ID
router.get('/:id', movieController.getMovieById);

export default router;
