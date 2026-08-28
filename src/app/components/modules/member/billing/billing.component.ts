import { MainUser } from './../../../../models/member/member.model';

import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { FORM_MODULES } from '../../../../common/common-imports';
import { LoadingComponent } from "../../../../common/loading/loading.component";
import { PaymentFailTopBarComponent } from "../../../../common/payment-fail-top-bar/payment-fail-top-bar.component";
import { BillingInterval, SubscriptionStatus, SubscriptionType } from '../../../../helpers/enum';
import { MemberCurrentPlan } from '../../../../models/index.model';
import { Invoice } from '../../../../models/Subscription/Invoice.model';
import { MemberPlan } from '../../../../models/Subscription/MemberPlan.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { SubscriptionService } from './../../../../core/services/subscription.service';
declare var Stripe: any;
@Component({
  selector: 'app-billing',
  imports: [CommonModule, FORM_MODULES, NgxPaginationModule, TitleCasePipe, LoadingComponent, PaymentFailTopBarComponent],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss'
})
export class BillingComponent {

  public availablePlans!: MemberPlan;
  public currentPlan!: MemberCurrentPlan;
  public invoices: Invoice[] = [];
  public mainUser!: MainUser;

  public totalItemCount: number = 0;
  public itemsPerPage: number = 6;
  public currentPage: number = 1;
  public billingInterval = BillingInterval;
  public subscriptionType = SubscriptionType;
  public subscriptionStatus = SubscriptionStatus;
  public isPlanBillingLoading: boolean = false;
  public isAvailablePlanLoading: boolean = false;
  public isInvoiceLoading: boolean = false;
  public isCancelLoading: boolean = false;
  public isPaymentChange: boolean = false;

  public isStripeLoading: boolean = false;
  private cardNumberElement: any;
  public isCompleteCardNumber: boolean = false;
  private cardCVVElement: any;
  public isCompleteCardCVV: boolean = false;
  private cardExpiryElement: any;
  public isCompleteCardExpiry: boolean = false;
  public isCompleteCardPostCode: boolean = false;


  public isSubmitted: boolean = false;
  public isChangeLoading: boolean = false;
  public clientSecret: string = '';
  public isLoading: boolean = false;
  public isSwitchPlanLoading = false;
  public isActiveSubscription: boolean | null = null;
  public isRetrieveLoading: boolean = false;

  public newPlanId: number = 0;

  /** Angular-driven modal state (replaces Bootstrap JS data-bs-* triggers) */
  public showSwitchPlanModal: boolean = false;
  public showInvoiceModal: boolean = false;
  public showRetrievePaymentModal: boolean = false;

  /** Custom tooltip: which plan's tooltip is open (plan id) */
  public openTooltipPlanId: string | null = null;

