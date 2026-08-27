import { inject } from '@angular/core';
import { CanDeactivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Functional canDeactivate guard for the billing route.
 * Prevents navigation away from billing when the subscription is not active,
 * except for a set of explicitly allowed routes.
 */
export const deactivateGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isActiveSubscription$.pipe(
    take(1),
    map((active: boolean | null) => {
      const allowedRoutes = [
        '/home/main-user',
        '/member/billing',
        '/help-center'
      ];
      const targetUrl = nextState.url;

      if (allowedRoutes.includes(targetUrl)) {
        return true;
      }

      if (active === false) {
        router.navigateByUrl('member/billing');
        return false;
      }

      return true;
    })
  );
};
