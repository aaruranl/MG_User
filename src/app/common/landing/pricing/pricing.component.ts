import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ROUTER_MODULES } from '../../common-imports';

import { MemberPlan, SubscriptionPlan } from '../../../models/Subscription/MemberPlan.model';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { BillingInterval } from '../../../helpers/enum';


@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, ROUTER_MODULES],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent {

  public billingInterval = BillingInterval;
  public baseUrl = environment.baseDomain;
  public currentYear = new Date().getFullYear();
  public pricingPlans: any[] = [];
  public loading = true;

  constructor(private subscriptionService: SubscriptionService) {}

    ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
   
    this.loadPlans();
    
  }

  // public pricingPlans = [
  //   {
  //     name: 'Silver Plan',
  //     price: '0.8',
  //     period: 'day',
  //     badge: '1 days free trial',
  //     popular: false,
  //     features: [
  //       { text: '1 Members included', included: true },
  //       { text: '1 Friend requests per month', included: true },
  //       { text: 'Advanced search filters', included: true },
  //       { text: 'Personalized match suggestions', included: true },
  //       { text: 'Unlimited matches', included: true },
  //       { text: 'Priority customer support', included: true }
  //     ]
  //   },
  //   {
  //     name: 'Gold Plan',
  //     price: '1.2',
  //     period: 'day',
  //     badge: '1 days free trial',
  //     popular: true,
  //     features: [
  //       { text: '2 Members included', included: true },
  //       { text: '2 Friend requests per month', included: true },
  //       { text: 'Advanced search filters', included: true },
  //       { text: 'Personalized match suggestions', included: true },
  //       { text: 'Unlimited matches', included: true },
  //       { text: 'Priority customer support', included: true }
  //     ]
  //   },
  //   {
  //     name: 'Platinum Plan',
  //     price: '1.6',
  //     period: 'day',
  //     badge: '1 days free trial',
  //     popular: false,
  //     features: [
  //       { text: '3 Members included', included: true },
  //       { text: '3 Friend requests per month', included: true },
  //       { text: 'Advanced search filters', included: true },
  //       { text: 'Personalized match suggestions', included: true },
  //       { text: 'Unlimited matches', included: true },
  //       { text: 'Priority customer support', included: true }
  //     ]
  //   }
  // ];

  private loadPlans(): void {
    this.subscriptionService.getMemberSubscriptionPlans().subscribe({
      next: (memberPlan: MemberPlan) => {
        this.pricingPlans = this.mapPlans(memberPlan.subscriptionPlans);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load plans', err);
        this.loading = false;
      }
    });
  }

  private mapPlans(plans: SubscriptionPlan[]) {
    
    return plans.map(plan => ({
      
      id: plan.id,
      name: plan.name,
      discount : plan.discount,
      discountedPrice: plan.price - (plan.price * (plan.discount / 100)),
      currency: plan.currency,
      price: plan.price,
      period: this.getIntervalText(plan),
      trialPeriodDays: plan.trialPeriodDays,
      badge: plan.trialPeriodDays > 0
        ? `${plan.trialPeriodDays} days free trial`
        : null,
      popular: plan.subscriptionType === 3, 
      features: [
        {
          text: `${plan.subscriptionPlanFeature.memberCount} Members included`,
           tooltip: `This plan allows you to create\nup to ${plan.subscriptionPlanFeature.memberCount} family member profiles.`,
          included: true
        },
        {
          text: `${plan.subscriptionPlanFeature.sendFriendRequestCount} Friend requests per month`,
          included: true
        },
         { text: 'Advanced search filters', included: true },
         { text: 'Personalized match suggestions', included: true },
         { text: 'Unlimited matches', included: true },
         { text: 'Priority customer support', included: true }
      ]
    }));
  }

  private getIntervalText(plan: SubscriptionPlan): string {
  switch (plan.intervalType) {
    case BillingInterval.Day:
      return 'day';
    case BillingInterval.Week:
      return 'week';
    case BillingInterval.Month:
      return 'month';
    case BillingInterval.Year:
      return 'year';
    default:
      return '';
  }
}

}

