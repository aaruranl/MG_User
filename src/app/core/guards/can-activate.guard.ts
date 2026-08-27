import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Functional guard that replaces the deprecated class-based CanActivateService.
 * Allows access only when the user is logged in; otherwise redirects to login.
 * Used on the /home/** routes.
 */
export const canActivateGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  return authService.memberList$.pipe(
    take(1),
    map((memberList) => {
      if (!memberList || memberList.length === 0) {
        return router.createUrlTree(['/member/member-registration']);
      }
      return true;
    })
  );
};
