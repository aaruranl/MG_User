import { MemberApproval } from './../../../../helpers/enum';
import { Component } from '@angular/core';
import { TopBarComponent } from "../../../../common/top-bar/top-bar.component";
import { MemberService } from '../../../../core/services/member.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { UserProfile } from '../../../../models/index.model';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MemberEditFormComponent } from "../member-registration/member-edit-form/member-edit-form.component";

@Component({
  selector: 'app-approval',
  imports: [TopBarComponent, CommonModule, MemberEditFormComponent],
  templateUrl: './approval.component.html',
  styleUrl: './approval.component.scss'
})
export class ApprovalComponent {

  public isLoading:boolean  = false;
  public memberProfile!:UserProfile;
  public isMoveEdit:boolean = false;
  public memberId:string = '';

  constructor(private _memberService:MemberService,
    private auth:AuthService,
    private toastr:ToastrService,
    private router:Router,
  ){

  }

  ngOnInit(): void {

    this.auth.member$.subscribe((member:any)=>{
      if(member){
         this.memberId = member.id;
        this._getMemberProfile(member.id);

      }
    })

  }

  private _getMemberProfile(memberId:string){
   this.isLoading = true;
   this._memberService.getMemberProfileById(memberId).subscribe({
    next:(res:any)=>{
     this.memberProfile = res;
     if(res.memberApproval === MemberApproval.Approved){
      this.router.navigateByUrl('home/member')
     }
    },
    complete:()=>{
      this.isLoading = false;
    },
    error:(error:any) => {
      this.isLoading = false;
      this.toastr.error(error.error.Error.Detail,error.error.Error.Title);
    }
   })
  }

  public navigateToEditForm(memberId:string){
   this.isMoveEdit = true;



   //this.router.navigate(['member/approval/modify/edit', memberId]);
  }

  public getGoBackEmitter(event:any){
    this.isMoveEdit = event;
  }

}
