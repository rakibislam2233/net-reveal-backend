import { Router } from 'express';
import movieRoutes from '../modules/movie/routes/movie.routes';
import subscriptionRoutes from '../modules/subscription/routes/subscription.routes';
import watchlistRoutes from '../modules/watchlist/routes/watchlist.routes';
import ratingRoutes from '../modules/rating/routes/rating.routes';
import watchHistoryRoutes from '../modules/watch-history/routes/watch-history.routes';
import authenticationRoutes from '../modules/authentication/routes/authentication.routes';
import userRoutes from '../modules/users/routes/user.routes';

const router = Router();

// API version
const API_VERSION = '/api/v1';

// Authentication routes
router.use(`${API_VERSION}/auth`, authenticationRoutes);

// User routes
router.use(`${API_VERSION}/users`, userRoutes);

// Movie routes
router.use(`${API_VERSION}/movies`, movieRoutes);

// Subscription routes
router.use(`${API_VERSION}/subscriptions`, subscriptionRoutes);

// Watchlist routes
router.use(`${API_VERSION}/watchlist`, watchlistRoutes);

// Rating routes
router.use(`${API_VERSION}/ratings`, ratingRoutes);

// Watch history routes
router.use(`${API_VERSION}/watch-history`, watchHistoryRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Netflix Movie Platform API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
