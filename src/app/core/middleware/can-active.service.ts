import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CanActivateService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authService.memberList$.pipe(
      take(1),
      map((memberList) => {
        const isLoggedIn = this.authService.isLoggedIn();

        if (isLoggedIn) {
          return true;
        }

        if (memberList && memberList.length > 0) {
          return this.router.createUrlTree(['/member/member-registration']);
        }

        return this.router.createUrlTree(['/home/member']);
      })
    );
  }
}
