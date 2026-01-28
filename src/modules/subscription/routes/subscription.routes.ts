import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';

const router = Router();

// Get all subscription plans (public)
router.get('/plans', subscriptionController.getPlans);

// Get specific subscription plan (public)
router.get('/plans/:plan', subscriptionController.getPlan);

// User subscription routes (protected)
router.get('/user', subscriptionController.getUserSubscription);
router.post('/user', subscriptionController.createSubscription);
router.put('/user', subscriptionController.updateSubscription);
router.delete('/user', subscriptionController.cancelSubscription);

// Get subscription usage (protected)
router.get('/usage', subscriptionController.getSubscriptionUsage);

// Check subscription access (protected)
router.get('/check-access', subscriptionController.checkAccess);

export default router;
