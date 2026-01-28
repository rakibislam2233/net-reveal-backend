import { SubscriptionResponse, CreateSubscriptionRequest, UpdateSubscriptionRequest, SubscriptionPlanDetails } from '../types/subscription.types';

export class SubscriptionService {
  // Subscription plan configurations
  private readonly subscriptionPlans: Record<string, SubscriptionPlanDetails> = {
    FREE: {
      plan: 'FREE',
      name: 'Free',
      price: 0,
      duration: 'monthly',
      features: {
        maxQuality: 'SD',
        maxDevices: 1,
        downloadsEnabled: false,
        offlineDownloads: 0,
        screens: 1,
      },
      description: 'Basic access with limited features',
    },
    BASIC: {
      plan: 'BASIC',
      name: 'Basic',
      price: 9.99,
      duration: 'monthly',
      features: {
        maxQuality: 'HD',
        maxDevices: 2,
        downloadsEnabled: true,
        offlineDownloads: 10,
        screens: 2,
      },
      description: 'HD quality on 2 devices with downloads',
    },
    PREMIUM: {
      plan: 'PREMIUM',
      name: 'Premium',
      price: 15.99,
      duration: 'monthly',
      features: {
        maxQuality: 'FULL_HD',
        maxDevices: 4,
        downloadsEnabled: true,
        offlineDownloads: 25,
        screens: 4,
      },
      description: 'Full HD quality on 4 devices with more downloads',
    },
    PREMIUM_PLUS: {
      plan: 'PREMIUM_PLUS',
      name: 'Premium Plus',
      price: 19.99,
      duration: 'monthly',
      features: {
        maxQuality: '4K',
        maxDevices: 6,
        downloadsEnabled: true,
        offlineDownloads: 100,
        screens: 6,
      },
      description: '4K quality on 6 devices with unlimited downloads',
    },
  };

  // Get all subscription plans
  getSubscriptionPlans(): SubscriptionPlanDetails[] {
    return Object.values(this.subscriptionPlans);
  }

  // Get subscription plan by name
  getSubscriptionPlan(plan: string): SubscriptionPlanDetails | null {
    return this.subscriptionPlans[plan.toUpperCase()] || null;
  }

  // Create subscription for user
  async createSubscription(userId: string, data: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
    try {
      const planDetails = this.getSubscriptionPlan(data.plan);
      if (!planDetails) {
        throw new Error('Invalid subscription plan');
      }

      // Calculate end date (1 month from start for now)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      // Mock subscription creation (replace with actual database logic)
      const subscription: SubscriptionResponse = {
        id: `sub_${Date.now()}`,
        userId,
        plan: data.plan,
        status: 'ACTIVE',
        startDate,
        endDate,
        nextBillingDate: endDate,
        paymentMethod: data.paymentMethod,
        lastPaymentAt: startDate,
        amount: planDetails.price,
        maxQuality: planDetails.features.maxQuality,
        maxDevices: planDetails.features.maxDevices,
        downloadsEnabled: planDetails.features.downloadsEnabled,
        createdAt: startDate,
        updatedAt: startDate,
      };

      return subscription;
    } catch (error: any) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  // Get user subscription
  async getUserSubscription(userId: string): Promise<SubscriptionResponse | null> {
    try {
      // Mock implementation (replace with actual database logic)
      const subscription: SubscriptionResponse = {
        id: 'sub_mock',
        userId,
        plan: 'BASIC',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentMethod: 'credit_card',
        lastPaymentAt: new Date(),
        amount: 9.99,
        maxQuality: 'HD',
        maxDevices: 2,
        downloadsEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return subscription;
    } catch (error: any) {
      throw new Error(`Failed to get user subscription: ${error.message}`);
    }
  }

  // Update subscription
  async updateSubscription(userId: string, data: UpdateSubscriptionRequest): Promise<SubscriptionResponse> {
    try {
      const currentSubscription = await this.getUserSubscription(userId);
      if (!currentSubscription) {
        throw new Error('No active subscription found');
      }

      let planDetails = null;
      if (data.plan) {
        planDetails = this.getSubscriptionPlan(data.plan);
        if (!planDetails) {
          throw new Error('Invalid subscription plan');
        }
      }

      // Mock update (replace with actual database logic)
      const updatedSubscription: SubscriptionResponse = {
        ...currentSubscription,
        plan: data.plan || currentSubscription.plan,
        paymentMethod: data.paymentMethod || currentSubscription.paymentMethod,
        maxQuality: planDetails?.features.maxQuality || currentSubscription.maxQuality,
        maxDevices: planDetails?.features.maxDevices || currentSubscription.maxDevices,
        downloadsEnabled: planDetails?.features.downloadsEnabled || currentSubscription.downloadsEnabled,
        amount: planDetails?.price || currentSubscription.amount,
        updatedAt: new Date(),
      };

      return updatedSubscription;
    } catch (error: any) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<SubscriptionResponse> {
    try {
      const currentSubscription = await this.getUserSubscription(userId);
      if (!currentSubscription) {
        throw new Error('No active subscription found');
      }

      // Mock cancellation (replace with actual database logic)
      const cancelledSubscription: SubscriptionResponse = {
        ...currentSubscription,
        status: 'CANCELLED',
        updatedAt: new Date(),
      };

      return cancelledSubscription;
    } catch (error: any) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  // Check if user has access to content based on subscription
  async checkSubscriptionAccess(userId: string, requiredQuality?: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        return false;
      }

      if (subscription.status !== 'ACTIVE') {
        return false;
      }

      // Check if subscription has expired
      if (new Date() > subscription.endDate) {
        return false;
      }

      // Check quality access if specified
      if (requiredQuality) {
        const qualityLevels = ['SD', 'HD', 'FULL_HD', '4K'];
        const userQualityIndex = qualityLevels.indexOf(subscription.maxQuality);
        const requiredQualityIndex = qualityLevels.indexOf(requiredQuality);
        
        if (requiredQualityIndex > userQualityIndex) {
          return false;
        }
      }

      return true;
    } catch (error: any) {
      throw new Error(`Failed to check subscription access: ${error.message}`);
    }
  }

  // Get subscription usage stats
  async getSubscriptionUsage(userId: string): Promise<any> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        throw new Error('No subscription found');
      }

      // Mock usage data (replace with actual database logic)
      const usage = {
        currentPlan: subscription.plan,
        maxDevices: subscription.maxDevices,
        activeDevices: 1, // Mock data
        downloadsEnabled: subscription.downloadsEnabled,
        downloadedContent: subscription.downloadsEnabled ? 5 : 0, // Mock data
        maxDownloads: subscription.downloadsEnabled ? 25 : 0, // Based on plan
        nextBillingDate: subscription.nextBillingDate,
        daysUntilRenewal: subscription.nextBillingDate 
          ? Math.ceil((subscription.nextBillingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 0,
      };

      return usage;
    } catch (error: any) {
      throw new Error(`Failed to get subscription usage: ${error.message}`);
    }
  }
}

export const subscriptionService = new SubscriptionService();
