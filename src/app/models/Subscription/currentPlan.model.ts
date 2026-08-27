import { GetPaymentCardImage } from "../../helpers/Functions/timeConverter";

export class MemberCurrentPlan {
  planId: string;
  subscriptionIdString: string;
  planName: string;
  price: number;
  intervalType: number;
  interval: number;
  last4Digit: string | null;
  cardType: string | null;
  isRequestToCancel: boolean;
  currentPeriodEnd: Date | null;
  downgradeSubscriptionDate: Date | null;
  canChangeSubscription: boolean;
  remainingMemberCount: number;
  remainingFriendRequestCount: number;
  subscriptionType: number;
  totalMemberCount: number;
  totalFriendRequestCount: number;
  cardImage: string;
  subscriptionStatus: number;
  downgradeSubscriptionPlan: DowngradeSubscriptionPlan | null;
  isPaymentFailed: boolean;
  paymentFailureReason: string | null;

  constructor(data: any) {
    this.planId = data.planId ?? '';
    this.subscriptionIdString = data.subscriptionIdString ?? '';
    this.planName = data.planName ?? '';
    this.price = data.price ?? 0;
    this.intervalType = data.intervalType ?? 0;
    this.interval = data.interval ?? 0;
    this.last4Digit = data.last4Digit ?? null;
    this.cardType = data.cardType ?? null;
    this.isRequestToCancel = data.isRequestToCancel ?? false;
    this.currentPeriodEnd = data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null;
    this.downgradeSubscriptionDate = data.downgradeSubscriptionDate ? new Date(data.downgradeSubscriptionDate) : null;
    this.canChangeSubscription = data.canChangeSubscription ?? false;
    this.remainingMemberCount = data.remainingMemberCount ?? 0;
    this.remainingFriendRequestCount = data.remainingFriendRequestCount ?? 0;
    this.subscriptionType = data.subscriptionType ?? 0;
    this.totalMemberCount = data.totalMemberCount ?? 0;
    this.totalFriendRequestCount = data.totalFriendRequestCount ?? 0;
    this.cardImage = GetPaymentCardImage(data.cardType).image ?? '';
    this.subscriptionStatus = data.subscriptionStatus ?? 0;
    this.downgradeSubscriptionPlan = data.downgradeSubscriptionPlan ? new DowngradeSubscriptionPlan(data.downgradeSubscriptionPlan) : null;
    this.isPaymentFailed = data.isPaymentFailed ?? false;
    this.paymentFailureReason = data.paymentFailureReason ?? null;

  }
}

export class DowngradeSubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  intervalType: number;
  interval: number;
  isActive: boolean;
  trialPeriodDays: number;
  subscriptionType: number;
  subscriptionPlanFeature: SubscriptionPlanFeature;

  constructor(init?: Partial<DowngradeSubscriptionPlan>) {
    this.id = init?.id ?? '';
    this.name = init?.name ?? '';
    this.price = init?.price ?? 0;
    this.currency = init?.currency ?? '';
    this.intervalType = init?.intervalType ?? 0;
    this.interval = init?.interval ?? 0;
    this.isActive = init?.isActive ?? false;
    this.trialPeriodDays = init?.trialPeriodDays ?? 0;
    this.subscriptionType = init?.subscriptionType ?? 0;
    this.subscriptionPlanFeature = new SubscriptionPlanFeature(
      init?.subscriptionPlanFeature
    );
  }
}

export class SubscriptionPlanFeature {
  memberCount: number;
  sendFriendRequestCount: number;

  constructor(init?: Partial<SubscriptionPlanFeature>) {
    this.memberCount = init?.memberCount ?? 0;
    this.sendFriendRequestCount = init?.sendFriendRequestCount ?? 0;
  }
}
