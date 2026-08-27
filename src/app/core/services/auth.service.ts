import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  private getStoredUser(): User | null {
    const stored = localStorage.getItem('mg_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    // Default demo mock user for rich experience
    return {
      id: 'usr-1001',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      role: 'member',
      memberId: 'MG-88921',
      profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      isVerified: true,
      membershipPlan: 'Royal Platinum'
    };
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: { email: string; password?: string }): Observable<boolean> {
    const user: User = {
      id: 'usr-1001',
      name: 'Aarav Sharma',
      email: credentials.email,
      role: 'member',
      memberId: 'MG-88921',
      profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      isVerified: true,
      membershipPlan: 'Royal Platinum'
    };
    localStorage.setItem('mg_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    return of(true);
  }

  logout(): void {
    localStorage.removeItem('mg_user');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
}
