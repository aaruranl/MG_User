import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MemberService } from '../../../../../core/services/member.service';
import { FullUserProfile } from '../../../../../models/index.model';
import { ToastrService } from 'ngx-toastr';

import { MemberProfileModalComponent } from '../../../../../common/pop-up/member-profile-modal/member-profile-modal.component';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from "../../../../../common/loading/loading.component";


@Component({
  selector: 'app-member-details',
  imports: [MemberProfileModalComponent, CommonModule, LoadingComponent],
  templateUrl: './member-details.component.html',
  styleUrl: './member-details.component.scss',
  standalone:true
})
export class MemberDetailsComponent {
public memberId!: string;
public filterMemberViewData!: FullUserProfile;
public isLoading:boolean = false;

constructor(
  private route: ActivatedRoute,
  private memberService:MemberService,
  private _toastr: ToastrService,){
}
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.memberId = params['id'];
      this.viewMemberDetails();
    });
  }

  // ngAfterViewInit(): void {
  //   if(this.memberId) {
  //     this.viewMemberDetails();
  //   }
  // }

  public viewMemberDetails() {
    this.isLoading = true;
    this.memberService.GetFilterMemberViewData(this.memberId).subscribe({
      next: (res: any) =>
      {this.filterMemberViewData = res;},
      complete: () => {this.isLoading = false;},
      error: (error: any) => {
        this.isLoading = false;
        this._toastr.error(error.error.Error.Detail, error.error.Error.Title);
      },
    });
  }
}

