import { ChatService } from './../../../../../core/services/chat.service';
import { Router } from '@angular/router';
import { MemberService } from './../../../../../core/services/member.service';
import { AuthService } from './../../../../../core/services/auth/auth.service';
import { Component } from '@angular/core';
import {
  COMMON_DIRECTIVES,
  FORM_MODULES,
} from '../../../../../common/common-imports';
import { CommonModule } from '@angular/common';
import {
  ChatParticipant,
  FullUserProfile,
  MemberProfile,
  UserProfile,
} from '../../../../../models/index.model';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { MemberProfileModalComponent } from '../../../../../common/pop-up/member-profile-modal/member-profile-modal.component';
import { combineLatest, distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { LoadingComponent } from "../../../../../common/loading/loading.component";

@Component({
  selector: 'app-filter-member-list',
  imports: [
    FORM_MODULES,
    COMMON_DIRECTIVES,
    CommonModule,
    NgxPaginationModule,
    MemberProfileModalComponent,
    LoadingComponent
],
  templateUrl: './filter-member-list.component.html',
  styleUrl: './filter-member-list.component.scss',
})
export class FilterMemberListComponent {
  public memberProfiles: MemberProfile[] = [];
  public filterMemberViewData!: FullUserProfile;
  public currentsUser!: UserProfile;
  public totalItemCount: number = 0;
  public itemsPerPage: number = 6;
  public currentPage: number = 1;
  public isLoading: boolean = false;
  public filter: any;
  private destroy$ = new Subject<void>();
  public isGetUser:boolean = false;
  public isMemberViewLoading:boolean = false;
  public viewMemberId:string = '';

  public memberImages:string[] = [];

  constructor(
    private auth: AuthService,
    private memberService: MemberService,
    private _toastr: ToastrService,
    private router: Router,
    private _chatService: ChatService,
  ) {
     combineLatest([
    this.auth.member$.pipe(filter(user => !!user)),
    this.memberService.filter$.pipe(filter(f => !!f))
  ])
  .pipe(takeUntil(this.destroy$))
  .subscribe(([user, filterData]) => {
    this.currentsUser = user;
    this.filter = filterData;
    if(this.filter.maxAge === undefined){
      this.filter.maxAge = user.profileLookingFor.maxAge;
    }
    if(this.filter.minAge === undefined){
      this.filter.minAge = user.profileLookingFor.minAge;
    }

    if(this.filter.OriginCountries === undefined){
      this.filter.OriginCountries = [user.originCountry];
    }

    if(this.filter.LivingCountries === undefined){
      this.filter.LivingCountries = [user.profileLookingFor.country];
    }
    this.itemsPerPage = 6;
    this.currentPage = 1;
    this.getAllMatchingProfiles();
  });
  }

  public activeImageIndex: number = 0;

  ngOnInit(): void {}

  public prevImage(): void {
    const count = this.filterMemberViewData?.profileImages?.length ?? 0;
    if (count === 0) return;
    this.activeImageIndex = (this.activeImageIndex - 1 + count) % count;
  }

  public nextImage(): void {
    const count = this.filterMemberViewData?.profileImages?.length ?? 0;
    if (count === 0) return;
    this.activeImageIndex = (this.activeImageIndex + 1) % count;
  }

  public goToImage(index: number): void {
    this.activeImageIndex = index;
  }

  public changePerPageValue(pageNumber: number) {
    if (pageNumber != 0 && pageNumber != null) {
      this.currentPage = 1;
      this.itemsPerPage = pageNumber;
      this.getAllMatchingProfiles();
    }
  }

  public pageChanged(event: any) {
    this.currentPage = event;
    this.getAllMatchingProfiles();
  }

  public getAllMatchingProfiles() {
    this.isLoading = true;

    const userId:any = this.currentsUser ?  this.currentsUser.id : localStorage.getItem("currentMemberId") ? localStorage.getItem("currentMemberId") : '';
    this.memberService
      .getMatchingData(this.filter, userId, this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (res: any) => {
          this.memberProfiles = res.data;
          this.totalItemCount = res.totalCount;
          this.isLoading = false;
        },
        complete: () => {
          //this.memberService.m
        },
        error: (error: any) => {
          this.isLoading = false;
          this._toastr.error(error.error.Error.Detail, error.error.Error.Title);
        },
      });
  }

  public viewMemberDetails(id: string) {
   // this.router.navigateByUrl(`home/profile/${id}`);
    this.isMemberViewLoading = true;
    this.viewMemberId = id;
    this.memberService.GetFilterMemberViewData(id).subscribe({
      next: (res: any) => {
        this.filterMemberViewData = res;
        this.isMemberViewLoading  = false;
      },
      complete: () => {
        this.viewMemberId = '';
        let viewModal: HTMLElement = document.getElementById(
          'viewProfileModal'
        ) as HTMLElement;
        if (viewModal) {
          viewModal.click();
        }
      },
      error: (error: any) => {
        this.isMemberViewLoading  = false;
        this._toastr.error(error.error.Error.Detail, error.error.Error.Title);
      },
    });
  }

  public addMember() {
    this.router.navigateByUrl('member/member-registration');
  }

  public openChat(member: MemberProfile) {
    this._chatService.clearParticipant();
    const openChatMember = new ChatParticipant({
      receiverProfileId: member.id,
      name: member.firstName,
      profileImage: member.imageUrl,
      lastSentAt: new Date().toString(),
      lastOnlineAt: null,
      isRead: false,
    });

    this._chatService.setParticipant(openChatMember);

    this.router.navigate(['/home/chat']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.memberService.setFilter(null);
    // this._chatService.clearParticipant();
  }
}
