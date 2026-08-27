import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FriendRequestStatus, NotificationType } from '../../helpers/enum';
import {
  ChatParticipant,
  FullUserProfile,
  MainUser,
  NotificationItem,
  RequestList,
  UserProfile,
} from '../../models/index.model';
import { ChatService } from '../../core/services/chat.service';
import { COMMON_DIRECTIVES, FORM_MODULES } from '../common-imports';
import { AuthService } from './../../core/services/auth/auth.service';
import { SocialLoginService } from './../../core/services/auth/social-login.service';
import { FriendSignalRService } from './../../core/services/friend-signal-r.service';
import { MemberService } from './../../core/services/member.service';
import { SignalRService } from './../../core/services/signal-r.service';
import { ROUTER_MODULES } from './../common-imports';

@Component({
  selector: 'app-navigation-bar',
  imports: [FORM_MODULES, COMMON_DIRECTIVES, ROUTER_MODULES, CommonModule, TitleCasePipe],
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.scss',
})
export class NavigationBarComponent {
  @Input() hideProps = false;
  @Output() openMemberPopup = new EventEmitter<FullUserProfile>();
  public isDropOpen: boolean = false;
  public isShowBox: boolean = false;
  public isLoading: boolean = false;
  public canAddProfile: boolean = false;
  public isMessageOpen: boolean = false;
  public isProfileOpen: boolean = false;
  public isRequestLoading: boolean = false;
  public isNotificationLoading: boolean = false;
  public isUnread: boolean = false;

  public currentPage = 1;
  public pageSize = 5;
  public hasMoreRequests = true;

  public currentNotificationPage = 1;
  public notificationPageSize = 5;
  public hasMoreNotification = true;

  public isNotificationOpen: boolean = false;
  public isFriendRequestOpen = false;
  public selectedMember!: UserProfile;
  public memberProfiles: UserProfile[] = [];
  public request = FriendRequestStatus;
  public loginUserDetails: any;
  public mainUser!: MainUser;

  public searchTerm: string = '';
  public selectedChatId: any = null;

  public UnreadCount: number = 0;

  public chatList: any[] = [];

  //FRIEND REQUESTS
  public participants: ChatParticipant[] = [];
  public friendRequestList: RequestList[] = [];
  public totalRequestList: number = 0;
  public totalNotification: number = 0;

  //NOTIFICATION
  public notificationList: NotificationItem[] = [];
  public totalNotificationList: number = 0;
  public totalUnReadCount: number = 0;

