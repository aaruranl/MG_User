import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ApprovalComponent } from '../../components/modules/member/approval/approval.component';

@Injectable({
  providedIn: 'root'
})
export class LeaveApprovalGuard implements CanDeactivate<ApprovalComponent> {
  canDeactivate(
    component: ApprovalComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    if (component.memberProfile.memberApproval === 1) {

      return false;
    }

    return true;
  }
}
