export interface SubscriptionResponse {
  id: string;
  userId: string;
  plan: string;
  status: string;
  startDate: Date;
  endDate: Date;
  nextBillingDate?: Date;
  paymentMethod?: string;
  lastPaymentAt?: Date;
  amount?: number;
  maxQuality: string;
  maxDevices: number;
  downloadsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionRequest {
  plan: string;
  paymentMethod?: string;
}

export interface UpdateSubscriptionRequest {
  plan?: string;
  paymentMethod?: string;
}

export interface SubscriptionPlanDetails {
  plan: string;
  name: string;
  price: number;
  duration: string; // monthly, yearly
  features: {
    maxQuality: string;
    maxDevices: number;
    downloadsEnabled: boolean;
    offlineDownloads: number;
    screens: number;
  };
  description: string;
}
