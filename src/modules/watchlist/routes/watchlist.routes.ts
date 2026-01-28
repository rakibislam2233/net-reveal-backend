import { Router } from 'express';
import { watchlistController } from '../controllers/watchlist.controller';

const router = Router();

// Add movie to watchlist
router.post('/', watchlistController.addToWatchlist);

// Get user's watchlist (with optional list type filter)
router.get('/', watchlistController.getWatchlist);

// Check if movie is in list
router.get('/check/:movieId', watchlistController.checkMovieInList);

// Get watchlist statistics
router.get('/stats', watchlistController.getWatchlistStats);

// Get similar movies for recommendations
router.get('/similar', watchlistController.getSimilarMovies);

// Remove movie from watchlist
router.delete('/:movieId', watchlistController.removeFromWatchlist);

// Move movie between lists
router.put('/:movieId/move', watchlistController.moveBetweenLists);

// Clear watchlist (or specific list type)
router.delete('/', watchlistController.clearWatchlist);

export default router;
