import { Router } from 'express';
import { ratingController } from '../controllers/rating.controller';

const router = Router();

// Create or update rating
router.post('/', ratingController.createOrUpdateRating);

// Get movie ratings
router.get('/movie/:movieId', ratingController.getMovieRatings);

// Get movie rating statistics
router.get('/movie/:movieId/stats', ratingController.getMovieRatingStats);

// Get top rated movies (public)
router.get('/top-rated', ratingController.getTopRatedMovies);

// User rating routes (protected)
router.get('/user', ratingController.getUserRatings);
router.get('/user/stats', ratingController.getUserRatingStats);
router.get('/user/movie/:movieId', ratingController.getUserMovieRating);

// Update specific rating
router.put('/:ratingId', ratingController.updateRating);

// Delete rating
router.delete('/:ratingId', ratingController.deleteRating);

export default router;