  constructor(
    private eRef: ElementRef,
    private _memberService: MemberService,
    private _toastr: ToastrService,
    public router: Router,
    private _authService: AuthService,
    private _socialLoginService: SocialLoginService,
    private _chatService: ChatService,
    private _friendSignalRService: FriendSignalRService,
    private _toster: ToastrService,
    private _signalRService: SignalRService
  ) { }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!this.eRef.nativeElement.contains(target)) {
      this.isNotificationOpen = false;
      this.isMessageOpen = false;
      this.isProfileOpen = false;
      this.isFriendRequestOpen = false;
    }
  }

  ngOnInit(): void {
    this._getMemberProfiles();
    this._getLoginUserDetails();
    this._getCurrentMember();
    this.getMainUser();

    if (this.selectedMember) {
      this._chatService.onChatParticipantsReceived((data: any[]) => {
        this.participants = data;
        this.UnreadCount = this.participants.filter(
          (p: ChatParticipant) => !p.isRead
        ).length;
      });

      this._friendSignalRService.registerFriendRequestListener((message: any) => {
        this.totalRequestList = this.totalRequestList + 1;
        const newRequest = new RequestList(message);
        const existingIndex = this.friendRequestList.findIndex(
          (r: any) => r.senderProfileId === newRequest.senderProfileId
        );
        if (existingIndex !== -1) {
          this.friendRequestList.splice(existingIndex, 1);
        }
        this.friendRequestList.unshift(message);
        if (Notification.permission === 'granted') {
          new Notification('New Friend Request', {
            body: `You received a request from ${message.name}`,
            icon: 'assets/icons/friend-request.png',
          });
          const audio = new Audio(
            'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3'
          );
          audio.play();
        }
      });

      this._signalRService.receiveNotification((notification: any) => {

        this.totalUnReadCount = this.totalUnReadCount + 1;
        const newNotification = new NotificationItem(notification);
        this.notificationList.unshift(newNotification);
        if (Notification.permission === 'granted') {
          new Notification(`${newNotification.title}`, {
            body: `${newNotification.body}`,
            icon: 'assets/icons/friend-request.png',
          });
        }
      });
    }

  }

  public toggleDropdown(
    type: 'message' | 'notification' | 'profile' | 'friendRequest'
  ): void {
    const wasMessageOpen = this.isMessageOpen;
    const wasNotificationOpen = this.isNotificationOpen;
    const wasProfileOpen = this.isProfileOpen;
    const wasFriendRequestOpen = this.isFriendRequestOpen;

    this.isMessageOpen = false;
    this.isNotificationOpen = false;
    this.isProfileOpen = false;
    this.isFriendRequestOpen = false;

    if (type === 'message') {
      this.isMessageOpen = !wasMessageOpen;
    } else if (type === 'notification') {
      this.isNotificationOpen = !wasNotificationOpen;
    } else if (type === 'profile') {
      this.isProfileOpen = !wasProfileOpen;
    } else if (type === 'friendRequest') {
      this.isFriendRequestOpen = !wasFriendRequestOpen;
    }
  }

  get displayedProfiles() {
    return this.canAddProfile
      ? this.memberProfiles
      : this.memberProfiles.slice(0, 3);
  }

  private _getMemberProfiles() {
    this._authService.memberList$.subscribe((data) => {
      if (data) {
        this.memberProfiles = data;
      }
    });
  }

  private _getCurrentMember() {
    this._authService.member$.subscribe((data) => {
      if (data) {
        this.selectedMember = data;
        this._getRequests();
        this.getNotifications();
      }
    });
  }

  private getMainUser() {
    // this._memberService.getMainUser().subscribe({
    //   next: (res: any) => {
    //     this.mainUser = res;
    //   },
    //   complete: () => {},
    //   error: (error: any) => {},
    // });

    this._authService.mainUser$.subscribe((res: any) => {
      this.mainUser = res;
    })

  }

  public changeMember() {
    this._authService.setUserDetails(this.selectedMember);
    this.router.navigateByUrl('home/member/' + this.selectedMember);
  }

  public viewMemberProfile(id: string) {
    this.router.navigateByUrl('home/member/' + this.selectedMember);
  }

  public _getLoginUserDetails() {
    this.loginUserDetails = this._authService.getTokenDecodeData();
  }

  _authLogout() {
    this._authService.removeAuthToken();
    this._socialLoginService.signOut();
    localStorage.removeItem('clientId');
    localStorage.removeItem('currentMemberId');
    this._authService.setUserDetails(null);
    window.location.href = '/';
  }

  navigateToRegister() {
    this.isProfileOpen = false;
    this.canAddProfile = false;
    this.router.navigateByUrl('member/member-registration');
  }

  public changeMemberProfile(id: string) {
    localStorage.removeItem('currentMemberId');
    localStorage.setItem('currentMemberId', id);
    window.location.href = '/';
  }

  public openChat(member: ChatParticipant) {
    this.selectedChatId = member.receiverProfileId;
    this._chatService.clearParticipant();
    this.UnreadCount = this.UnreadCount - 1;
    this.participants.forEach((p: any) => {
      if (p.receiverProfileId === member.receiverProfileId) {
        p.isRead = true;
      }
    });
    const openChatMember = new ChatParticipant({
      receiverProfileId: member.receiverProfileId,
      name: member.name,
      profileImage: member.profileImage,
      lastSentAt: new Date().toString(),
      isRead: member.isRead,
      lastOnlineAt: null,
    });

    this._chatService.setParticipant(openChatMember);
    this.isMessageOpen = false;


    this.router.navigate(['/home/chat']);
  }
  //FRIENDS REQUEST
  private _getRequests() {
    if (this.isRequestLoading || !this.hasMoreRequests) return;

    this.isRequestLoading = true;

    this._memberService
      .GetFriendRequests(this.currentPage, this.pageSize)
      .subscribe({
        next: (res: any) => {
          if (res.data.length < this.pageSize) {
            this.hasMoreRequests = false;
          }
          this.totalRequestList = res.totalCount;
          this.friendRequestList.push(...res.data);
          this.currentPage++;
        },
        complete: () => {
          this.isRequestLoading = false;
        },
      });
  }

  onScroll(event: any) {
    const element = event.target;
    const scrollBottom = Math.ceil(element.scrollTop + element.clientHeight);

    if (scrollBottom >= element.scrollHeight) {
      this._getRequests();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isFriendRequestOpen']?.currentValue) {
      this.resetAndLoadRequests();
    }
    if (changes['isNotificationOpen']?.currentValue) {
      this.resetAndLoadNotification();
    }
  }

  resetAndLoadRequests() {
    this.currentPage = 1;
    this.hasMoreRequests = true;
    this.friendRequestList = [];
    this._getRequests();
  }
  resetAndLoadNotification() {
    this.currentNotificationPage = 1;
    this.hasMoreNotification = true;
    this.notificationList = [];
    this.getNotifications();
  }

  public confirmFriendRequest(id: any) {
    this.isRequestLoading = true;
    this._memberService.acceptFriendRequest(id).subscribe({
      next: (res: any) => {
        const request = this.friendRequestList.find((r: any) => r.id === id);
        if (request) {
          request.status = this.request.Accepted;
        }
        // this._toster.success(res, 'Confirm');
      },
      complete: () => {
        this.isRequestLoading = false;
        this.totalRequestList = this.totalRequestList - 1;
      },
      error: (error: any) => {
        this._toster.error(error.error.Error.Title, error.error.Error.Detail);
        this.isRequestLoading = false;
      },
    });
  }

  public rejectFriendRequest(id: any) {
    this.isRequestLoading = true;
    this._memberService.rejectFriendRequest(id).subscribe({
      next: (res: any) => {
        const request = this.friendRequestList.find((r: any) => r.id === id);
        if (request) {
          request.status = this.request.Rejected;
        }
        //  this._toster.success(res, 'rejected');
      },
      complete: () => {
        this.isRequestLoading = false;
        this.totalRequestList = this.totalRequestList - 1;
      },
      error: (error: any) => {
        this._toster.error(error.error.Error.Title, error.error.Error.Detail);
        this.isRequestLoading = false;
      },
    });
  }

  public navigateToMemberView(type: RequestList) {
    if (type) {
      this.router.navigateByUrl(`home/profile/${type.senderProfileId}`);
      this.isFriendRequestOpen = false;
    }
  }


  //FRIENDS REQUEST
  public getNotifications() {
    if (this.isNotificationLoading || !this.hasMoreNotification) return;
    this.isNotificationLoading = true;
    this._memberService
      .GetNotification(
        this.currentNotificationPage,
        this.notificationPageSize,
        this.isUnread ? this.isUnread : null
      )
      .subscribe({
        next: (res: any) => {
          if (res.data.length < this.notificationPageSize) {
            this.hasMoreNotification = false;
          }
          this.totalNotificationList = res.totalCount;
          this.totalUnReadCount = res.totalUnreadCount;
          this.notificationList.push(...res.data);
          this.currentNotificationPage++;
        },
        complete: () => {
          this.isNotificationLoading = false;
        },
      });
  }

  public onNotificationScroll(event: any) {
    const element = event.target;
    const scrollBottom = Math.ceil(element.scrollTop + element.clientHeight);

    if (scrollBottom >= element.scrollHeight) {
      this.getNotifications();
    }
  }

  public navigateToNotificationSection(type: NotificationItem) {
    if (type.notificationType === NotificationType.FriendRequestAccept && type.parsedPayload) {
      this.router.navigateByUrl(`home/profile/${type.parsedPayload?.ProfileId}`);
      this.isNotificationOpen = false;
    }
    this._makeItAsReadNotification(type.id);
  }

  private _makeItAsReadNotification(notificationId: string) {
    this._memberService.MakeAsReadNotification(notificationId).subscribe({
      next: (res: any) => { },
      complete: () => {
        const notif = this.notificationList.find(n => n.id === notificationId);
        if (notif) {
          notif.isRead = true;
          this.notificationList = [...this.notificationList];
          this.totalUnReadCount = this.totalUnReadCount - 1;
        }
      },
    });
  }

  public markAllNotificationsAsRead() {
    this._memberService.MakeAsReadAllNotification().subscribe({
      next: (res: any) => { },
      complete: () => {
        this.notificationList.forEach((n) => (n.isRead = true));
        this._toastr.success('Messages marked as read.', 'Success');
      },
    });
  }

  public viewMemberDetails(id: string) {
    // this.isLoading = true;
    this._memberService.GetFilterMemberViewData(id).subscribe({
      next: (res: any) => {
        this.openMemberPopup.emit(res);
      },
      complete: () => {
        let viewModal: HTMLElement = document.getElementById(
          'viewProfileModals'
        ) as HTMLElement;
        if (viewModal) {
          viewModal.click();
        }
      },
      error: (error: any) => {
        //   this.isLoading = false;
        this._toastr.error(error.error.Error.Detail, error.error.Error.Title);
      },
    });
  }

  public enterSettings() {
    this.isProfileOpen = false;
    this.router.navigateByUrl('home/main-user');
  }

  public enterPlanAndBilling() {
    this.isProfileOpen = false;
    this.router.navigateByUrl('member/billing');
  }

  public enterPrivacyPolicy() {
    this.isProfileOpen = false;
    this.router.navigateByUrl('help-center');
  }
}
