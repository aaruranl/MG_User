import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Functional guard that replaces the deprecated class-based DeActiveService.
 * Prevents logged-in users from accessing public-only routes (login, landing, etc.).
 * Returns a UrlTree to /home/member when the user is already authenticated.
 */
export const deActiveGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/home/member']);
  }

  return true;
};
