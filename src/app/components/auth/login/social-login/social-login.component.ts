import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SocialAuthService,
  FacebookLoginProvider,
  SocialUser,
  SocialLoginModule,
  GoogleSigninButtonModule,
} from '@abacritt/angularx-social-login';
import { LoginType, SubscriptionStatus } from '../../../../helpers/enum';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { fbAppId } from '../../../../../environments/environment';
import { MemberService } from '../../../../core/services/member.service';
import { LoadingComponent } from "../../../../common/loading/loading.component";

@Component({
  selector: 'app-social-login',
  standalone: true,
  imports: [CommonModule, SocialLoginModule, GoogleSigninButtonModule, LoadingComponent],
  providers: [],
  templateUrl: './social-login.component.html',
  styleUrls: ['./social-login.component.scss'],
})
export class SocialLoginComponent {
  user: SocialUser | null = null;
  isGoogle: boolean = true;
  isLoading: boolean = false;
  isAgent: boolean = false;
  public subscriptionStatus = SubscriptionStatus;

  constructor(
    private authService: SocialAuthService,
    private auth: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private memberService: MemberService
  ) {}

  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      user.provider === 'GOOGLE'
        ? (this.isGoogle = true)
        : (this.isGoogle = false);
      if (user) {
        this._makeSocialLogin();
      }
    });
  }

  signInWithFacebook(): void {
    this.authService
      .signIn(FacebookLoginProvider.PROVIDER_ID)
      .then((user) => console.log())
      .catch((error) => this.toastr.error('Facebook sign-in error', error));
  }

  signOut(): void {
    this.authService.signOut();
  }

  private _makeSocialLogin() {
    this.isLoading = true;
    const body = {
      loginType: this.isGoogle ? LoginType.Google : LoginType.Facebook,
      socialToken: this.isGoogle ? this.user?.idToken : this.user?.authToken,
      socialClientId: this.isGoogle ? '' : fbAppId,
      firstName: this.user?.firstName,
      lastName: this.user?.lastName,
    };
    const clientToken = localStorage.getItem('clientId') || '';
    this.auth.socialLogin(body, clientToken).subscribe({
      next: (res: any) => {
        this.auth.setAuthToken(res.Result.token);
        this.auth.setUser();
      },

      complete: () => {
        // if(!this.isAgent){ window.location.href = "/";}
        this.getMainUser();
      },

      error: (error: any) => {
        this.isLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
        this.router.navigateByUrl('login');
        this.authService.signOut();
      },
    });
  }

  //Subscription
  private getMainUser() {
    this.isLoading = true;
    this.memberService.getMainUser().subscribe({
      next: (res: any) => {
        this.auth.setMainUser(res);
         if(res.subscriptionStatus === this.subscriptionStatus.none){
          this.router.navigateByUrl('member/plans');
          return;
       }

          if (res.memberCount > 0) {
            if (!this.isAgent) {
              window.location.href = '/';
            }
          } else {
            this.router.navigateByUrl('member/member-registration');
          }
          this.isLoading = false;

      },
      complete: () => {},
      error: (error: any) => {
        this.isLoading = false;
      },
    });
  }
}
