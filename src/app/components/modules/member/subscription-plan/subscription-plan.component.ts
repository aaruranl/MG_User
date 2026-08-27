import { Component, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { FORM_MODULES } from '../../../../common/common-imports';
import { CommonModule } from '@angular/common';
import { billingIntervalsList, subscriptionTypeList } from '../../../../helpers/data';
import { BillingInterval, SubscriptionType } from '../../../../helpers/enum';
import { MemberPlan } from '../../../../models/Subscription/MemberPlan.model';
import { StripePaymentComponent } from "../stripe-payment/stripe-payment.component";
import { Router } from '@angular/router';
import { TopBarComponent } from "../../../../common/top-bar/top-bar.component";
import { LoadingComponent } from "../../../../common/loading/loading.component";



@Component({
  selector: 'app-subscription-plan',
  imports: [FORM_MODULES, CommonModule, LoadingComponent, TopBarComponent],
  templateUrl: './subscription-plan.component.html',
  styleUrl: './subscription-plan.component.scss'
})
export class SubscriptionPlanComponent implements OnDestroy {
  public isLoading: boolean = false;
  public plans!: MemberPlan;
  public billingInterval = BillingInterval;
  public billingIntervalsList = billingIntervalsList;
  public subscriptionTypeList = subscriptionTypeList;
  public subscriptionType = SubscriptionType;

  public isMovedPayment: boolean = true;

  /** Custom tooltip: which plan's tooltip is open (plan id) */
  public openTooltipPlanId: string | null = null;

  constructor(
    private subscriptionService: SubscriptionService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubscriptionPlans();
  }

  showTooltip(planId: string): void {
    this.openTooltipPlanId = planId;
  }

  hideTooltip(): void {
    this.openTooltipPlanId = null;
  }

  toggleTooltip(planId: string): void {
    this.openTooltipPlanId = this.openTooltipPlanId === planId ? null : planId;
  }
  getMemberTooltip(plan: any): string {
    return `This plan allows you to create\nup to ${plan.subscriptionPlanFeature.memberCount} family member profiles.`;
  }
  private loadSubscriptionPlans() {
    this.isLoading = true;
    this.subscriptionService.getMemberSubscriptionPlans().subscribe({
      next:(res:any)=>{
        this.plans = res;
      },
      complete: () => {
        this.isLoading = false;
        setTimeout(() => this.initPlanTooltips(), 0);
      },
      error: (error:any) => {
        this.isLoading = false;
        this.toastr.error(error.error.Error.Detail,error.error.Error.Title);
      }
    })
  }

  public moveToPayment(id:string){
    this.router.navigateByUrl(`member/payment/${id}`);
  }

  ngOnDestroy(): void {
    this.disposePlanTooltips();
  }

  private initPlanTooltips(): void {
    const Tooltip = (window as unknown as { bootstrap?: { Tooltip: { getOrCreateInstance: (el: HTMLElement) => unknown; getInstance: (el: HTMLElement) => { dispose: () => void } | undefined } } })
      .bootstrap?.Tooltip;
    if (!Tooltip) return;

    document
      .querySelectorAll<HTMLElement>('app-subscription-plan [data-bs-toggle="tooltip"]')
      .forEach((el) => Tooltip.getOrCreateInstance(el));
  }

  private disposePlanTooltips(): void {
    const Tooltip = (window as unknown as { bootstrap?: { Tooltip: { getInstance: (el: HTMLElement) => { dispose: () => void } | undefined } } })
      .bootstrap?.Tooltip;
    if (!Tooltip) return;

    document
      .querySelectorAll<HTMLElement>('app-subscription-plan [data-bs-toggle="tooltip"]')
      .forEach((el) => Tooltip.getInstance(el)?.dispose());
  }

}
