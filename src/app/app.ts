import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  currentUser$: any;
  private destroy$ = new Subject<void>();
  private authInitialized = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Wait for auth subsystem to initialize (restored persistence) before subscribing
    this.authService.getAuthInitialized().pipe(take(1)).subscribe(() => {
      // Now it's safe to subscribe to currentUser$ without causing premature redirects
      this.authService.currentUser$
        .pipe(takeUntil(this.destroy$))
        .subscribe(user => {
          // Only redirect to login if:
          // 1. No user is logged in
          // 2. AND we're not already on login/signup page
          // 3. AND the user didn't just navigate to a protected route (guards handle that)
          if (!user && !this.isAuthPage() && !this.isRootPath()) {
            console.log('No user found after init, redirecting to login');
            this.router.navigate(['/login']);
          } else if (user) {
            console.log('User is authenticated:', user.email);
          }
        });
    });
  }

  private isAuthPage(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.includes('/login') || currentUrl.includes('/signup') || currentUrl === '/dashboard';
  }

  private isRootPath(): boolean {
    return this.router.url === '/';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
