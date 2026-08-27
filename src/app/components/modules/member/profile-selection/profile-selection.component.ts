import { MemberService } from './../../../../core/services/member.service';
import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { COMMON_DIRECTIVES, FORM_MODULES, ROUTER_MODULES } from '../../../../common/common-imports';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { SocialLoginService } from '../../../../core/services/auth/social-login.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MainUser, UserProfile } from '../../../../models/index.model';
import { LoadingComponent } from "../../../../common/loading/loading.component";
@Component({
  selector: 'app-profile-selection',
  imports: [CommonModule, COMMON_DIRECTIVES, FORM_MODULES, ROUTER_MODULES, LoadingComponent],
  templateUrl: './profile-selection.component.html',
  styleUrl: './profile-selection.component.scss'
})
export class ProfileSelectionComponent {

  constructor(
    private auth:AuthService,
    private socialLoginService:SocialLoginService,
    private router:Router,
    private _memberService:MemberService,
    private _toastr: ToastrService,
  ){

  }


  public memberProfiles:UserProfile[] = [];
  public isLoading:boolean = false;
  public deleteMemberId:string = '';
  public mainUser!:MainUser;

  ngOnInit(): void {
   this._getMemberProfiles();
   this.scrollToTop();
   this.getMainUser();
  }

  private scrollToTop(): void {
   window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  _authLogout() {
    this.auth.removeAuthToken();
    this.socialLoginService.signOut();
    window.location.href = "/";
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('clientId');
  }

  private _getMemberProfiles(){
    this.isLoading = true;
    this._memberService.getProfiles().subscribe({
      next:(res:any) => {
        this.memberProfiles = res;
        this.isLoading = false;
      },
      complete:() => {

      },
      error:(error:any) => {
        this.isLoading = false;
        this._toastr.error(error.error.Error.Detail,error.error.Error.Title);
      }
    })

    //  this.auth.memberList$.subscribe(data => {
    //   if(data){
    //     this.memberProfiles = data;
    //   }
    // })
  }


  public navigateToFrom(){
    this.router.navigateByUrl('member/member-registration');
  }

  public navigateToEditForm(memberId:string){
   this.router.navigate(['member/member-registration/edit', memberId]);
  }

  public navigateToHome(){
  // this.router.navigateByUrl('home/member/'+ memberId);
  //  this.auth.setUserDetails(memberId);
  //  this.auth.setMember(memberId);
  }

  public deleteMember(){
    this.isLoading = true;
    this._memberService.deleteMember(this.deleteMemberId).subscribe({
      next:(res:any) => {
        this.mainUser.memberCount -= 1;
        this.mainUser.remainingMemberCount += 1;
        this.auth.setMainUser(this.mainUser);
        this._getMemberList();
      },
      complete:() => {
        // this._toastr.success('Member deleted successfully','Success');
      },
      error:(error:any) => {
       this.isLoading = false;
       this._toastr.error(error.error.Error.Detail,error.error.Error.Title);
      }
    })
  }

  private _getMemberList(){
    this.isLoading = true;
    this._memberService.getProfiles().subscribe({
      next:(res:any) => {
        if(res.length  === 0){

        }else{
          let currentMemberId = localStorage.getItem('currentMemberId');
          this.memberProfiles = res;
          this.auth.setMemberList(res);
          this.isLoading = false;
          let deleteModal: HTMLElement = document.getElementById('deleteMemberModalId') as HTMLElement;
          deleteModal.click();
          if(currentMemberId === this.deleteMemberId){
            localStorage.removeItem('currentMemberId');
            window.location.href = "/";
          }
        }

      },
      complete:() =>{
        this.isLoading = false;
      },
      error:(error:any)=>{
      this.isLoading = false;
      }
    })
  }


  private getMainUser(){
    this.auth.mainUser$.subscribe((res:any)=>{
      this.mainUser = res;
    })
  }
}
