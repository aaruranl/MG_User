import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FORM_MODULES } from '../../../../common/common-imports';
import { LoadingComponent } from "../../../../common/loading/loading.component";
import { PrivacyPolicyComponent } from "../../../../common/privacy-policy/privacy-policy.component";
import { TermsAndConditionComponent } from "../../../../common/terms-and-condition/terms-and-condition.component";
import { TopBarComponent } from "../../../../common/top-bar/top-bar.component";
import { BillingInterval } from '../../../../helpers/enum';
import { SubscriptionPlan } from '../../../../models/Subscription/MemberPlan.model';
import { MainUser } from '../../../../models/index.model';
import { AuthService } from './../../../../core/services/auth/auth.service';
import { SubscriptionService } from './../../../../core/services/subscription.service';
declare var Stripe: any;
@Component({
  selector: 'app-stripe-payment',
  imports: [CommonModule, FORM_MODULES, LoadingComponent, TopBarComponent, PrivacyPolicyComponent, TermsAndConditionComponent],
  templateUrl: './stripe-payment.component.html',
  styleUrl: './stripe-payment.component.scss'
})
export class StripePaymentComponent {

  public stripe: any;
  public isStripeLoading: boolean = false;
  private cardNumberElement: any;
  public isCompleteCardNumber: boolean = false;
  private cardCVVElement: any;
  public isCompleteCardCVV: boolean = false;
  private cardExpiryElement: any;
  public isCompleteCardExpiry: boolean = false;
  private cardPostCodeElement: any;
  public isCompleteCardPostCode: boolean = false;
  private _isActiveSubscription: boolean = false;

  public isLoading: boolean = false;
  public clientSecret: string = '';
  public isSubmitted: boolean = false;
  public agreed = false;
  public name: string = '';

  private planId!: string;
  public plan!: SubscriptionPlan;
  public mainUser!: MainUser;
  public subscriptionForm!: FormGroup;

