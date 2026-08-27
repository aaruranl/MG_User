import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FORM_MODULES, ROUTER_MODULES } from '../../../common/common-imports';
import { PhoneNumberInputComponent } from "../../../common/phone-number-input/phone-number-input.component";
import { LoginType, ResetPasswordStep, SubscriptionStatus, TokenType } from '../../../helpers/enum';
import { TokenResult } from '../../../models/index.model';
import { AuthService } from '../../../core/services/auth/auth.service';
import { VerificationComponent } from "../verification/verification.component";
import { matrimonyAgentConfig, matrimonyMemberConfig } from './../../../helpers/util';
import { MemberService } from './../../../core/services/member.service';
import { SocialLoginComponent } from "./social-login/social-login.component";
@Component({
  selector: 'app-login',
  imports: [FORM_MODULES, CommonModule, ROUTER_MODULES, FORM_MODULES, VerificationComponent, PhoneNumberInputComponent, SocialLoginComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private _agentClientData = matrimonyAgentConfig.clientData;
  private _memberClientData = matrimonyMemberConfig.clientData;
  private _resetToken: string = '';
  private _verifyToken: string = '';
  private _phoneNumber: string = '';


  public isLoading: boolean = false;
  public isSubmitted: boolean = false;
  public isLogin: boolean = true;
  public isAgent: boolean = false;
  public isSingUp: boolean = false;
  public isMatchPwd: boolean = true;
  public isEmailLogin: boolean = true;
  public isForgotSubmitted: boolean = false;
  public isForgot: boolean = false;
  public isOtpVerification: boolean = false;
  public showPassword: boolean = false;
  public step: number = 1;
  public otpCode: number = 0;
  public phoneNumberDetails: any = null;

  public loginForm!: FormGroup;
  public signUpForm!: FormGroup;
  public forgotForm!: FormGroup;
  public passwordResetForm!: FormGroup;

  public inputControls: string[] = [];
  public clientToken: string = '';
  public resetStep = ResetPasswordStep;
  public passwordStrength = {
    value: 0,
    text: 'None',
    class: ''
  };

  public subscriptionStatus = SubscriptionStatus;

  private _loginTokenType: number = 0;
  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private memberService: MemberService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getLoginClientToken();
    this._loginFormInit();
    this._signInFormInit();
    this._forgotFormInit();
    this._resetPwdFormsInit();
  }

  private _loginFormInit() {
    this.loginForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
    })
  }

  private _signInFormInit() {
    this.signUpForm = this.formBuilder.group({
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,50}$/)]],
      password: [null, [Validators.required, Validators.minLength(8)]],
    })
  }

  private _forgotFormInit() {
    this.forgotForm = this.formBuilder.group({
      email: [null, [Validators.required,]],
    })
  }


  private _resetPwdFormsInit() {
    this.passwordResetForm = this.formBuilder.group({
      password: [null, [Validators.required, Validators.minLength(8)]],
      confirmPassword: [null, [Validators.required, Validators.minLength(8)]],
    })
  }

  //CLIENT TOKEN
  public getLoginClientToken() {
    this.clientToken = '';
    this.isLoading = true;

    this.auth.getLoginClientToken(this.isAgent ? this._agentClientData : this._memberClientData).subscribe({
      next: (response: TokenResult) => {
        this.clientToken = response.token;
        localStorage.removeItem('clientId');
        localStorage.setItem('clientId', response.token);
      },
      complete: () => {
        this.isLoading = false;
      },
      error: (error: any) => {
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    });
  }

  //OTP EMITTER
  public getOtpFromChild(event: any) {
    this.otpCode = event;
    if (!this.isForgot) {
      this._emailVerification()
    } else {
      this.verifyOtp()
    }
  }
  //EMAIL OTP VERIFICATION
  private _emailVerification() {
    this.isLoading = true;
    const body = {
      token: this._resetToken,
      otpCode: this.otpCode,
    }
    this.auth.emailVerification(body, this.clientToken).subscribe({
      next: (res: any) => {
        this.auth.setAuthToken(res.Result.token);
        this.auth.setUser();
      },
      complete: () => {
        //  this.isLoading = false;
        //   if(!this.isAgent){ window.location.href = "/";}
        this.getMainUser();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    })
  }

  //OTP
  public sendOtp() {
    let body = this.forgotForm.value.email;

    let isValid: boolean = true;
    if (!this.isEmailLogin) {
      this.forgotForm.get('email')?.setValidators([]);
      this.forgotForm.get('email')?.updateValueAndValidity();
      let phoneNumberText = this._phoneNumber.split('+');
      let phoneNumber = '%2B' + phoneNumberText[1];
      body = phoneNumber;
      this._phoneNumber.length === 0 ? isValid = false : isValid = true;
    } else {
      this.forgotForm.get('email')?.setValidators([Validators.required, Validators.email]);
      this.forgotForm.get('email')?.updateValueAndValidity();
      isValid = this.forgotForm.valid;
    }
    this.isForgotSubmitted = true;
    if (isValid) {
      this.isLoading = true;
      this.auth.forgotPassword(this.isEmailLogin, this.clientToken, body).subscribe({
        next: (res: TokenResult) => {
          this._resetToken = res.token;
        },
        complete: () => {
          this.isLoading = false;
          this.isForgotSubmitted = false;
          this.step = this.resetStep.verification;
        },
        error: (error: any) => {
          this.isLoading = false;
          this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
        }
      })
    }
  }

  //PHONE NUMBER
  public getPhoneNumber(event: any) {
    this.phoneNumberDetails = event;
    this._phoneNumber = event.phoneNumber;
  }

  //SING UP
  public signUp() {
    this.isSubmitted = true;
    if (this.passwordStrength.value < 100 || !this.phoneNumberDetails?.phoneNumber) {
      return;
    }
    if (this.signUpForm.valid) {
      this.isLoading = true;
      const body = this.signUpForm.value;
      body['loginType'] = LoginType.Email;
      body['phoneNumber'] = this._phoneNumber;
      body['phoneCode'] = this.phoneNumberDetails?.code;
      this.auth.signUp(this.signUpForm.value, this.clientToken).subscribe({
        next: (res: any) => {
          this._resetToken = res.Result.token;
        },
        complete: () => {
          this.isLoading = false;
          this.isOtpVerification = true;
        },
        error: (error: any) => {
          this.isLoading = false;
          this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
        }
      })
    }
  }

  // LOGIN
  public login() {
    this.isSubmitted = true;
    const formValue = this.loginForm.value;
    const body = {
      password: formValue.password,
      loginType: this.isEmailLogin ? LoginType.Email : LoginType.PhoneNumber,
      ...(!this.isEmailLogin ? { phoneNumber: this._phoneNumber } : { email: formValue.email })
    };
    if (!this.isEmailLogin) {
      this.loginForm.get('email')?.setValidators([]);
      this.loginForm.get('email')?.updateValueAndValidity();
    } else {
      this.loginForm.get('email')?.setValidators([Validators.required, Validators.email]);
      this.loginForm.get('email')?.updateValueAndValidity();
    }

    if (this.loginForm.valid) {
      this.isLoading = true;
      this.auth.login(body, this.clientToken).subscribe({
        next: (res: any) => {
          if (res.Result.tokenType === TokenType.UserVerificationToken) {
            this._loginTokenType = res.Result.tokenType;
            this._resetToken = res.Result.token;
            this.isOtpVerification = true;
            this.isLoading = false;
          } else {
            this.isOtpVerification = false;
            this.auth.setAuthToken(res.Result.token);
            this.auth.setUser();
            //  this.isLoading = false;
            this.getMainUser()
            //  if(!this.isAgent){ window.location.href = "/";}
          }
        },
        complete: () => { },
        error: (error: any) => {
          this.isLoading = false;
          this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
        }
      })
    }
  }

  //RESENT OTP
  public resentOtp() {
    this.isLoading = true;
    const formValue = this.signUpForm.value;
    const body = {
      password: formValue.password,
      email: formValue.email,
      LoginType: LoginType.Email
    };
    this.auth.login(body, this.clientToken).subscribe({
      next: (res: any) => {
        if (res.Result.tokenType === TokenType.UserVerificationToken) {
          this._resetToken = res.Result.token;
        }
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

  public loginWithPhoneNumber(value: boolean) {
    this.isEmailLogin = value;
    this.isSubmitted = false;
  }

  public backToStep() {
    if (this._loginTokenType === TokenType.UserVerificationToken) {
      this.step = this.resetStep.login;
      this.isSubmitted = false;
      this.loginForm.get('password')?.setValue(null);
      return;
    }
    if (this.step = this.resetStep.enterEmail) {
      this.isForgot = false;
      this.isSubmitted = false;
      this.isForgotSubmitted = false;
      this.forgotForm.reset();
      return;
    }
    if (this.step = this.resetStep.verification) {
      this.step = this.resetStep.enterEmail;
    } else if (this.step = this.resetStep.resetPassword) {
      this.step = this.resetStep.verification;
    }
  }

  public verifyOtp() {
    this.isLoading = true;
    const body = {
      token: this._resetToken,
      otpCode: Number(this.otpCode)
    }
    this.auth.verifyOtp(body, this.clientToken).subscribe({
      next: (res: any) => {
        this._verifyToken = res.Result.token;
      },
      complete: () => {
        this.step = this.resetStep.resetPassword;
        this.passwordResetForm.reset();
        this.isLoading = false;
      },
      error: (error: any) => {
        const firstInput = document.querySelector('.otp-input') as HTMLElement;
        if (firstInput) {
          setTimeout(() => firstInput.focus(), 50);
        }
        this.isLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    })
  }

  public createPassword() {
    const pwdValues = this.passwordResetForm.value;
    if (this.passwordStrength.value < 100) {
      this.toastr.error('Password strength must be excellent', 'Error');
      return;
    }
    if (pwdValues.password === pwdValues.confirmPassword) {
      this.isLoading = true;
      this.isSubmitted = true;
      this.isMatchPwd = true;
      const body = {
        token: this._verifyToken,
        newPassword: pwdValues.password
      }
      this.auth.createPassword(body, this.clientToken).subscribe({
        next: (res: any) => {
          this.auth.setAuthToken(res.Result.token);
          this.auth.setUser();
        },
        complete: () => {
          this.isLoading = false;
          if (!this.isAgent) {
            //  window.location.href = "/";
            // this.router.navigateByUrl('home/member');
            this.getMainUser()
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
        }
      })
    } else {
      this.isMatchPwd = false;
    }
  }

  public onInputChange() {
    this.isMatchPwd = true;
  }

  public updatePasswordStrength(isSignUp: boolean): void {
    let password = null;
    isSignUp ? password = this.signUpForm.get('password')?.value : password = this.passwordResetForm.get('password')?.value;
    this.passwordStrength = { value: 0, text: 'None', class: '' };
    if (!password || password.length === 0) return;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    this.passwordStrength.value = strength;
    if (strength < 30) {
      this.passwordStrength.class = 'bg-danger';
      this.passwordStrength.text = 'Weak';
    } else if (strength < 60) {
      this.passwordStrength.class = 'bg-warning';
      this.passwordStrength.text = 'Fair';
    } else if (strength < 100) {
      this.passwordStrength.class = 'bg-info';
      this.passwordStrength.text = 'Good';
    } else {
      this.passwordStrength.class = 'bg-success';
      this.passwordStrength.text = 'Excellent';
    }
  }

  public togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  public changeSignUpStatus() {
    this.isSingUp = true;
    this.loginForm.reset();
    this.isSubmitted = false;
    this.passwordStrength = {
      value: 0,
      text: 'None',
      class: ''
    };
  }

  public changeSignInStatus() {
    this.isSingUp = false;
    this.signUpForm.reset();
    this.isSubmitted = false;
    this.passwordStrength = {
      value: 0,
      text: 'None',
      class: ''
    };
  }

  //Subscription
  private getMainUser() {
    this.isLoading = true;
    this.memberService.getMainUser().subscribe({
      next: (res: any) => {
        this.auth.setMainUser(res);
        if (res.subscriptionStatus === this.subscriptionStatus.none) {
          this.router.navigateByUrl('member/plans');
          return;
        }

        if (res.memberCount > 0) {
          if (!this.isAgent) { window.location.href = "/"; }
        } else {
          this.router.navigateByUrl('member/member-registration');
        }
        this.isLoading = false;

      },
      complete: () => { },
      error: (error: any) => { this.isLoading = false; },
    });
  }

}


