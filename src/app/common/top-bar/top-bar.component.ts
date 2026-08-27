import { Component } from '@angular/core';
import { SocialLoginService } from '../../core/services/auth/social-login.service';
import { MemberService } from '../../core/services/member.service';
import { MainUser } from '../../models/index.model';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';


@Component({
  selector: 'app-top-bar',
  imports: [CommonModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent {

  public currentUser:any;
  public mainUser!: MainUser;

  constructor(
    private socialLoginService:SocialLoginService,
    private _memberService: MemberService,
    private _authService: AuthService
  ){}

  ngOnInit(){
    this.getMainUser();
  }

  private getMainUser() {
    this._memberService.getMainUser().subscribe({
      next: (res: any) => {
        this.mainUser = res;
      },
      complete: () => {},
      error: (error: any) => {},
    });
  }

  public _authLogout() {
    this._authService.removeAuthToken();
    localStorage.removeItem('clientId');
    localStorage.removeItem('userType');
    localStorage.removeItem('currentMemberId');
    this._authService.setUserDetails(null);
    window.location.href = '/';
  }

}