  public billingInterval = BillingInterval;
  constructor(
    private subscriptionService: SubscriptionService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService

  ) {

  }
  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('id')!;
    this.subScriptionFormInit();
    this.getSetUpIntent();
    this.getPlan();
    this.getMainUser();

  }

  private subScriptionFormInit() {
    this.subscriptionForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      postcode: ['', [Validators.required]],
      country: ['', [Validators.required]],
      name: [null]
    });
  }


  private initCardElements(cardElements: any) {
    this.isStripeLoading = true;
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
    // if (!this.cardPostCodeElement) {
    //   this.cardPostCodeElement = cardElements.create('postalCode', {
    //     ...inputFieldStyle,
    //     placeholder: '-',
    //   });
    //   this.cardPostCodeElement.mount('#floatingPost');
    //   this.cardPostCodeElement.on('change', (event: any) => {
    //     this.isCompleteCardPostCode = event.complete;
    //   });
    // };
    this.isStripeLoading = false;
  }

  private getSetUpIntent() {
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

  public confirmPayment() {
    this.isSubmitted = true;
    if (this.subscriptionForm.valid) {
      if (this.isCompleteCardNumber && this.isCompleteCardExpiry && this.isCompleteCardCVV) {
        this.isLoading = true;
        this.stripe.confirmCardSetup(this.clientSecret, { payment_method: { card: this.cardNumberElement }, })
          .then((result: any) => {
            if (result.error) {
              this.isLoading = false;
              this.toastr.error(result.error.message, 'Error!');
            } else {
              this._addPaymentMethod(result.setupIntent.payment_method);
            }
          });
      } else {
        this.toastr.error("In complete", 'Please fill the card information');
      }
    } else {
      if (!this.subscriptionForm.get('email')?.valid) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }

    }
  }

  private _addPaymentMethod(paymentMethodId: string) {
    let body = {
      address: this.subscriptionForm.value.address,
      city: this.subscriptionForm.value.city,
      country: this.subscriptionForm.value.country,
      postalCode: this.subscriptionForm.value.postcode,
      IsAcceptedTerms: this.agreed,
    }
    this.subscriptionService.confirmPayment(paymentMethodId, body).subscribe({
      next: (res: any) => {
      },
      complete: () => {
        this._makeSubScription(paymentMethodId);
      },
      error: (error: any) => {
        this.isLoading = false;
        const detail = error?.error?.Error?.Detail ?? 'Subscription failed';
        const title = error?.error?.Error?.Title ?? 'Error';
        this.toastr.error(detail, title);
        if (title === 'Card declined') {
          this.resetCardElements();
          this.getSetUpIntent();
        }
      }
    })
  }

  private resetCardElements(): void {
    // Safely unmount existing Stripe elements
    try {
      this.cardNumberElement?.unmount();
      this.cardCVVElement?.unmount();
      this.cardExpiryElement?.unmount();
      this.cardPostCodeElement?.unmount();
    } catch {
      // ignore unmount errors
    }

    this.cardNumberElement = null;
    this.cardCVVElement = null;
    this.cardExpiryElement = null;
    this.cardPostCodeElement = null;

    this.isCompleteCardNumber = false;
    this.isCompleteCardCVV = false;
    this.isCompleteCardExpiry = false;
    this.isCompleteCardPostCode = false;

    // If you have card error state, clear it here as well
    (this as any).cardNumberError = null;
    (this as any).cardCVVError = null;
    (this as any).cardExpiryError = null;
  }

  private _makeSubScription(paymentMethodId: string) {
    const body = {
      planId: this.planId,
      paymentMethodId,
      isReactive: false
    };

    this.isLoading = true;

    this.subscriptionService.makeSubscription(body).subscribe({
      next: async (res: any) => {
        try {
          const clientSecretKey =
            res?.clientSecretKey ??
            res?.result?.clientSecretKey ??
            res?.Result?.clientSecretKey;

          // ✅ Trial / $0 invoice => no payment intent => just continue
          if (!clientSecretKey) {
            this.isLoading = false;
            this.router.navigateByUrl('member/member-registration');
            return;
          }

          const result = await this.stripe.confirmCardPayment(
            clientSecretKey,
            { payment_method: paymentMethodId },
            { handleActions: true }
          );

          if (result?.error) {
            this.isLoading = false;
            this.toastr.error(result.error.message, 'Payment failed');
            return;
          }

          this.isLoading = false;
          this.router.navigateByUrl('member/member-registration');
        } catch (e: any) {
          this.isLoading = false;
          this.toastr.error(e?.message ?? 'Payment confirmation failed', 'Error');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        const detail = error?.error?.Error?.Detail ?? 'Subscription failed';
        const title = error?.error?.Error?.Title ?? 'Error';
        this.toastr.error(detail, title);

        if (title === 'Card declined') {
          window.location.href = `/member/payment/${this.planId}`;
        }
      }
    });
  }


  // private _makeSubScription(paymentMethodId: string) {
  //   let body = {
  //     planId: this.planId,
  //     paymentMethodId: paymentMethodId,
  //     isReactive: false
  //   }
  //   this.subscriptionService.makeSubscription(body).subscribe({
  //     next: (res: any) => {
  //       if (res.clientSecretKey) {
  //         this.stripe.confirmCardPayment(res.clientSecretKey, {
  //           setup_future_usage: 'off_session'
  //         });
  //       }
  //     },
  //     complete: () => {
  //       this.isLoading = false;
  //       // this.toastr.success('Payment method successfully updated', 'Success!');
  //       this.router.navigateByUrl('member/member-registration');
  //     },
  //     error: (error: any) => {
  //       this.isLoading = false;
  //       this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
  //     }
  //   })
  // }

  private getPlan() {
    this.isLoading = true;
    this.subscriptionService.getPlan(this.planId).subscribe({
      next: (res: any) => {
        this.plan = res;
      },
      complete: () => {
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    })
  }

  private getMainUser() {
    this.authService.mainUser$.subscribe((res: any) => {
      this.mainUser = res;
      if (res !== null) {
        this.subscriptionForm.get('email')?.patchValue(res.email);
        this.subscriptionForm.get('name')?.patchValue(res.firstName + ' ' + (res.lastName !== null ? res.lastName : ''));
      }
    })
  }

  public changeAgree(event: any) {
    this.agreed = event.target.checked;
  }

  get promoMessage(): string {
  if (!this.plan) return '';
  
  if (this.plan.trialPeriodDays > 0 && this.plan.discount <= 0) {
    return `$0.00 for First ${this.plan.trialPeriodDays} Days`;
  }

  if (this.plan.trialPeriodDays > 0 && this.plan.discount > 0) {
    return `$0.00 for First ${this.plan.trialPeriodDays} Days, Then enjoy ${this.plan.discount}% OFF `;
  }


  return '';
}


}