  public stripe: any;
  constructor(
    private subscriptionService: SubscriptionService,
    private toastr: ToastrService,
    private authService: AuthService
  ) { }
  ngOnInit(): void {
    this.loadMainUserSubscriptionStatus();
    this.getMainUser();
    this.loadBillingData();
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

  private loadBillingData(): void {
    this.isPlanBillingLoading = true;
    this.isInvoiceLoading = true;
    this.isAvailablePlanLoading = true;

    forkJoin([
      this.subscriptionService.getPlanAndBilling(),
      this.subscriptionService.getInvoice(this.currentPage, this.itemsPerPage),
      this.subscriptionService.getAvailablePlan()
    ]).subscribe({
      next: ([plan, invoicesRes, availablePlans]) => {
        this.currentPlan = plan;
        this.invoices = invoicesRes.data;
        this.totalItemCount = invoicesRes.totalCount;
        this.availablePlans = availablePlans;
      },
      complete: () => {
        this.isPlanBillingLoading = false;
        this.isInvoiceLoading = false;
        this.isAvailablePlanLoading = false;
      },
      error: (error) => {
        this.isPlanBillingLoading = false;
        this.isInvoiceLoading = false;
        this.isAvailablePlanLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    });
  }

  private getPlanAndBilling() {
    //this.isPlanBillingLoading = true;
    this.subscriptionService.getPlanAndBilling().subscribe({
      next: (res: any) => {
        this.currentPlan = res;
      },
      complete: () => {
        // this.isPlanBillingLoading = false;
      },
      error: (error: any) => {
        // this.isPlanBillingLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    })
  }

  private getAllInvoice() {
    // this.isInvoiceLoading = true;
    this.subscriptionService.getInvoice(this.currentPage, this.itemsPerPage).subscribe({
      next: (res: any) => {
        this.invoices = res.data;
        this.totalItemCount = res.totalCount;
      },
      complete: () => {
        //      this.isInvoiceLoading = false;
      },
      error: (error: any) => {
        //    this.isInvoiceLoading = true;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    })
  }

  public getAvailablePlan() {
    // this.isPlanBillingLoading = true;
    this.subscriptionService.getAvailablePlan().subscribe({
      next: (res: any) => {
        this.availablePlans = res;
      },
      complete: () => {
        //      this.isAvailablePlanLoading = false;
      },
      error: (error: any) => {
        //   this.isAvailablePlanLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    })
  }

  public cancelSubscription(id: string) {
    this.isCancelLoading = true;
    this.subscriptionService.cancelSubscription(id).subscribe({
      next: (res: any) => {
        //this.isCancelLoading = false;
      },
      complete: () => {
        this.isCancelLoading = false;
        this.currentPlan.isRequestToCancel = true;
        //  this.toastr.success('Successfully cancel. Your subscription will end after free trial period','Success');
      },
      error: (error: any) => {
        this.isCancelLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    })
  }


  public changePaymentMethod() {
    this.isPaymentChange = true;
    this.getSetUpIntent();
  }

  private getSetUpIntent() {
    this.isLoading = true;
    this.subscriptionService.setUpIntent().subscribe({
      next: (res: any) => {
        this.clientSecret = res.setupIntent.clientSecret;
        this.stripe = Stripe(res.publishableKey);
        const cardElements = this.stripe.elements();
        this.initCardElements(cardElements);
      },
      complete: () => { },
      error: (error: any) => {
        this.isLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    })
  }


  public changePerPageValue(pageNumber: number) {
    if (pageNumber != 0 && pageNumber != null) {
      this.currentPage = 1;
      this.itemsPerPage = pageNumber;
      this.getAllInvoice();
    }
  }

  public pageChanged(event: any) {
    this.currentPage = event;
    this.getAllInvoice();
  }

  private initCardElements(cardElements: any) {
    var inputFieldStyle = {
      style: {
        base: {
          lineHeight: 2,
          fontFamily: '"Raleway", sans-serif',
          fontSize: '15px',
          '::placeholder': {
            color: '#CFD7E0',
          },
        },
      },
    };
    if (!this.cardNumberElement) {
      this.cardNumberElement = cardElements.create('cardNumber', {
        ...inputFieldStyle,
        placeholder: '1234 1234 1234 1234',
        showIcon: true,
      });
      this.cardNumberElement.mount('#floatingNumber');
      this.cardNumberElement.on('change', (event: any) => {
        this.isCompleteCardNumber = event.complete;
      });
    };
    if (!this.cardCVVElement) {
      this.cardCVVElement = cardElements.create('cardCvc', {
        ...inputFieldStyle,
        placeholder: 'CVV',
      });
      this.cardCVVElement.mount('#floatingCvc');
      this.cardCVVElement.on('change', (event: any) => {
        this.isCompleteCardCVV = event.complete;


      });
    };
    if (!this.cardExpiryElement) {
      this.cardExpiryElement = cardElements.create('cardExpiry', {
        ...inputFieldStyle,
        placeholder: 'MM/YY',
      });
      this.cardExpiryElement.mount('#floatingExpiry');
      this.cardExpiryElement.on('change', (event: any) => {
        this.isCompleteCardExpiry = event.complete;

      });
    };


    this.isLoading = false;
  }

  public cancelChangeMethod() {
    this.isPaymentChange = false;
    this.clientSecret = '';


    if (this.cardNumberElement) {
      this.cardNumberElement.unmount();
      this.cardNumberElement = null;
    }
    if (this.cardCVVElement) {
      this.cardCVVElement.unmount();
      this.cardCVVElement = null;
    }
    if (this.cardExpiryElement) {
      this.cardExpiryElement.unmount();
      this.cardExpiryElement = null;
    }
  }

  public confirmPayment() {
    this.isSubmitted = true;
    this.isChangeLoading = true;
    if (this.isCompleteCardNumber && this.isCompleteCardExpiry && this.isCompleteCardCVV) {
      this.isLoading = true;
      this.stripe.confirmCardSetup(this.clientSecret, { payment_method: { card: this.cardNumberElement }, })
        .then((result: any) => {
          if (result.error) {
            this.toastr.error(result.error.message, 'Error!');
            this.isChangeLoading = false;
          } else {
            this._changePaymentMethod(result.setupIntent.payment_method);
          }
        });
    } else {
      this.toastr.error("In complete", 'Please fill the card information')
    }
  }

  private _changePaymentMethod(paymentMethodId: string) {
    this.subscriptionService.changePaymentMethod(paymentMethodId, this.currentPlan.subscriptionIdString).subscribe({
      next: (res: any) => { },
      complete: () => {
        // this.toastr.success('Payment changed','Success');
        this.isChangeLoading = false;
        this.isLoading = false;
        this.isPaymentChange = false;
        this.getPlanAndBilling();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.isChangeLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    })
  }

  public switchPlan() {
    this.isSwitchPlanLoading = true;
    this.subscriptionService.switchPlan(this.newPlanId, this.currentPlan.subscriptionType).subscribe({
      next: (res: any) => { },
      complete: () => {
        //  this.toastr.success('Plan changed','Success');
        let viewModal: HTMLElement = document.getElementById(
          'close-btn'
        ) as HTMLElement;
        if (viewModal) {
          viewModal.click();
        }
        window.location.href = '/';
        // this.isSwitchPlanLoading = false;
        // this.getPlanAndBilling();
        //   this.getAvailablePlan();
        // this.newPlanId = 0;
      },
      error: (error: any) => {
        let viewModal: HTMLElement = document.getElementById(
          'close-btn'
        ) as HTMLElement;
        if (viewModal) {
          viewModal.click();
        }
        this.isSwitchPlanLoading = false;
        this.isLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    })
  }

  public reactivePayment() {
    // var stripeRes: any;
    this.isCancelLoading = true;
    this.subscriptionService.setUpIntent().subscribe({
      next: (res: any) => {
        // stripeRes = res;
        this.clientSecret = res.setupIntent.clientSecret;
        this.stripe = Stripe(res.publishableKey);
        this.reactivePlan();
      },
      complete: () => { },
      error: (error: any) => {
        this.isLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    })
  }

  public reactivePlan() {
    this.isCancelLoading = true;

    this.subscriptionService.reactivateSubscription(this.currentPlan.subscriptionIdString).subscribe({
      next: async (stripeRes: any) => {
        try {
          const ok = await this._makeCardPayment(stripeRes);
          if (!ok) {
            this.isCancelLoading = false;
            return;
          }
          this.currentPlan.isRequestToCancel = false;
          this.mainUser.isActiveSubscription = true;
          this.authService.setMainUser(this.mainUser);
          this.authService.setActiveSubscription(true);

          this.toastr.success('Subscription successfully reactivated', 'Success!');
          window.location.href = "/";
          // this.getPlanAndBilling();
        } finally {
          this.isCancelLoading = false;
        }
      },
      error: (error: any) => {
        this.isCancelLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    });
  }



  // public reactivePlan() {
  //   var stripeRes: any;
  //   this.subscriptionService.reactivateSubscription(this.currentPlan.subscriptionIdString).subscribe({
  //     next: (res: any) => {
  //       stripeRes = res;
  //     },
  //     complete: () => {
  //       //  this.toastr.success('Plan reactivated','Success');
  //       this._makeCardPayment(stripeRes);
  //       this.isCancelLoading = false;
  //       this.currentPlan.isRequestToCancel = false;
  //       this.mainUser.isActiveSubscription = true;
  //       this.authService.setMainUser(this.mainUser);
  //       this.authService.setActiveSubscription(true);
  //       // this.authService.setIsActiveSubscription(true);
  //       // window.location.href = "/";
  //       // this.getPlanAndBilling();
  //     },
  //     error: (error: any) => {
  //       this.isCancelLoading = false;
  //       this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
  //     }
  //   })
  // }

  public loadMainUserSubscriptionStatus() {
    this.authService.isActiveSubscription$.subscribe((active: boolean | null) => {
      this.isActiveSubscription = active;
      if (!active && active) {
        this.showRetrievePaymentModal = true;
      }
    });
  }

  private getMainUser() {
    this.authService.mainUser$.subscribe((res: any) => {
      this.mainUser = res;
    })
  }

  public retrievePayment(): void {
    this.isRetrieveLoading = true;
    this.subscriptionService.setUpIntent().subscribe({
      next: (res: any) => {
        this.clientSecret = res.setupIntent.clientSecret;
        this.stripe = Stripe(res.publishableKey);
        this.makeRetryPayment();
      },
      complete: () => { },
      error: (error: any) => {
        this.isLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    })
  }


  public makeRetryPayment() {
    this.isRetrieveLoading = true;

    this.subscriptionService.retryPayment(this.currentPlan.subscriptionIdString).subscribe({
      next: async (stripeRes: any) => {
        try {
          const ok = await this._makeCardPayment(stripeRes);

          if (!ok) {
            this.isRetrieveLoading = false;
            return;
          }

          this.toastr.success('Payment retrieved successfully', 'Success!');
          window.location.href = "/";
          //  this.getPlanAndBilling();
        } finally {
          this.isRetrieveLoading = false;
        }
      },
      error: (error: any) => {
        this.isRetrieveLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    });
  }



  // public makeRetryPayment() {
  //   var stripeRes: any;
  //   this.subscriptionService.retryPayment(this.currentPlan.subscriptionIdString).subscribe({
  //     next: (res: any) => {
  //       stripeRes = res;
  //     },
  //     complete: () => {
  //       // this.toastr.success('Payment Retrieved Successfully', 'Success');
  //       this._makeCardPayment(stripeRes);
  //     },
  //     error: (error: any) => {
  //       this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
  //     }
  //   })
  // }


  private async _makeCardPayment(stripeRes: any, paymentMethodId?: string): Promise<boolean> {
    const clientSecretKey =
      stripeRes?.clientSecretKey ??
      stripeRes?.Result?.clientSecretKey ??
      stripeRes?.result?.clientSecretKey;

    // No payment needed (trial / $0)
    if (!clientSecretKey) return true;

    const confirmData: any = {};
    if (paymentMethodId) {
      confirmData.payment_method = paymentMethodId;
    }

    const result = await this.stripe.confirmCardPayment(clientSecretKey, confirmData);

    if (result?.error) {
      this.toastr.error(result.error.message, 'Payment failed');
      return false;
    }

    return true;
  }



  // private _makeCardPayment(stripeRes: any) {
  //   console.log(stripeRes);
  //   if (stripeRes.clientSecretKey) {
  //     this.stripe.confirmCardPayment(stripeRes.paymentIntentId).then((result: any) => {
  //       if (result.error) {
  //         this.isRetrieveLoading = false;
  //         this.toastr.error(result.error.message, 'Error!');
  //       } else {
  //         setTimeout(() => {
  //           this.toastr.success('Subscription successfully reactivated', 'Success!');
  //           this.getPlanAndBilling();
  //         }, 2000);
  //       }
  //     });
  //   } else {
  //     setTimeout(() => {
  //       this.toastr.success('Subscription successfully reactivated', 'Success!');
  //       this.getPlanAndBilling();
  //     }, 2000);
  //   }
  // }
}

