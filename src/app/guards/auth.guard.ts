import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, combineLatest } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.getAuthInitialized().pipe(
      filter(init => init),          // wait until initialized === true
      take(1),                       // only once
      switchMap(() =>
        combineLatest([
          this.auth.getCurrentUser(),
          this.auth.getCurrentUserRole()
        ]).pipe(
          take(1),                   // only need one emission
          map(([user, role]) => {
            if (!user) {
              this.router.navigate(['/login']);
              return false;
            }
            if (role === 'staff') {
              this.router.navigate(['/staff/dashboard']);
            } else if (role === 'resident') {
              this.router.navigate(['/resident/dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
            return false; // block blank route
          })
        )
      )
    );
  }
}

@Injectable({ providedIn: 'root' })
export class StaffGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.getAuthInitialized().pipe(
      filter(init => init),
      take(1),
      switchMap(() =>
        combineLatest([
          this.auth.getCurrentUser(),
          this.auth.getCurrentUserRole()
        ]).pipe(
          take(1),
          map(([user, role]) => {
            if (!user) {
              this.router.navigate(['/login']);
              return false;
            }
            if (role === 'staff') {
              return true;
            } else {
              this.router.navigate(['/resident/dashboard']);
              return false;
            }
          })
        )
      )
    );
  }
}


@Injectable({ providedIn: 'root' })
export class ResidentGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.getAuthInitialized().pipe(
      filter(init => init),
      take(1),
      switchMap(() =>
        combineLatest([
          this.auth.getCurrentUser(),
          this.auth.getCurrentUserRole()
        ]).pipe(
          take(1),
          map(([user, role]) => {
            if (!user) {
              this.router.navigate(['/login']);
              return false;
            }
            if (role === 'resident') {
              return true;
            } else {
              this.router.navigate(['/staff/dashboard']);
              return false;
            }
          })
        )
      )
    );
  }
}
