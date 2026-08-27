import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FriendRequestStatus } from '../../../helpers/enum';
import { ChatParticipant, FullUserProfile, MainUser, Request } from '../../../models/index.model';
import { ChatService } from '../../../core/services/chat.service';
import { FriendSignalRService } from '../../../core/services/friend-signal-r.service';
import { COMMON_DIRECTIVES } from '../../common-imports';
import { AuthService } from './../../../core/services/auth/auth.service';
import { MemberService } from './../../../core/services/member.service';


@Component({
  selector: 'app-member-profile-modal',
  imports: [CommonModule, COMMON_DIRECTIVES, TitleCasePipe],
  templateUrl: './member-profile-modal.component.html',
  styleUrl: './member-profile-modal.component.scss'
})
export class MemberProfileModalComponent {
  @Input() memberProfile!: FullUserProfile;
  @Input() isPopUp: boolean = false;
  @Input() isAdmin: boolean = false;
  @Output() imageSelected = new EventEmitter<number>();

  public mainUser!: MainUser;

  private readonly allTabs: any = [
    { id: 1, icon: 'fas fa-user', label: 'Overview' },
    { id: 2, icon: 'fas fa-heart', label: 'Personal' },
    { id: 3, icon: 'fas fa-briefcase', label: 'Career' },
    { id: 4, icon: 'fas fa-users', label: 'Family' },
    { id: 5, icon: 'fas fa-star', label: 'Astrology' }
  ];

  public tabs: any = [...this.allTabs];

  public currentTap: number = 1;
  public request = FriendRequestStatus;
  public isLoading: boolean = false;
  public selectedMember: string = '';

  // Active slide of this component's own image carousel (#exampleModal222).
  public activeImageIndex: number = 0;

  constructor(
    private _memberService: MemberService,
    private _toster: ToastrService,
    private _authService: AuthService,
    private _chatService: ChatService,
    private router: Router,
    private _friendSignalRService: FriendSignalRService
  ) {

  }

  ngOnInit(): void {
    this.getMainUser();
  }

  ngOnChanges(): void {
    this.tabs = [...this.allTabs];
    this.currentTap = 1;

    if (this.memberProfile) {
      if (!this.memberProfile?.profileJob) {
        this.tabs = this.tabs.filter((tab: any) => tab.id !== 3);
      }

      if (!this.memberProfile?.profileAstrology?.timeOfBirth && !this.memberProfile.profileAstrology?.starName && !this.memberProfile.profileAstrology?.rasiName) {
        this.tabs = this.tabs.filter((tab: any) => tab.id !== 5);
      }
    }
    this._getCurrentMember();
  }


  private _getCurrentMember() {
    this._authService.member$.subscribe(data => {
      if (data) {
        this.selectedMember = data.id;
      }
    })
  }

  public addFriendRequest(id: string) {
    this.isLoading = true;
    this._memberService.addFriendRequest(id).subscribe({
      next: (res: any) => {
        var fr = new Request({ status: 1, id: res.id })
        this.memberProfile.friendRequest = fr;
        // this._toster.success('Friend request sent.','Success');
      },
      complete: () => {
        this.isLoading = false;
      },
      error: (error: any) => {
        this._toster.error(error.error.Error.Title, error.error.Error.Detail);
        this.isLoading = false;
      }
    })
  }

  public confirmFriendRequest(id: any) {
    this.isLoading = true;
    this._memberService.acceptFriendRequest(id).subscribe({
      next: (res: any) => {
        var fr = new Request({ status: this.request.Accepted })
        this.memberProfile.friendRequest = fr;
        //  this._toster.success(res,'Confirm');
      },
      complete: () => {
        this.isLoading = false;
        this._friendSignalRService.notifyFriendRequestAccepted(id);
      },
      error: (error: any) => {
        this._toster.error(error.error.Error.Title, error.error.Error.Detail);
        this.isLoading = false;
      }
    })
  }

  public cancelFriendRequest(id: any) {
    this.isLoading = true;
    this._memberService.cancelRequest(id).subscribe({
      next: (res: any) => {
        // this._toster.success(res,'cancel');
      },
      complete: () => {
        this.memberProfile.friendRequest = null;
        this.isLoading = false;
      },
      error: (error: any) => {
        this._toster.error(error.error.Error.Title, error.error.Error.Detail);
        this.isLoading = false;
      }
    })
  }

  public openChat(member: FullUserProfile) {
    this._chatService.clearParticipant();
    const openChatMember = new ChatParticipant({
      receiverProfileId: member.id,
      name: member.firstName,
      profileImage: member.profileImages[0].url,
      lastSentAt: new Date().toString(),
      isRead: false,
    });
    this._chatService.setParticipant(openChatMember);
    let viewModal: HTMLElement = document.getElementById(
      'member-profile-close-btn'
    ) as HTMLElement;
    if (viewModal) {
      viewModal.click();
    }
    this.router.navigate(['/home/chat']);
  }

  public prevImage(): void {
    const count = this.memberProfile?.profileImages?.length ?? 0;
    if (count === 0) return;
    this.activeImageIndex = (this.activeImageIndex - 1 + count) % count;
  }

  public nextImage(): void {
    const count = this.memberProfile?.profileImages?.length ?? 0;
    if (count === 0) return;
    this.activeImageIndex = (this.activeImageIndex + 1) % count;
  }

  public goToImage(index: number): void {
    this.activeImageIndex = index;
  }

  private getMainUser() {
    this._authService.mainUser$.subscribe((res: any) => {
      this.mainUser = res;
    })
  }

}
