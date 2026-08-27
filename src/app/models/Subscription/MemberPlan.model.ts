export class MemberPlan {
  id: string;
  name: string;
  productId: string;
  description: string;
  isActive: boolean;
  subscriptionPlans: SubscriptionPlan[];

  constructor(data: any) {
    this.id = data.id ?? null;
    this.name = data.name ?? '';
    this.productId = data.productId ?? '';
    this.description = data.description ?? '';
    this.isActive = data.isActive ?? false;
    this.subscriptionPlans = data.subscriptionPlans
      ? data.subscriptionPlans.map((plan: any) => new SubscriptionPlan(plan))
      : [];
  }
}
export class SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  intervalType: number;
  interval: number;
  isActive: boolean;
  trialPeriodDays: number;
  subscriptionType: number;
  discount:number;
  discountedPrice:number;
  subscriptionPlanFeature:SubscriptionPlanFeature;


  constructor(data: any) {
    this.id = data.id ?? null;
    this.name = data.name ?? '';
    this.price = data.price ?? 0;
    this.currency = data.currency ?? '';
    this.intervalType = data.intervalType ?? 0;
    this.interval = data.interval ?? 0;
    this.isActive = data.isActive ?? false;
    this.trialPeriodDays = data.trialPeriodDays ?? 0;
    this.subscriptionType = data.subscriptionType ?? 0;
    this.discount = data.discount ?? 0;
    this.subscriptionPlanFeature =  new SubscriptionPlanFeature(data.subscriptionPlanFeature);
    this.discountedPrice = calculateDiscountedPrice(this.price, this.discount);
  }
}

export class SubscriptionPlanFeature{
  memberCount:number;
  sendFriendRequestCount:number;

  constructor(data:any){
    this.memberCount = data.memberCount ?? 0;
    this.sendFriendRequestCount = data.sendFriendRequestCount ?? 0;
  }

}
function calculateDiscountedPrice(price: number, discount: number): number {
  if (discount <= 0) {
    return price;
  } else {
    return price - (price * (discount / 100));
  }
}


