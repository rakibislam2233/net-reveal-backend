import { Router } from 'express';
import { watchHistoryController } from '../controllers/watch-history.controller';

const router = Router();

// Update watch history
router.post('/', watchHistoryController.updateWatchHistory);

// Get watch history
router.get('/', watchHistoryController.getWatchHistory);

// Get continue watching list
router.get('/continue-watching', watchHistoryController.getContinueWatching);

// Get watch history statistics
router.get('/stats', watchHistoryController.getWatchHistoryStats);

// Get watching trends
router.get('/trends', watchHistoryController.getWatchingTrends);

// Get watch history for specific movie
router.get('/movie/:movieId', watchHistoryController.getMovieWatchHistory);

// Mark movie as completed
router.post('/movie/:movieId/complete', watchHistoryController.markAsCompleted);

// Delete watch history entry
router.delete('/movie/:movieId', watchHistoryController.deleteWatchHistory);

// Clear all watch history
router.delete('/', watchHistoryController.clearWatchHistory);

export default router;
