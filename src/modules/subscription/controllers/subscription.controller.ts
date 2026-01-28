import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscription.service';
import { StatusCodes } from 'http-status-codes';

export class SubscriptionController {
  // Get all subscription plans
  async getPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = subscriptionService.getSubscriptionPlans();

      res.status(StatusCodes.OK).json({
        success: true,
        data: plans,
        message: 'Subscription plans retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get specific subscription plan
  async getPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plan } = req.params;
      const planDetails = subscriptionService.getSubscriptionPlan(plan);

      if (!planDetails) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Subscription plan not found',
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: planDetails,
        message: 'Subscription plan retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get user subscription
  async getUserSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const subscription = await subscriptionService.getUserSubscription(userId);

      if (!subscription) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'No subscription found',
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: subscription,
        message: 'User subscription retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Create subscription
  async createSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { plan, paymentMethod } = req.body;

      if (!plan) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Subscription plan is required',
        });
        return;
      }

      const subscription = await subscriptionService.createSubscription(userId, { plan, paymentMethod });

      res.status(StatusCodes.CREATED).json({
        success: true,
        data: subscription,
        message: 'Subscription created successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Update subscription
  async updateSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { plan, paymentMethod } = req.body;

      const subscription = await subscriptionService.updateSubscription(userId, { plan, paymentMethod });

      res.status(StatusCodes.OK).json({
        success: true,
        data: subscription,
        message: 'Subscription updated successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Cancel subscription
  async cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const subscription = await subscriptionService.cancelSubscription(userId);

      res.status(StatusCodes.OK).json({
        success: true,
        data: subscription,
        message: 'Subscription cancelled successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Get subscription usage
  async getSubscriptionUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const usage = await subscriptionService.getSubscriptionUsage(userId);

      res.status(StatusCodes.OK).json({
        success: true,
        data: usage,
        message: 'Subscription usage retrieved successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Check subscription access
  async checkAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { quality } = req.query;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const hasAccess = await subscriptionService.checkSubscriptionAccess(userId, quality as string);

      res.status(StatusCodes.OK).json({
        success: true,
        data: { hasAccess },
        message: hasAccess ? 'Access granted' : 'Access denied',
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const subscriptionController = new SubscriptionController();
