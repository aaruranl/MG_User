export class SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  intervalType: number;
  interval: number;
  isActive: boolean;
  trialPeriodDays: number;
  subscriptionType: number;
  memberCount: number;
  sendFriendRequestCount: number;
  discount:number;

  constructor(data: any) {
    this.id = data.id ?? null;
    this.name = data.name ?? '';
    this.price = data.price ?? 0;
    this.intervalType = data.intervalType ?? 0;
    this.interval = data.interval ?? 0;
    this.isActive = data.isActive ?? false;
    this.trialPeriodDays = data.trialPeriodDays ?? 0;
    this.subscriptionType = data.subscriptionType ?? 0;
    this.memberCount = data.memberCount ?? 0;
    this.sendFriendRequestCount = data.sendFriendRequestCount ?? 0;
    this.discount = data.discount ?? 0;
  }
}
