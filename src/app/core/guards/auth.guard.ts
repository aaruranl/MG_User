import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Functional guard that replaces the deprecated class-based AuthGuardService.
 * Checks whether the logged-in user's role is in the route's `accessUsers` data array.
 * Returns a UrlTree to '/not-found' (instead of navigating and returning true) when access is denied.
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUserType();
  const routeUserAccess: string[] = route.data['accessUsers'] ?? [];

  if (routeUserAccess.includes(user)) {
    return true;
  }

  return router.createUrlTree(['/not-found']);
};
