import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FriendRequestStatus, NotificationType } from '../../helpers/enum';
import { FullUserProfile, NotificationItem, RequestList, UserProfile } from '../../models/index.model';
import { AuthService } from '../../core/services/auth/auth.service';
import { FriendSignalRService } from '../../core/services/friend-signal-r.service';
import { MemberService } from '../../core/services/member.service';
import { SignalRService } from '../../core/services/signal-r.service';
import { FORM_MODULES } from '../common-imports';

@Component({
  selector: 'app-mobile-top-bar',
  imports: [CommonModule, FORM_MODULES],
  templateUrl: './mobile-top-bar.component.html',
  styleUrl: './mobile-top-bar.component.scss'
})

export class MobileTopBarComponent {
  @Output() openMemberPopup = new EventEmitter<FullUserProfile>();
  public selectedMember!: UserProfile;
  public memberProfiles: UserProfile[] = [];
  public showFriendDropdown = false;
  public showNotificationDropdown = false;
  public isRequestLoading: boolean = false;
  public isNotificationLoading: boolean = false;
  public isUnread: boolean = false;
  public totalRequestList: number = 0;

  public friendRequestList: RequestList[] = [];
  public currentPage = 1;
  public pageSize = 5;
  public hasMoreRequests = true;
  public request = FriendRequestStatus;

  //NOTIFICATION
  public notificationList: NotificationItem[] = [];
  public totalNotificationList: number = 0;
  public totalUnReadCount: number = 0;
  public hasMoreNotification = true;
  public currentNotificationPage = 1;
  public notificationPageSize = 5;

  constructor(
    private _authService: AuthService,
    private _memberService: MemberService,
    private _toster: ToastrService,
    private _friendSignalRService: FriendSignalRService,
    private _signalRService: SignalRService,
    public router: Router,
  ) {

  }

  @HostListener('document:click')
  closeAllDropdowns(): void {
    this.showFriendDropdown = false;
    this.showNotificationDropdown = false;
  }

  ngOnInit(): void {

    this._friendSignalRService.friendRequestAccepted$
      .subscribe((requestId: string) => {
        this.friendRequestList = this.friendRequestList.filter(
          req => req.id !== requestId
        );
      });

    this._getCurrentMember();
    this._getMemberProfiles();
    //  this._getRequests();
    //  this.getNotifications();

    if (this.selectedMember) {
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


  private _getCurrentMember() {
    this._authService.member$.subscribe(data => {
      if (data) {
        this.selectedMember = data;
        this._getRequests();
        this.getNotifications();
      }
    })
  }


  private _getMemberProfiles() {
    this._authService.memberList$.subscribe((data) => {
      if (data) {
        this.memberProfiles = data;
      }
    });
  }

  public changeMemberProfile() {
    localStorage.removeItem('currentMemberId');
    localStorage.setItem('currentMemberId', this.selectedMember.id);
    window.location.href = '/';
  }

  toggleDropdown(type: 'friend' | 'notification', event: MouseEvent): void {
    event.stopPropagation();
    event.stopPropagation()
    if (type === 'friend') {
      this.showFriendDropdown = !this.showFriendDropdown;
      this.showNotificationDropdown = false;
    } else {
      this.showNotificationDropdown = !this.showNotificationDropdown;
      this.showFriendDropdown = false;
    }
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
        // this._toster.success(res, 'rejected');
      },
      complete: () => {
        this.isRequestLoading = false;
      },
      error: (error: any) => {
        this._toster.error(error.error.Error.Title, error.error.Error.Detail);
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

  public navigateToNotificationSection(type: NotificationItem) {
    if (
      type.notificationType === NotificationType.FriendRequestAccept &&
      type.parsedPayload
    ) {
      //  this.viewMemberDetails(type.parsedPayload?.ProfileId);

    }
    this._makeItAsReadNotification(type.id);
  }

  public navigateToMemberView(type: RequestList) {
    if (type) {
      this.router.navigateByUrl(`home/profile/${type.senderProfileId}`);
      this.showNotificationDropdown = false;
    }
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
        this._toster.error(error.error.Error.Detail, error.error.Error.Title);
      },
    });
  }

  public markAllNotificationsAsRead() {
    this._memberService.MakeAsReadAllNotification().subscribe({
      next: (res: any) => { },
      complete: () => {
        this.notificationList.forEach((n) => (n.isRead = true));
        this._toster.success('Messages marked as read.', 'Success');
      },
    });
  }


  private _makeItAsReadNotification(notificationId: string) {
    this._memberService.MakeAsReadNotification(notificationId).subscribe({
      next: (res: any) => { },
      complete: () => {
        const notif = this.notificationList.find(
          (n) => n.id === notificationId
        );
        if (notif) notif.isRead = true;
      },
    });
  }

}
