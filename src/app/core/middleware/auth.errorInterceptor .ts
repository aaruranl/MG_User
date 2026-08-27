import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth/auth.service';
import { SocialLoginService } from '../services/auth/social-login.service';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const _authService = inject(AuthService);
  const _socialLoginService = inject(SocialLoginService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const status = error.status;

      if ([401, 403].includes(status)) {
        _authService.removeAuthToken();
        _socialLoginService.signOut();
        localStorage.removeItem('clientId');
        localStorage.removeItem('currentMemberId');
        _authService.setUserDetails(null);

        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    })
  );
};
