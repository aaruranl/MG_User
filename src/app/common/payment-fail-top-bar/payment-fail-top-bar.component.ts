import { MainUser } from './../../models/member/member.model';
import { Component, Input, input } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-fail-top-bar',
  imports: [CommonModule],
  templateUrl: './payment-fail-top-bar.component.html',
  styleUrl: './payment-fail-top-bar.component.scss'
})
export class PaymentFailTopBarComponent {
  @Input() mainUser!:MainUser;
  menuOpen: boolean = false;
   constructor(
      private _authService: AuthService,
      public router: Router,
    ){}

   public _authLogout() {
    this.menuOpen = false;
    this._authService.removeAuthToken();
    localStorage.removeItem('clientId');
    localStorage.removeItem('userType');
    localStorage.removeItem('currentMemberId');
    this._authService.setUserDetails(null);
    window.location.href = '/';
  }



public enterSettings() {
  this.menuOpen = false;
  this.router.navigateByUrl('home/main-user');
}

public enterPlanAndBilling() {
  this.menuOpen = false;
  this.router.navigateByUrl('member/billing');
}

public enterPrivacyPolicy() {
  this.menuOpen = false;
  this.router.navigateByUrl('help-center');
}



}
