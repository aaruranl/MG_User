import { HttpInterceptorFn } from "@angular/common/http";
import { AuthService } from "../services/auth/auth.service";
import { inject } from "@angular/core";

export const AuthInterceptor: HttpInterceptorFn = (request:any, next:any) => {
  const authService = inject(AuthService);
  if (authService.isLoggedIn()) {
    const token = authService.getAuthToken();
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request);
};
