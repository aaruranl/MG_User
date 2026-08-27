import { MemberApproval, SubscriptionStatus } from './helpers/enum';
import { MainUser, UserProfile } from './models/member/member.model';
import { FriendSignalRService } from './core/services/friend-signal-r.service';
import { ChatService } from './core/services/chat.service';
import { SignalRService } from './core/services/signal-r.service';
import { AuthService } from './core/services/auth/auth.service';
import { DataProviderService } from './core/services/data-provider.service';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavigationBarComponent } from "./common/navigation-bar/navigation-bar.component";
import { CommonModule } from '@angular/common';
import { COMMON_DIRECTIVES } from './common/common-imports';
import { MemberService } from './core/services/member.service';
import { MobileTopBarComponent } from "./common/mobile-top-bar/mobile-top-bar.component";
import { MemberProfileModalComponent } from "./common/pop-up/member-profile-modal/member-profile-modal.component";
import { UserType } from './helpers/util';
import { LoadingComponent } from "./common/loading/loading.component";
import { CookieService } from './core/services/cookie-service.service';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    COMMON_DIRECTIVES,
    NavigationBarComponent,
    MemberProfileModalComponent,
    LoadingComponent,
    MobileTopBarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'matrimony';
  public isLogin: boolean = false;
  public isLoading: boolean = true;
  public hideNavProps = false;
  public isCanRenderSideBar: boolean = false;
  public currentMemberDetails: any;
  public filterMemberViewData: any;
  public userType = UserType;
  public currentUserType: any;
  public mainUser!: MainUser;
  public memberList: UserProfile[] = [];
  public subscriptionStatus = SubscriptionStatus;
  public isActiveSubscription = false;
  public currentMember: any;
  public isMobile = false;
  cookieConsent: string | null = null;

  constructor(
    private dataProviderService: DataProviderService,
    private _authService: AuthService,
    private router: Router,
    private _memberService: MemberService,
    private _chatService: ChatService,
    private _friendSignalRService: FriendSignalRService,
    private _signalRService: SignalRService,
    private cookieService: CookieService,
    private seoService: SeoService
  ) {
    this.currentUserType = localStorage.getItem('userType');
  }

  ngOnInit(): void {
    this.seoService.init();
    this.cookieConsent = this.cookieService.getCookie('userConsent');

    if (this.cookieConsent === 'accepted') {
      this._grantGAConsent();
    }

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (typeof (window as any).gtag === 'function') {
          (window as any).gtag('event', 'page_view', {
            page_path: event.urlAfterRedirects
          });
        }
      });

    this.dataProviderService.getUserGeoLocation();
    this._authService.member$.subscribe((data) => {
      this.currentMemberDetails = data;
    });
    this._authService.authStatus.subscribe(data => {
      this.isLogin = data;
    });

    if (this.isLogin) {
      this.getMainUser();
    } else {
      this.isLoading = false;
    }
  }

  private _grantGAConsent(): void {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  }

  private _denyGAConsent(): void {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', { analytics_storage: 'denied' });
    }
  }

  private _getMemberList() {
    this.isLoading = true;
    this._memberService.getProfiles().subscribe({
      next: (res: any) => {
        this.memberList = res;
        if (res.length === 0) {
          this.hideNavProps = true;
          this._authService.setMemberList(null);
          this._authService.setUserDetails(null);
          localStorage.removeItem('currentMemberId');
          this.isLoading = false;
          this.router.navigateByUrl('member/member-registration');
          return;
        } else {
          this._authService.setMemberList(res);
          this.hideNavProps = false;
          const currentMemberId = localStorage.getItem('currentMemberId');
          if (currentMemberId) {
            const member = res.find((m: any) => m.id === currentMemberId);
            this.currentMember = member;
            this._authService.setUserDetails(member);
          } else {
            const approvalMembers = res.filter((m: any) => m.memberApproval === MemberApproval.Approved);
            if (approvalMembers.length > 0) {
              localStorage.setItem('currentMemberId', res[0].id);
              this._authService.setUserDetails(res[0]);
              this.currentMember = res[0];
            } else {
              localStorage.setItem('currentMemberId', res[0].id);
              this._authService.setUserDetails(res[0]);
              this.currentMember = res[0];
              this.router.navigateByUrl('member/approval');
              this.isLoading = false;
              return;
            }
          }
          if (res.length === 1 && res[0].memberApproval === MemberApproval.Pending) {
            this.router.navigateByUrl('member/approval');
            this.isLoading = false;
            return;
          }
          this._chatService.startConnection();
          this._friendSignalRService.startConnection();
          this._signalRService.startNotificationHub();
          this.isLoading = false;
          this._memberService.setInitialLoading(false);
        }
      },
      complete: () => {},
      error: (error: any) => {
        this.isLoading = false;
      }
    });
  }

  public viewMemberDetails(id: string) {
    this._memberService.GetFilterMemberViewData(id).subscribe({
      next: (res: any) => {
        this.filterMemberViewData = res;
      },
      complete: () => {},
      error: (error: any) => {},
    });
  }

  private getMainUser() {
    this._memberService.setInitialLoading(true);
    this.isLoading = true;
    this._memberService.getMainUser().subscribe({
      next: (res: any) => {
        this.mainUser = res;
        this._authService.setMainUser(res);
        this._authService.setActiveSubscription(res.isActiveSubscription);
        if (res.isActiveSubscription) {
          this._getMemberList();
        } else {
          this.isLoading = false;
          res.subscriptionStatus === this.subscriptionStatus.none ? this.router.navigateByUrl('member/plans') : this.router.navigateByUrl('member/billing');
        }
      },
      complete: () => {},
      error: (error: any) => { this.isLoading = false; },
    });
  }

  accept() {
    this.cookieService.setCookie('userConsent', 'accepted', 365);
    this.cookieConsent = 'accepted';
    this._grantGAConsent();
  }

  reject() {
    this.cookieService.setCookie('userConsent', 'rejected', 365);
    this.cookieConsent = 'rejected';
    this._denyGAConsent();
  }
}
