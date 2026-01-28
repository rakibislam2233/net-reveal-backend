import { Router } from 'express';
import movieRoutes from '../modules/movie/routes/movie.routes';
import subscriptionRoutes from '../modules/subscription/routes/subscription.routes';

const router = Router();

// API version
const API_VERSION = '/api/v1';

// Movie routes
router.use(`${API_VERSION}/movies`, movieRoutes);

// Subscription routes
router.use(`${API_VERSION}/subscriptions`, subscriptionRoutes);

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
