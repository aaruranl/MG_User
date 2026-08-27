import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from '@angular/router';
import { ApprovalComponent } from '../../components/modules/member/approval/approval.component';

/**
 * Functional canDeactivate guard for the approval route.
 * Prevents navigation away from the approval page when the member profile is pending approval.
 * Added null-safety check for memberProfile before accessing memberApproval.
 */
export const leaveApprovalGuard: CanDeactivateFn<ApprovalComponent> = (
  component: ApprovalComponent,
  currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  nextState?: RouterStateSnapshot
): boolean => {
  if (!component.memberProfile) {
    return true;
  }

  if (component.memberProfile.memberApproval === 1) {
    return false;
  }

  return true;
};
