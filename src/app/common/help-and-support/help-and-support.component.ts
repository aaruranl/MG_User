import { Component, OnInit } from '@angular/core';
import { PaymentFailTopBarComponent } from "../payment-fail-top-bar/payment-fail-top-bar.component";
import { MainUser } from '../../models/index.model';
import { MemberService } from '../../core/services/member.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ROUTER_MODULES } from '../common-imports';

@Component({
  selector: 'app-help-and-support',
  imports: [PaymentFailTopBarComponent, CommonModule, ROUTER_MODULES],
  templateUrl: './help-and-support.component.html',
  styleUrl: './help-and-support.component.scss'
})
export class HelpAndSupportComponent implements OnInit {
  public mainUser!: MainUser;
  public baseUrl = environment.baseDomain;
  public currentYear = new Date().getFullYear();

  constructor(private _memberService: MemberService) {}

  ngOnInit() {
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
}
